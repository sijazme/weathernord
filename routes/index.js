'use strict';

const fetch = require('node-fetch');
var express = require('express');
var router = express.Router();

const datacontroller = require('../controllers/datacontroller');
const openweathermapcontroller = require('../controllers/openweathermapcontroller');


router.get('/schedule', openweathermapcontroller.saveForecastAll);

router.get('/', openweathermapcontroller.getForecastAll);

router.get('/forecast/:city', datacontroller.getCityForecast);

module.exports = router;
