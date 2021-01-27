'use strict';

const fetch = require('node-fetch');
var express = require('express');
var router = express.Router();

const datacontroller = require('../controllers/datacontroller');
const openweathermapcontroller = require('../controllers/openweathermapcontroller');

// schedule task router calls the open weather map controller to save forecast for all cities in the config file
router.get('/schedule', openweathermapcontroller.saveForecastAll);

// router redirects calls to index page to get forecast for all cities and displays them in html format
router.get('/', openweathermapcontroller.getOpenMapForecastAll);

// rest api router to get forecast for a particular city
router.get('/city/:name', datacontroller.getCityForecast);

// rest api to get five day forecast for a start date
router.get('/date/:start', datacontroller.getDateForecast);

// rest api to get forecast by limit
router.get('/limit/:number', datacontroller.getLimitForecast);

// rest api to get forecast by limit
router.get('/limit/:city/:number', datacontroller.getCityLimitForecast);

// rest api router to get all forecast entries in the database
router.get('/all', datacontroller.getForecastAll);

module.exports = router;
