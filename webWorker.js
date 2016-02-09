var path = require('path');
var clientFolder = path.join(__dirname, 'public');

var webServer = require('./server/webServer.js');
webServer.clientFolder = clientFolder;
webServer.listen();
