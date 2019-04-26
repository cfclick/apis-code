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
	validateVehicleYear,
	validateVehicleMultipleyear
} = require('../models/vehicle');

const express = require('express');
const controller = express.Router();
let conditionFilters = {}
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
controller.post('/fetchVehicleStatisticsByYear',[validate(validateVehicleYear)], async(req,res,next)=>{

	let condition = {};
    //condition to fetch vehicle details by Year
    condition['year'] = req.body.year    

    console.log('condition',condition);
    let records = await Vehicle.findOne(condition)
   
    return res.status(def.API_STATUS.SUCCESS.OK).send(records);	
	
})

/**
 * get Vehicle Details By Year Array 
*/
controller.post('/fetchVehicleStatisticsByMultipleyear',[validate(validateVehicleMultipleyear)], async(req,res,next)=>{


    //condition to fetch vehicle details by Year
    conditionFilters['year'] = { $in : req.body.year } 

    console.log('conditionFilters',conditionFilters);
    let records = await Vehicle.find(conditionFilters,{ "makes.name":1, "makes._id":1 })
   
    return res.status(def.API_STATUS.SUCCESS.OK).send(records);	
	
})


/**
 * get models by make
*/
controller.post('/fetchVehicleStatisticsByMultiplemake', async(req,res,next)=>{


    //condition to fetch vehicle details by Year
    conditionFilters['makes.name'] = { $in : req.body.make } 

    console.log('conditionFilters',conditionFilters);
    let records = await Vehicle.find(conditionFilters,{ "makes.models.name":1, "makes.models._id":1 })
   
    return res.status(def.API_STATUS.SUCCESS.OK).send(records);	
	
})

/**
 * get trims by model
*/
controller.post('/fetchVehicleStatisticsByMultiplemodel', async(req,res,next)=>{


    //condition to fetch vehicle details by Year
    conditionFilters['makes.models.name'] = { $in : req.body.model } 

    console.log('conditionFilters',conditionFilters);
    let records = await Vehicle.find(conditionFilters,{ "makes.models.trims.name":1, "makes.models.trims._id":1 })
   
    return res.status(def.API_STATUS.SUCCESS.OK).send(records);	
	
})



controller.post('/imageUploadMultiple', upload.array('file'), function(req, res, next) {
	console.log(res);
  //res.send('Successfully uploaded ' + req.files.length + ' files!')
})

const singleUpload = upload.single('file')
controller.post('/imageUpload', function(req, res) {   
	
	singleUpload(req, res, function(err) {
	  if (err) {
		return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message);
	  }
		console.log(req);
		//console.log(res);
	  return res.status(def.API_STATUS.SUCCESS.OK).send(req.file.location); 
	});
});

controller.post('/imageUploadtoBucket', function(req, res) {   
	
	singleUpload(req, res, function(err) {
	  if (err) {
		return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message);
	  }	
		
	  return res.status(def.API_STATUS.SUCCESS.OK).send({fileLocation: req.file.location, fileKey:req.file.key}); 
	});
});


module.exports = controller;


