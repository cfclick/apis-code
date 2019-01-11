const Joi = require('joi');
const mongoose = require('mongoose');
const {
    userSchema,
    validateUser
} = require('./user');

const sellerSchema = userSchema.add({

    social_login: {
        type: String,
        trim: true
    },

});

const Seller = mongoose.model('sellers', sellerSchema);

function validateSellerLogin(seller) {
    const schema = {
        username: Joi.string().min(6).max(50).required(),
        password: Joi.string().min(8).max(50).required()
    }

    return Joi.validate(seller, schema);
}


module.exports.Seller = Seller;
module.exports.validateUser = validateUser;
module.exports.validateSellerLogin = validateSellerLogin;