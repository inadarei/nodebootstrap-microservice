const request = require('supertest');
const assert  = require('chai').assert;
const sinon   = require('sinon');
const server  = require('../support/server');
const fh      = require("../support/fixture-helper.js");
const log     = require('metalogger')();

const usersModel = require('users/models/users');

describe('health endpoint', () => {
  let app;

  beforeEach((done) => {
    app = server.express();
    server.beforeEach(app, function() {
      done();
    });
  });

  // Note: depends on the usersModel stub.
  it('GET /health returns proper data', (done) =>  {
    request(app)
      .get('/health')
      .expect('Content-Type', /application\/health\+json.*/)
      .expect(200)
      .expect(function(response) {
        const payload = response.body;
        assert.equal(payload.status, 'pass');
        assert.property(payload, "details");
        assert.property(payload.details, "db:usersQuery");
        assert.equal(payload.details["db:usersQuery"].metricUnit, 'ms');
      })
      .end(done);
  });  

});
