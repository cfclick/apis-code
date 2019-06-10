const Joi = require('joi');
const mongoose  = require('mongoose');
const Schema = mongoose.Schema;
const _ =require('lodash'); 


const DealerRatingSchema = new Schema({

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


const JoiDealerRatingSchema = {

    rating:Joi.number().required(),
    review:Joi.string(),
    create_at:Joi.date(),
    car_id: Joi.objectId().required(),
    seller_id: Joi.objectId().required(),
    update_at:Joi.objectId()
};



//valid the sellerrating using joi schema
function validateDealerRating(rating) {
    return Joi.validate(rating, JoiDealerRatingSchema, { allowUnknown: true })
};

//definding the modal name for dealeRating 
const DealerRating =  mongoose.model('Dealer_rating',DealerRatingSchema)

module.exports.DealerRating = DealerRating;
module.exports.validateDealerRating = validateDealerRating;
