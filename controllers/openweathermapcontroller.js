var nconf = require('nconf');
const { Worker, isMainThread} = require('worker_threads');
nconf.argv().env().file({ file: 'config.json' });
const mapexecutor = require("./openmap.executor");

exports.getOpenMapForecastAll = (req, res) => {

    mapexecutor.readJsonFile().then((cityList) => {        
        mapexecutor.getOpenMapForecast(cityList).then(cityarray => {
            res.render('index', { title: 'Weather Forcast', data: cityarray });
        });
    });
};

exports.saveForecastAll = async (req, res) => {

    if (isMainThread) {        
        const worker = new Worker(__dirname + '/openmap.executor.js', { workerData: { value: "" } });
        worker.on('message', (result) => {
            res.status(200).send({ message: result.rows + " rows inserted to dabatase -- open weather forecast information saved."   });
        });
        worker.on('exit', (code) => {
        });
    }
};
