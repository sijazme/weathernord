const Forecast = require("../models/forecast");
const regex = '^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$';
const dayjs = require('dayjs');

// get forecast for a given city name
exports.getCityForecast = (req, res) => {

    var city = req.params.name;

    if (city && city.match(regex)) {

        Forecast.getCityForecastByName(req.params.name)
            .then((result) => {
                res.status(200).send(result);                
            });
    }
    else
    {
        res.status(401).send('City name must be in valid format');
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
            });
    }
    else
    {
        res.status(401).send('Date must be in valid format YYYYMMDD');
    }
};

// get forcast for a limit number
exports.getLimitForecast = (req, res) => {

    val = parseFloat(req.params.number);
    
    if (!isNaN(val)) {

        Forecast.getLimitForecast(val)
            .then((result) => {
                res.status(200).send(result);
            });
    }    
    else
    {
        res.status(401).send('Limit must be a floating point number');
    }
};

// get all forcast entries since today

exports.getForecastAll = (req, res) => {

    var dformat = dayjs().format('YYYY-MM-DD');

    Forecast.getDateForecast(dformat)
        .then((result) => {
            res.status(200).send(result);
        });
};

// save forcast for all cities listed in the local json data file
exports.saveForecastData = (data) => {
    Forecast.saveForecastData(data)
    .then((result) => {
        
    });
};
