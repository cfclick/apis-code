const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const CarRatingSchema = new Schema({
    dealer_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Dealer'
    },
    rating: {
        type: Number,
        default: 0
    },
    review: {
        type: String,
        default: ''
    },
     created_at:{
         type:Date,
         default:new Date()
     },
     updated_at:{
         type:Date,
         default:new Date()
     }


});

const JoiCarRatingSchema  = {
    rating:Joi.number().required(),
    review:Joi.string(),
    create_at:Joi.date(),
    dealer_id: Joi.objectId().required(),
    update_at:Joi.objectId()
}


const CarRating = mongoose.model('Car_rating',CarRatingSchema);

//valid the bid using joi schema
function validateCarRatingSchema(rating) {
    return Joi.validate(rating, JoiCarRatingSchema, { allowUnknown: true })
}

module.exports.CarRating =  CarRating;
module.exports.validateCarRatingSchema =validateCarRatingSchema;
