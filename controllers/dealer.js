const def = require('../models/def/statuses');
const bcrypt = require('bcrypt'); // for password encryption
const _ = require('lodash'); //js utility lib
const validateNow = require('../interceptors/validate');
const {
    Dealer,
    validate,
    validateLogin
} = require('../models/dealer');

const express = require('express');
const controller = express.Router();

/**
 * Dealer Controller
 */

module.exports = controller;