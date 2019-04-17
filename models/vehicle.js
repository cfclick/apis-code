
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const currentYear = (new Date()).getFullYear();
const _ = require('lodash'); //js utility lib

const vehicleSchema = new mongoose.Schema({   
	
	year: { 
        type: Number,
        trim: true,
        required: true,
        min: 2000,
        max: currentYear      
    },
    makes: [
        {
            name: { 
				type: String,        
				trim: true,
				required: true,
			   // text: true
			},
            models: [
                {
                    name: { 
						type: String,        
						trim: true,
						required: true,
					   // text: true
					}
                }
            ]
        }
    ]

});


//joi validations
const vehicleDetailsByYearJoiSchema = {   
    //id: Joi.objectId(),       
    year: Joi.number().min(2000).max(currentYear).required()
}


function validateVehicleYear(year) {
    //console.log(year)
    return Joi.validate(year, vehicleDetailsByYearJoiSchema, { allowUnknown: true });
}


const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports.Vehicle = Vehicle;

module.exports.validateVehicleYear = validateVehicleYear;