
// sql client query
const { Client } = require('pg');
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
const isProduction = process.env.NODE_ENV === 'production';

// constructor for the forecast model
function Forecast(city, temp_lo, limit, date) {

    this.city = city;
    this.temp_lo = temp_lo;
    this.limit = limit;
    this.date = date;
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
const getLimitForecast = (limit) => {
    var query = 'SELECT * FROM weather WHERE \"temp_lo\" <= ' + limit;
    return getQueryResults(query);
};

// get forecast where lower limit has been breached
const getCityLimitForecast = (city, limit) => {
    var query = 'SELECT * FROM weather WHERE city = \'' + city + '\' AND \"temp_lo\" <= ' + limit;
    return getQueryResults(query);
};

// get forecast by start date
const getDateForecast = (date) => {
    var query = 'SELECT * FROM weather WHERE date >= \'' + date + '\'::date;';
    return getQueryResults(query);
};

// get city forecast by name of the city
const getCityForecastByName = (city) =>
{
    var query = 'SELECT * FROM weather WHERE city = \'' + city + '\';';

    return getQueryResults(query);
};

// save forecast data into the database using insert statements
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


// generic query method that runs the query and returns the rows
const getQueryResults = async (query) => {

    var client = getClient();

    return new Promise(function (resolve, reject) {
        client.query(query, function (err, result) {
            client.end();

            if (err)
            {
                return reject(err);
            }
            else
            {
                if (result.rowCount > 0) {
                    return resolve(result.rows);
                }

                else {
                    return reject(new Error("Not Found"));
                }
            }
            
        });
    });

}

const getQueryResultsInsert = async (query) => {

    var client = getClient();

    return new Promise(function (resolve, reject) {
        client.query(query, function (err, result) {

            client.end();

            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });

}


exports.getCityForecastByName = getCityForecastByName;
exports.saveForecastData = saveForecastData;
exports.getDateForecast = getDateForecast;
exports.getLimitForecast = getLimitForecast;
exports.getCityLimitForecast = getCityLimitForecast;