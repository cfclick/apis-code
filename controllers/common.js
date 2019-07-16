const config = require('config');
const def = require('../models/def/statuses');	
const _ = require('lodash'); //js utility lib
const validate = require('../interceptors/validate');
const upload = require('../helpers/upload');
var hummus = require('hummus');
var isBase64 = require('is-base64');
var mysqlQuery = require('../init/mysqldb');

const {Chat} = require('../models/chat');

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
    secretAccessKey: config.get('aws.secretKey'),  
    accessKeyId: config.get('aws.accessKey'),
    region: config.get('aws.region')
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
		let records = await Vehicle.findOne(condition)
		
    return res.status(def.API_STATUS.SUCCESS.OK).send(records);	
	
})


/**
 * save chat message
 */
controller.post('/saveMessage',async function(req,res){
   let message = new Chat({
	   seller_id:req.body.seller_id,
	   dealer_id:req.body.dealer_id,
	   message_body:req.body.messageBody,
	   created_at:Date.now(),
	   is_seller:req.body.isSeller

   });

	  let msg =  await message.save();
	  if(msg)
	  return res.status(def.API_STATUS.SUCCESS.OK).send(msg);
	  else
	  return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(false);
})


/**
 * check PDF Corrupted 
*/
controller.post('/checkPDFCorrupted', function(req, res) {  
	
	let pdfBase64String = req.body.base64string;
	if(isBase64(pdfBase64String)){
		let bufferPdf;
		try {
		  bufferPdf = Buffer.from(pdfBase64String, 'base64');
		  const pdfReader = hummus.createReader(new hummus.PDFRStreamForBuffer(bufferPdf));
		  var pages = pdfReader.getPagesCount();
		  if(pages > 0) {
				console.log("Seems to be a valid PDF!");
			  return res.status(def.API_STATUS.SUCCESS.OK).send(true);	
		  }
		  else {
			  console.log("Unexpected outcome for number o pages: '" + pages + "'");
			  return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(false);
		  }
		}
		catch(err) {
		   console.log("ERROR while handling buffer of pdfBase64 and/or trying to parse PDF: " + err);
		   return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(false);
		}
	}else{
		return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(false);
	}		
})

/**
 * get Vehicle Details By Year Array 
*/
controller.post('/fetchVehicleStatisticsByMultipleyear',[validate(validateVehicleMultipleyear)], async(req,res,next)=>{


    //condition to fetch vehicle details by Year
    conditionFilters['year'] = { $in : req.body.year } 
    let records = await Vehicle.find(conditionFilters,{ "makes.name":1, "makes._id":1 })
   
    return res.status(def.API_STATUS.SUCCESS.OK).send(records);	
	
})


/**
 * get models by make
*/
controller.post('/fetchVehicleStatisticsByMultiplemake', async(req,res,next)=>{


    //condition to fetch vehicle details by make
    conditionFilters['makes.name'] = { $in : req.body.make }   
    let records = await Vehicle.find(conditionFilters,{ "makes.models.name":1, "makes.models._id":1 })
   
    return res.status(def.API_STATUS.SUCCESS.OK).send(records);	
	
})

/**
 * get trims by model
*/
controller.post('/fetchVehicleStatisticsByMultiplemodel', async(req,res,next)=>{


    //condition to fetch vehicle details by model
    conditionFilters['makes.models.name'] = { $in : req.body.model }  
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
	  console.log(req);
	  return res.status(def.API_STATUS.SUCCESS.OK).send({fileLocation: req.file.location, fileKey:req.file.key, fileName:req.file.originalname, fileMimeType:req.file.mimetype}); 
	});
});



/**
 * Function to delete object from aws s3 bucket
*/
controller.post('/deleteObject', function(req, res) {   
 
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
		}           
	});  
});


/**
 * Function to fetch all makes
*/
controller.get('/listingMakes', function(req, res) {    
	
	mysqlQuery('SELECT id_car_make, name from car_make', { }, function(err, rows)   {
		if (err) {				
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.messege);
		}else{ 			
			
			return res.status(def.API_STATUS.SUCCESS.OK).send(rows); 
		}	
	});  
	
});



/**
 * Function to fetch all bodystyles
*/
controller.post('/listingBodystyles', function(req, res) {    
	
	mysqlQuery('SELECT id_car_serie, name from car_serie where', {id_car_model: req.body.model_id}, function(err, rows)   {
		if (err) {				
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.messege);
		}else{ 			
			return res.status(def.API_STATUS.SUCCESS.OK).send(rows); 
		}	
	});  
	
});


/**
 * Function to fetch Models By Make ID
*/
controller.post('/ListingModels', function(req, res) {    
	
	mysqlQuery('SELECT id_car_model,name from car_model where ?', {id_car_make: req.body.make_id}, function(err, rows)   {
		if (err) {				
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.messege);
		}else{ 			
			return res.status(def.API_STATUS.SUCCESS.OK).send(rows); 
		}
	});  
	
});

/**
 * Function to fetch Trims By Model ID
*/
controller.post('/ListingTrimsWithBodystyles', function(req, res) {    
	
	mysqlQuery('SELECT * from car_trim where ?', {id_car_model: req.body.model_id}, function(err, trims)   {
		if (err) {				
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.messege);
		}else{ 			
				mysqlQuery('SELECT 	id_car_serie, name from car_serie where ?', {id_car_model: req.body.model_id}, function(err, bodystyles)   {
					if (err) {				
						return res.status(def.API_STATUS.SUCCESS.OK).send({'trims':trims,'bodystyles':[]}); 
					}else{ 			
						return res.status(def.API_STATUS.SUCCESS.OK).send({'trims':trims,'bodystyles':bodystyles}); 
					}		
			}) 
		}
	})
});

/**
 * Function to fetch Trims By Model ID
*/
controller.post('/ListingTrimsByMakeName', function(req, res) {    
	
	mysqlQuery('SELECT ctr.id_car_trim, ctr.name, cmk.id_car_make FROM `car_trim` as ctr INNER JOIN `car_model` as cmd ON ctr.id_car_model = cmd.id_car_model INNER JOIN `car_make` as cmk ON cmd.id_car_make = cmk.id_car_make WHERE cmk.name = ? AND cmd.name = ?', [req.body.make_name, req.body.model_name], function(err, rows)   {
		if (err) {				
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.messege);
		}else{ 			
			return res.status(def.API_STATUS.SUCCESS.OK).send(rows); 
		}
	});  
	
});


/**
 * Function to vehicle options By Trim ID
*/
    
controller.post('/ListingVehicleDetailsByTrimId', function(req, res) { 	
	
	mysqlQuery('SELECT ctr.id_car_serie, ctr.id_car_model, ctr.name as trim_name, ceq.id_car_equipment, cov.id_car_option, cop.name as car_option_name FROM `car_equipment` as ceq INNER JOIN `car_trim` as ctr ON ceq.id_car_trim = ctr.id_car_trim INNER JOIN `car_option_value` as cov ON  cov.id_car_equipment = ceq.id_car_equipment INNER JOIN `car_option` as cop ON cop.id_car_option = cov.id_car_option  WHERE ceq.id_car_trim = ?', [req.body.trim_id], function(err, options)   {
		if (err) {				
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.messege);
		}else{ 			
			mysqlQuery('SELECT ctr.name as trim_name, csp.id_car_specification, csp.name as specification_name, csv.value as specification_value FROM `car_specification_value` as csv INNER JOIN `car_trim` as ctr ON csv.id_car_trim = ctr.id_car_trim INNER JOIN `car_specification` as csp ON csp.id_car_specification = csv.id_car_specification  WHERE csv.id_car_trim = ?', [req.body.trim_id], function(err, specifications)   {
					if (err) {				
						return res.status(def.API_STATUS.SUCCESS.OK).send({'vehicle_options':options,'vehicle_specifications':[]}); 
					}else{ 			
						return res.status(def.API_STATUS.SUCCESS.OK).send({'vehicle_options':options,'vehicle_specifications':specifications}); 
					}		
			}) 
		}
	})
	
});




module.exports = controller;


