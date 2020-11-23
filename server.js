// @see: https://gist.github.com/branneman/8048520
const path = require('path');
require('app-module-path').addPath(path.join(__dirname,'/lib'));

const server = require('nodebootstrap-server')
    , appConfig = require('./appConfig')
    , app    = require('express')();

server.setup(app, appConfig.setup);
