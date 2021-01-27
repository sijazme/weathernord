'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dotenv = require('dotenv').config();
var nconf = require('nconf');

const cron = require('node-cron');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1;

// run job every five minutes
// */5 * * * *

// run job every 6 hours
// 0 */6 * * *

// more on this website https://crontab.guru/

const axios = require('axios');
var internetAvailable = require("internet-available");

var routes = require('./routes/index');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
// end sql client query

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

// Scheduled tasks to be run on the server. Frequence is a cron syntax string. 
cron.schedule(nconf.get('Frequency'), function () {

    internetAvailable().then(function () {

        console.log('connecting to openweathermap.org');
        try
        {
            var url = nconf.get('AppURL') + '/schedule';            
            // run the scheduled task by calling a web function using promise based http client axios
            axios.get(url).then((response) => {
                console.log(response.data);
            });
        }
        catch (err) {
            console.log(err);
        }
    }).catch(function () {
        // if there is no internet then print to console
        console.log("No internet connection!");
    });
});


