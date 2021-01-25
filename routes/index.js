'use strict';

const fetch = require('node-fetch');
var express = require('express');
var router = express.Router();

const forecastcontroller = require('../controllers/forecastcontroller');
const openweathermapcontroller = require('../controllers/openweathermapcontroller');


router.get('/schedule', openweathermapcontroller.saveForecastAll);

router.get('/', openweathermapcontroller.getForecastAll);

router.get('/forecast/:city', forecastcontroller.getCityForecast);

module.exports = router;
