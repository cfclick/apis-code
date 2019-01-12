const Joi = require('joi');
const mongoose = require('mongoose');
const {
    userSchema,
    validateUser,
    userJoiSchema,
} = require('./user');

const dealerSchema = userSchema.add({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 250,
        trim: true
    },
    social_login: {
        type: String,
        trim: true
    },

});

const Dealer = mongoose.model('dealers', dealerSchema);

function validateDealerLogin(dealer) {
    const schema = {
        username: Joi.string().min(6).max(50).required(),
        password: Joi.string().min(8).max(50).required()
    }

    return Joi.validate(dealer, schema);
}

function validateDealer(dealer) {

    let schema = userJoiSchema;
    schema.name = Joi.string().min(2).max(250).required();
    return Joi.validate(dealer, schema);
}


module.exports.Dealer = Dealer;
module.exports.validateUser = validateUser;
module.exports.validateDealer = validateDealer;
module.exports.validateDealerLogin = validateDealerLogin;