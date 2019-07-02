'use strict'
require('dotenv').config();

const config = require('config')
const winston = require('winston');
const express = require('express');
const app = express();
const realTimeUpdate = require('./controllers/realtimeupdates')

require('./init/errorhandling')(); //logging library
require('./init/controllers')(app);
require('./init/db')();
//require('./init/config')();
require('./init/validation')();

const port = config.get('port') || 3001;
console.log(app.get('env'))
const server = app.listen(port, () => winston.info(`API Started, listening on port ${port}...`));

const io = require('socket.io')(server);
require('./controllers/realtimeupdates')(io)//set io object in app we can use whereever we want

module.exports = server;