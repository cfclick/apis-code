const config = require('config');
const def = require('../models/def/statuses');
const _ = require('lodash'); //js utility lib
const fs = require('fs');
const jwt = require('jsonwebtoken'); //generate json token
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
} = require('../helpers/emailService');

const express = require('express');
const controller = express.Router();

/**
 * Seller Login, signup
 */
controller.post('/seller/login', validate(validateLogin), async (req, res) => {

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
    return res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(seller, ['_id', 'name', 'emails', 'is_verified', 'phones', 'profile_pic','is_multifactor_authorized']));

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
    seller = new Seller(_.pick(req.body, ['name', 'username', 'emails', 'phones', 'password', 'social_login', 'active', 'created_at', 'verified', 'updated_at']));


    //await seller.save();
    seller.save(async function (err, seller) {
        console.log('the erroris ', err)
        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save dealer information!.');


        //send mail	
        seller['cipher'] = req.body.password;
        console.log('the token is ', generateAuthToken(seller));
        const token = generateAuthToken(seller);
        const name = seller.name.prefix + ' ' + seller.name.first_name
        const webEndPoint = config.get('webEndPointStaging') + '/seller/verify-email/' + token;
        // const message = '<p style="line-height: 24px; margin-bottom:15px;">' + name + ',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have been successfully registered as a seller.<p style="line-height: 24px; margin-bottom:20px;">	You can verify your account at any point using <a target="_blank" href="' + webEndPoint + '" style="text-decoration: underline;">this</a> link.</p>'
       const msg ={
        to: req.body.emails[0].email,
        from :config.get('fromEmail'),
        subject:"Seller's Account Verification",
        template_id:config.get('email-templates.seller-welcome-template'),
        dynamic_template_data:{
            verificationLink:webEndPoint,
            name:name
        }
       }
        sendMail(msg)
                await Seller.findOneAndUpdate({ _id: seller._id }, { $set: { token: token } }, { new: true })

        res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(seller, ['_id']));
    });

});
//function to generate jwt token
function generateAuthToken(user) {
    // PRIVATE and PUBLIC key
    console.log('the user is ', user.cipher)
    let privateKEY = fs.readFileSync('./config/keys/private.key');

    const i = 'topautobid'; // Issuer 
    const s = 'info@topautobid.com'; // Subject 
    const a = 'http://topautobid.com'; // Audience
    // SIGNING OPTIONS
    const signOptions = {
        issuer: i,
        subject: s,
        audience: a,
        expiresIn: "1h",
        algorithm: "RS256"
    };
    const token = jwt.sign({
        _id: user._id,
        // email: user.emails[0].email,
        cipher: user.cipher,//its the password in plain text
        username: user.username,
        isAdmin: user.isAdmin,
        userType: user.userType,
    }, privateKEY, signOptions);
    return token;
}





/**
 * seller send verification link  using token
 */
controller.post('/seller/sendVerificationLink', async (req, res) => {

    let user = await Seller.findOne({ _id: req.body.userId });

    let privateKEY = fs.readFileSync('./config/keys/private.key');
    let decoded = jwt.decode(user.token, privateKEY);
    console.log('the email is', decoded);

    if (!decoded || !decoded.username) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('your token is invalid.');
    let password = decoded.cipher;

    //send mail
    //    user = user.toObject();
    user['cipher'] = password;
    console.log('the token is ', generateAuthToken(user));
    const token = generateAuthToken(user);
    const name = user.name.prefix + ' ' + user.name.first_name
    const webEndPoint = config.get('webEndPointStaging') + '/seller/verify-email/' + token;
    // const message = '<p style="line-height: 24px; margin-bottom:15px;">' + name + ',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have been successfully registered as a seller.<p style="line-height: 24px; margin-bottom:20px;">	You can verify your account at any point using <a target="_blank" href="' + webEndPoint + '" style="text-decoration: underline;">this</a> link.</p>'
    const msg ={
        to: user.emails[0].email,
        from :config.get('fromEmail'),
        Subject:"Seller's Forgot Password",
        template_id:config.get('email-templates.forgot-password-template'),
        dynamic_template_data:{
			forgotpasswordlink:webEndPoint,
			name:name
		}
    }
    await sendMail(msg);
    await Seller.findOneAndUpdate({ _id: user._id }, { $set: { token: token } }, { new: true })

    res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(user, ['_id']));


});



/**
 * seller verify user using token
 */
controller.post('/seller/verifyEmail', async (req, res) => {
    let privateKEY = fs.readFileSync('./config/keys/private.key');
    let decoded = jwt.decode(req.body.token, privateKEY);
    console.log('the email is', decoded);

    if (!decoded || !decoded.username) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('your token is invalid.');
    let password = decoded.cipher;

    let seller = await Seller.findOne({ 'username': decoded.username });
    // console.log('the seller is', seller);
    if (!seller)
        return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('seller not found.');
    //check if the user is already verified
    seller = seller.toObject();
    seller['cipher'] = password;
    if (seller.is_verified)
        return res.status(def.API_STATUS.SUCCESS.OK).send({ alreadyVerified: true, seller: seller })

    //if the user is not verified
    Seller.findOneAndUpdate({ _id: seller._id }, { $set: { is_verified: true } }, { new: true }, function (err, doc) {

        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not update the seller information!');
        doc = doc.toObject();
        doc['cipher'] = password;// send back passowod---
        res.status(def.API_STATUS.SUCCESS.OK).send(doc);

    });


});


/**
 * seller verify user using token
 */
controller.post('/seller/setMFA', async (req, res) => {

    //if req.body._id is a seller id
    Seller.findOneAndUpdate({ _id: req.body.userId }, { $set: { is_multifactor_authorized: true } }, { new: true }, function (err, doc) {

        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not update the seller information!');
        res.status(def.API_STATUS.SUCCESS.OK).send({ sellerId: doc._id });

    });
})



/**
 * Dealer Login, signup
 */
controller.post('/dealer/login', validate(validateLogin), async (req, res) => {

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
    return res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(dealer, ['_id', 'name', 'emails','is_verified', 'phones', 'profile_pic','is_multifactor_authorized']));
});




controller.post('/dealer/signup', validate(validateDealer), async (req, res) => {


    //fetching data to check unique email
    let dealer = await Dealer.findOne(
        { "emails.email": req.body.emails[0].email },
        { _id: 1 }
    );
    if (dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

    //fetching data to check unique phone number
    dealer = await Dealer.findOne(
        { "phones.phone": req.body.phones[0].phone },
        { _id: 1 }
    );
    if (dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Phone number already registered.');

    //save dealer 
    dealer = new Dealer(_.pick(req.body, ['name', 'username', 'emails', 'phones', 'password', 'social_login', 'state', 'city', 'zip', 'dealerships', 'availabilitydate', 'time', 'timezone', 'language', 'active', 'verified', 'created_at', 'updated_at']));
    console.log('the dealer is ',dealer)
    //await dealer.save();
    dealer.save(async function (err, dealer) {
        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);


        //send mail	
        //send mail	
        dealer['cipher'] = req.body.password;
        const token = generateAuthToken(dealer);
        const name = dealer.name.prefix + ' ' + dealer.name.first_name
        const webEndPoint = config.get('webEndPointStaging') + '/dealer/verify-email/' + token;
        // const message = '<p style="line-height: 24px; margin-bottom:15px;">' + name + ',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have been successfully registered as a dealer.<p style="line-height: 24px; margin-bottom:20px;">	You can verify your account at any point using <a target="_blank" href="' + webEndPoint + '" style="text-decoration: underline;">this</a> link.</p>'
        const msg ={
            to: req.body.emails[0].email,
            from :config.get('fromEmail'),
            subject:"Dealer's Account Verification",
            template_id:config.get('email-templates.dealer-welcome-template'),
            dynamic_template_data:{
                verificationLink:webEndPoint,
                name:name
            }
           }
  
           await sendMail(msg)
        await Dealer.findOneAndUpdate({ _id: dealer._id }, { $set: { token: token } }, { new: true })
        res.status(def.API_STATUS.SUCCESS.OK).send(true);
    });

});

/**
 * seller verify user using token
 */
controller.post('/dealer/verifyEmail', async (req, res) => {
    let privateKEY = fs.readFileSync('./config/keys/private.key');
    let decoded = jwt.decode(req.body.token, privateKEY);
    console.log('the email is', decoded);

    if (!decoded || !decoded.username) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('your token is invalid.');
    let password = decoded.cipher;

    let dealer = await Dealer.findOne({ 'username': decoded.username });
    if (!dealer)
        return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('dealer not found.');
    //check if the user is already verified
    dealer = dealer.toObject();
    dealer['cipher'] = password;
    if (dealer.is_verified)
        return res.status(def.API_STATUS.SUCCESS.OK).send({ alreadyVerified: true, dealer: _.pick(dealer, ['_id','name', 'username', 'emails', 'phones', 'cipher']) });

    //if the user is not verified
    Dealer.findOneAndUpdate({ _id: dealer._id }, { $set: { is_verified: true } }, { new: true }, function (err, doc) {

        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not update the dealer information!');
        doc = doc.toObject();
        doc['cipher'] = password;// send back passowod---
        res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(doc, ['_id','name', 'username', 'emails', 'phones', 'cipher']));

    });


});


/**
 * seller send verification link  using token
 */
controller.post('/dealer/sendVerificationLink', async (req, res) => {

    let user = await Dealer.findOne({ _id: req.body.userId });

    let privateKEY = fs.readFileSync('./config/keys/private.key');
    let decoded = jwt.decode(user.token, privateKEY);
    console.log('the email is', decoded);

    if (!decoded || !decoded.username) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('your token is invalid.');
    let password = decoded.cipher;

    //send mail
    //    user = user.toObject();
    user['cipher'] = password;
    console.log('the token is ', generateAuthToken(user));
    const token = generateAuthToken(user);
    const name = user.name.prefix + ' ' + user.name.first_name
    const webEndPoint = config.get('webEndPointStaging') + '/dealer/verify-email/' + token;
    // const message = '<p style="line-height: 24px; margin-bottom:15px;">' + name + ',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have been successfully registered as a seller.<p style="line-height: 24px; margin-bottom:20px;">	You can verify your account at any point using <a target="_blank" href="' + webEndPoint + '" style="text-decoration: underline;">this</a> link.</p>'
    const msg ={
        to: user.emails[0].email,
        from :config.get('fromEmail'),
        Subject:"Seller's Forgot Password",
        template_id:config.get('email-templates.forgot-password-template'),
        dynamic_template_data:{
			forgotpasswordlink:webEndPoint,
			name:name
		}
    }
    await sendMail(msg);
    await Dealer.findOneAndUpdate({ _id: user._id }, { $set: { token: token } }, { new: true })

    res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(user, ['_id']));


});


/**
 * Dealer set MFA 
 */
controller.post('/dealer/setMFA', async (req, res) => {

    //if req.body._id is a seller id
    Dealer.findOneAndUpdate({ _id: req.body.userId }, { $set: { is_multifactor_authorized: true } }, { new: true }, function (err, doc) {

        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not update the seller information!');

        res.status(def.API_STATUS.SUCCESS.OK).send({ sellerId: doc._id });

    });
})






module.exports = controller;