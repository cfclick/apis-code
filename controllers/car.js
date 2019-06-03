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
    validateContactRequest,
    validateReviewBySeller,
    validateReviewByDealer
} = require('../models/car');
const { Bid } = require('../models/bid');
const {
    Seller
} = require('../models/seller');

const {
    Dealer
} = require('../models/dealer');


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
    car = new Car(_.pick(req.body, ['vin_number', 'vehicle_year', 'seller_id', 'basic_info', 'vehicle_images', 'vehicle_has_second_key', '_id','is_vehicle_aftermarket', 'vehicle_aftermarket', 'vehicle_ownership', 'vehicle_comments', 'vehicle_condition', 'willing_to_drive', 'vehicle_to_be_picked_up', 'willing_to_drive_how_many_miles', 'vehicle_finance_details', 'created_at', 'updated_at']));

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

controller.post('/editCar', [validate(validateCar)], async (req, res, next) => {
   
     //checking car exist
    let car = await Car.findOne({ "_id": req.body._id }, { _id: 1 });

    if (!car) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No recrod found.');
 
    Car.findOneAndUpdate({ _id: req.body._id },{ $set:req.body },{ new: true },	function(err, doc){
      
		if(err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save car information!');

		res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(doc, ['_id']));

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
    let totalRecords = await Car.find({seller_id:req.body.seller_id}).countDocuments()


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
    console.log('the condition is', condition);
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
            $sort: sortCondition
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
    if (req.body.type == 'bids') {
        let carIds = await Bid.distinct('car_id');// select all those car ids those have bids
        condition = { '_id': { $in: carIds } };
    } else if (req.body.type == 'active') {

        let carIds = await Bid.distinct('car_id');// select all those car ids those have bids
        condition = { '_id': { $nin: carIds } };//fetck only those cars doest have bids
    }

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
    let totalRecords = await Car.find(condition).countDocuments()


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

/**=====================Fetch All Car Bids ============================= */
controller.post('/getCarBids', async (req, res) => {
    //----fetch all the bids corsponding to car Id----

    let body = req.body;

    let condition = {
        "car_id": mongoose.Types.ObjectId(req.body.car_id)
        // , "bid_acceptance": 'accepted'
    };
    let sortCondition = {};
    //if filters contains the 'trim' filter
    sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort     

    if (body.search && isNaN(body.search))
        condition['$or'] = [{ fee_status: { $regex: req.body.search, $options: 'i' } },]

    if (body.search && !isNaN(body.search))
        condition['price'] = body.search
    //if filters contains the 'dates' filter
    if (_.has(req.body.filters, ['dates']))
        condition['$or'] = [{ bid_date: { $gte: (req.body.filters.dates['transformedStartDate']), $lte: (req.body.filters.dates['transformedEndDate']) } }]

    let totalRecords = await Bid.count(condition);//count total records 

    const start = body.pageNumber * body.size;//calculate how many records need to be skipped
    //fetch all the bids recrods 
    let bids = await Bid.find(condition).populate({
        path: "dealer_id",
        model: "Dealer",
        select: "name",
    }).populate({
        path: "car_id",
        model: "Car",
        select: "seller_id",
        // populate: {
        //     path: 'seller_id',
        //     model: 'Seller',
        //     select: 'name'
        // }
    }).sort(sortCondition).skip(start).limit(body.size);;

    res.status(def.API_STATUS.SUCCESS.OK).send({ records: bids, count: totalRecords })
})

/* ====================== Dealer car list  =======================================*/
controller.post('/contactRequest', [validate(validateContactRequest)], async (req, res, next) => {
    const name = req.body.name;
    const webEndPoint = config.get('webEndPoint') + '/seller/login';
    const message = '<p style="line-height: 24px; margin-bottom:15px;">Hello Admin,</p><p style="line-height: 24px;margin-bottom:15px;">We got a new contact request to know more information about car. Customer details is mentioned below: <p style="line-height: 24px; margin-bottom:15px;">Name:' + req.body.name + '</p> <p style="line-height: 24px; margin-bottom:15px;">Email:' + req.body.email + '</p><p style="line-height: 24px; margin-bottom:15px;">Phone:' + req.body.country_code + ' ' + req.body.phone + '</p><p style="line-height: 24px; margin-bottom:15px;">Message:' + req.body.message + '</p><p style="line-height: 24px; margin-bottom:15px;">Contact on:' + req.body.preference + '</p><p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using <a target="_blank" href="' + webEndPoint + '" style="text-decoration: underline;">this</a> link.</p>'
    console.log(message);
    sendMail({
        to: req.body.email,
        subject: 'New Contact Request',
        message: message,
    })

    //sending response
    res.status(def.API_STATUS.SUCCESS.OK).send(true);
})


/* ====================== Rate & review by dealer =======================================*/
controller.post('/ratingReviewByDealer', [validate(validateReviewByDealer)], async (req, res, next) => {

    //fetching the user data
    const dealer = await Dealer.findOne({ "_id": req.body.dealer_id }, { _id: 1 });
    if (!dealer) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found.');
    let ratingReview = {
        dealer_id: req.body.dealer_id,
        rating: req.body.rating,
        comment: req.body.comment,
    }
    Car.findOneAndUpdate({ _id: req.body._id }, { $set: { review_by_dealer: ratingReview } }, { new: true }, function (err, doc) {
        console.log('error', err);
        console.log('doc', doc);
        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);

        res.status(def.API_STATUS.SUCCESS.OK).send(doc);

    });

})


/* ====================== Rate & review by seller =======================================*/
controller.post('/getsellerRating', async (req, res, next) => {


    let sortCondition = {}
    sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort

    let start = (req.body.pageNumber <= 1) ? 0 : (req.body.pageNumber - 1) * req.body.size;//no of docs to be skipped
    //fetching the user data
    // condition object
    let condition = {
        type: 'sold',
        seller_id: mongoose.Types.ObjectId(req.body.seller_id)
    };


    if (req.body.search)
        condition['$or'] = search(req);


    if (_.has(req.body.filters, ['dates']))
        condition = filters(req, condition)


    let count = await Car.count(condition);//find the total no of sold cars


    let soldCarDetails = await Car.aggregate([
        {
            $match: condition
        },
        {
            $lookup: {
                from: "car_bids",
                let: { car_id: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$car_id", "$$car_id"] },
                                    {
                                        $eq: [
                                            "$bid_acceptance", "accepted"]
                                    }
                                ]
                            },

                        },

                    },
                    {
                        $project: {
                            dealer_id: 1,
                            updated_at: 1,
                            bid_acceptance_date: 1
                        }
                    }
                ],
                as: "car_bids"
            }
            
        },
        {
            $lookup: {
                from: "dealers",
                localField: "car_bids.dealer_id",
                foreignField: "_id",
                as: "dealer"
            }
        }
        ,
        {
            $project: {
                _id: 1,
                vehicle_year: 1,
                "basic_info.vehicle_make": 1,
                "basic_info.vehicle_model": 1,
                created_at: 1,
                review_by_dealer: 1,
                review_by_seller: 1,
                "dealer.name": 1,
                "car_bids.updated_at": 1,
                "car_bids.bid_acceptance_date": 1,
            }
        },
        {
            $sort: sortCondition
        },
        {
            $skip: parseInt(start)
        },
        {
            $limit: parseInt(req.body.size)
        },

    ])

    console.log('the rate and review are', soldCarDetails)
    res.status(def.API_STATUS.SUCCESS.OK).send({ records: soldCarDetails, count: count });


})


/* ====================== Change car status =======================================*/
controller.post('/changeCarStatus', async (req, res, next) => {

    //fetching the user data
    const car = await Car.findOne({ "_id": req.body.id }, { _id: 1 });
    if (!car) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found.');

    Car.findOneAndUpdate({ _id: req.body.id }, { $set: { type: req.body.type } }, { new: true }, function (err, doc) {
        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);

        res.status(def.API_STATUS.SUCCESS.OK).send(doc);

    });

})

function filters(req, condition) {

    //if filters contains the 'bid price' filter
    if (_.has(req.body.filters, ['price_range']))
        condition['vehicle_finance_details.vehicle_estimated_price'] = { $gte: (req.body.filters.price_range[0]), $lte: (req.body.filters.price_range[1]) }

    //if filters contains the 'dates' filter
    if (_.has(req.body.filters, ['dates'])) {
        let start = new Date(req.body.filters.dates['transformedStartDate']);
        start.setUTCHours(0, 0, 0, 0);
        let end = new Date(req.body.filters.dates['transformedEndDate'])
        end.setUTCHours(23, 59, 59, 999);
        condition['created_at'] = { $gte: start, $lte: end }

    }
    // if (_.has(req.body.filters, ['dates']))
    //    condition['created_at'] = { $gte: (new Date(req.body.filters.dates['transformedStartDate'])), $lte: (new Date(req.body.filters.dates['transformedEndDate'])) }

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
