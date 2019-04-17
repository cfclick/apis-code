

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const PasswordComplexity = require('joi-password-complexity');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash'); //js utility lib

//mongoose.set('debug', true);

const currentYear = (new Date()).getFullYear();
const carSchema = new mongoose.Schema({
    ref: { 
        type: Number,
        //text: true     
    },
    vin: { 
        type: String,
        trim: true,
        unique: true,
        required: true,
        minlength: 17,        
        maxlength: 17, 
       // text: true     
    },
    mileage:{
        type: Number,
        trim: true,
        required: true,
        minlength: 1,
        maxlength: 99,
    },    
    year: { 
        type: Number,
        trim: true,
        required: true,
        min: 2000,
        max: currentYear,
       // text: true
       // description: "must be an integer in [ 2000, "+currentYear+" ] and is required"      
    }, 
    make:  { 
        type: String,        
        trim: true,
        required: true,
       // text: true
    },
    model: { 
        type: String, 
        trim: true,
        required: true, 
       // text: true
    },
    body_style: { 
        type: String, 
        trim: true,
        required: true, 
       // text: true
    },
    trim: { 
        type: String,
        trim: true,
        required: true,
       // text: true 
    },
    doors: { 
        type: Number, 
        trim: true,
        required: true,
    },
    engine: { 
        type: Number, 
        trim: true,
        required: true,
    },
    transmission: { 
        type: String, 
        trim: true,
    }, 
    fuel_type: { 
        type: String, 
        trim: true,
    },   
    drive_type: { 
        type: String, 
        trim: true,
    }, 
    interior_color: { 
        type: String, 
        trim: true,
    },
    exterior_color: { 
        type: String, 
        trim: true,
    },
    interior_material: { 
        type: String, 
        trim: true,
    },
    best_bid:{
        type: Number, 
        trim: true,
        default:0,
       // text: true
    },    
    listed: {
        type: Date,
        trim: true,  
    }, 
    created_at: {
        type: Date,
        trim: true,  
    },
    updated_at: {
        type: Date,
        trim: true,
        default: new Date(), 
    },   
    type: {
        type: String,
        trim: true,        
        enum: [ "active", "sold", "archived"],
        default: 'active'
    },       
    offer_in_hand:{ 
        type: Number,
        default:0,  
    },    
    comments: {
        type: String, 
        trim: true,      
    },
    car_selleing_radius: {
        type: Number,  
        trim: true,     
    },
    seller_id:{              
        type: Schema.Types.ObjectId,
        ref: 'Seller'
    },
    location:{
        address1:{
            type: String,  
            trim: true,   
            required: true,  
        },
        address2:{
            type: String,    
            trim: true,   
        },
        state:{
            type: String,  
            trim: true, 
            required: true,    
        },
        city:{
            type: String, 
            trim: true,  
            required: true,    
        },
        zipcode:{
            type: String,  
            trim: true,  
            required: true,   
        },
    },
    bids:[
        {
            dealer_id:{              
                type: Schema.Types.ObjectId,
                ref: 'Dealer'
            },
            price:{
                type: Number                  
            },
        }
    ],
    images: [], 
    offer_in_hand_images: [],
}); 

//schema hooks to process/modify data before save
carSchema.pre('save', async function(next) {    
  
    if (!this.created_at){
        this.created_at = new Date();
    }    
     
    next();
});


carSchema.methods.bestBid = function (allBids) {
    Math.max.apply(Math, array.map(function(allBids) { 
        return allBids.price;
     }))   
}

const Car = mongoose.model('Car', carSchema);


//joi validations
const carJoiSchema = {    
    //id: Joi.objectId(),   
    ref: Joi.number().min(1), 
    vin: Joi.string().trim().min(17).max(17).required(),
    mileage: Joi.number().min(1).max(99).required(),    
    year: Joi.number().min(2000).max(currentYear).required(),
    make:Joi.string().trim().max(100).required(),
    model:Joi.string().trim().max(100).required(),
    body_style:Joi.string().trim().max(100).required(),
    trim:Joi.string().trim().max(100).required(),
    doors:Joi.number().min(2).max(4).required(),
    engine:Joi.number().min(2).max(8).required(),
    transmission:Joi.string().trim().max(100).required(),
    fuel_type:Joi.string().trim().max(100),
    drive_type:Joi.string().trim().max(100),
    interior_color:Joi.string().trim().max(100),
    exterior_color:Joi.string().trim().max(100),
    interior_material:Joi.string().trim().max(100),
    best_bid: Joi.number(),
    created_at:Joi.date(),
    updated_at:Joi.date(),    
    offer_in_hand: Joi.number(),
    comments:Joi.string().trim(),
    car_selleing_radius:Joi.number().min(1).positive().required(),
    seller_id:Joi.objectId().required(),
    location: Joi.object({
        address1: Joi.string().trim().required(),
        address2: Joi.string().allow('').optional().trim(),
        state: Joi.string().required(),
        city:Joi.string().required(),
        zipcode:Joi.string().required(),
    }).required(),  

    // bids array validation           
    bids:Joi.array(),
    //car images array
    images:Joi.array().min(1).required(),

    //best price offered images
    offer_in_hand_images: Joi.array().min(1).required(),   

}

// validating remove 
const carRemoveJoiSchema = {  
    seller_id:Joi.objectId().required(),
    id:Joi.objectId().required(),    
}

// validating seller car listing schema 
const listingJoiSchema = {  
    seller_id:Joi.objectId().required(),  
    search: Joi.string().allow('').optional().trim(),     
    sortDirection:Joi.string().trim().required(),
    sortProperty:Joi.string().trim().required(),
    pageNumber:Joi.number().min(0).required(), 
    size :Joi.number().min(10).positive().required(),
    type:Joi.string().trim().required(),
    filters:Joi.object({
        bid: Joi.array().items().allow(null),
        years: Joi.array().items().allow(null)
    })
}

// validating dealer car listing schema 
const listingDealerCarsJoiSchema = {  
    dealer_id:Joi.objectId().required(),  
    search: Joi.string().allow('').optional().trim(),     
    sortDirection:Joi.string().trim().required(),
    sortProperty:Joi.string().trim().required(),
    pageNumber:Joi.number().min(0).required(), 
    size :Joi.number().min(10).positive().required(),
    type:Joi.string().trim().required(),
    filters:Joi.object({
        bid: Joi.array().items().allow(null),
        years: Joi.array().items().allow(null)
    })
}


function validateCar(car) {
    console.log(car)
    return Joi.validate(car, carJoiSchema, { allowUnknown: true });
}

function validateRemoveCar(data) {
    console.log(data)
    return Joi.validate(data, carRemoveJoiSchema, { allowUnknown: true });
}

function validateCarListing(data) {
    console.log(data)
    return Joi.validate(data, listingJoiSchema, { allowUnknown: true });
}
function validateDealerCarListing(data) {
    console.log(data)
    return Joi.validate(data, listingDealerCarsJoiSchema, { allowUnknown: true });
}



module.exports.Car = Car;
module.exports.validateCar = validateCar;
module.exports.validateRemoveCar = validateRemoveCar;
module.exports.validateCarListing = validateCarListing;
module.exports.validateDealerCarListing = validateDealerCarListing;


