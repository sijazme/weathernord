'use strict';

const fetch = require('node-fetch');
var express = require('express');
var router = express.Router();

const datacontroller = require('../controllers/datacontroller');
const openweathermapcontroller = require('../controllers/openweathermapcontroller');

// schedule task router calls the open weather map controller to save forecast for all cities in the config file
router.get('/schedule', openweathermapcontroller.saveForecastAll);

// router redirects calls to index page to get forecast for all cities and displays them in html format
router.get('/', openweathermapcontroller.getForecastAll);

// rest api router to get forecast for a particular city
router.get('/city/:name', datacontroller.getCityForecast);

// rest api router to get five day forecast for a start date
router.get('/date/:start', datacontroller.getDateForecast);

module.exports = router;
