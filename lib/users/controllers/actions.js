/* jshint -W079 */
const Promise = require('bluebird')
    , config = require('config')
    , log = require('metalogger')()
    , representor = require('kokua')
    , _ = require('lodash');

const Users   = require("users/models/users");
const actions = {}
    , model   = new Users();

const responseMediaType = 'application/hal+json';

actions.getUsers = async function(req, res, next) {

  let userRows = {};
  try {
    userRows = await model.getUsers();
  } catch (err) {
    let msg = "Database Error: " + err.message;
    if (err.message.match(/ER_NO_SUCH_TABLE/)) {
        msg = "Database hasn't been set up. Please run: `make migrate`";
    }
    return res.status(500).send(msg);
  }

  let response = {};
  response.users = userRows;
  response["h:ref"] = {
      "self" : "/users"
  };

  // Render internal representation into proper HAL+JSON
  response = representor(response, responseMediaType);

  res.set('Content-Type', responseMediaType)
      .status(200)
      .json(response);

};

actions.addUser = async function(req, res, next) {
    const response = {"status" : "ok"};
    response.req = req.body;
    res.status(200).json(response);
};

module.exports = actions;
