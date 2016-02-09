/* jshint -W097 */
/* jshint node: true */
'use strict';

let bunyan = require('bunyan');

function createLogger(loggerName) {
  return bunyan.createLogger({
    name: loggerName,
    streams: [
      {
        level: 'info',
        stream: process.stdout
      }
    ],
    serializers: {
      req: reqSerializer,
      res: resSerializer,
      err: bunyan.stdSerializers.err
    }
  });
}

function reqSerializer(req) {
  if (!req || !req.connection) {
    return req;
  }

  return {
    req_id: req.req_id,
    method: req.method,
    url: req.url,
    headers: req.headers,
    remoteAddress: req.connection.remoteAddress,
    remotePort: req.connection.remotePort
  };
}

function resSerializer(res) {
  if (!res || !res.statusCode) {
    return res;
  }

  return {
    req_id: res.req.req_id,
    statusCode: res.statusCode,
    header: res._header
  };
}

module.exports = {
  logger: createLogger
};
