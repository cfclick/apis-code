var express = require('express');
var router = express.Router();
const helpers = require('../../helpers');

module.exports = function(app,options) {     
    app.use(function (req, res, next) {

        
        res.setHeader('Access-Control-Allow-Origin', '*');    
        
      
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
    
        // Pass to next layer of middleware
        next();
    });
    
    app.use('/api/auth', require('./authRoute'));    
    app.use(helpers.errorHandler);
}