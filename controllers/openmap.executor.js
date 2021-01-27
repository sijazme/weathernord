const { workerData, parentPort } = require('worker_threads');
const fetch = require('node-fetch');
var _ = require('underscore');
const fs = require('fs-extra');
var nconf = require('nconf');
const datacontroller = require('./datacontroller');

nconf.argv().env().file({ file: 'config.json' });

// You can do any heavy stuff here, in a synchronous way without blocking the "main thread"

const getOpenMapForecast = async (cityList) => {

    try {

        const allAsyncResults = [];

        for (const x of cityList) {

            const limit = parseFloat(x.limit);
            const asnycResult = await fetchCityForecast(x.name, limit);
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

// reads the json file from the local server with all the names of the cities

const readJsonFile = async () => {

    try {
        var datafile = nconf.get('DataFile');
        var cityJsonData = await fs.readJson(datafile);
        return cityJsonData;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// saveforecast methods calls the datacontroller to insert rows into the database
const saveForecast = function (opendata) {

        return new Promise((resolve, reject) => {

            datacontroller.saveForecastData(opendata).then((result) => {

                if (result != null) {
                    return resolve(result);
                }
                else {
                    return reject(result);
                }

            });

        });
}

// collect openmap forecast data for all cities in the json config file and add them to an array for saving into the database

const openMapForecast =  function (citydata) {

    return new Promise((resolve, reject) => {

        const allAsyncResults = [];

        getOpenMapForecast(citydata).then(citiesdata => {

            if (citiesdata != null && citiesdata.length > 0) {

                for (const city of citiesdata) {

                    if (city.limit_exceeded) {

                        const filtered = _.where(city.forcast, { flag: true });

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

                resolve(allAsyncResults);
            }

            else
            {
                reject(allAsyncResults);
            }
        });

    });
}

// compare two dates
function comp(a, b) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
}

// format the json data to flag which forecast results actually break the lower temperature limit
const getFormattedData = async (json, limit) => {

    var result = Object.entries(json.list).map(([k, v]) => ({
        temp_lo: v.main.temp_min,
        date: v.dt_txt,
        flag: parseFloat(v.main.temp_min) < limit
    }));

    result.sort(comp);

    return result;
}

// use node fetch tp call the open maps api and collect the forecast data for a particular city
const fetchCityForecast = async (cityname, limit) => {

    var url = nconf.get('OpenWeatherMapAPIURL');
    var urlcity = url.replace("{cityname}", cityname);

    try {
        return fetch(urlcity)
            .then(res => res.json())
            .then(json => {
                return getFormattedData(json, limit);
            });

    } catch (err) {
        console.error(err);
        return null;
    }
}

// Read the json file with all the cities data and attempt to retreive weather forcast for each city from the openweathermap api

readJsonFile().then((cityList) =>
{
    if (parentPort != null && cityList != null) {

        openMapForecast(cityList).then((opendata) => {

            saveForecast(opendata).then((data) =>
            {            
                try { parentPort.postMessage({ rows: data.length } ); }
                catch (e) { console.log(e); }
            
            });
        });
    }
});

exports.getOpenMapForecast = getOpenMapForecast;
exports.readJsonFile = readJsonFile;