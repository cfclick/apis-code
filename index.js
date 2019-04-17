'use strict'
require('dotenv').config();

const config = require('config')
const winston = require('winston');
const express = require('express');
const app = express();

require('./init/errorhandling')(); //logging library
require('./init/controllers')(app);
require('./init/db')();
//require('./init/config')();
require('./init/validation')();

const port = config.get('port') || 3001;
console.log(app.get('env'))
const server = app.listen(port, () => winston.info(`API Started, listening on port ${port}...`));

module.exports = server;