
exports.converter = {

  logTO : function(po) {

    return {
      id: po._id,
      cid: po.cid,
      msgId: po.msgId,
      timestamp: po.timestamp,
      microservice: po.microservice,
      logType: po.logType,
      logLevel: po.logLevel,
      microserviceTo: po.microserviceTo,
      message: po.message
    }
  }
}
