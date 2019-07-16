const config = require('config');
const def = require('../../models/def/statuses');
const fs = require('fs');
const jwt = require('jsonwebtoken'); //generate json token
const _ = require('lodash'); //js utility lib
const bcrypt = require('bcrypt'); // for password encryption
const {
    Seller 
} = require('../../models/seller');

const express = require('express');
const controller = express.Router();






/**
 * Seller Controller
 */




/* ====================== Seller  list  =======================================*/
controller.post('/listingSeller', async (req, res, next) => {

    let sortCondition = {}
    sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort




    // calculating the car's count
    let totalRecords = await Car.find({ }).countDocuments()


    //calculating the limit and skip attributes to paginate records
    let start = req.body.pageNumber * req.body.size;
    let records = await Car.find(condition).
        sort(sortCondition).
        skip(start).
        limit(req.body.size)

    return res.status(def.API_STATUS.SUCCESS.OK).send({ records: records, count: totalRecords });
})


module.exports = controller;
