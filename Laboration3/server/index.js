'use strict';

let Hapi = require('hapi');
let traceur = require('traceur');

// Set up Traceur before importing es6 code
traceur.require.makeDefault(function (filename) {
  // don't transpile our dependencies, just our app
  return filename.indexOf('node_modules') === -1;
});

let routes = require('./lib/routes.js').routes;

let server = new Hapi.Server('127.0.0.1', 9099, {cors: true});

routes.forEach(function (route) {
  server.route(route);
});

if (!module.parent) {
  server.start(function () {
    console.log('Server started', server.info.uri);
  });
}

module.exports = server;
