const config = require('config');
const def = require('../../models/def/statuses');
const _ = require('lodash'); //js utility lib
const bcrypt = require('bcrypt'); // for password encryption
const admin = require('../../models/admin/admin');
const {
    sendMail
} = require('../../helpers/mail');

const express = require('express');
const controller = express.Router();

const validate = require('../../interceptors/validate');


/**
 * Admin Login, signup
 */
controller.post('/login', async (req, res) => {

    //checking email exist

    let  adminData = await admin.findOne({
        "email":req.body.email
    });
    if (!adminData) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email or password.');

    //checking password match
    const validPassword = await bcrypt.compare(req.body.password, adminData.password);
    if (!validPassword) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Invalid email or password.');

   
    //generating authToken
    const token = adminData.generateAuthToken();     
    res.setHeader('x-auth-token', token);	
    res.header('Access-Control-Expose-Headers', 'x-auth-token') 	
    return res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(adminData, ['email']));
        
});


controller.post('/forgetPassword',async (req,res)=>{
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
