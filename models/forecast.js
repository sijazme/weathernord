// sql client query
const { Client } = require('pg');

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
const isProduction = process.env.NODE_ENV === 'production';

function Forecast(city, temp_lo, limit) {

    this.city = city;
    this.temp_lo = temp_lo;
    this.limit = limit;
}

const getClient = () => {
    const client = new Client({
        connectionString: connectionString,
        ssl: isProduction,
    })
    client.connect();
    return client;
};

const getCityForecastByName = async (cityname) =>
{
    try {
        const forecast = await getCityForecast(cityname);        
        return forecast;
    }

    catch (err) {
        console.error(err);
        return null;
    }
};


const getCityForecast = async (city) => {
    
    var cityname = city.charAt(0).toUpperCase() + city.slice(1);
    var query = 'SELECT * FROM weather WHERE city = \'' + cityname + '\';';
    
    var client = getClient();    

    return new Promise(function (resolve, reject) {
        client.query(query, function (err, result) {
            client.end();
            if (err) {
                return reject(err);
            } else {
                if (result.rowCount > 0) {
                    return resolve(result.rows);
                }
            }
            return resolve(false);
        });
    });
}

const saveForecastData = async (data) => {

    const allAsyncResults = [];

    for (const forecast of data) {
        var insert = 'INSERT INTO weather VALUES (\'' + forecast.city + '\',' + forecast.temp_lo + ',' + forecast.limit + ',\'' + forecast.date + '\');';
        allAsyncResults.push(insert);        
    }

    const query = allAsyncResults.join("");

    var client = getClient();  // run entire script at once
    
    return new Promise(function (resolve, reject) {
        client.query(query, function (err, result) {
            client.end();
            if (err) {
                return reject(err);
            } else {
                if (result.rowCount > 0) {
                    return resolve(result.rows);
                }
            }
            return resolve(false);
        });
    });
   
};

exports.getCityForecastByName = getCityForecastByName;
exports.saveForecastData = saveForecastData;