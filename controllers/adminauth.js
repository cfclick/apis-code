const config = require('config');
const def = require('../models/def/statuses');
const _ = require('lodash'); //js utility lib
const bcrypt = require('bcrypt'); // for password encryption
const adminUser = require('../models/adminuser');
const {
    sendMail
} = require('../helpers/mail');

const express = require('express');
const controller = express.Router();

const validate = require('../interceptors/validate');


/**
 * Admin Login, signup
 */
controller.post('/adminuser/login', async (req, res) => {

    //checking email exist

    let  admin = await adminUser.findOne({
        "email":req.body.email
    });
    if (!admin) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email or password.');

    //checking password match
    const validPassword = await bcrypt.compare(req.body.password, admin.password);
    if (!validPassword) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email or password.');

    //checking user verified
    if (!admin.verified) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Account is not verified/confirmed.');

    //checking user active
    if (!admin.active) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Account is not activted. Please contact to admin.');

    //generating authToken
    const token = admin.generateAuthToken();     
    res.setHeader('x-auth-token', token);	
    res.header('Access-Control-Expose-Headers', 'x-auth-token') 	
    return res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(admin, ['_id', 'name', 'email', 'phones','profile_pic']));
        
});


controller.post('/adminuser/signup', async (req, res) => {
    // console.log(req.body)
    // checking unique email
    let admin = await adminUser.findOne(
        { "email": req.body.email },
        { _id: 1 }
    );
    
    if (admin) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

    //checking unique phone number
    admin = await adminUser.findOne(
        { "phones.phone": req.body.phone },
        { _id: 1 }
    );
    if (admin) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Phone number already registered.');

    // save adminuser 
    admin = new adminUser(_.pick(req.body, ['name', 'email', 'phones', 'password', 'active','verified']));


    //await seller.save();
    console.log('the admin is ',admin);
    admin.save(function(err, admin){
        console.log('the error is',err)	;
		if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save admin information!.');
        
        
        //send mail	
        const name = admin.name.prefix+' '+admin.name.first_name
        const webEndPoint = config.get('webEndPoint')+'/admin/login';        
        const message='<p style="line-height: 24px; margin-bottom:15px;">'+name+',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have been successfully registered as a seller.<p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using <a target="_blank" href="'+webEndPoint+'" style="text-decoration: underline;">this</a> link.</p>'
        sendMail({
            to:req.body.email,
            subject: 'Successfull Signup',
            message:message,
        })

		res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(admin, ['_id']));	
	});	
    
});

controller.post('/adminuser/forgetPassword',async (req,res)=>{
        //checking email exist

    let  admin = await adminUser.findOne({
        "email":req.body.email
    });
    if (!admin) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email or password.');
 
    //generatinf auth token
    const token =  admin.generateAuthToken();
    //send mail	
        const name = admin.name.prefix+' '+admin.name.first_name
        const webEndPoint = config.get('webEndPoint')+'/resetPassword/'+token;        
        const message='<p style="line-height: 24px; margin-bottom:15px;">'+name+',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have requested for the password reset as a admin.<p style="line-height: 24px; margin-bottom:20px;">	You can reset your password   using <a target="_blank" href="'+webEndPoint+'" style="text-decoration: underline;">this</a> link.</p>'
        sendMail({
            to:admin.email,
            subject: 'Successfull Send Password Reset Instruction',
            message:message,
        })

       return res.status(def.API_STATUS.SUCCESS.OK).send('Password Reset Instruction Sent SuccessFully!');	

});

module.exports = controller;
