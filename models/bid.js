const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash'); //js utility lib



const bidSchema = new mongoose.Schema({
    car_id: {
        type: Schema.Types.ObjectId,
        ref: 'Car'
    },
    dealer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Dealer'
    },
    dealership_id:{
        type: Schema.Types.ObjectId,
        ref: 'DealerShip'
    },
    price: {
        type: Number
    },
    bid_date: {
        type: Date,
        trim: true,
        default: new Date()
    },
    bid_acceptance: {
        type: String,
        trim: true,
        enum: ["active", "rejected", "accepted"],
        default: 'active'
    },
    bid_acceptance_date:{
          type:Date,
          trim:true
    },
    time: {
        hour: {
            type: Number,
            default: 13,
        },
        minute: {
            type: Number,
            default: 30,
        },
        second: {
            type: Number,
            default: 0,
        }
    },
    fee_status: {
        type: String,
        trim: true,
        enum: ['unpaid', 'paid'],
        default: 'unpaid'

    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'Seller'
    }

});
//defined validators for bid schema
const joiBidSchema  = {
    car_id:Joi.objectId().required(),
    dealer_id:Joi.objectId().required(),
    price:Joi.number().required(),
    bid_date:Joi.date(),
    bid_acceptance:Joi.string().trim().required(),
    bid_acceptance_date:Joi.date(),
    time: Joi.object({
        hour: Joi.number().min(1).max(24).positive().required(),
        minute: Joi.number().min(1).max(60).positive().required(),
        second: Joi.number().min(0).max(60).required()
    }).required(),
    fee_status:Joi.string().trim(),
    updated_by:Joi.objectId()
}

//valid the bid using joi schema
function validateBid(bid){
    return Joi.validate(bid,joiBidSchema,{allowUnknown:true})
}


//defining the modal(collection) name
const bid  = mongoose.model('car_bids',bidSchema);
//export the bid schema
module.exports = bid;
module.exports.validateBid = validateBid;

