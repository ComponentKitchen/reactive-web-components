/* jshint -W097 */
/* jshint node: true */
'use strict';

let path = require('path');
let express = require('express');
let engines = require('consolidate');
let compression = require('compression');
let version = require('./version.js');
let pages = require('./pages.js');
let logger = require('./logger').logger('rwcweb');

let viewsFolderName = 'views';

// Log all requests
function logRequest(req, res, next) {
  logger.info({req: req}, 'REQUEST');
  next();
}

module.exports = {

  start: function(clientFolder, testHookExpressStarted) {
    logger.info('Starting the Express server');

    let app = express();
    let server = require('http').createServer(app);

    app.use(compression());
    app.use(logRequest);

    // Use DustJS as our web view engine.
    var viewsFolder = path.join(__dirname, viewsFolderName);
    app.set('view engine', 'dust');
    app.engine('dust', engines.dust);
    app.set('views', viewsFolder);

    // Headers shared by most responses served by Express.
    app.all('*', function(request, response, next) {
      response.set({
        // Enable CORS
        // From http://enable-cors.org/server_expressjs.html
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With'
      });
      next();
    });

    //
    // Dynamic routes.
    // Since (some of) these are also valid static paths, these declarations
    // have to come before the express.static invocation.
    //

    // General page serving.
    pages.init(app);

    var port = process.env.CK_EXPRESS_PORT || process.env.PORT || 5000;
    server.listen(port, function() {
      version.readBuildTimestamp()
        .then(function() {
          // Serve files from the specified client folder.
          // If we're running against public/src on a local test, then set no max-age, otherwise 365 days
          let staticCacheTime = version.versionInfo.build_timestamp == 'src' ? 0 : 1000*60*60*24*365;
          app.use(express.static(clientFolder, {
            maxage: staticCacheTime,
            redirect: false     // Don't automatically redirect from foo to foo/
          }));

          logger.info('Web server running on port ' + port + ' (e.g., http://localhost:' + port + ')');
          logger.info('Serving pages from ' + clientFolder);
          logger.info('Using timestamp string: ' + version.versionInfo.build_timestamp);
          logger.info('Using version string: ' + version.versionInfo.version);
          logger.info('Setting max-age Cache-Control value to ' + staticCacheTime + ' milliseconds');

          // Inform any test hooks that the server (ie, Express) has started
          if (testHookExpressStarted) {
            testHookExpressStarted();
          }
        });
    });
  }
};
