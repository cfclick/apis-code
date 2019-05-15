const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const PasswordComplexity = require('joi-password-complexity');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash'); //js utility lib

//mongoose.set('debug', true);

const currentYear = (new Date()).getFullYear();
const carSchema = new mongoose.Schema({
    
    vin_number: { 
        type: String,       
		unique: false,
		text:false,
		default:'rhewhrlkwhelkrjhwlke'
        // required: true,
        // minlength: 17,        
        // maxlength: 17
            
	},
	type: {
        type: String,
        trim: true,        
        enum: [ "active", "sold", "archived"],
        default: 'active'
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
	best_bid:{
        type: Number, 
        default:0,
       // text: true
    },  
	vehicle_year: { 
        type: Number,
        trim: true,
        required: true,
        min: 2000,
        max: currentYear      
    },
	basic_info:{
		
        vehicle_zip: {
            type: Number,  
            trim: true,  
            required: true,   
        },
		vehicle_make: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_model: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_mileage: {
            type: Number,  
            trim: true,  
            required: true,   
        },
		vehicle_body_type: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_trim: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_doors: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_engine: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_transmission: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_fuel_type: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_drive_type: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_interior_color: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_exterior_color: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_interior_material: {
            type: String,  
            trim: true,  
            required: true,   
        } 
		
    }, 
	vehicle_images: [{
		file_path:{
            type: String,  
            trim: true,  
            //required: true,   
        },
		file_key: {
            type: String,  
            trim: true,  
            //required: true,   
        },
		file_name: {
            type: String,  
            trim: true,  
            //required: true,   
        },
		file_category: {
            type: String,  
            trim: true,  
            //required: true,   
        }
	}],
	vehicle_has_second_key: {
		type: Boolean, 
		required: true,               
		default: false
	},
	is_vehicle_aftermarket: {
		type: Boolean, 
		required: true,               
		default: false
	},
	vehicle_aftermarket: {
		vehicle_aftermarket_description: {
            type: String,  
            trim: true,  
            //required: true,   
        },
		vehicle_aftermarket_images: [{
			file_path:{
				type: String,  
				trim: true,  
				//required: true,   
			},
			file_key: {
				type: String,  
				trim: true,  
				//required: true,   
			},
			file_name: {
				type: String,  
				trim: true,  
				//required: true,   
			},
			file_category: {
				type: String,  
				trim: true,  
				//required: true,   
			}
		}]
		
	},
	vehicle_ownership: {
		vehicle_clean_title: {
			type: Boolean, 
			required: true,               
			default: false
		},
		vehicle_ownership_value: {
            type: String,  
            trim: true,  
            //required: true,   
        },
		vehicle_ownership_description: {
            type: String,  
            trim: true,  
            //required: true   
        }
	},
	vehicle_comments: {
		type: String,  
		trim: true,  
		required: true
	},
	vehicle_condition: {
		vehicle_condition_value: {
            type: String,  
            trim: true,  
            required: true,   
        },
		vehicle_condition_description: {
            type: String,  
            trim: true,  
            //required: true,   
        },
		vehicle_condition_images: [{
			file_path: {
				type: String,  
				trim: true,  
				//required: true,   
			},
			file_key: {
				type: String,  
				trim: true,  
				//required: true,   
			},
			file_name: {
				type: String,  
				trim: true,  
				//required: true,   
			},
			file_category: {
				type: String,  
				trim: true,  
				//required: true,   
			}
		}]
		
	},
	vehicle_to_be_picked_up: {
		type: Boolean, 
		required: true,               
		default: false
	},
	willing_to_drive: {
		type: Boolean, 
		required: true,               
		default: false
	},
	willing_to_drive_how_many_miles: {
		type: Number,  
		trim: true,  
		//required: true
	},
	vehicle_finance_details: {
		vehicle_offer_in_hands_price: {
			type: Number,  
			trim: true,  
			required: true,
			default: 0
		},
		vehicle_finance_bank: {
			type: String,  
			trim: true,  
			required: true   
		},
		vehicle_pay_off: {
			type: Number,  
			trim: true,  
			required: true,
			default: 0
		},	
		vehicle_proof_image: [{
			file_path: {
				type: String,  
				trim: true,  
				//required: true,   
			},
			file_key: {
				type: String,  
				trim: true,  
				//required: true,   
			},
			file_name: {
				type: String,  
				trim: true,  
				//required: true,   
			},
			file_category: {
				type: String,  
				trim: true,  
				//required: true,   
			}
		}]
	},
    seller_id: {              
        type: Schema.Types.ObjectId,
		ref: 'Seller',
		default:'5cd170562688321559f12f32'
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
    created_at: {
        type: Date,
        trim: true,  
    },
    updated_at: {
        type: Date,
        trim: true,
        default: new Date(), 
    }
    
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
    
    vin_number: Joi.string().allow('').optional().trim(),
	vehicle_year: Joi.number().min(2000).max(currentYear),
	basic_info: Joi.object({
		vehicle_zip: Joi.number().required(), 	   
		vehicle_make:Joi.string().trim().max(100).required(),
		vehicle_model:Joi.string().trim().max(100).required(),
		vehicle_trim:Joi.string().trim().max(100).required(),
		vehicle_mileage: Joi.number().min(1).max(999999).required(),
		vehicle_body_type:Joi.string().trim().max(100).required(),		
		vehicle_doors:Joi.string().trim().max(100).required(),
		vehicle_engine:Joi.string().trim().max(100).required(),
		vehicle_transmission:Joi.string().trim().max(100).required(),
		vehicle_fuel_type:Joi.string().trim().max(100).required(),
		vehicle_drive_type:Joi.string().trim().max(100).required(),
		vehicle_interior_color:Joi.string().trim().max(100).required(),
		vehicle_exterior_color:Joi.string().trim().max(100).required(),
		vehicle_interior_material:Joi.string().trim().max(100).required(),
	}).required(),
	vehicle_images: Joi.array().items(
		Joi.object().keys({
			file_path: Joi.string().trim(),				
			file_name: Joi.string().trim(),
			file_key: Joi.string().trim(),
			file_category: Joi.string().trim(),
		})
	),	
	vehicle_has_second_key: Joi.boolean().required(),
	is_vehicle_aftermarket: Joi.boolean().required(),
	vehicle_aftermarket: Joi.object({
		vehicle_aftermarket_description: Joi.string().allow('').optional().trim(),
		vehicle_aftermarket_images: Joi.array().items(
			Joi.object().keys({
				file_path: Joi.string().trim(),				
				file_name: Joi.string().trim(),
				file_key: Joi.string().trim(),
				file_category: Joi.string().trim(),
			})
		)
	}).required(),
	vehicle_ownership: Joi.object({
		vehicle_clean_title: Joi.boolean().required(),
		vehicle_ownership_value: Joi.string().trim(),
		vehicle_ownership_description: Joi.string().allow('').optional().trim(),
		
		
	}).required(),
	vehicle_comments: Joi.string().trim().required(),
	vehicle_condition: Joi.object({
		vehicle_condition_value: Joi.string().trim().max(100).required(),
		vehicle_condition_description: Joi.string().allow('').optional().trim(),
		vehicle_condition_images: Joi.array().items(
			Joi.object().keys({
				file_path: Joi.string().trim(),				
				file_name: Joi.string().trim(),
				file_key: Joi.string().trim(),
				file_category: Joi.string().trim(),
			})
		)
	}).required(),
	willing_to_drive: Joi.boolean().required(),
	vehicle_to_be_picked_up: Joi.boolean().required(),
    willing_to_drive_how_many_miles: Joi.number(),
	vehicle_finance_details: Joi.object({
		vehicle_offer_in_hands_price: Joi.number(),
		vehicle_finance_bank: Joi.string().trim().required(),
		vehicle_pay_off: Joi.number().required(),
		vehicle_proof_image: Joi.array().items(
			Joi.object().keys({
				file_path: Joi.string().trim(),				
				file_name: Joi.string().trim(),
				file_key: Joi.string().trim(),
				file_category: Joi.string().trim(),
			})
		),
	}).required(),	
    created_at:Joi.date(),
    updated_at:Joi.date(),    
    seller_id:Joi.objectId().required(),
}

// validating remove 
const carRemoveJoiSchema = {  
    seller_id:Joi.objectId().required(),
    id:Joi.objectId().required(),    
}

// validating car details 
const carDetailJoiSchema = {     
    id:Joi.objectId().required(),    
}

// validating seller car listing schema 
const listingJoiSchema = {  
    seller_id:Joi.objectId().required(),  
    search: Joi.string().allow('').optional().trim(),     
    sortDirection:Joi.string().trim().required(),
    sortProperty:Joi.string().trim().required(),
    pageNumber:Joi.number().min(0).required(), 
    size :Joi.number().min(6).max(96).positive().required(),
    type:Joi.string().trim().required(),
    filters:Joi.object({
        bid: Joi.array().items().allow(null),
        years: Joi.array().items().allow(null),
        year: Joi.array().items().allow(null),
        make: Joi.array().items().allow(null),
        model: Joi.array().items().allow(null),
        trim: Joi.array().items().allow(null)
    })
}

// validating dealer car listing schema 
const listingDealerCarsJoiSchema = {  
   // dealer_id:Joi.objectId().required(),  
    search: Joi.string().allow('').optional().trim(),     
    sortDirection:Joi.string().trim().required(),
    sortProperty:Joi.string().trim().required(),
    pageNumber:Joi.number().min(0).required(), 
    size :Joi.number().min(6).positive().required(),
    type:Joi.string().trim().required(),
    filters:Joi.object({
        bid: Joi.array().items().allow(null),
        years: Joi.array().items().allow(null)
    })
}



// validating car more information contact request
const contactRequestJoiSchema = {  
	// dealer_id:Joi.objectId().required(),  
	 name: Joi.string().allow('').optional().trim(),     
	 email: Joi.string().trim().email().required(),
	 phone: Joi.string().trim().min(10).max(15).required(),
	 message:Joi.string().allow('').optional().trim(),  
	 preference :Joi.string().valid('email', 'phone'),
	 
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

function validateCarDetail(data) {
    return Joi.validate(data, carDetailJoiSchema, { allowUnknown: true });
}
function validateContactRequest(data) {
    return Joi.validate(data, contactRequestJoiSchema, { allowUnknown: true });
}


module.exports.Car = Car;
module.exports.validateCar = validateCar;
module.exports.validateRemoveCar = validateRemoveCar;
module.exports.validateCarListing = validateCarListing;
module.exports.validateDealerCarListing = validateDealerCarListing;
module.exports.validateCarDetail = validateCarDetail;
module.exports.validateContactRequest = validateContactRequest;


