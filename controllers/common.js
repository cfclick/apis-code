const config = require('config');
const def = require('../models/def/statuses');	
const _ = require('lodash'); //js utility lib
const upload = require('../helpers/upload');
const validate = require('../interceptors/validate');

const {
    State   
} = require('../models/state');

const {
    Vehicle,
	validateVehicleYear
} = require('../models/vehicle');

const express = require('express');
const controller = express.Router();

/**
 * Common Apis 
*/
controller.get('/fetchStates',async(req,res,next)=>{	

    let records = await State.find({})
 
	return res.status(def.API_STATUS.SUCCESS.OK).send(records);	
})

/**
 * get Vehicle Details By Year 
*/
controller.post('/fetchVehiclesByYear',[validate(validateVehicleYear)], async(req,res,next)=>{

	let condition = {};
    //condition to fetch vehicle details by Year
    condition['year'] = req.body.year    

    console.log('condition',condition);
    let records = await Vehicle.findOne(condition)
   
    return res.status(def.API_STATUS.SUCCESS.OK).send(records);	
	
})

const singleUpload = upload.single('file')
controller.post('/imageUpload', function(req, res) {   
   
	singleUpload(req, res, function(err) {
	  if (err) {
		return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message);
	  }
  
	  return res.status(def.API_STATUS.SUCCESS.OK).send(req.file.location); 
	});
});
module.exports = controller;


