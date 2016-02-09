/* jshint -W097 */
/* jshint node: true */
'use strict';

let fs = require('fs');
let fsp = require('fs-promise');

exports.versionInfo = {
  'build_timestamp': 'src',
  'version': 'no version file'
};

exports.readBuildTimestamp = function() {
  return fsp.readFile('timestamp.txt', 'utf-8')
    .then(function(data) {
      if (data) {
        exports.versionInfo.build_timestamp = data.trim();
      }
    })
    .catch(function(error) {
    });
};

exports.readVersion = function() {
  return fsp.readFile('version.txt', 'utf-8')
    .then(function(data) {
      if (data) {
        exports.versionInfo.version = data.trim();
      }
    })
    .catch(function(error) {
    });
};

// Read in Timestamp file
fs.readFile('timestamp.txt', 'utf-8', function(err, ts) {
  if (ts) {
    exports.versionInfo.build_timestamp = ts.trim();
  }
});

// Read in version string in version.txt
fs.readFile('version.txt', 'utf-8', function(err, vs) {
  if (vs) {
    exports.versionInfo.version = vs.trim();
  }
});
