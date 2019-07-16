const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash'); //js utility lib
const { Car } = require('./car');



const paymentSchema = new mongoose.Schema({
    car_id: {
        type: Schema.Types.ObjectId,
        ref: 'Car'
    },
    dealer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Dealer'
    },
    seller_id: {
        type: Schema.Types.ObjectId,
        ref: 'Seller'
    },
    bid_id: {
        type: Schema.Types.ObjectId,
        ref: 'Bid'
    },   
    payee:{
        email_address:{ 
            type: String, 
            required: true,            
            trim: true
        },
        merchant_id:{ 
            type: String, 
            required: true,                          
            trim: true
        }

    },   
    payer:{
        email_address:{ 
            type: String, 
            required: true,           
            trim: true
        },
        payer_id:{ 
            type: String, 
            required: true,                          
            trim: true
        }

    },
    transaction_id:{ 
        type: String, 
        required: true,  
        unique: true,             
        trim: true
    },
    transaction_status: {
        type: String,
        required: true,
        trim: true

    },
    transaction_amount: {
        type: Number,
        required: true,
        trim: true

    },
    vin_number: { 
        type: String,       
        unique: false,
        required: true,
		text:false,            
	},
    created_at: {
        type: Date,
        trim: true,  
    }
   

});

//defined a post hook for calculate higest bid and store in the car 
paymentSchema.post('save', async function (doc, next) {

    if (!this.created_at){
        this.created_at = new Date();
    }    
     
    next();


})

//defined validators for Payment schema
const joiPaymentSchema = {
    car_id: Joi.objectId().required(),
    dealer_id: Joi.objectId().required(),
    seller_id: Joi.objectId().required(),
    payee: Joi.object({
			email_address: Joi.string().trim().email().required(),				
			merchant_id: Joi.string().trim().required(),
     }).required(),
    payer: Joi.object({
			email_address: Joi.string().trim().email().required(),				
			payer_id: Joi.string().trim().required(),
	 }).required(),
    transaction_id:Joi.string().trim().max(100).required(),
    transaction_status:Joi.string().trim().max(100).required(),
    transaction_amount: Joi.number().min(1).positive().required(),
    vin_number: Joi.string().trim().required(),
    created_at:Joi.date(),
}

//valid the Payment using joi schema
function validatePayment(payment) {
    return Joi.validate(payment, joiPaymentSchema, { allowUnknown: true })
}


//defining the modal(collection) name
const Payment = mongoose.model('payments', paymentSchema);
//export the Payment schema
module.exports.Payment = Payment;
module.exports.validatePayment = validatePayment;

