// @see: https://gist.github.com/branneman/8048520
import express from 'express';
import server  from 'nodebootstrap-server-test';

import appConfig from './appConfig.js';

const app = express();

server.setup(app, appConfig);
