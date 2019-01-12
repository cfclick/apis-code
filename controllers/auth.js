const def = require('../models/def/statuses');
const _ = require('lodash'); //js utility lib
const bcrypt = require('bcrypt'); // for password encryption
const {
    Seller,
    validateSellerLogin
} = require('../models/seller');

const {
    Dealer,
    validateDealerLogin,
    validateDealer,
} = require('../models/dealer');

const {
    User,
    validateUser
} = require('../models/user');

const express = require('express');
const controller = express.Router();

controller.post('/seller/login', async (req, res) => {

    const {
        error
    } = validateSellerLogin(req.body);
    if (error) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(error.details[0].message);

    let seller = await Seller.findOne({
        username: req.body.username
    });
    if (!seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid username or password.');

    const validPassword = await bcrypt.compare(req.body.password, seller.password);
    if (!validPassword) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid username or password.');

    const token = seller.generateAuthToken();
    //const token = user.generateAuthToken();
    res.send(token);
});

controller.post('/seller/signup', async (req, res) => {

    const {
        error
    } = validateUser(req.body);
    if (error) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(error.details[0].message);

    let seller = await Seller.findOne({
        email: req.body.email
    });

    if (seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

    seller = await Seller.findOne({
        username: req.body.username
    });

    if (seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Username already registered.');

    seller = new Seller(_.pick(req.body, ['firstName', 'lastName', 'username', 'email', 'password', 'social_login', 'phone']));

    const salt = await bcrypt.genSalt(10);
    seller.password = await bcrypt.hash(seller.password, salt);

    await seller.save();
    res.send(_.pick(seller, ['_id', 'firstName', 'lastName', 'username', 'email', 'phone']));

});

controller.post('/dealer/login', async (req, res) => {

    const {
        error
    } = validateDealerLogin(req.body);
    if (error) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(error.details[0].message);

    let dealer = await Dealer.findOne({
        username: req.body.username
    });
    if (!dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid username or password.');

    const validPassword = await bcrypt.compare(req.body.password, dealer.password);
    if (!validPassword) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid username or password.');

    const token = dealer.generateAuthToken();
    //const token = user.generateAuthToken();
    res.send(token);
});

controller.post('/dealer/signup', async (req, res) => {

    const {
        error
    } = validateDealer(req.body);
    if (error) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(error.details[0].message);

    let dealer = await Dealer.findOne({
        email: req.body.email
    });

    if (dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

    dealer = await Dealer.findOne({
        username: req.body.username
    });

    if (dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Username already registered.');

    dealer = new Dealer(_.pick(req.body, ['name', 'firstName', 'lastName', 'username', 'email', 'password', 'social_login', 'phone']));

    const salt = await bcrypt.genSalt(10);
    dealer.password = await bcrypt.hash(dealer.password, salt);

    await dealer.save();
    res.send(_.pick(dealer, ['_id', 'name', 'firstName', 'lastName', 'username', 'email', 'phone']));

});


module.exports = controller;