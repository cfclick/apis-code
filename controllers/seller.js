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
const controller = express.Router();

/**
 * Seller Controller
 */

module.exports = controller;