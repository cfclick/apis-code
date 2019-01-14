// grab the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const Joi = require('joi');
const jwt = require('jsonwebtoken')
const config = require('config');
const _ = require('lodash')
const PasswordComplexity = require('joi-password-complexity');



// create a seller schema 
const sellerSchema = new Schema({
    name: {
        prefix: { 
            type: String, 
            trim: true,
            default: 'Mr.', 
        },
        first_name: { 
            type: String, 
            trim: true,
            minlength: 5,
            required: true,
            maxlength: 150 
                    
        },
        last_name: { 
            type: String, 
            trim: true,
            minlength: 5,
            required: true,  
            maxlength: 150
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
            }
        }
    ],   
    username: { 
        type: String,        
        unique: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 10,
        maxlength: 250,
        trim: true
    },
    social_login: { 
        type: String, 
        default: 'Web',      
        trim: true
    },
     
    active: { 
        type: Boolean, 
        default: true
    },   
    created_at: { 
        type: Date         
    },  
    updated_at: { 
        type: Date,       
        default: new Date(),    
    }   
});  





//schema hooks to process/modify data before save
sellerSchema.pre('save', async function(next) {

    
    if(this.isModified('password')) {   
        this.password  = await this.generatePasswordHash(this.password)      
        console.log('password:'+this.password);                                                            
    }

    if(this.isModified('emails')) {  
        this.username = this.generateUsername(this.emails)                                                                  
    }
   
    if (!this.created_at){
        this.created_at = new Date();
    }    
     
    next();
});




// Add custom instance methods to our Seller Schema
sellerSchema.methods = {

    // validate the password
    validatePassword: function() {
        const complexityOptions = {
            min: 10,
            max: 50,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1,
            symbol: 1,
            requirementCount: 4
        }
        return Joi.validate(this.password, new PasswordComplexity(complexityOptions));
    },

    // Hash the password
    generateAuthToken: function() {
        const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'))
        return token;
    },

    // Hash the password
     generatePasswordHash: async (password) =>{  
         
        const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));       
        return hashPassword;       
    },

   // generate the username
    generateUsername: function(emails) {
       
        const emailObject = emails.find(i => i.default == true);     
        const userEmailArr = (emailObject)?_.dropRight((emailObject.email).split('@')):'';  
        console.log(userEmailArr) 
        return userEmailArr;   
       
    }
};


// Add custom class or model methods to our Seller Schema
sellerSchema.statics = {

    //validate  seller signup fields
    validateSignup:function(seller){

        // define the validation schema
        let schema = Joi.object().keys({         
            
            name: Joi.object({
                prefix: Joi.string().required(),
                first_name: Joi.string().trim().min(5).max(150).required(),
                last_name: Joi.string().trim().min(5).max(150).required()
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

            // password is required
            // password must have minimum 10 and maximum 50 characters
            password: Joi.string().trim().min(10).max(250).required(),         


            //match password and confirm password
            repassword: Joi.any().valid(Joi.ref('password')).options({language: {any: {allowOnly: "and Password don't match"}}}) 
                  
            

        }).unknown(true);
        return Joi.validate(seller, schema);
    }  

};

//validate  seller/dealer profile fields
function validateProfile(profileData){

    // define the validation schema
    let schema = Joi.object().keys({
        name: Joi.object({
            prefix: Joi.string().required(),
            first_name: Joi.string().trim().min(5).max(150).required(),
            last_name: Joi.string().trim().min(5).max(150).required()
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
    }).unknown(true);
    return Joi.validate(profileData, schema);
}

//validate  unique email 
function validateEmail(emailData){

    // define the validation schema
    let schema = Joi.object().keys({

        // email is required
        // email must be a valid email string
        email: Joi.string().trim().email().required(),           

        //model is required
        model: Joi.string().required(),

    }).unknown(true);
    return Joi.validate(emailData, schema);
}

//validate  unique phone number 
function validatePhoneNumber(phoneData){

    // define the validation schema
    let schema = Joi.object().keys({

        // phone is required
        // phone must be min 10 and max 15 length
        phone: Joi.string().trim().min(10).max(15).required(),        

        //model is required
        model: Joi.string().required(),

    }).unknown(true);
    return Joi.validate(phoneData, schema);
}


//validate  seller/dealer login fields
function validateLogin(data){

    // define the validation schema
    let schema = Joi.object().keys({

        // email is required
        // email must be a valid email string
        email: Joi.string().trim().email().required(),

        // password is required
        // password must have minimum 10 and maximum 250 characters
        password: Joi.string().trim().min(10).max(250).required(),

        //model is required
        model: Joi.string().required(),

    }).unknown(true);
    return Joi.validate(data, schema);
}

// validate the seller/dealer password
function validatePassword(password) {

	const complexityOptions = {
		min: 10,
		max: 50,
		lowerCase: 1,
		upperCase: 1,
		numeric: 1,
		symbol: 1,
		requirementCount: 4
	}
	return Joi.validate(password, new PasswordComplexity(complexityOptions));
}



//creating the model Object
const Seller = mongoose.model('Seller', sellerSchema);

// make this available to our Node apis

module.exports.Seller = Seller;
module.exports.validateLogin = validateLogin;
module.exports.validateEmail = validateEmail;
module.exports.validatePhoneNumber = validatePhoneNumber;
module.exports.validatePassword = validatePassword;
module.exports.validateProfile = validateProfile;
