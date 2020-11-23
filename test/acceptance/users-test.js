const request = require('supertest');
const assert  = require('chai').assert;
const sinon   = require('sinon');
const server  = require('../support/server');
const fh      = require("../support/fixture-helper.js");
const log     = require('metalogger')();

const usersModel = require('users/models/users');

describe('users endpoint', () => {
  let app;

  beforeEach((done) => {
    app = server.express();
    server.beforeEach(app, function() {
      done();
    });
  });

  afterEach(function () {
  });

  before(() => {

    this.sinonbox = sinon.createSandbox();

    this.getUsers = this.sinonbox.stub(usersModel.prototype, 'getUsers').callsFake(function() {
      return new Promise(function(resolve, reject) {
        fh.loadFixture("users-list.json").then(function(sampleUsersList) {
          resolve(JSON.parse(sampleUsersList));
        }).catch(function(err) {
          log.error(err);
        });
      });
    });
  });

  after(() => {
    this.sinonbox.restore();
  });

  // Note: depends on the usersModel stub.
  it('GET /users returns proper data', (done) =>  {
    request(app)
      .get('/users')
      .expect('Content-Type', /application\/hal\+json.*/)
      .expect(200)
      .expect(function(response) {
        const payload = response.body;
        assert.property(payload, '_links');
        assert.property(payload, 'users');
        assert.equal(payload._links.self.href, '/users');
        assert.equal(payload.users.length, 2);
        assert.equal(payload.users[0].email, 'first@example.com');
        assert.equal(payload.users[1].uuid, '229b673c-a2c5-4729-84eb-ff30d42ab133');
      })
      .end(done);
  });

  it('POST /users validates properly', (done) =>  {
    request(app)
      .post('/users')
      .expect('Content-Type', /application\/json.*/)
      .expect(400)
      .expect(function(response) {
        const payload = response.body;
        assert.equal(payload.errors[0], "email must be provided");
      })
      .end(done);
  });
});
