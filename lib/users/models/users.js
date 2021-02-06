import db from '../../datastore/index.js';

export default class Users {

  async getUsers() {
    return await db.query('select "email", "uuid", "last_updated" from users');
  }

}

