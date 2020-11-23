const request = require('supertest');
const server = require('../support/server');

describe('home document', () => {
  let app;
  beforeEach(function (done) {
    app = server.express();
    server.beforeEach(app, () => {
      done();
    });
  });

  afterEach(function () {

  });

  it('responds to / with a 200 OK', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end(done);
  });

  it('should have proper headers', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .expect((res) => {
        res.headers.should.have.properties(['content-type','etag']);
      })
      .end(done);
  });

  it('should have proper uber+json content-type', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .expect((res) => {
        res.headers['content-type'].should.equal('application/vnd.uber+json; charset=utf-8');
      })
      .end(done);
  });

  it('response body should be a valid uber document', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect((res) => {
        res.body.should.have.properties(['uber']);
        res.body.uber.should.have.properties(['data']);
      })
      .end(done);
  });
});
