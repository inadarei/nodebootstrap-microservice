// eslint-disable global-require
import hbs         from 'hbs';
import helmet      from 'helmet';
import healthcheck from 'maikai';
import metalogger  from 'metalogger';

import AdvancedHealthCheckers from './lib/healthchecks-advanced/index.js';
import homeDoc                from './lib/homedoc/index.js';
import users                  from './lib/users/index.js';

const log = metalogger();

// Add all routes and route-handlers for your service/app here:
function serviceRoutes(app) {

  // Add advanced healthcheck middleware (incl. database check)
  const check       = healthcheck();
  const advCheckers = new AdvancedHealthCheckers();
  // Database health check is cached for 10000ms = 10 seconds!
  check.addCheck('db', 'usersQuery', advCheckers.dbUsersCheck,
    { minCacheMs: 10000 });
  app.use(check.express());

  /* eslint-disable global-require */

  app.use('/', homeDoc); // attach to root route
  app.use('/users', users); // attach to sub-route

  /* eslint-enable global-require */
}

function setupErrorHandling(app) {
  // Custom formatting for error responses.
  app.use((err, req, res, next) => {
    if (err) {
      const out = {};
      if (err.isJoi || err.type === 'validation') { //validation error. No need to log these
        out.errors = err.details;
        res.status(400).json(out);
        return;
      } else {
        log.error(err);
        if (process.env.NODE_ENV === 'production') {
          out.errors = ['Internal server error'];
        } else {
          out.errors = [err.toString()];
        }
        res.status(500).json(out);
        return;
      }
    }
    return next();
  });
}

export default function (app, callback) {
  // Choose your favorite view engine(s)
  app.set('view engine', 'handlebars');
  app.engine('handlebars', hbs.__express);

  /** Adding security best-practices middleware
   * see: https://www.npmjs.com/package/helmet **/
  app.use(helmet());

  //---- Mounting well-encapsulated application modules (so-called: "mini-apps")
  //---- See: http://expressjs.com/guide/routing.html and http://vimeo.com/56166857
  serviceRoutes(app);

  setupErrorHandling(app);

  // If you need websockets:
  // let socketio = require('socket.io')(runningApp.http);
  // require('fauxchatapp')(socketio);

  if (typeof callback === 'function') {
    callback(app);
  }
}
