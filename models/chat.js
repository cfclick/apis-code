const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash'); //js utility lib
const { Car } = require('./car');



const Message = new mongoose.Schema({
    dealer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Dealer'
    },
    seller_id: {
        type: Schema.Types.ObjectId,
        ref: 'Seller'
    },
    message_body: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    is_seller: {
        type: Boolean,
        default: true
    },
    is_read: {
        type: Boolean,
        default: false
    }


});






//defining the modal(collection) name
const Chat = mongoose.model('chat', Message);
//export the bid schema
module.exports.Chat = Chat;

