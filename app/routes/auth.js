const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const _ = require('lodash'); //js utility lib
const { API_STATUS } = require('../models/def/statuses');	
const auth = require('../interceptors/auth');	



//include models
const { Seller, validateLogin, validateEmail, validatePhoneNumber, validatePassword, validateProfile } = require('../models/seller');
const { Dealer } = require('../models/dealer');

//importing validation interceptor
const validate = require('../interceptors/validate');


/* ====================== Seller/Dealer Login  =======================================*/
router.post('/login',validate(validateLogin), async(req,res,next)=>{

    
	//fetching the user data
	seller = await eval(req.body.model).findOne({		
		$and: [			
			{ "emails": { $elemMatch: { "email": req.body.email, "default":true } } }, 
		]
	});
	if (!seller) 
		return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email.');
	
	const validPassword = await bcrypt.compare(req.body.password, seller.password);
	if (!validPassword) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Password do not Match.');


	const token = seller.generateAuthToken()
	res.setHeader('x-auth-token', token);		
	return res.status(API_STATUS.SUCCESS.OK).send(_.pick(seller, ['_id']));	
	
})



/* ====================== Save seller information  =======================================*/
router.post('/sellerSignup',validate(Seller.validateSignup),async(req,res,next)=>{

	//validating the password complexity
	const { error} = validatePassword(req.body.password)
	if(error) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('password must have complexity in combination of 1 lowercase & 1 uppercase & 1 numeric & 1 symbol.')
	
	//fetching data to check unique email
	let seller = await Seller.findOne({	"emails.email": req.body.emails[0].email },{ _id:1 });
	if (seller) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

	//fetching data to check unique phone number
	seller = await Seller.findOne({	"phones.phone": req.body.phones[0].phone },{ _id:1 });
	if (seller) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Phone number already registered.');
	
	//save seller 
	seller = new Seller(_.pick(req.body, ['name', 'username', 'emails','phones', 'password', 'social_login', 'active','created_at','updated_at']));
	

	seller.save(function(err, seller){	
		if (err) return res.status(API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save seller information!.');
		 					
		res.status(API_STATUS.SUCCESS.OK).send(true);

		
	});			
	
})

/* ====================== Save dealer information  =======================================*/
router.post('/dealerSignup',validate(Dealer.validateSignup),async(req,res,next)=>{
	
	//validating the password complexity
	const { error} = validatePassword(req.body.password)
	if(error) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('password must have complexity in combination of 1 lowercase & 1 uppercase & 1 numeric & 1 symbol.')
		
	//fetching data to check unique email
	let dealer = await Dealer.findOne({	"emails.email": req.body.emails[0].email },{ _id:1 });
	if (dealer) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

	//fetching data to check unique phone number
	dealer = await Dealer.findOne({	"phones.phone": req.body.phones[0].phone },{ _id:1 });
	if (dealer) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Phone number already registered.');	
	
	//save dealer 
	dealer = new Dealer(_.pick(req.body, ['name', 'username', 'emails','phones', 'password', 'social_login', 'state', 'city', 'zip', 'dealerships', 'active','created_at', 'updated_at']));

	dealer.save(function(err, document){	
		if (err) return res.status(API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save dealer information!.');
		
		res.status(API_STATUS.SUCCESS.OK).send(true);
	});			
	
})

/* ====================== Seller/Dealer forgot password  =======================================*/
router.post('/forgotPassword',validate(validateEmail), async(req,res,next)=>{
    
	//send mail	
	res.status(API_STATUS.SERVER_ERROR.NOT_IMPLEMENTED).send('Email functionality is pending to integrate.');
})



/* ====================== Seller/Dealer profile  =======================================*/
router.post('/profile',[auth, validate(validateProfile)], async(req,res,next)=>{

	//checking existing emails if any from emails array
	const emailsArr = req.body.emails.map(function(e){ 
		return e.email	 
	});

	const checkExistingEmail = await eval( req.body.model ).findOne({
			$and: [
			{"emails.email":{ $in: emailsArr } },
			{"_id": { $ne: req.body.id }}
			]
		},
	  { _id:1 }
	);
	console.log('checkExistingEmail:')
		console.log(checkExistingEmail)
	if(checkExistingEmail) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');
	
	//checking existing phone numbers if any from phones array
	const phonesArr = req.body.phones.map(function(e){ 
		return e.phone	 
	});
	const checkExistingPhone = await eval( req.body.model ).findOne({
			$and: [
			{"phones.phone":{ $in: phonesArr } },
			{"_id": { $ne: req.body.id }}
			]
		},
		{ _id:1 }
	);
	
	if(checkExistingEmail) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

	if(checkExistingPhone) return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Phone number already registered.');

    eval(req.body.model).findOneAndUpdate({ _id: req.body.id },{ $set:req.body },{ new: true },	function(err, doc){
	
		if(err) return res.status(API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not update seller information!.');

		res.status(API_STATUS.SUCCESS.OK).send(doc);

	});
	
})






/* ====================== Seller/Dealer email exist  =======================================*/
router.post('/emailExist',validate(validateEmail),async(req,res,next)=>{

    
	//fetching the user data
	const document = await eval(req.body.model).findOne({ "emails.email": req.body.email }, { emails:1, _id:0 });

	if(document){
		return res.status(API_STATUS.SUCCESS.OK).send(true);
	}else{
		return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(false);
	}   
	
})

/* ====================== Seller/Dealer phone number exist  =======================================*/
router.post('/phoneNumberExist',validate(validatePhoneNumber),async(req,res,next)=>{

    
	//fetching the user data
	const document = await eval(req.body.model).findOne({"phones.phone": req.body.phone },{ phones:1, _id:0 });

	if(document){
		return res.status(API_STATUS.SUCCESS.OK).send(true);
	}else{
		return res.status(API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(false);
	}   
	
})




module.exports = router;