var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
var MD5      = require('md5');
const Appconfig = require('../../config/config')
var repository     = require('../repository');

/* ====================== Login  =======================================*/
router.post('/login',function(req,res,next){

	//if email or password is empty
	if(!req.body.email || !req.body.password || !req.body.model){
		res.json({'status':201,'error':'All Fields are Requierd'});
	}
    
	//fetching the user data and checking auth for valid user
	repository.authRepo.fetchUserByEmail(req.body.model,req.body.email)
        .then(doc => {			
			switch (true){
				//case: no user found
				case (doc==null || doc.length<=0):
					res.json({'status':400,'error':'Email do not Match'});		
					break;
				//case: user found but password not matched
				case ((doc.password != MD5(req.body.password))):
					res.json({'status':400,'error':'password do not Match'});				
					break;
				//case: user found and match password (valid user)
				case ((doc.password == MD5(req.body.password))):
					data  = doc.toJSON();
					const token = jwt.sign({ sub: data._id }, Appconfig.AppConfig.jwt_Secret);					
					res.json({'status':200,'data':data,'jwtAuthToken':token});
			
					break; 				
				default:
					res.json({'status':401,'error':'Wrong email/password'});			
					break; 
			}	
		})
	
})

/* ====================== social Login  =======================================*/
router.post('/socialLogin',function(req,res,next){

	/*
	social login types(3)
		Facebook :facebook
		Google   :google
		Microsoft:microsoft
	*/
	//if email or password is empty
	if(!req.body.email || !req.body.model || !req.body.social_login){
		res.json({'status':201,'error':'All Fields are Requierd'});
	}
    
	//checking the existing user and update. If not exist then save user information
	repository.authRepo.insertOrUpdateUser(req.body)
        .then(doc => {			
			data  = doc.toJSON();
			const token = jwt.sign({ sub: data._id }, Appconfig.AppConfig.jwt_Secret);									
			res.json({'status':200,'data':data, 'jwtAuthToken':token });	
		})
	
})
/* ====================== forgot password  =======================================*/
router.post('/forgot',function(){
	//if email is empty
	if(!req.body.email){
		res.json({'status':201,'error':'All Fields are Requierd'});
	}

	//fetching the user data and checking existing user
	repository.authRepo.fetchUserByEmail(req.body.email)
        .then(doc => {			
			switch (true){
				//case: no user found
				case (doc==null || doc.length<=0):
					res.json({'status':400,'error':'Email do not Match'});		
					break;				
				//case: user found and match password (valid user)
				case (doc.length>0):
					data  = doc.toJSON();									
					res.json({'status':200,'data':data });
					//put send mail code here			
					break; 				
				default:
					res.json({'status':401,'error':'Wrong email'});			
					break; 
			}	
		})
})

/* ====================== saving seller account info  =======================================*/
router.post('/sellerSignup',function(){
	//if any listed below attribute is empty
	if(!req.body.email || !req.body.phone || !req.body.password){
		res.json({'status':201,'error':'All Fields are Requierd'});
	}

	//fetching the user data and checking existing user
	repository.authRepo.saveSellerInfo(req.body)
        .then(doc => {			
			switch (true){
				//case: no document return when data not saved
				case (doc==null || doc.length<=0):
					res.json({'status':400,'error':'could not save data'});		
					break;				
				//case: user docuemnt after successfully saved
				case (doc.length>0):
					data  = doc.toJSON();									
					res.json({'status':200,'data':data });
					//put send mail code here			
					break; 				
				default:
					res.json({'status':401,'error':'could not save'});			
					break; 
			}	
		})
})
module.exports = router;