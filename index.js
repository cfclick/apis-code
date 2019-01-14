'use strict'
const {EventEmitter} = require('events')

const config = require('config')
const server = require('./serverConnect')
const dbConnection = require('./config/mongoose')
const mediator = new EventEmitter()


if(!config.get('jwtPrivateKey')){
    console.log('FATAl ERROR: jwtPrivateKey is not defined')
}


process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception', err)
})
  
process.on('uncaughtRejection', (err, promise) => {
    console.error('Unhandled Rejection', err)
})
process.on('unhandledRejection', function(reason, p) {
    console.log("Unhandled Rejection:", reason.stack);
    process.exit(1);
});

mediator.on('db.ready',(db)=>{
    console.log('Connected to MongoDb...');

    return server.start({
        port: config.get('ApiPort')       
    })

})
mediator.on('db.error', (err) => {
    console.log('Could not connect to MongoDb...');
})

dbConnection.connect(config.get('MongoDb'), mediator)

mediator.emit('boot.ready')
  