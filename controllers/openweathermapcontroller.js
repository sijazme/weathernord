const fetch = require('node-fetch');
var _ = require('underscore');
var express = require('express');

const fs = require('fs-extra');
var nconf = require('nconf');

nconf.argv().env().file({ file: 'config.json' });

const forecastcontroller = require('../controllers/forecastcontroller');

exports.getForecastAll = (req, res) => {

    readJsonFile().then((cityList) => {
        getOpenMapForecast(cityList).then(cityarray => {
            res.render('index', { title: 'Weather Forcast', data: cityarray });
        });
    });
};

const jsondump = (json) => {
    let data = JSON.stringify(json);
    fs.writeFileSync('jsondump.json', data);
}

exports.saveForecastAll = (req, res) => {
       
    readJsonFile().then((cityList) => {

        getOpenMapForecast(cityList).then(citiesdata => {

            const allAsyncResults = [];

            for (const city of citiesdata) {

                if (city.limit_exceeded) {  // this only checks if limit exceeded, we still need to filter the forecast results according to lower limit

                    // var filtered = _.filter(city.forcast, function (item) { return item.temp_lo < city.limit; });
                    const filtered = _.where(city.forcast, { flag: true });

                    //console.log(filtered);
                    

                    for (const forecast of filtered) {
                        
                        var data = {
                            "city": city.city,
                            "temp_lo": forecast.temp_lo,
                            "limit": city.limit,
                            "date": forecast.date
                        }

                        
                        allAsyncResults.push(data);
                    }
                }
            }

           //console.log(allAsyncResults);
            //jsondump(allAsyncResults);
            
            forecastcontroller.saveForecastData(allAsyncResults);

            res.status(200).send({ message: "weather forcast data saved successfuly" });

        });
    });
};

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

const getFormattedData = async (json, limit) => {

    var result = Object.entries(json.list).map(([k, v]) => ({        
        temp_lo: v.main.temp_min,
        date: v.dt_txt,
        flag: parseFloat(v.main.temp_min) < limit
    }));

    result.sort(comp);

    return result;
}

const fetchCityForecast = async (cityname, limit) => {

    var formattedData = null;
    var url = nconf.get('OpenWeatherMapAPIURL');
    var urlcity = url.replace("{cityname}", cityname);

    try {

        return fetch(urlcity)
            .then(res => res.json())
            .then(json => {
                formattedData = getFormattedData(json, limit);
                return formattedData;
            });

    } catch (err) {
        console.error(err);
        return null;
    }
}

const getOpenMapForecast = async (cityList) => {

    try {

        const allAsyncResults = [];

        for (const x of cityList) {

            
            var cityname = x.name;
            const limit = parseFloat(x.limit);
            const asnycResult = await fetchCityForecast(cityname, limit);
            const limit_exceeded = _.where(asnycResult, { flag: true }).length > 0;            

            var arr = Object.entries(asnycResult).map(([key, value]) => [value.temp_lo]);
            var min = Math.min.apply(null, arr);
            
            allAsyncResults.push({ city: x.name, limit: limit, temp_lowest: min, limit_exceeded: limit_exceeded, forcast: asnycResult });
        }

        return allAsyncResults;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
