const ObjectID = require('mongodb').ObjectID;
const config = require('config');
const def = require('../models/def/statuses');
const validate = require('../interceptors/validate');
const _ = require('lodash'); //js utility lib
const mongoose = require('mongoose');

const {
    Car,
    validateCar,
    validateRemoveCar,
    validateCarListing,
    validateDealerCarListing,
    validateCarDetail,
    validateContactRequest
} = require('../models/car');
const {Bid}  = require('../models/bid');
const {
    Seller
} = require('../models/seller');


const {
    sendMail
} = require('../helpers/mail');

const express = require('express');
const controller = express.Router();

/**
 * Car Controller
*/

controller.post('/newCar', [validate(validateCar)], async (req, res, next) => {
    console.log(req.body);
    //checking unique car vin
    //let car = await Car.findOne({ "vin_number": req.body.vin }, { _id: 1 });

    //if (car) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Car VIN already exist.');

    //fetching the last record's ref
    //let lastRecord = await Car.findOne( { }, { ref: 1,_id:-1 } ).sort( { _id: -1 } )
    //let nextRef =  ((lastRecord) && lastRecord.ref)?lastRecord.ref+1:1
    //console.log('nextRef:',nextRef);
    //req.body.ref = nextRef; //modify req object by adding new ref

    //preparing new car object 
    car = new Car(_.pick(req.body, ['vin_number', 'vehicle_year', 'seller_id', 'basic_info', 'vehicle_images', 'vehicle_has_second_key', 'is_vehicle_aftermarket', 'vehicle_aftermarket', 'vehicle_ownership', 'vehicle_comments', 'vehicle_condition', 'willing_to_drive', 'vehicle_to_be_picked_up', 'willing_to_drive_how_many_miles', 'vehicle_offer_in_hands_price', 'vehicle_proof_image', 'created_at', 'updated_at']));

    //save new car
    car.save(async (err, car) => {
        console.log(err);
        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save car information!.');

        //fetching seller data 
        let seller = await Seller.findOne({ "_id": req.body.seller_id }, { name: 1, emails: 1 });
        //console.log('seller',seller);
        const emailObject = await seller.emails.find(i => i.default == true);

        //send mail	
        const name = seller.name.prefix + ' ' + seller.name.first_name
        const webEndPoint = config.get('webEndPoint') + '/seller/login';
        const message = '<p style="line-height: 24px; margin-bottom:15px;">' + name + ',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, Your car has been added in our system successfully.<p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using <a target="_blank" href="' + webEndPoint + '" style="text-decoration: underline;">this</a> link.</p>'
        sendMail({
            to: emailObject.email,
            subject: 'Car Added',
            message: message,
        })

        //sending response
        res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(car, ['_id']));
    });


})

controller.post('/deleteCar', [validate(validateRemoveCar)], async (req, res, next) => {


    //checking car exist
    let car = await Car.findOne({ "_id": req.body.id, "seller_id": req.body.seller_id }, { _id: 1 });

    if (!car) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No recrod found.');


    //remove car
    Car.deleteOne({ _id: req.body.id }, function (err, result) {
        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not delete car!.');

        res.status(def.API_STATUS.SUCCESS.OK).send(true);
    });
})


controller.post('/carDetail', [validate(validateCarDetail)], async (req, res, next) => {
    //console.log(req.body)


    let car = await Car.findOne({ "_id": req.body.id });

    if (!car) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No recrod found.');

    return res.status(def.API_STATUS.SUCCESS.OK).send(car);
})

/* ====================== Seller car list  =======================================*/
controller.post('/listingCars', [validate(validateCarListing)], async (req, res, next) => {


    //define the condition to fetch records (All, active, sold, archived)
    let condition = (req.body.type != 'all') ? ({ "type": req.body.type }) : {};

    //condition to filter cars according to loggedin seller
    condition['seller_id'] = req.body.seller_id

    if (!_.isEmpty(req.body.filters, true)) {
        condition = filters(req, condition)
    }

    if (req.body.search)
        condition['$or'] = search(req);

    let sortCondition = {}
    sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort

    console.log('condition', condition);
    // calculating the car's count after search/filters
    let totalRecordsAfterFilter = await Car.find(condition).countDocuments()

    // calculating the car's count
    let totalRecords = await Car.find().countDocuments()


    //calculating the limit and skip attributes to paginate records
    let totalPages = totalRecordsAfterFilter / req.body.size;
    let start = (req.body.pageNumber <= 1) ? 0 : (req.body.pageNumber - 1) * req.body.size;
    // console.log('start',start);
    // console.log('condition',condition);
    let records = await Car.find(condition).
        sort(sortCondition).
        skip(start).
        limit(req.body.size)

    return res.status(def.API_STATUS.SUCCESS.OK).send({ records: records, count: totalRecordsAfterFilter, filteredRecords: totalRecords });
})

/* ====================== Seller car list on datatbles =======================================*/
controller.post('/listingCarsOnDatable', [validate(validateCarListing)], async (req, res, next) => {


    //define the condition to fetch records (All, active, sold, archived)
    let condition = (req.body.type != 'all') ? ({ "type": req.body.type }) : {};

    //condition to filter cars according to loggedin seller
    condition['seller_id'] = mongoose.Types.ObjectId(req.body.seller_id)

    if (!_.isEmpty(req.body.filters, true)) {
        condition = filters(req, condition)
    }

    if (req.body.search)
        condition['$or'] = search(req);

    let sortCondition = {}
    sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort

    console.log('condition', condition);
    // calculating the car's count after search/filters
    let totalRecordsAfterFilter = await Car.find(condition).countDocuments()

    // calculating the car's count
    let totalRecords = await Car.find().countDocuments()


    //calculating the limit and skip attributes to paginate records
    let totalPages = totalRecordsAfterFilter / req.body.size;
    //let start = (req.body.pageNumber<=1)? 0 : (req.body.pageNumber-1) * req.body.size;
    let start = req.body.pageNumber * req.body.size;
    let records = await Car.aggregate([
        {
            $match: condition
            
        },
        {
            $lookup: {
                from: "car_bids",
                localField: "_id",    // field in the car collection
                foreignField: "car_id",  // field in the car_bids collection
                as: "carbids"
            }

        },
        {
            $addFields: {
                bids: { $size: "$carbids" }

            }
        },
        {
           $sort:sortCondition
        },
        {
            $skip: parseInt(start)
        },
        {
            $limit: parseInt(req.body.size)
        },
       
    ])

    return res.status(def.API_STATUS.SUCCESS.OK).send({ records: records, count: totalRecordsAfterFilter, filteredRecords: totalRecords });
})

/* ====================== Dealer car list  =======================================*/
controller.post('/listingDealersCars', [validate(validateDealerCarListing)], async (req, res, next) => {


    //define the condition to fetch records (All, active, sold, archived)
    let condition = { "type": req.body.type };

    if (!_.isEmpty(req.body.filters, true)) {
        condition = filters(req, condition)
    }

    if (req.body.search)
        condition['$or'] = search(req);

    let sortCondition = {}
    sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort

    console.log('condition', condition);

    // calculating the car's count after search/filters
    let totalRecordsAfterFilter = await Car.find(condition).countDocuments()

    // calculating the car's count
    let totalRecords = await Car.find().countDocuments()


    //calculating the limit and skip attributes to paginate records
    let totalPages = totalRecordsAfterFilter / req.body.size;
    let start = (req.body.pageNumber <= 1) ? 0 : (req.body.pageNumber - 1) * req.body.size;
    // console.log('start',start);
    // console.log('condition',condition);
    let records = await Car.find(condition).
        sort(sortCondition).
        skip(start).
        limit(req.body.size)

    return res.status(def.API_STATUS.SUCCESS.OK).send({ records: records, count: totalRecordsAfterFilter, filteredRecords: totalRecords });
});

/* ====================== get car bids  =======================================*/
controller.post('/getCarBids',async (req,res)=>{
    let bids = await Bid.find({car_id:req.body.carId});
    
    res.status(def.API_STATUS.SUCCESS.OK).send({records:bids})
})

/* ====================== Dealer car list  =======================================*/
controller.post('/contactRequest',[validate(validateContactRequest)], async(req,res,next)=>{
    const name = req.body.name;
    const webEndPoint = config.get('webEndPoint')+'/seller/login';        
    const message='<p style="line-height: 24px; margin-bottom:15px;">Hello Admin,</p><p style="line-height: 24px;margin-bottom:15px;">We got a new contact request to know more information about car. Customer details is mentioned below: <p style="line-height: 24px; margin-bottom:15px;">Name:'+req.body.name+'</p> <p style="line-height: 24px; margin-bottom:15px;">Email:'+req.body.email+'</p><p style="line-height: 24px; margin-bottom:15px;">Phone:'+req.body.country_code+' '+req.body.phone+'</p><p style="line-height: 24px; margin-bottom:15px;">Message:'+req.body.message+'</p><p style="line-height: 24px; margin-bottom:15px;">Contact on:'+req.body.preference+'</p><p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using <a target="_blank" href="'+webEndPoint+'" style="text-decoration: underline;">this</a> link.</p>'
    console.log(message);
    sendMail({
        to:req.body.email,
        subject: 'New Contact Request',
        message:message,
    })

    //sending response
    res.status(def.API_STATUS.SUCCESS.OK).send(true);
})

function filters(req, condition){

    //if filters contains the 'bid price' filter
    if (_.has(req.body.filters, ['price_range']))
        condition['vehicle_ownership.vehicle_pay_off'] = { $gte: (req.body.filters.price_range[0]), $lte: (req.body.filters.price_range[1]) }

    //if filters contains the 'dates' filter
    if (_.has(req.body.filters, ['dates']))
        condition['created_at'] = { $gte: (req.body.filters.dates['transformedStartDate']), $lte: (req.body.filters.dates['transformedEndDate']) }

    //if filters contains the 'years' filter
    if (_.has(req.body.filters, ['year_range']))
        condition['vehicle_year'] = { $gte: req.body.filters.year_range[0], $lte: req.body.filters.year_range[1] }

    //if filters contains the 'year' filter
    if (_.has(req.body.filters, ['year']) && req.body.filters['year'].length > 0)
        condition['vehicle_year'] = { $in: req.body.filters['year'] }

    //if filters contains the 'make' filter
    if (_.has(req.body.filters, ['make']) && req.body.filters['make'].length > 0)
        condition['basic_info.vehicle_make'] = { $in: req.body.filters['make'] }


    //if filters contains the 'model' filter
    if (_.has(req.body.filters, ['model']) && req.body.filters['model'].length > 0)
        condition['basic_info.vehicle_model'] = { $in: req.body.filters['model'] }


    //if filters contains the 'trim' filter
    if (_.has(req.body.filters, ['trim']) && req.body.filters['trim'].length > 0)
        condition['basic_info.vehicle_trim'] = { $in: req.body.filters['trim'] }

    //if filters contains the 'body_style' filter
    if (_.has(req.body.filters, ['body_style']) && req.body.filters['body_style'].length > 0 && !_.includes(req.body.filters['body_style'], 'All body'))
        condition['basic_info.vehicle_body_type'] = { $in: req.body.filters['body_style'] }


    //if filters contains the 'transmission' filter
    if (_.has(req.body.filters, ['transmission']) && req.body.filters['transmission'].length > 0)
        condition['basic_info.vehicle_transmission'] = { $in: req.body.filters['transmission'] }

    //if filters contains the 'exterior_color' filter
    if (_.has(req.body.filters, ['exterior_color']) && req.body.filters['exterior_color'].length > 0)
        condition['basic_info.vehicle_exterior_color'] = { $in: req.body.filters['exterior_color'] }

    //if filters contains the 'interior_color' filter
    if (_.has(req.body.filters, ['interior_color']) && req.body.filters['interior_color'].length > 0)
        condition['basic_info.vehicle_interior_color'] = { $in: req.body.filters['interior_color'] }

    //if filters contains the 'interior_color' filter
    if (_.has(req.body.filters, ['miles']) && req.body.filters['miles'].length > 0)
        condition['willing_to_drive_how_many_miles'] = { $in: req.body.filters['miles'] }


    return condition
}

function search(req) {
    //text search on listed columns
    return [
        { vin_number: { $regex: req.body.search, $options: 'i' } },
        { 'basic_info.vehicle_make': { $regex: req.body.search, $options: 'i' } },
        { 'basic_info.vehicle_model': { $regex: req.body.search, $options: 'i' } },
        { 'basic_info.vehicle_trim': { $regex: req.body.search, $options: 'i' } },
        { 'basic_info.vehicle_body_type': { $regex: req.body.search, $options: 'i' } },
        { 'basic_info.type': { $regex: req.body.search, $options: 'i' } },
        /*{offer_in_hand: req.body.search}, //ToDo
        {year: req.body.search } //ToDo
        */
    ]
}

module.exports = controller;
