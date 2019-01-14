const jwt = require('jsonwebtoken')
const config = require('config');
const { API_STATUS } = require('../models/def/statuses');	

module.exports = function auth(req, res, next){
    const token = req.header('x-auth-token');
    if(!token) return  res.status(API_STATUS.CLIENT_ERROR.UNAUTHORIZED).send('Access denied. No token provided')

    try{
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();
    }
    catch(ex){
        res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid token');
    }
}

