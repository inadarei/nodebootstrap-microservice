const express = require('express');
const http = require('http');
const healthcheck = require('maikai');
const appConfig = require('../../appConfig');

exports.beforeEach = function(app, callback) {
  // Body parsing middleware (Express 5 built-in)
  const defaultLimit = '50mb';
  app.use(express.urlencoded({ extended: true, limit: defaultLimit }));
  app.use(express.json({ type: 'application/*+json', limit: defaultLimit }));
  app.use(express.json({ type: 'application/json', limit: defaultLimit }));
  app.use(express.text({ type: 'text/plain', limit: defaultLimit }));
  app.use(express.raw({ limit: defaultLimit }));

  // Create HTTP server (not listening for tests)
  const server = http.createServer(app);
  app.http = server;

  const check = healthcheck();
  const AdvancedHealthcheckers = require('healthchecks-advanced');
  const advCheckers = new AdvancedHealthcheckers();
  // Database health check is cached for 10000ms = 10 seconds!
  check.addCheck('db', 'usersQuery', advCheckers.dbUsersCheck,
    {minCacheMs: 10000});
  app.use(check.express());

  appConfig.setup(app, callback);
};

exports.express = function() {
  return express();
};
