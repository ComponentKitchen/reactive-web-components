
/* jshint -W097 */
/* jshint node: true */
'use strict';

var logger = require('./logger').logger('rwcweb');
var expressServer = require('./expressServer.js');

var clientFolder;             // The location of the page files.
var testHookExpressStarted = null;

logger.info('***** Starting RWC web app *****');

module.exports = {

  get clientFolder() {
    return clientFolder;
  },
  set clientFolder(folder) {
    clientFolder = folder;
  },

  //
  // listen is the entry point for starting the express server.
  // The callback parameter is to be used by end-to-end test code
  // and is otherwise not invoked by the core app.
  //
  listen: function(expressStartedCB) {

    //
    // The listen method may be called from within our app, as
    // part of a connection retry. Do not overwrite the testHook callbacks
    // with null.
    //
    if (expressStartedCB) {
      testHookExpressStarted = expressStartedCB;
    }

    return expressServer.start(clientFolder, testHookExpressStarted);
  }

};
