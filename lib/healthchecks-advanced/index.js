import Duration from 'duration';
import db       from '../datastore/index.js';

export default class Checks {

  async dbUsersCheck() {
    const start = new Date();
    const query = 'select `email`, `uuid`, `last_updated` from users LIMIT 1';
    let errMsg  = '';

    const response = {};

    try {
      await db.query(query);
    } catch (err) {
      errMsg = err;
    } finally {
      const elapsed = new Duration(start, new Date());

      response.status      = errMsg ? 'fail' : 'pass';
      response.metricValue = elapsed.milliseconds;
      response.metricUnit  = 'ms';

      if (errMsg) {
        response.output = errMsg;
      }
    }

    return response;
  }
}
