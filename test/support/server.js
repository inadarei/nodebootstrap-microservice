const server = require('nodebootstrap-server')
    , express = require('express')
    , healthcheck = require('maikai')
    , appConfig = require('../../appConfig');

exports.beforeEach = function(app, callback) {
  server.setupTest(app, function(app) {
    //app.use(healthcheck().express());

    const check = healthcheck();
    const AdvancedHealthcheckers = require('healthchecks-advanced');
    const advCheckers = new AdvancedHealthcheckers();
    // Database health check is cached for 10000ms = 10 seconds!
    check.addCheck('db', 'usersQuery', advCheckers.dbUsersCheck, 
      {minCacheMs: 10000});
    app.use(check.express());

    appConfig.setup(app, callback);
  });
};

exports.express = function() {
  return express();
};
