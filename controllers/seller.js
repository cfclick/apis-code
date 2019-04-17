const config = require('config');
const def = require('../models/def/statuses');
const validate = require('../interceptors/validate');
const auth = require('../interceptors/auth');	
const upload = require('../helpers/upload');
const _ = require('lodash'); //js utility lib
const bcrypt = require('bcrypt'); // for password encryption
const {
    Seller 
} = require('../models/seller');
const {
    validateEmail,   
    validateProfile,
    validatePhoneNumber
} = require('../models/user');

const {
    sendMail
} = require('../helpers/mail');


const express = require('express');
const controller = express.Router();

/**
 * Seller Controller
 */


/* ====================== Seller email exist  =======================================*/
controller.post('/emailExist',validate(validateEmail),async(req,res,next)=>{
	let condition = { "emails.email": req.body.email }

    if(req.body.id){
		condition = { $and: [{"emails.email": req.body.email },{"_id": { $ne: req.body.id }}] }
	}
	//fetching the user data
	const seller = await Seller.findOne(condition, { emails:1, _id:0 });

	if(seller){
		return res.status(def.API_STATUS.SUCCESS.OK).send(true);
	}else{
		return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(false);
	}   
	
})

/* ====================== Seller phone number exist  =======================================*/
controller.post('/phoneNumberExist',validate(validatePhoneNumber),async(req,res,next)=>{
	let condition = { "phones.phone": req.body.phone }
    if(req.body.id){
		condition = { $and: [{"phones.phone": req.body.phone },{"_id": { $ne: req.body.id }}] }
	}
	//fetching the user data
	const seller = await Seller.findOne(condition,{ phones:1, _id:0 });

	if(seller){
		return res.status(def.API_STATUS.SUCCESS.OK).send(true);
	}else{
		return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(false);
	}   
	
})


/* ====================== Fetch Seller data  =======================================*/
controller.post('/fetchData', [auth], async(req,res,next)=>{
    //fetching the user data
	const seller = await Seller.findOne({ "_id": req.body.id }, { _id:1, name:1, emails:1, phones:1 });
	if(!seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found.');
	

	res.status(def.API_STATUS.SUCCESS.OK).send(seller);
})

/* ====================== Seller forgot password  =======================================*/
controller.post('/forgotPassword',validate(validateEmail), async(req,res,next)=>{
    //fetching the user data
	const seller = await Seller.findOne({ "emails.email": req.body.email }, { _id:1, name:1 });
	if(!seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('If your entered email address exist in our system, you will receive an email with instruction how to reset your password.');	
	
	//send mail	
	const name = seller.name.prefix+' '+seller.name.first_name
	const webEndPoint = config.get('webEndPoint')+'/seller/login';	
	const message='<p style="line-height: 24px; margin-bottom:15px;">'+name+',</p><p style="line-height: 24px;margin-bottom:15px;">Great news, you will now be the first to see exclusive previews of our latest collections, hear about news from the Abacus!community and get the most up to date news in the world of fashion.</p><p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using the <a target="_blank" href="'+webEndPoint+'" style="text-decoration: underline;">Here</a> link.</p>'
        
    const status = await sendMail({
        to:req.body.email,
        subject: 'Forgot Password',
        message:message,
    })
	console.log('status',status);
	if(status) return res.status(def.API_STATUS.SERVER_ERROR.NOT_IMPLEMENTED).send('Email has been sent to inbox. Please check.');
	return res.status(def.API_STATUS.SERVER_ERROR.NOT_IMPLEMENTED).send('Oops!! we got some issues in sending mail. Please try again.');
	
})



/* ====================== Seller profile  =======================================*/
controller.post('/profile',[auth, validate(validateProfile)], async(req,res,next)=>{

    //fetching the user data
	const seller = await Seller.findOne({ "_id": req.body.id }, { _id:1, name:1, emails:1, phones:1 });
	if(!seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found to update.');
    
    
	//checking existing emails if any from emails array
	const emailsArr = req.body.emails.map(function(e){ 
		return e.email	 
	});

	const checkExistingEmail = await Seller.findOne({
			$and: [
			{"emails.email":{ $in: emailsArr } },
			{"_id": { $ne: req.body.id }}
			]
		},
	  { _id:1 }
	);
	
	if(checkExistingEmail) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');
	
	//checking existing phone numbers if any from phones array
	const phonesArr = req.body.phones.map(function(e){ 
		return e.phone	 
	});
	const checkExistingPhone = await Seller.findOne({
			$and: [
			{"phones.phone":{ $in: phonesArr } },
			{"_id": { $ne: req.body.id }}
			]
		},
		{ _id:1 }
	);
	
	if(checkExistingEmail) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

	if(checkExistingPhone) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Phone number already registered.');

    Seller.findOneAndUpdate({ _id: req.body.id },{ $set:req.body },{ new: true },	function(err, doc){
      
		if(err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save seller information!');

		res.status(def.API_STATUS.SUCCESS.OK).send(doc);

	});
	
})

const singleUpload = upload.single('file')
controller.post('/profileImageUpload', function(req, res) {
	singleUpload(req, res, function(err) {
	  if (err) {
		return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message);
	  }
  
	  return res.status(def.API_STATUS.SUCCESS.OK).send(req.file.location); 
	});
});

//verifyActivateSeller
controller.post('/verifyActivateSeller', async(req,res,next)=>{
	console.log('id',req.body.id)
    //fetching the user data
	const seller = await Seller.findOne({ "_id": req.body.id }, { _id:1, name:1, emails:1, phones:1 });
	if(!seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found to update.');
    
    Seller.findOneAndUpdate({ _id: req.body.id },{ $set:{ active:true,verified:true } },{ new: true },	function(err, doc){
	  console.log('error',err);
	  console.log('doc',doc);
		if(err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);

		res.status(def.API_STATUS.SUCCESS.OK).send(doc);

	});
	
})

//updatePassword seller
controller.post('/updatePassword', async(req,res,next)=>{
	console.log('email',req.body.email)

	


    
	//fetching the user data
	const seller = await Seller.findOne({ "emails.email": req.body.email }, { emails:1, _id:0, name:1 });

	if(!seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found to update.');
    
	//seller = new Seller(_.pick(req.body, [ 'password' ]));

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

	console.log('password',password)
    Seller.findOneAndUpdate({ "emails.email": req.body.email },{ $set:{ password:password } },{ new: true },	function(err, doc){
	
		if(err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Could not save updated password.');

		//send mail		
        const name = seller.name.prefix+' '+seller.name.first_name
        const webEndPoint = config.get('webEndPoint')+'/seller/login';        
        const message='<p style="line-height: 24px; margin-bottom:15px;">'+name+',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have reset your password successfully.</p><p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using <a target="_blank" href="'+webEndPoint+'" style="text-decoration: underline;">this</a> link.</p><p style="line-height: 24px;margin-bottom:15px;">Note*: If you did not request to password reset, please contact to admin.</p>'
        sendMail({
            to:req.body.email,
            subject: 'Password Reset Request: Successfully Reset',
            message:message,
        })
	
		res.status(def.API_STATUS.SUCCESS.OK).send(doc);

	});
	
})

//change Password  seller
controller.post('/changePassword', async(req,res,next)=>{
	console.log('id',req.body.id)
    
	//fetching the user data
	const seller = await Seller.findOne({ "_id": req.body.id }, { _id:1, name:1 });
	if(!seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found.');
    

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

	console.log('password',password)
    Seller.findOneAndUpdate({ _id: req.body.id },{ $set:{ password:password } },{ new: true },	function(err, doc){
	
		if(err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Could not save updated password.');

		//send mail		
        const name = seller.name.prefix+' '+seller.name.first_name
        const webEndPoint = config.get('webEndPoint')+'/seller/login';        
		const message='<p style="line-height: 24px; margin-bottom:15px;">'+name+',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, Your have reset your password successfully.</p><p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using the <a target="_blank" href="'+webEndPoint+'" style="text-decoration: underline;">Here</a> link.</p><p style="line-height: 24px;margin-bottom:15px;">Note*: If you did not request to password reset, please contact to admin.</p>'
        sendMail({
            to:req.body.email,
            subject: 'Password Reset Request: Successfully Reset',
            message:message,
        })
		
		res.status(def.API_STATUS.SUCCESS.OK).send(doc);

	});
	
})





  

module.exports = controller;