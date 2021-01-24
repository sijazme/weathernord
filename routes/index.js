'use strict';

const fetch = require('node-fetch');
var _ = require('underscore');
var express = require('express');
var router = express.Router();
const fs = require('fs-extra');
var nconf = require('nconf');

nconf.argv().env().file({ file: 'config.json' });

// sql client query
const { Client } = require('pg');
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
const isProduction = process.env.NODE_ENV === 'production';

const client = new Client({
    connectionString: connectionString,
    ssl: isProduction,
})

client.connect();

/* GET home page. */
router.get('/', function (req, res) {

    
    readJsonFile().then((cityList) => {

        GetForcast(cityList).then(cityarray => {

            for (const data of cityarray) {

                var cityname = data.city;
                var forcast = data.forcast;
                var limit_exceeded = data.limit_exceeded;
                var temp_lowest = data.temp_lowest;

                console.log(cityname + " ---> " + temp_lowest);

                // find if the temperature limit exceeds in the next 5 days forcast
                //var cold_days = _.where(data.forcast, { flag: true });

                //var limit_exceeded = cold_days.length > 0;
                
                //if (limit_exceeded) {
                    
                //}
                
            }
        });

        
    });

    res.render('index', { title: 'Express' });
});

router.get('/weather/:city', function (req, response) {

    var obj = null;    
    var city = null;

    if (req.params.city != null) {

        city = req.params.city.charAt(0).toUpperCase() + req.params.city.slice(1);
    }
    
    var sql = 'SELECT city, temp_lo FROM weather WHERE city = \'' + city + '\';';

    //console.log(sql);

    client.query(sql, (err, res) => {

        if (err) throw err;

        if (res.rows != null && res.rows.length > 0)
        {
            var row = res.rows[0];

            if (row["city"].toLowerCase() == city.toLowerCase()) {

                var temp_lo = JSON.parse(row["temp_lo"]).toString();
                response.status(200).send(temp_lo);
            }

            else {
                response.status(404).send('weather information not found for this city ' + city);
            }
        }

    });
});

const readJsonFile = async () => {

    var cityJsonData = null;

    try {        
        cityJsonData = await fs.readJson('cities.json');        
        return cityJsonData;
    } catch (err) {
        console.error(err);
        return null;
    }
}

function comp(a, b) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
}

const GetFormattedData = async (json, limit) => {

    var cityname = json.city.name;

    var result = Object.entries(json.list).map(([k, v]) => ({ temp_lo: v.main.temp_min, date: v.dt_txt, flag: parseFloat(v.main.temp_min) < limit }));

    result.sort(comp);

    return result;

    //fs.writeFile('json_dump.txt', JSON.stringify(result), function (err) {
    //    if (err) return console.log(err);
    //    console.log('json_dump saved');
    //});

  

}

const GetOpenMapCityForcast = async (url, limit) => {    

    var formattedData = null;

    try {
        
        return fetch(url)
            .then(res => res.json())
            .then(json => {
                formattedData = GetFormattedData(json, limit);
                return formattedData;
            }
        );

    } catch (err) {
        console.error(err);
        return null;
    }
}

const GetForcast = async (cityList)  => {    
        
    var url = nconf.get('OpenWeatherMapAPIURL');

    try {

        const allAsyncResults = [];

        for (const x of cityList) {

            var urlcity = url.replace("{cityname}", x.name);
            var limit = parseFloat(x.limit);

            const asnycResult = await GetOpenMapCityForcast(urlcity, limit);
            const limit_exceeded = _.where(asnycResult, { flag: true }).length > 0;
            //let temp_lowest = _.minBy(asnycResult, function (x) { return x.temp_min; });

            const temp_lowest = Math.min(Object.entries(asnycResult).map(d => parseFloat(d.temp_lo)));

            
            //var t = Object.entries(asnycResult).map(([k, v]) => ({ temp_lo = v.temp_lo }));
            //console.log(t);
            //console.log(Object.entries(asnycResult).map(d => parseFloat(d.temp_lo)));

            allAsyncResults.push({ city: x.name, temp_lowest: 0, limit: limit_exceeded, forcast: asnycResult });
        };

        return allAsyncResults;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = router;
