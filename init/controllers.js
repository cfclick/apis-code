const express = require('express');

//const users = require('../controllers/users');
const auth = require('../controllers/auth');
const error = require('../interceptors/error');

module.exports = function (app) {
    app.use(express.json());
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'x-auth-token,content-type');
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });
    // app.use('/api/users', users);
    app.use('/api/auth', auth);

    //Error Handler
    app.use(error);
}