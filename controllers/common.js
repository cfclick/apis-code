const config = require('config');
const def = require('../models/def/statuses');	
const _ = require('lodash'); //js utility lib
const validate = require('../interceptors/validate');
const upload = require('../helpers/upload');

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

const aws = require('aws-sdk');
aws.config.update({
    // Your SECRET ACCESS KEY from AWS should go here,
    // Never share it!
    // Setup Env Variable, e.g: process.env.SECRET_ACCESS_KEY
    secretAccessKey: config.get('aws.secretKey'),
    // Not working key, Your ACCESS KEY ID from AWS should go here,
    // Never share it!
    // Setup Env Variable, e.g: process.env.ACCESS_KEY_ID
    accessKeyId: config.get('aws.accessKey'),
    region: config.get('aws.region'), // region of your bucket
});
const s3 = new aws.S3();


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
	// console.log(records);
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




/**
 * Function to upload image on aws s3 bucket and return uploaded path
*/
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

/**
 * Function to upload image on aws s3 bucket and return uploaded path with key
*/
controller.post('/imageUploadtoBucket', function(req, res) {   
	
	singleUpload(req, res, function(err) {
	  if (err) {
		return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message);
	  }	
	  //console.log(req);
	  return res.status(def.API_STATUS.SUCCESS.OK).send({fileLocation: req.file.location, fileKey:req.file.key, fileName:req.file.originalname}); 
	});
});



/**
 * Function to delete object from aws s3 bucket
*/
controller.post('/deleteObject', function(req, res) {   
/* 	let params = {
	  Bucket: config.get('aws.bucket'),
	  Delete: {
		  Objects: [
			  {Key: req.body.fileKey}        
		  ]
	  }
	};
 */  
	let params = {
		Bucket: config.get('aws.bucket'), 
		Key: req.body.fileKey
	};

  
	s3.headObject(params, function(err, data) {
		
		if (err) {			
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('File Not Found.');
		}else{   
		  s3.deleteObject(params, function (err, data) {
			if (err) {				
				return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.messege);
			}else{ 			
				return res.status(def.API_STATUS.SUCCESS.OK).send(true); 
			}	
		  }); 
		}           // successful response
	});

  
});


module.exports = controller;


