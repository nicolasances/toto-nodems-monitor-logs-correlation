var Controller = require('toto-api-controller');

var getLogs = require('./dlg/GetLogs');

var apiName = 'monitor-logs-correlation';

var api = new Controller(apiName);

api.path('GET', '/logs', getLogs);

api.listen();
