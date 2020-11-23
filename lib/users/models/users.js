const db = require("datastore");
const log = require('metalogger')();
const Promise = require('bluebird');

class Users {

  async getUsers() {
    const conn = await db.conn();
    let users = [{}];
    if (conn) {
      users = await conn.query('select `email`, `uuid`, `last_updated` from users');
    } 
    return users;
  }

}

module.exports = Users;
