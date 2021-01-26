const Forecast = require("../models/forecast");
const regex = '^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$';


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
        Forecast.getDateForecast(req.params.start)
            .then((result) => {
                res.status(200).send(result);
            });
    }
    else
    {
        res.status(401).send('Date must be in valid format YYYYMMDD');
    }
};

// save forcast for all cities listed in the local json data file
exports.saveForecastData = (data) => {
    Forecast.saveForecastData(data)
    .then((result) => {
        
    });
};
