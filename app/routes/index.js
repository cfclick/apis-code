const auth = require('../routes/auth');
const error = require('../interceptors/error');
const express = require('express');

module.exports = function (app, options) {
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

    //app.use('/apis/auth', require('./authRoute'));  
    app.use(express.json());
    app.use('/api/auth', auth);
    //app.use(helpers.errorHandler);
    //Error Handler
    app.use(error);
}