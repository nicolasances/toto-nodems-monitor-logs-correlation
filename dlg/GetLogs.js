var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/LogConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(request) {

  var filters = request.query;

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Filter definition
      let filter = {};
      let options = {};

      // Sorting
      options.sort = [];

      if (filters.sort == 'date') options.sort.push(['date', filters.sortDir == 'desc' ? -1 : 1]);
      // Default sorting
      else options.sort.push(['date', -1]);

      // Filtering
      // Filter per correlationId
      let correlationFilter = {};
      if (filters.correlationId != null) correlationFilter = {cid: filters.correlationId};

      filter = correlationFilter;

      // Max results
      if (filters.maxResults != null) options.limit = parseInt(filters.maxResults);
      // default
      else options.limit = 100;

      // Fetch the data!
      db.db(config.dbName).collection(config.collections.logs)
                          .find(filter, options)
                          .toArray(function(err, array) {

        db.close();

        if (array == null) {
          success({});
          return;
        }

        var logs = [];
        for (var i = 0; i < array.length; i++) {
          logs.push(converter.converter.logTO(array[i]));
        }

        success({logs: logs});

      });
    });
  });

}
