const def = require('../models/def/statuses');
const bcrypt = require('bcrypt'); // for password encryption
const _ = require('lodash'); //js utility lib
const validateNow = require('../interceptors/validate');
const {
    Seller,
    validate,
    validateLogin
} = require('../models/seller');

const express = require('express');
const router = express.Router();

router.post('/seller/login', validateNow(validateLogin), async (req, res) => {

    let seller = await Seller.findOne({
        username: req.body.username
    });
    if (!seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid username or password.');

    const validPassword = await bcrypt.compare(req.body.password, seller.password);
    if (!validPassword) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid username or password.');

    // const token = seller.generateAuthToken();
    res.send(_.pick(seller, ['_id', 'name', 'email', 'phone']));
});

router.post('/seller/Signup', [validateNow(validate)], async (req, res) => {

    let seller = await Seller.findOne({
        email: req.body.email
    });

    if (seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

    seller = await Seller.findOne({
        username: req.body.username
    });

    if (seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Username already registered.');

    seller = new Seller(_.pick(req.body, ['name', 'username', 'email', 'password', 'social_login', 'phone']));

    const salt = await bcrypt.genSalt(10);
    seller.password = await bcrypt.hash(seller.password, salt);

    await seller.save();
    res.send(_.pick(seller, ['_id', 'name', 'email', 'phone']));
});

module.exports = router;