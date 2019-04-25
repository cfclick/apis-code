const ObjectID = require('mongodb').ObjectID;
const config = require('config');
const def = require('../models/def/statuses');
const validate = require('../interceptors/validate');
const _ = require('lodash'); //js utility lib

const {
    Car,
    validateCar,
    validateRemoveCar,
    validateCarListing,
    validateDealerCarListing
} = require('../models/car');

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

controller.post('/newCar',[validate(validateCar)],async(req,res,next)=>{

    //checking unique car vin
   let car = await Car.findOne({ "vin": req.body.vin }, { _id: 1 });

   if (car) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Car VIN already exist.');

   //fetching the last record's ref
   let lastRecord = await Car.findOne( { }, { ref: 1,_id:-1 } ).sort( { _id: -1 } )
   let nextRef =  ((lastRecord) && lastRecord.ref)?lastRecord.ref+1:1
   console.log('nextRef:',nextRef);
   req.body.ref = nextRef; //modify req object by adding new ref

   //preparing new car object 
   car = new Car(_.pick(req.body, ['vin','seller_id', 'mileage', 'year', 'make', 'model', 'body_style', 'trim', 'doors','engine', 'transmission','fuel_type','drive_type','interior_color','exterior_color','interior_material','best_bid','created_at','updated_at','type','offer_in_hand','comments','car_selleing_radius','location','bids','images','offer_in_hand_images','ref']));
  
   //save new car
   car.save(async (err, car)=>{	
        if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not save car information!.');
        
        //fetching seller data 
        let seller = await Seller.findOne({ "_id": req.body.seller_id }, { name:1, emails:1 });
        //console.log('seller',seller);
        const emailObject = await seller.emails.find(i => i.default == true);     

        //send mail	
        const name = seller.name.prefix+' '+seller.name.first_name
        const webEndPoint = config.get('webEndPoint')+'/seller/login';        
        const message='<p style="line-height: 24px; margin-bottom:15px;">'+name+',</p><p style="line-height: 24px;margin-bottom:15px;">Congratulations, Yous car has been added in our system successfully.<p style="line-height: 24px; margin-bottom:20px;">	You can access your account at any point using <a target="_blank" href="'+webEndPoint+'" style="text-decoration: underline;">this</a> link.</p>'
        sendMail({
            to:emailObject.email,
            subject: 'Car Added',
            message:message,
        })

        //sending response
        res.status(def.API_STATUS.SUCCESS.OK).send(_.pick(car, ['_id']));	
    });

   	
})

controller.post('/deleteCar',[validate(validateRemoveCar)], async(req,res,next)=>{
    //console.log(req.body)

    //checking unique car vin
   let car = await Car.findOne({ "_id": req.body.id, "seller_id": req.body.seller_id }, { _id: 1 });

   if (!car) return res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('No recrod found.');

   
   //remove car
   Car.deleteOne({_id: req.body.id }, function(err, result) {
    if (err) return res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Ooops, could not delete car!.');

    res.status(def.API_STATUS.SUCCESS.OK).send(true);
    });   	
})

/* ====================== Seller car list  =======================================*/
controller.post('/listingCars',[validate(validateCarListing)], async(req,res,next)=>{

    
    //define the condition to fetch records (All, active, sold, archived)
    let condition = (req.body.type != 'all')? ({ "type": req.body.type  }):{};

    //condition to filter cars according to loggedin seller
    condition['seller_id'] = req.body.seller_id

    if (! _.isEmpty(req.body.filters, true) ){
        condition = filters(req, condition)
    } 

    if(req.body.search)
        condition['$or'] = search(req);
   
    let sortCondition = {}
    sortCondition[req.body.sortProperty] = req.body.sortDirection=='asc'?1:-1 //1 for ascending -1 for descending order sort
    
    
    // calculating the car's count after search/filters
    let totalRecordsAfterFilter = await Car.find(condition).countDocuments()  

    // calculating the car's count
    let totalRecords = await Car.find().countDocuments()  

   
    //calculating the limit and skip attributes to paginate records
    let totalPages = totalRecordsAfterFilter / req.body.size;
    let start = (req.body.pageNumber<=1)? 0 : (req.body.pageNumber-1) * req.body.size;
    console.log('start',start);
    console.log('condition',condition);
    let records = await Car.find(condition).   
        sort(sortCondition).
        skip(start).
        limit(req.body.size)   

    return res.status(def.API_STATUS.SUCCESS.OK).send({ records:records, count:totalRecordsAfterFilter, filteredRecords:totalRecords });	
})

/* ====================== Dealer car list  =======================================*/
controller.post('/listingDealersCars',[validate(validateDealerCarListing)], async(req,res,next)=>{
  
     
    //define the condition to fetch records (All, active, sold, archived)
    let condition = (req.body.type != 'all')? ({ "type": req.body.type  }):{};

    //condition to filter cars on which dealer have bid  
    condition['bids.dealer_id'] = req.body.dealer_id
   
    if (! _.isEmpty(req.body.filters, true) ){
        condition = filters(req, condition)
    }   
        

    if (req.body.search)    
        condition['$or'] = search(req);
   
    let sortCondition = {}
    sortCondition[req.body.sortProperty] = req.body.sortDirection=='asc'?1:-1 //1 for ascending -1 for descending order sort
    console.log('condition',condition)
    
    // calculating the car's count
    let totalRecords = await Car.find(condition).countDocuments()  


    //calculating the limit and skip attributes to paginate records
    let totalPages = totalRecords / req.body.size;
    let start = req.body.pageNumber * req.body.size;


    let records = await Car.find(condition).
    //populate('bids.dealer_id').   
    sort(sortCondition).skip(start).limit(req.body.size)
   
    return res.status(def.API_STATUS.SUCCESS.OK).send({ records:records, count:totalRecords });	
}) 

function filters(req, condition){

    //if filters contains the 'bid price' filter
    if(_.has(req.body.filters,['price_range']))
        condition['bids.price'] = { $gte: (req.body.filters.price_range[0]), $lte: (req.body.filters.price_range[1]) }
    
    //if filters contains the 'dates' filter
    if(_.has(req.body.filters,['dates']))
        condition['created_at'] = { $gte: (req.body.filters.dates['transformedStartDate']),$lte: (req.body.filters.dates['transformedEndDate']) }
    
    //if filters contains the 'years' filter
    if(_.has(req.body.filters,['year_range']))
        condition['year'] = { $gte: req.body.filters.year_range[0],$lte: req.body.filters.year_range[1] }
    
    //if filters contains the 'year' filter
    if(_.has(req.body.filters,['year']))
        condition['year'] = { $in : req.body.filters['year'] }  

    //if filters contains the 'make' filter
    if(_.has(req.body.filters,['make']))
        condition['make'] = req.body.filters['make']

    //if filters contains the 'model' filter
    if(_.has(req.body.filters,['model']))
        condition['model'] = req.body.filters['model']


    //if filters contains the 'trim' filter
    if(_.has(req.body.filters,['trim']))
        condition['trim'] = req.body.filters['trim']
    
    
    return condition  
}

function search(req){
    //text search on listed columns
    return [
            { vin: { $regex: req.body.search,$options: 'i' } },            
            { make: { $regex: req.body.search,$options: 'i' } },
            { model: { $regex: req.body.search,$options: 'i' } },
            { trim: { $regex: req.body.search,$options: 'i' } },
            { body_style: { $regex: req.body.search,$options: 'i' } },
            { type: { $regex: req.body.search,$options: 'i' } },
            { body_style: { $regex: req.body.search,$options: 'i' } },            
            {"bids.price": req.body.search}, //ToDo
            {year: req.body.search } //ToDo
      ]
}

module.exports = controller;