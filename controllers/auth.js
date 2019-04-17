const config = require('config');
const def = require('../models/def/statuses');
const _ = require('lodash'); //js utility lib
const bcrypt = require('bcrypt'); // for password encryption

const {
    Seller,
    validateSeller,    
} = require('../models/seller');

const {
    Dealer,
    validateDealer,
} = require('../models/dealer');

const {
    User,  
    validateLogin  
} = require('../models/user');

const validate = require('../interceptors/validate');
const {
    sendMail
} = require('../helpers/mail');

const express = require('express');
const controller = express.Router();


/**
 * Seller Login, signup
 */
controller.post('/seller/login',validate(validateLogin), async (req, res) => {

    //checking email exist
    seller = await Seller.findOne({
        $and: [
            { "emails": { $elemMatch: { "email": req.body.email, "default": true } } },
        ]
    });
    if (!seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email or password.');

    //checking password match
    const validPassword = await bcrypt.compare(req.body.password, seller.password);
    if (!validPassword) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email or password.');

    //checking user verified
    if (!seller.verified) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Account is not verified/confirmed.');

    //checking user active
    if (!seller.active) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Account is not activted. Please contact to admin.');

    //generating authToken
    const token = seller.generateAuthToken();     
    res.setHeader('x-auth-token', token);	
    res.header('Access-Control-Expose-Headers', 'x-auth-token') 	
    return res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(seller, ['_id', 'name', 'emails', 'phones','profile_pic']));
        
});

controller.post('/seller/signup', validate(validateSeller), async (req, res) => {
    
  
    console.log(req.body)
    //checking unique email
    let seller = await Seller.findOne(
        { "emails.email": req.body.emails[0].email },
        { _id: 1 }
    );
    
    if (seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

    //checking unique phone number
    seller = await Seller.findOne(
        { "phones.phone": req.body.phones[0].phone },
        { _id: 1 }
    );
    if (seller) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Phone number already registered.');

    //save seller 
    seller = new Seller(_.pick(req.body, ['name', 'username', 'emails', 'phones', 'password', 'social_login', 'active', 'created_at','verified', 'updated_at']));


    //await seller.save();
    seller.save(function(err, seller){	
		if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save dealer information!.');
        
        
        //send mail	
        const name = seller.name.prefix+' '+seller.name.first_name
        const webEndPoint = config.get('webEndPoint')+'/seller/login';        
        const message='<p style="line-height: 24px; margin-bottom:15px;">'+name+',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have been successfully registered as a seller.<p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using <a target="_blank" href="'+webEndPoint+'" style="text-decoration: underline;">this</a> link.</p>'
        sendMail({
            to:req.body.emails[0].email,
            subject: 'Successfull Signup',
            message:message,
        })

		res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(seller, ['_id']));	
	});	
    
});


/**
 * Dealer Login, signup
 */
controller.post('/dealer/login',validate(validateLogin), async (req, res) => {

    //checking email exist
    dealer = await Dealer.findOne({
        $and: [
            { "emails": { $elemMatch: { "email": req.body.email, "default": true } } },
        ]
    });
    if (!dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email or password.');

    //checking password match
    const validPassword = await bcrypt.compare(req.body.password, dealer.password);
    if (!validPassword) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email or password.');
	
	//checking user verified
    if (!dealer.verified) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Account is not verified/confirmed.');

    //checking user active
    if (!dealer.active) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Account is not activted. Please contact to admin.');

    //generating authToken
    const token = dealer.generateAuthToken();

    res.setHeader('x-auth-token', token);	
    res.header('Access-Control-Expose-Headers', 'x-auth-token') 
    return res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(dealer, ['_id', 'name', 'emails', 'phones','profile_pic']));
});

controller.post('/dealer/signup',validate(validateDealer), async (req, res) => {

   
    //fetching data to check unique email
	let dealer = await Dealer.findOne(
        { "emails.email": req.body.emails[0].email },
        { _id:1 }
    );
	if (dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

	//fetching data to check unique phone number
	dealer = await Dealer.findOne(
        { "phones.phone": req.body.phones[0].phone },
        { _id:1 }
    );
	if (dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Phone number already registered.');	
	
    //save dealer 
	dealer = new Dealer(_.pick(req.body, ['name', 'username', 'emails','phones', 'password', 'social_login', 'state', 'city', 'zip', 'dealerships', 'availabilitydate', 'time', 'timezone', 'language', 'active', 'verified' ,'created_at', 'updated_at']));

    //await dealer.save();
    dealer.save(function(err, dealer){	
		if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);
		
		
		//send mail	
        const name = dealer.name.prefix+' '+dealer.name.first_name
        const webEndPoint = config.get('webEndPoint')+'/dealer/login';        
        const message='<p style="line-height: 24px; margin-bottom:15px;">'+name+',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have been successfully registered as a dealer.<p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using <a target="_blank" href="'+webEndPoint+'" style="text-decoration: underline;">this</a> link.</p>'
        sendMail({
            to:req.body.emails[0].email,
            subject: 'Successfull Signup',
            message:message,
        })
		 					
		res.status(def.API_STATUS.SUCCESS.OK).send(true);		
	});

});



module.exports = controller;