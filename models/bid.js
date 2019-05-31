const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash'); //js utility lib
const { Car } = require('./car');



const bidSchema = new mongoose.Schema({
    car_id: {
        type: Schema.Types.ObjectId,
        ref: 'Car'
    },
    dealer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Dealer'
    },
    dealership_id: {
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
    bid_acceptance_date: {
        type: Date,
        trim: true
    },
    fee_status: {
        type: String,
        trim: true,
        enum: ['unpaid', 'paid'],
        default: 'unpaid'

    }

});

//defined a post hook for calculate higest bid and store in the car 
bidSchema.post('save', async function (doc, next) {
    //   find the best bid price
    let bid = await this.constructor.findOne({ car_id: doc.car_id }).sort({'price':-1});
    //   find the car to update  higest bid
    let updateCar = await   Car.findOneAndUpdate({ _id: doc.car_id },{ $set:{best_bid:bid.price} },{ new: true });
   
    next()


})

//defined validators for bid schema
const joiBidSchema = {
    car_id: Joi.objectId().required(),
    dealer_id: Joi.objectId().required(),
    price: Joi.number().min(1).positive().required(),   
}

//valid the bid using joi schema
function validateBid(bid) {
    return Joi.validate(bid, joiBidSchema, { allowUnknown: true })
}


//defining the modal(collection) name
const Bid = mongoose.model('car_bids', bidSchema);
//export the bid schema
module.exports.Bid = Bid;
module.exports.validateBid = validateBid;

