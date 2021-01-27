
// sql client query
const { Client } = require('pg');
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
const isProduction = process.env.NODE_ENV === 'production';

// constructor for the forecast model
function Forecast(city, temp_lo, limit) {

    this.city = city;
    this.temp_lo = temp_lo;
    this.limit = limit;
}

// returns the postgres client object with open connection
const getClient = () => {
    const client = new Client({
        connectionString: connectionString,
        ssl: isProduction,
    })
    client.connect();
    return client;
};

// get forecast where lower limit has been breached
const getLimitForecast = async (limit) => {
    try {
        const forecast = await getLimitForecast_(limit);
        return forecast;
    }

    catch (err) {
        console.error(err);
        return null;
    }
};

// helper method for getLimitForecast_
const getLimitForecast_ = async (limit) => {
    var query = 'SELECT * FROM weather WHERE \"limit\" <= ' + limit;
    return getQueryResults(query);
}

// get forecast by start date
const getDateForecast = async (date) => {
    try {
        const forecast = await getDateForecast_(date);
        return forecast;
    }

    catch (err) {
        console.error(err);
        return null;
    }
};

// helper method for getDateForecast
const getDateForecast_ = async (date) => {
    var query = 'SELECT * FROM weather WHERE date >= \'' + date + '\'::date;';
    return getQueryResults(query);
}


const getCityForecastByName = async (cityname) =>
{
    try {
        const forecast = await getCityForecastByName_(cityname);        
        return forecast;
    }

    catch (err) {
        console.error(err);
        return null;
    }
};

const getCityForecastByName_ = async (city) => {

    var cityname = city.charAt(0).toUpperCase() + city.slice(1);
    var query = 'SELECT * FROM weather WHERE city = \'' + cityname + '\';';
    return getQueryResults(query);

}


const saveForecastData = async (data) => {

    const allAsyncResults = [];

    // format insert query to perform a multiple line insert into the database
    for (const forecast of data) {
        var insert = 'INSERT INTO weather VALUES (\'' + forecast.city + '\',' + forecast.temp_lo + ',' + forecast.limit + ',\'' + forecast.date + '\');';
        allAsyncResults.push(insert);
    }

    const query = allAsyncResults.join("");
    return getQueryResultsInsert(query);
   
};

const getQueryResultsInsert = async (query) => {

    var client = getClient();

    return new Promise(function (resolve, reject) {
        client.query(query, function (err, result) {
            
            if (err) {
                return reject(err);
            } else {
                //console.log(result.rowCount);
                client.end();
                return resolve(result);
            }
        });
    });

}


const getQueryResults = async (query) => {

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
            return resolve("not found");
        });
    });

}

exports.getCityForecastByName = getCityForecastByName;
exports.saveForecastData = saveForecastData;
exports.getDateForecast = getDateForecast;
exports.getLimitForecast = getLimitForecast;