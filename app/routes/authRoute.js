var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
var MD5      = require('md5');
const Appconfig = require('../../config/config')
const mailHelper = require('../../helpers/send_mail')
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

/* ====================== saving seller account info  =======================================*/
router.post('/sellerSignup',function(req,res,next){
	//if any listed below attribute is empty
	if(!req.body.email || !req.body.password){
		res.json({'status':201,'error':'All Fields are Requierd'});
	}


	//fetching the user data and checking existing user
	repository.authRepo.fetchUserByEmail(req.body.model,req.body.email)
        .then(doc => {			
			switch (true){
				//case: no user found
				case (doc==null || ! '_id' in doc):
				
					//save seller if do not exist
					repository.authRepo.saveSellerInfo(req.body)
						.then(record => {			
							data  = record.toJSON();
							const token = jwt.sign({ sub: data._id }, Appconfig.AppConfig.jwt_Secret);									
							res.json({'status':200,'data':data, 'jwtAuthToken':token });
									
					})
					break; 
								
				//case: user found and match password (valid user)
				case ('_id' in doc):												
					res.json({'status':400,'error':'Email already exist' });							
					break; 				
				default:
					res.json({'status':401,'error':'Wrong email'});			
					break; 
			}	
		})

})


/* ====================== Seller/Dealer Email Exist  =======================================*/
router.post('/emailExist',function(req,res,next){

	//if email or password is empty
	if(!req.body.email || !req.body.model){
		res.json({'status':201,'error':'All Fields are Requierd'});
	}
    
	//fetching the user data and checking auth for valid user
	repository.authRepo.fetchUserByEmail(req.body.model,req.body.email)
        .then(doc => {	
			
			switch (true){
				

				//case: no user found
				case (doc==null || ! '_id' in doc):
					res.json({'status':400, emailExist: false});		
					break;

				//case: no user found
				case ('_id' in doc):
					res.json({'status':200, emailExist: true});		
					break;
							
				default:
					res.json({'status':401, emailExist: false});				
					break; 
			}	
		})
	
})


module.exports = router;