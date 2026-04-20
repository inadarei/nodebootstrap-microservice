// @see: https://gist.github.com/branneman/8048520
const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '/lib'));

const express = require('express');
const http = require('http');
const CONF = require('config');
const log = require('metalogger')();
const appConfig = require('./appConfig');

const app = express();

// Configure logging from config if present
if ('log' in CONF) {
  if ('plugin' in CONF.log) { process.env.NODE_LOGGER_PLUGIN = CONF.log.plugin; }
  if ('level' in CONF.log) { process.env.NODE_LOGGER_LEVEL = CONF.log.level; }
  if ('customlevels' in CONF.log) {
    for (const key in CONF.log.customlevels) {
      process.env['NODE_LOGGER_LEVEL_' + key] = CONF.log.customlevels[key];
    }
  }
}

// Body parsing middleware (Express 5 built-in)
const defaultLimit = '50mb';
app.use(express.urlencoded({ extended: true, limit: defaultLimit }));
app.use(express.json({ type: 'application/*+json', limit: defaultLimit }));
app.use(express.json({ type: 'application/json', limit: defaultLimit }));
app.use(express.text({ type: 'text/plain', limit: defaultLimit }));
app.use(express.raw({ limit: defaultLimit }));

// Get port from config or environment
let serverPort = CONF.app.port || 5501;
if (process.env.PORT) {
  serverPort = process.env.PORT;
}

// Create and start HTTP server
const server = http.createServer(app);
server.listen(serverPort);
log.notice('Express server instance listening on port ' + serverPort);

// Expose http server for socket.io or other needs
app.http = server;

// Setup application routes and middleware
appConfig.setup(app);
