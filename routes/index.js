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
    GetCityData();
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
        console.log("attempting to read cities.json");
        cityJsonData = await fs.readJson('cities.json');
        //console.log(cityJsonData);
        return cityJsonData;
    } catch (err) {
        console.error(err);
        return null;
    }
}

function useData(json, limit) {

    var list = _.filter(json, function (a) { return json.list; })

    //var datetemp = _.filter(list, function (a) { return list.dt_txt, list.main.temp_min; })


    _.each(list, function (x) {

        console.log(x[0]);

        //var text = x.dt_txt + " -------> " + x.main.temp_min + "--------->" + limit;

        //var mintemp = parseFloat(x.main.temp_min);
        //var limit = parseFloat(limit);
        //var flag = mintemp < limit ? "FLAGGED" : "";
        //console.log(text + flag);
        //console.log(text + flag);

    })
}

const readOpenMapCityForcast = async (url, limit) => {    

    try {
        //console.log(url);
        var citydata = null;
        fetch(url)
            .then(res => res.json())
            .then(json => { useData(json, limit) }
        );

        
    } catch (err) {
        console.error(err);
        return null;
    }
}

function GetCityData() {    

    const apikey = nconf.get('OpenWeatherMapAPIKey');
    var url = nconf.get('OpenWeatherMapAPIURL');

    readJsonFile().then((cityJsonData) => 
        _.each(cityJsonData, function (x) {
            //console.log(x.name + " has low temp limit  " + x.limit);
            url = url.replace("{cityname}", x.name);
            readOpenMapCityForcast(url, x.limit);
        })
    );
}

module.exports = router;
