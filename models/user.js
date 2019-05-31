const fs = require('fs'); //file system
const jwt = require('jsonwebtoken'); //generate json token
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const PasswordComplexity = require('joi-password-complexity');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // for password encryption
const _ = require('lodash'); //js utility lib

const userSchema = new mongoose.Schema({
    name: {
        
        prefix: { 
            type: String, 
            trim: true,
            default: 'Mr.', 
        },
        first_name: { 
            type: String, 
            trim: true,
            minlength: 2,
            required: true,
            maxlength: 50,                   
        },
        last_name: { 
            type: String, 
            trim: true,
            minlength: 2,
            required: true,  
            maxlength: 50,        
        }
    },  
    emails: [
        {
            email:{ 
                type: String, 
                required: true,  
                unique: true,             
                trim: true
            },
            default:{ 
                type: Boolean, 
                required: true,               
                default: false
            },
            aws_verified:{ 
                type: Boolean,               
                default: false
            }
        }
    ],
    phones: [
        {
            phone:{ 
                type: String, 
                required: true, 
                unique: true,              
                trim: true
            },
            default:{ 
                type: Boolean, 
                required: true,               
                default: false
            },
            country_code:{ 
                type: String, 
                required: true
            },
            aws_verified:{ 
                type: Boolean,                 
                default: false
            }
        }
    ],   
    username: { 
        type: String,        
        // unique: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 10,
        maxlength: 50,
        trim: true
    }, 
    profile_pic:  { 
        type: String,        
        trim: true,
    },
    active: { 
        type: Boolean, 
        default: false
    },
    verified: { 
        type: Boolean, 
        default: false,
    }, 
    isAdmin: {
        type: Boolean,
        default: false
    },  
    created_at: Date, 
    updated_at: { 
        type: Date,       
        default: new Date(),    
    },
    social_login: {
        type: String,
        trim: true,
        default:'web',
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    is_multifactor_authorized:{
        type:Boolean,
        default:false
    },
    token:{
        type:String,
        trim:true
    }
    
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
        email: this.emails[0].email,
        username: this.username,
        isAdmin: this.isAdmin,
        userType: this.userType,
    }, privateKEY, signOptions);
    return token;
}

userSchema.methods.generatePasswordHash = async function (password){  
         
    const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));       
    return hashPassword;       
},



userSchema.methods.generateUsername = function(emails) {
       
    const emailObject = emails.find(i => i.default == true);     
    const userEmailArr = (emailObject)?_.dropRight((emailObject.email).split('@')):'';     
    return userEmailArr;   
   
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



const userJoiSchema = {

    
    id: Joi.objectId(),
    name: Joi.object({
        prefix: Joi.string().required(),
        first_name: Joi.string().trim().min(2).max(50).required(),
        last_name: Joi.string().trim().min(2).max(50).required()
    }).required(),    
    // emails array validation           
    emails:Joi.array().min(1).items(
        Joi.object().keys({
            email: Joi.string().trim().email().required(),
            default: Joi.boolean().required()
        })
    ).required(),

    // phones array validation                    
    phones:Joi.array().min(1).items(
        Joi.object().keys({
            phone: Joi.string().trim().min(10).max(15).required(),
            default: Joi.boolean().required(),
            country_code: Joi.string().min(2).max(3).required()
        })
    ).required(),

    //profile pic must be url string
    profile_pic: Joi.string().uri().trim(),

    // password is required
    // password must have minimum 10 and maximum 50 characters
    password: Joi.string().trim().min(10).max(50).required()
}


/**
 * Seller/Dealer  common validation fucntions
 */
function validateEmail(emailData){

    // define the validation schema
    let schema = Joi.object().keys({

        // email is required
        // email must be a valid email string
        email: Joi.string().trim().email().required()         

    }).unknown(true);
    return Joi.validate(emailData, schema, { allowUnknown: true });
}

//validate  unique phone number 
function validatePhoneNumber(phoneData){

    // define the validation schema
    let schema = Joi.object().keys({

        // phone is required
        // phone must be min 10 and max 15 length
        phone: Joi.string().trim().min(10).max(15).required()
        
    })
    return Joi.validate(phoneData, schema, { allowUnknown: true });
}

//validate seller login 
function validateLogin(seller) {
    const schema = {
        email: Joi.string().min(6).max(50).required(),
        password: Joi.string().min(8).max(50).required()
    }

    return Joi.validate(seller, schema, { allowUnknown: true });
}
function validateProfile(profileData){

    // define the validation schema
    let schema = Joi.object().keys({
        name: Joi.object({
            prefix: Joi.string().required(),
            first_name: Joi.string().trim().min(2).max(50).required(),
            last_name: Joi.string().trim().min(2).max(50).required()
        }).required(),

        // emails array validation           
        emails:Joi.array().items(
            Joi.object().keys({
                email: Joi.string().trim().email().required(),
                default: Joi.boolean().required()
            })
        ),

        // phones array validation                    
        phones:Joi.array().items(
            Joi.object().keys({
                phone: Joi.string().trim().min(10).max(15).required(),
                default: Joi.boolean().required()
            })
        ),
    })
    return Joi.validate(profileData, schema, { allowUnknown: true });
}

module.exports.userSchema = userSchema;
module.exports.userJoiSchema = userJoiSchema;


/**
 * Exporting Seller/Dealer common validation functions
 */
module.exports.validateEmail = validateEmail;
module.exports.validatePhoneNumber = validatePhoneNumber;
module.exports.validateLogin = validateLogin;
module.exports.validateProfile = validateProfile;
