const fs = require('fs'); //file system
const jwt = require('jsonwebtoken'); //generate json token
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const PasswordComplexity = require('joi-password-complexity');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true
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
        maxlength: 250
    },
    phone: {
        type: String,
        required: false,
        minlength: 10,
        maxlength: 14,
        trim: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    created_at: Date,
    updated_at: Date,
});

userSchema.methods.generateAuthToken = function () {

    // PRIVATE and PUBLIC key

    let privateKEY = fs.readFileSync('./config/keys/private.key');

    const i = 'topautobid'; // Issuer 
    const s = 'info@topautobid.com'; // Subject 
    const a = 'http://topautobid.com'; // Audience
    // SIGNING OPTIONS
    const signOptions = {
        issuer: i,
        subject: s,
        audience: a,
        expiresIn: "1h",
        algorithm: "RS256"
    };
    const token = jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        isAdmin: this.isAdmin,
        userType: this.userType,
    }, privateKEY, signOptions);
    return token;
}

userSchema.methods.validatePassword = function () {
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

//const User = mongoose.model('users', userSchema);

const userJoiSchema = {
    id: Joi.objectId(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    username: Joi.string().min(6).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required()
}

function validateUser(user) {
    return Joi.validate(user, userJoiSchema);
}


module.exports.userSchema = userSchema;
module.exports.userJoiSchema = userJoiSchema;
module.exports.validateUser = validateUser;