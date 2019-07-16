const ObjectID = require('mongodb').ObjectID;
const config = require('config');
const def = require('../../models/def/statuses');
const _ = require('lodash'); //js utility lib
const mongoose = require('mongoose');

const {
    Car   
} = require('../../models/car');

const {
    Bid   
} = require('../../models/bid');

const express = require('express');
const controller = express.Router();

/**
 * Car Controller
*/


/* ====================== car list  =======================================*/



/* ====================== Fetch car details =======================================*/

controller.post('/carDetail', async (req, res, next) => {
    //console.log(req.body)


    let car = await Car.findOne({ "_id": req.body.id });

    if (!car) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No recrod found.');

    return res.status(def.API_STATUS.SUCCESS.OK).send(car);
})



/* ====================== Dealer car list on datatbles =======================================*/
controller.post('/listing', async (req, res, next) => {

    let condition = (req.body.type != 'all') ? ({ "type": req.body.type }) : {};   

    let sortCondition = {}
    sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort


    let totalRecords = await Car.find(condition).countDocuments()
    let start = (req.body.pageNumber <= 1) ? 0 : (req.body.pageNumber - 1) * req.body.size;
   

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
            },
           
        },
        {
            $lookup: {
                from: "sellers",
                localField: "seller_id",    // field in the car collection
                foreignField: "_id",  // field in the car_bids collection
                as: "sellers"
            }

        },
        
        {
            "$addFields": {
                "totalBids": { "$size": "$carbids" }
            },
        },
        { $unwind:
            {
                path:"$carbids",
                preserveNullAndEmptyArrays:true
            }  }
        ,
        {
            "$addFields": {
                "higest_bid": {
                    $max: "$carbids.bids.price"
                }
            }
        },
        {

            $group: {
                _id: '$_id',
                basic_info: { $first: '$basic_info' },
                vehicle_make:{$first:'$vehicle_make'},
                vehicle_model:{$first:'$vehicle_model'},
                vehicle_trim:{$first:'$vehicle_trim'},
                standard_equipments:{$first:'$standard_equipments'},
                additional_options:{$first:'$additional_options'},
                best_bid: { $first: '$best_bid' },
                vehicle_has_second_key: { $first: '$vehicle_has_second_key' },
                vehicle_year: { $first: '$vehicle_year' },
                vehicle_images: { $first: '$vehicle_images' },
                vin_number: { $first: '$vin_number' },
                vehicle_location: { $first: '$vehicle_location' },
                created_at: { $first: '$created_at' },
                updated_at: { $first: '$updated_at' },
                vehicle_finance_details: { $first: '$vehicle_finance_details' },
                vehicle_comments: { $first: '$vehicle_comments' },
                type: { $first: '$type' },
                vehicle_aftermarket: { $first: '$vehicle_aftermarket' },
                review: { $first: '$review' },
                vehicle_condition: { $first: '$vehicle_condition' },
                willing_to_drive: { $first: '$willing_to_drive' },
                willing_to_drive_how_many_miles: { $first: '$willing_to_drive_how_many_miles' },
                vehicle_to_be_picked_up: { $first: '$vehicle_to_be_picked_up' },
                is_vehicle_aftermarket: { $first: '$is_vehicle_aftermarket' },
                vehicle_ownership: { $first: '$vehicle_ownership' },
                vehicle_condition: { $first: '$vehicle_condition' },
                dealers_bids: { $first: '$dealers_bids' },
                higest_bid: { $max: '$higest_bid' },//get the max of all the bids
                distance: { $first: '$distance' },
                my_bid: { $first: '$my_bid' },
                totalBids: { $first: '$totalBids' },
                sellers: { $first: '$sellers.name' },



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

    return res.status(def.API_STATUS.SUCCESS.OK).send({ records: records, count:totalRecords });
})



/**=====================Fetch All Car Bids ============================= */
controller.post('/listingCarBids', async (req, res) => {
    //----fetch all the bids corsponding to car Id----

    let body = req.body;

    let condition = {
        "car_id": mongoose.Types.ObjectId(req.body.id)
    };
    let sortCondition = {};
    //if filters contains the 'trim' filter
    sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort     

    console.log('condition',condition);
    let totalRecords = await Bid.count({car_id:req.body.id});//count total records 

    const start = body.pageNumber * body.size;//calculate how many records need to be skipped
    //fetch all the bids recrods
    let bids = await Bid.aggregate([

        { $match: condition }
        ,
        {
            $lookup: {
                from: "dealers",
                localField: "dealer_id",
                foreignField: "_id",
                as: "dealer"
            }
        },
        {
            $lookup: {
                from: "dealerships",
                localField: "bids.dealership_id",
                foreignField: "_id",
                as: "dealership"
            }
        },
        
        {
            $lookup: {
                from: "cars",
                localField: "car_id",
                foreignField: "_id",
                as: "car"
            }
        },
        {
            $lookup: {
                from: "dealer_ratings",
                let: { dealer_id: "$dealer_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    // { $eq: ["$car_id", "$$car_id"] },
                                    {
                                        $eq: [
                                            "$dealer_id", "$$dealer_id"]
                                    }
                                ]
                            },

                        },

                    },
                ],
                as: "dealer_ratings"
            }

        },


        {
            "$addFields": {
                "dealer_rating_average": {
                    "$divide": [
                        { // expression returns total
                            "$reduce": {
                                "input": "$dealer_ratings",
                                "initialValue": 0,
                                "in": { "$add": ["$$value", "$$this.rating"] }
                            }
                        },
                        { // expression returns ratings count
                            "$cond": [
                                { "$ne": [{ "$size": "$dealer_ratings" }, 0] },
                                { "$size": "$dealer_ratings" },
                                1
                            ]
                        }
                    ]
                }
            }
        }
        , {
            $project: {
                
                "_id": 1,
                "dealer.name": 1,
                "dealership.legalcoroporationname": 1,
                "dealership.profile_pic": 1,
                "dealershipnumber": 1,
                "bid_date": 1,
                "bid_acceptance": 1,
                "price": 1,
                "bids":1,
                "car.vehicle_year": 1,
                "car.basic_info": 1,
                "dealer_rating_average": 1
            }
        }



    ]);



    res.status(def.API_STATUS.SUCCESS.OK).send({ records: bids, count: totalRecords })
})

module.exports = controller;
