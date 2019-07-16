const ObjectID = require('mongodb').ObjectID;
const config = require('config');
const def = require('../models/def/statuses');
const validate = require('../interceptors/validate');
const _ = require('lodash'); //js utility lib
const mongoose = require('mongoose');

const {
    Payment,
    validatePayment
} = require('../models/payment');

const {
    Seller
} = require('../models/seller');

const {
    Dealer
} = require('../models/dealer');


const {
    sendMail
} = require('../helpers/mail');

const { Bid } = require('../models/bid');

const {
    Car
} = require('../models/car');

const express = require('express');
const controller = express.Router();

/**
 * Payment Controller
*/

controller.post('/onTransctionComplete', [validate(validatePayment)], async (req, res, next) => {
   // console.log(req.body);
   
   
   
   //fetching the user data
   const car = await Car.findOne({ "_id": req.body.car_id }, { _id: 1 });
	
    if (!car) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No Car found.');

    Car.findOneAndUpdate({ _id: req.body.car_id }, { $set: { type: req.body.type } }, { new: true }, function (err, response) {
        if (err) {
			return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);
		}else{
			
			
			// Update Bid Status to Paid
			Bid.findOneAndUpdate({ dealer_id: req.body.dealer_id, car_id: req.body.car_id }, { $set: { fee_status: req.body.fee_status } }, { new: true }, 	function (err, response){
					if (err) {
						return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);
					}else{
						
						//preparing new transaction object 
						payment = new Payment(_.pick(req.body, ['vin_number', 'car_id', 'dealer_id', 'seller_id', 'payee', 'payer', 'transaction_id', 'transaction_status', 'transaction_amount', 'created_at']));
						
						//save new transaction
						payment.save(async (err, car) => {
							console.log(err);
							if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save transaction information!.');

							//sending response
							res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(payment, ['_id']));
						});
						
					}
			});		
			
					
		}	
        //res.status(def.API_STATUS.SUCCESS.OK).send(doc);

    });
    

    

    


})





module.exports = controller;
