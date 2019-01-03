const Joi = require('joi');
const PasswordComplexity = require('joi-password-complexity');
const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 150
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        maxlength: 50,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 250,
        trim: true
    },
    social_login: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 14,
        trim: true
    },
    created_at: Date,
    updated_at: Date,
});


sellerSchema.methods.validatePassword = function () {
    const complexityOptions = {
        min: 8,
        max: 30,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 4
    }
    return Joi.validate(this.password, new PasswordComplexity(complexityOptions));
}

const Seller = mongoose.model('sellers', sellerSchema);

function validateSeller(seller) {
    const schema = {
        name: Joi.string().min(2).max(50).required(),
        username: Joi.string().min(6).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(50).required(),
        phone: Joi.string().min(10).max(15).required(),
    }

    return Joi.validate(seller, schema);
}

function validateLogin(seller) {
    const schema = {
        username: Joi.string().min(6).max(50).required(),
        password: Joi.string().min(8).max(50).required()
    }

    return Joi.validate(seller, schema);
}


module.exports.Seller = Seller;
module.exports.validate = validateSeller;
module.exports.validateLogin = validateLogin;