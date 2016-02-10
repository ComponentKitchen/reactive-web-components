/* jshint -W097 */
/* jshint node: true */
'use strict';

let version = require('./version.js');

function init(app) {
  // Map simple routes to Dust templates.
  let routes = {
    '/': 'index.html'
  };
  for (let routePath in routes) {
    let view = routes[routePath];
    routePathToView(app, routePath, view);
  }

  // Version page
  app.get('/version', function(request, response) {
    response.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });

    return response.send(version.versionInfo);
  });
}

function routePathToView(app, path, view) {
  app.get(path, function(request, response) {
    response.set({'Cache-Control': 'no-cache'});
    let data = {
      version: version.versionInfo.build_timestamp
    };
    response.render(view, data);
  });
}

module.exports = {
  init: init
};
