const express = require('express');

//const users = require('../controllers/users');
const auth = require('../controllers/auth');
const dealer = require('../controllers/dealer');
const seller = require('../controllers/seller');
const car = require('../controllers/car');
const dealership = require('../controllers/dealership');
const common = require('../controllers/common');
const error = require('../interceptors/error');
const authMiddleware = require('../interceptors/auth');//calling authentication middleware

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
    app.use('/api/seller', seller);
    app.use('/api/dealer', dealer);
    app.use('/api/car', car);
    app.use('/api/dealership', [authMiddleware], dealership);
    app.use('/api/common', common);

    //Error Handler
    app.use(error);
}