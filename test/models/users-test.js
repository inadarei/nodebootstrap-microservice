const assert  = require('chai').assert;
const expect = require('chai').expect;
const fp = require('fakepromise');

const Users = require('users/models/users');

describe('users model', () => {

  it('Load users from a database', async () =>  {
      const users = new Users();
      const usersList = await users.getUsers();
      assert.ok(usersList.length > 0, 
        'Database query returns more than zero elements');
      const aUser = usersList[0];
      expect(aUser).to.have.property('email');  
  });


  after( async () => {
    const db = require("datastore");
    const conn = await db.conn();
    conn.end();
  });

});
