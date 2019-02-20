var getLogs = require('./GetLogs');

/**
* Gets a representation of the flow of data of a given correlation id
*/
exports.do = function(request) {

  var cid = request.query.correlationId;

  return new Promise(function(success, failure) {

    // Retrieve the logs for the correlation id
    getLogs.do({query: {correlationId: cid, sort: 'timestamp', sortDir: 'asc'}}).then((data) => {

      var logs = data.logs;

      /**
       * 1. Get tuples
       * The tuples are repesented as an array of tuple objects, ORDERED by timestamp:
       * [ {ts: string, sender: {log}, receivers: [{log}]} , {...} ]
       */
      var tuples = getTuples(logs);

      // 2. Get tuples
      success({flow: tuples});

    }, failure)

  });

}

/**
 * Get Tuples function
 */
var getTuples = (logs) => {

  var tuples = [];

  var nextTuple;

  do {
    // Get next tuple to process (in order of timestamp asc)
    // The tuple is a correlated ensemble of logs that are correlated by the same msgId
    nextTuple = getNextTuple(logs);

    // Add the next tuple to the list of tuples
    if (nextTuple != null) tuples.push(nextTuple);

  } while (nextTuple != null);

  // Terminating condition = there are no more unprocessed elements
  return tuples;

}

/**
 * Get the next tuple (in order of asc timestamp)
 */
var getNextTuple = (logs) => {

  // 1. Get the first unprocessed msgId
  var msgId = getNextMsgId(logs);

  // TERMINATING CONDITION : If there are no unprocessed logs, return
  if (msgId == null) return null;

  // 2. Get all logs with that msgId and MARK THEM AS PROCESSED
  var correlatedLogs = getCorrelatedLogs(logs, msgId);

  // 3. Find the sender of the message
  var sender = findSender(correlatedLogs);

  // 4. Find the receivers of the message
  var receivers = findReceivers(correlatedLogs);

  // If the msgId == 'no-id' then create a particular tuple
  if (sender == null)
    return {
      ts: 0,
      sender: null,
      receivers: receivers
    }

  // 3. Compose the tuple
  return {
    ts: sender.timestamp,
    sender: sender,
    receivers: receivers
  };

}

/**
 * Retrieves the next unprocessed msg id
 */
var getNextMsgId = (logs) => {

  for (var i = 0; i < logs.length; i++) {

    if (logs[i].processed == null || !logs[i].processed) return logs[i].msgId;

  }

  return null;
}

/**
 * Retrieve the logs correlated by the specified msg id
 * AND MARK THEM AS PROCESSED
 */
var getCorrelatedLogs = (logs, msgId) => {

  var corLogs = [];

  for (var i = 0; i < logs.length; i++) {

    if (logs[i].msgId == msgId) {

      // add
      corLogs.push(logs[i]);

      // mark as processed
      logs[i].processed = true;

    }

  }

  return corLogs;

}

/**
 * Finds the sender of the message in the provided correlated logs
 */
var findSender = (logs) => {

  for (var i = 0; i < logs.length; i++) {

    if (logs[i].logType.indexOf('-out') > -1) return logs[i];

  }

  return null;

}

/**
 * Finds the receivers of the message in the provided correlated logs
 */
var findReceivers = (logs) => {

  var receivers = [];

  for (var i = 0; i < logs.length; i++) {

    if (logs[i].logType.indexOf('-in') > -1) receivers.push(logs[i]);

  }

  return receivers;

}
