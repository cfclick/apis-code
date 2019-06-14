const Joi = require('joi');
const mongoose = require('mongoose');
const _ = require('lodash'); //js utility lib
const {  
    userSchema,
    userJoiSchema  
} = require('./user');


//clone the userSchema and add seller properties
const sellerSchema = userSchema.clone();

//seller schema hooks to process/modify data before save
sellerSchema.pre('save', async function(next) {

    
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
sellerSchema.pre('findOneAndUpdate', function (next) {
  
    /*const emails = this.getUpdate().$set.emails;  
    const emailObject = emails.find(i => i.default == true);     
    const username = (emailObject)?_.dropRight((emailObject.email).split('@')):'';  
    this.getUpdate().$set.username = username*/    
    next();
    
  });



const sellerJoiSchema = {
    userJoiSchema,
    location: Joi.object({
        state: Joi.string().trim().min(2).max(50).required(),
        city: Joi.string().trim().min(2).max(50).required(),
        zipcode: Joi.string().trim().min(2).max(50).required(),
    }).required(), 
    repassword:  Joi.any().valid(Joi.ref('password')).options({language: {any: {allowOnly: "and Password don't match"}}})  
    
    
}

//validate seller signup
function validateSeller(seller) {
   
    return Joi.validate(seller, sellerJoiSchema, { allowUnknown: true });

   
}


const Seller  = mongoose.model('Seller', sellerSchema);//seller model

module.exports.Seller = Seller;
module.exports.validateSeller = validateSeller;
