global.mongoose = require('mongoose')

const getMongooseURL = (options) => {  
    const url = 'mongodb://localhost/'+options.db 
    return url;
}
const connect =(options, mediator)=>{
    mediator.once('boot.ready',()=>{      

        console.log('creating connection');
        mongoose.connect(getMongooseURL(options))

        // If the connection throws an error
        mongoose.connection.on('error',function(err){         
            mediator.emit('db.error', err)
        })

        // When successfully connected
        mongoose.connection.on('connected', function () {             
            mediator.emit('db.ready', mongoose.connection)
        });       
                
    })
    
}
module.exports = Object.assign({}, {connect})
