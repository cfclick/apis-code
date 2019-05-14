const config = require('config');
const def = require('../models/def/statuses');
const validate = require('../interceptors/validate');
const _ = require('lodash'); //js utility lib

const {
  Dealership,
  validateDealership,
  validateLegalContact,
  validateListing,
  validateRemoveDealership
} = require('../models/dealership');


const express = require('express');
const controller = express.Router();

/* ====================== Dealership list on datatbles =======================================*/
controller.post('/listingDealershipOnDatable', [validate(validateListing)], async (req, res, next) => {

  //define the condition 
  let condition = { "dealer_id": req.body.dealer_id }

  //text search on listed columns
  if(req.body.search)
    condition['$or'] = search(req);


//if filters contains the 'dates' filter
  if(_.has(req.body.filters,['dates']))
    condition['created_at'] = { $gte: (req.body.filters.dates['transformedStartDate']),$lte: (req.body.filters.dates['transformedEndDate']) }




  //sorting
  let sortCondition = {}
  sortCondition[req.body.sortProperty] = req.body.sortDirection == 'asc' ? 1 : -1 //1 for ascending -1 for descending order sort

  // calculating the dealership's count
  let totalRecords = await Dealership.find(condition).countDocuments()

  //calculating the limit and skip attributes to paginate records
  let totalPages = totalRecords / req.body.size;
  let start = req.body.pageNumber * req.body.size;

  console.log('condition dealership',condition);

  let records = await Dealership.
    find(condition).   
    sort(sortCondition).
    skip(start).limit(req.body.size)

  return res.status(def.API_STATUS.SUCCESS.OK).send({ records: records, count: totalRecords });
})

//Add/edit dealership
controller.post('/addEditDealership', [validate(validateDealership)], async (req, res, next) => {

  let dealership = await Dealership.findOne({ "_id": req.body[0]._id }, { _id: 1 });

  if (dealership) {

    //update dealership
    Dealership.findOneAndUpdate({ _id: req.body[0]._id }, { $set: req.body[0] }, { new: true }, function (err, doc) {

      if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save seller information!');

      res.status(def.API_STATUS.SUCCESS.OK).send(doc);

    });
  } else {

    //save new dealership
    Dealership.create(req.body, function (err, car) {
      if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);

      res.status(def.API_STATUS.SUCCESS.OK).send(true);
    });
  }
})

//Remove dealership
controller.post('/removeDealership', [validate(validateRemoveDealership)], async (req, res, next) => {

  //checking existing dealership
  let dealership = await Dealership.findOne({ "_id": req.body.id, "dealer_id": req.body.dealer_id }, { _id: 1 });

  if (!dealership) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found.');


  //remove existing dealership
  Dealership.deleteOne({ _id: req.body.id }, function (err, result) {
    if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not remove dealership!.');

    res.status(def.API_STATUS.SUCCESS.OK).send(true);
  });
})

//Adding legal contacts to dealership
controller.post('/newLegalContact', [validate(validateLegalContact)], async (req, res) => {

  //checking existing dealership
  let dealership = await Dealership.findOne({ "_id": req.body.id }, { _id: 1 });

  if (!dealership) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No record found.');

  Dealership.findOneAndUpdate({ _id: req.body.id }, { $set: { legal_contacts: req.body.contacts } }, { new: true }, function (err, doc) {

    if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(err);

    res.status(def.API_STATUS.SUCCESS.OK).send(doc);

  });

})



function search(req){
  //text search on listed columns
  return [
    { legalcoroporationname: { $regex: req.body.search, $options: 'i' } },
    { dealershipnumber: { $regex: req.body.search, $options: 'i' } },
    { city: { $regex: req.body.search, $options: 'i' } },
    { state: { $regex: req.body.search, $options: 'i' } },
    { zip: { $regex: req.body.search, $options: 'i' } },
  ]
}

module.exports = controller;