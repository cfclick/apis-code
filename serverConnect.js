const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
var bodyParser = require('body-parser');
const cors = require('cors');
const api = require('./app/routes')



var start = (options)=>{
    return new Promise((resolve,reject)=>{
        
        if(!options.port){
            reject(new Error('The server must be started with an available port'))
        }

        const app = express()
        app.use(morgan('dev'))
        app.use(helmet())
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(cors());
        
        app.use((err, req, res, next) => {
        reject(new Error('Something went wrong!, err:' + err))
            res.status(500).send('Something went wrong!')
        })
        api(app, options)
        //const server = app.listen(options.port, () => resolve(server))
        
        app.listen(options.port,function(){
            console.log('server running on http://localhost:'+options.port);
         })
        //console.log(server)
    })
}

module.exports = Object.assign({},{ start })