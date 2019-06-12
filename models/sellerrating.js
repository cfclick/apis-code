const Joi = require('joi');
const mongoose  = require('mongoose');
const Schema = mongoose.Schema;
const _ =require('lodash'); 


const SellerRatingSchema = new Schema({

    rating:{
        type:Number,
        default:0
    },
    review:{
        type:String,
        default:''
    },
    create_at:{
        type:Date,
        default:new Date()
    },
    seller_id:{
        type:Schema.Types.ObjectId,
        ref:'Seller'
    },
    dealer_id:{
        type:Schema.Types.ObjectId,
        ref:'Dealer'
    },
    car_id:{
        type:Schema.Types.ObjectId,
        ref:'Car'
    },
    update_at:{
        type:Date,
        default:new Date()
    }

});


const JoiSellerRatingSchema = {

    rating:Joi.number().required(),
    review:Joi.string(),
    create_at:Joi.date(),
    car_id:Joi.objectId().required(),
    dealer_id: Joi.objectId().required(),
    update_at:Joi.objectId()
};



//valid the sellerrating using joi schema
function validateSellerRating(rating) {
    return Joi.validate(rating, JoiSellerRatingSchema, { allowUnknown: true })
};

//definding the modal name for seller name
const SellerRating =  mongoose.model('Seller_rating',SellerRatingSchema)

module.exports.SellerRating = SellerRating;
module.exports.validateSellerRating = validateSellerRating;
