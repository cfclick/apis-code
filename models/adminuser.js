const fs = require('fs'); //file system
const jwt = require('jsonwebtoken'); //generate json token
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const PasswordComplexity = require('joi-password-complexity');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // for password encryption
const _ = require('lodash'); //js utility lib


const adminuserSchema = new mongoose.Schema({
    name:{
        prefix:{
            type:String,
            trim:true,
            default:'Mr.'
        },
        first_name:{
            type: String, 
            trim: true,
            minlength: 2,
            required: true,
            maxlength: 50,
    
        },
        last_name:{
            type: String, 
            trim: true,
            minlength: 2,
            required: true,
            maxlength: 50,
        }

    },
    title:{
        type:String,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 8,
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
    verified:{
        type: Boolean, 
        default: false
    },
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
                default: false
            },
            country_code:{ 
                type: String, 
                default:'+1'
            },
            phoneType:{
             type:String,
            },
            

            
        }
    ],   
    language_prefrence:{
        type:String,
    },
    time_zone:{
        type:String,
    },
    userType:{
        type:String,
        default:'Admin'
    }
});


//admin schema hooks to process/modify data before save
adminuserSchema.pre('save', async function(next) {

    
    if(this.isModified('password')) {   
        this.password  = await this.generatePasswordHash(this.password)                                                                   
    }

    if(this.isModified('emails')) {  
        //this.username = this.generateUsername(this.emails)                                                                  
    }
   
    if (!this.created_at){
        this.created_at = new Date();
    }    
     
    next();
});



adminuserSchema.methods.generateAuthToken = function () {

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
        userType: this.userType,
    }, privateKEY, signOptions);
    return token;
}

adminuserSchema.methods.generatePasswordHash = async function (password){  
         
    const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));       
    return hashPassword;       
}

const adminUser  = mongoose.model('admin_users', adminuserSchema);//admin model

module.exports = adminUser;