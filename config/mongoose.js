global.mongoose = require('mongoose')

const getMongooseURL = (options) => {  
    console.log(options)
    const url = 'mongodb://'+options.user+':'+options.pass+'@ds127944.mlab.com:27944/'+options.db
    console.log(url)
    return url;
}
const connect =(options, mediator)=>{
    mediator.once('boot.ready',()=>{      

        console.log('creating connection');
        mongoose.connect(getMongooseURL(options),options.dbParameters)
        // If the connection throws an error
        mongoose.connection.on('error',function(err){
            mediator.emit('db.error', err)
        })
        // When successfully connected
        mongoose.connection.on('connected', function () {  
            mediator.emit('db.ready', mongoose.connection)
        });
        // When the connection is disconnected
        /*mongoose.connection.on('disconnected', function () {  
            mediator.emit('db.error', err)
        });

        // If the Node process ends, close the Mongoose connection 
        process.on('SIGINT', function() {  
            mongoose.connection.close(function () { 
                mediator.emit('db.error', err)
                process.exit(0); 
            }); 
        });*/
                
    })
    
}
module.exports = Object.assign({}, {connect})
