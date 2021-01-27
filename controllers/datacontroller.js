const Forecast = require("../models/forecast");
const regex = '^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$';
const dayjs = require('dayjs');

// get forecast for a given city name
exports.getCityForecast = (req, res) => {

    var city = req.params.name;

    if (city && city.match(regex)) {

        var cityname = city.charAt(0).toUpperCase() + city.slice(1);

        Forecast.getCityForecastByName(cityname)
            .then((result) => {                
                res.status(200).send(result);
            }).catch(function (error) {
                res.status(400).send({ message: "Forecast data not found for city" });
            });
    }
    else
    {
        res.status(400).send('City name must be in valid format');
    }
       
    
};

// get forcast from a start date value
exports.getDateForecast = (req, res) => {

    var d = dayjs(req.params.start, "YYYYMMDD");

    if (d.isValid())
    {
        var dformat = dayjs(d).format('YYYY-MM-DD');

        Forecast.getDateForecast(dformat)
            .then((result) => {
                res.status(200).send(result);
            }).catch(function (error) {                
                res.status(400).send({ message: "No records found for given date." });
            });
    }
    else
    {   
        res.status(400).send({ message: "Date must be in valid format YYYYMMDD." });
    }
};

// get forcast for a limit number
exports.getLimitForecast = (req, res) => {

    var val = parseFloat(req.params.number);
    
    if (!isNaN(val)) {

        Forecast.getLimitForecast(val)
            .then((result) => {
                res.status(200).send(result);
            }).catch(function (error) {                
                res.status(400).send({ message: "No records found for given limit." });
            });
    }    
    else
    {   
        res.status(400).send({ message: "Limit must be a floating point number." });
    }
};

// get forecast for a city given a limit

exports.getCityLimitForecast = (req, res) => {

    var city = req.params.city;
    var limit = parseFloat(req.params.number);

    if (!isNaN(limit) && city && city.match(regex)) {

        var cityname = city.charAt(0).toUpperCase() + city.slice(1);

        Forecast.getCityLimitForecast(cityname,limit)
            .then((result) => {
                res.status(200).send(result);
            }).catch(function (error) {                
                res.status(400).send({ message: "No records found for given city and limit." });
            });
    }
    else {
        res.status(400).send({ message: "City and limit parameters must be in correct format, example: limit/chicago/10." });
    }
};


// get all forcast entries since today

exports.getForecastAll = (req, res) => {

    var today = dayjs().format('YYYY-MM-DD');

    Forecast.getDateForecast(today)
        .then((result) => {
            res.status(200).send(result);
        }).catch(function (error) {            
            res.status(400).send({ message: "No records found" });
        });
};

// save forcast for all cities listed in the local json data file
exports.saveForecastData = async (data) => {

    return new Promise((resolve, reject) => {

        Forecast.saveForecastData(data)
            .then((result) => {
                return resolve(result);
            });
    });

};
