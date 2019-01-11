const def = require('../models/def/statuses');
//const request = require('supertest');

module.exports = function (req, res, next) {

    if (!req.user.isAdmin) return res.status(def.API_STATUS.CLIENT_ERROR.FORBIDDEN).send('Access denided');

    next();
}