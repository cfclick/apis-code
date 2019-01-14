const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser');
const cors = require('cors');
const api = require('./app/routes')



const start = (options)=>{
    return new Promise((resolve,reject)=>{
        
        if(!options.port){
            reject(new Error('The server must be started with an available port'))
        }

        const app = express()
        app.use(morgan('dev'))
        app.use(helmet())        
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cors());        
      
        api(app, options)     
        
        app.listen(options.port,function(){
            console.log('server running on http://localhost:'+options.port);
         })
        //console.log(server)
    })
}

module.exports = Object.assign({},{ start })