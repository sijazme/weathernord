const Forecast = require("../models/forecast");

exports.getCityForecast = (req, res) => {
       
    Forecast.getCityForecastByName(req.params.city)
        .then((result) => {
            res.status(200).send(result);
        });
};


exports.saveForecastData = (data) => {

    Forecast.saveForecastData(data)
    .then((result) => {
        //res.status(200).send(result);
    });

};
