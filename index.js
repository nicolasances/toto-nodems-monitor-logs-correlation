var Controller = require('toto-api-controller');

var getLogs = require('./dlg/GetLogs');
var getFlow = require('./dlg/GetFlow');

var apiName = 'monitor-logs-correlation';

var api = new Controller(apiName);

api.path('GET', '/logs', getLogs);
api.path('GET', '/flow', getFlow);

api.listen();
