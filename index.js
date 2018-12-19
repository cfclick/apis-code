'use strict'
const {EventEmitter} = require('events')
const config = require('./config/')
const server = require('./serverConnect')
const mediator = new EventEmitter()
require('dotenv').config();

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception', err)
})
  
process.on('uncaughtRejection', (err, promise) => {
    console.error('Unhandled Rejection', err)
})
mediator.on('db.ready',(db)=>{
    return server.start({
        port: config.serverSettings.port        
    })
})
mediator.on('db.error', (err) => {
    console.error(err)
})
config.db.connect(config.dbSettings, mediator)

mediator.emit('boot.ready')
  