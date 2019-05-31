const config = require('config');
const def = require('../models/def/statuses');
const validate = require('../interceptors/validate');
const auth = require('../interceptors/auth');
const upload = require('../helpers/upload');
const mongoose = require('mongoose');
const _ = require('lodash'); //js utility lib
const bcrypt = require('bcrypt'); // for password encryption
const {
	Dealer
} = require('../models/dealer');
//import bid modal
const { Bid } = require('../models/bid');
const { validateBid } = require('../models/bid');
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
 * Dealer Controller
 */
/* ====================== Dealer email exist  =======================================*/
controller.post('/emailExist', validate(validateEmail), async (req, res, next) => {
	let condition = { "emails.email": req.body.email }

	if (req.body.id) {
		condition = { $and: [{ "emails.email": req.body.email }, { "_id": { $ne: req.body.id } }] }
	}
	//fetching the user data
	const dealer = await Dealer.findOne(condition, { emails: 1, _id: 0 });

	if (dealer) {
		return res.status(def.API_STATUS.SUCCESS.OK).send(true);
	} else {
		return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(false);
	}

})

/* ====================== Dealer phone number exist  =======================================*/
controller.post('/phoneNumberExist', validate(validatePhoneNumber), async (req, res, next) => {
	let condition = { "phones.phone": req.body.phone }
	if (req.body.id) {
		condition = { $and: [{ "phones.phone": req.body.phone }, { "_id": { $ne: req.body.id } }] }
	}
	//fetching the user data
	const dealer = await Dealer.findOne(condition, { phones: 1, _id: 0 });

	if (dealer) {
		return res.status(def.API_STATUS.SUCCESS.OK).send(true);
	} else {
		return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send(false);
	}

})


/* ====================== Fetch Dealer data  =======================================*/
controller.post('/fetchData', [auth], async (req, res, next) => {
	//fetching the user data
	const dealer = await Dealer.findOne({ "_id": req.body.id }, { _id: 1, name: 1, emails: 1, phones: 1 });
	if (!dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found.');


	res.status(def.API_STATUS.SUCCESS.OK).send(dealer);
})

/* ====================== Dealer forgot password  =======================================*/
controller.post('/forgotPassword', validate(validateEmail), async (req, res, next) => {
	//fetching the user data
	const dealer = await Dealer.findOne({ "emails.email": req.body.email }, { _id: 1 });
	if (!dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('If your entered email address exist in our system, you will receive an email with instruction how to reset your password.');

	//send mail	
	sendMail({
		to: 'sandeep.kumar@trigma.in',
		subject: 'Test Email',
		message: 'your <b>message</b> goes here',
	})

	return res.status(def.API_STATUS.SERVER_ERROR.NOT_IMPLEMENTED).send('Email functionality is pending to integrate.');
})



/* ====================== Dealer profile  =======================================*/
controller.post('/profile', [auth, validate(validateProfile)], async (req, res, next) => {

	//fetching the user data
	const dealer = await Dealer.findOne({ "_id": req.body.id }, { _id: 1, name: 1, emails: 1, phones: 1 });
	if (!dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found to update.');


	//checking existing emails if any from emails array
	const emailsArr = req.body.emails.map(function (e) {
		return e.email
	});

	const checkExistingEmail = await Dealer.findOne({
		$and: [
			{ "emails.email": { $in: emailsArr } },
			{ "_id": { $ne: req.body.id } }
		]
	},
		{ _id: 1 }
	);

	if (checkExistingEmail) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

	//checking existing phone numbers if any from phones array
	const phonesArr = req.body.phones.map(function (e) {
		return e.phone
	});
	const checkExistingPhone = await Dealer.findOne({
		$and: [
			{ "phones.phone": { $in: phonesArr } },
			{ "_id": { $ne: req.body.id } }
		]
	},
		{ _id: 1 }
	);

	if (checkExistingEmail) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Email address already registered.');

	if (checkExistingPhone) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Phone number already registered.');

	Dealer.findOneAndUpdate({ _id: req.body.id }, { $set: req.body }, { new: true }, function (err, doc) {

		if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not update dealer information!.');

		res.status(def.API_STATUS.SUCCESS.OK).send(doc);

	});

})


const singleUpload = upload.single('file')
controller.post('/profileImageUpload', function (req, res) {
	singleUpload(req, res, function (err) {
		if (err) {
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message);
		}

		return res.status(def.API_STATUS.SUCCESS.OK).send(req.file.location);
	});
});

const vehicleUpload = upload.single('file')
controller.post('/vehicleImageUpload', function (req, res) {
	vehicleUpload(req, res, function (err) {
		if (err) {
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err.message);
		}

		return res.status(def.API_STATUS.SUCCESS.OK).send(req.file.location);
	});
});


//updatePassword dealer
controller.post('/updatePassword', async (req, res, next) => {

	//fetching the user data
	const dealer = await Dealer.findOne({ "emails.email": req.body.email }, { emails: 1, _id: 0, name: 1 });

	if (!dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found to update.');

	//dealer = new Dealer(_.pick(req.body, [ 'password' ]));

	const salt = await bcrypt.genSalt(10);
	const password = await bcrypt.hash(req.body.password, salt);


	Dealer.findOneAndUpdate({ "emails.email": req.body.email }, { $set: { password: password } }, { new: true }, function (err, doc) {

		if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Could not save updated password.');

		//send mail		
		const name = seller.name.prefix + ' ' + seller.name.first_name
		const webEndPoint = config.get('webEndPoint') + '/dealer/login';
		const message = '<p style="line-height: 24px; margin-bottom:15px;">' + name + ',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, You have reset your password successfully.</p><p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using <a target="_blank" href="' + webEndPoint + '" style="text-decoration: underline;">this</a> link.</p><p style="line-height: 24px;margin-bottom:15px;">Note*: If you did not request to password reset, please contact to admin.</p>'
		sendMail({
			to: req.body.email,
			subject: 'Password Reset Request: Successfully Reset',
			message: message,
		})

		res.status(def.API_STATUS.SUCCESS.OK).send(doc);

	});

})




//create bid...
controller.post('/createBi', validate(validateBid), async (req, res) => {
	sendMail({
		to: 'asdasd',
		subject: 'Password Reset Request: Successfully Reset',
		message: 'message',
	})
	res.json({
		succes: true,

	})
})

//create bid...
controller.post('/createBid', validate(validateBid), async (req, res) => {
	let bid = new Bid({
		car_id: req.body.car_id,
		dealer_id: req.body.dealer_id,
		price: req.body.price,
		bid_date: req.body.bid_date,
		bid_acceptance: req.body.bid_acceptance,
		bid_acceptance_date: req.body.bid_acceptance_date,
		time: req.body.time,
		fee_status: req.body.fee_status,

	})
	console.log('the bid is ', bid)
	bid.save(async (err, bid) => {
		if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not create bid!.');

		//sending response
		res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(bid, ['_id']));
	})

})

//get all purchases
controller.post('/getPurchaseList', async (req, res) => {
	let body = req.body;

	let condition = { "dealer_id": mongoose.Types.ObjectId(req.body.dealer_id) };
   let sortCondition = {};

   //if filters contains the 'sortDirection,sortProperty' filter
	sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort     

	if (body.search && isNaN(body.search)) 
		condition['$or'] = [{ fee_status: { $regex: req.body.search, $options: 'i' } }]
	
	if (body.search && !isNaN(body.search)) 
		condition['price'] = body.search
	
	//if filters contains the 'dates' filter
	if (_.has(req.body.filters, ['dates']))
		condition['$or']= [
			{ bid_date: { $gte: (req.body.filters.dates['transformedStartDate']), $lte: (req.body.filters.dates['transformedEndDate']) }},
			{ bid_acceptance_date: { $gte: (req.body.filters.dates['transformedStartDate']), $lte: (req.body.filters.dates['transformedEndDate']) }},
		]


	let totalRecords = await Bid.count(condition);//total bids

	const start = body.pageNumber * body.size;//calculating the skipping records

	let records = await Bid.find(condition).populate({
			path: "dealer_id",
			model: "Dealer",
			select: "name"
		}).populate({
			path: "car_id",
			model: "Car",
			select: "ref"
		})
		.sort(sortCondition)
		.skip(start)
		.limit(body.size);
	return res.status(def.API_STATUS.SUCCESS.OK).send({ records: records, count: totalRecords });
})


module.exports = controller;