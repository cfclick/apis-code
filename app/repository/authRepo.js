//importing models

var Dealer = require('../models/dealerModel');
//var Seller = require('../models/sellerModel');



module.exports = {
    fetchUserByEmail,
    fetchUserById,
    saveSellerInfo,
    saveDealerInfo,
    insertOrUpdateUser
};

/* ====================== 
Function: Fetch seller, dealer by email
Params: email
Return: Promise
=======================================*/
async function fetchUserByEmail(model, email) {

    return await new Promise(function (resolve, reject) {
        eval(model).findOne({
            email: email
        }, (err, doc) => {
            if (err) {
                reject(new Error('Ooops, something broke!'));
            } else {
                resolve(doc);
            }
        })
    });

}

/* ====================== 
Function: save seller information
Params: seller info object with name, email, phone, password etc.
Return: Promise
=======================================*/
async function saveSellerInfo(sellerInfo) {
    const seller = new Seller({

        email: sellerInfo.email,
        username: sellerInfo.username,
        password: sellerInfo.password,
        phone: sellerInfo.phone

    });
    await seller.save();
    return seller;
    /*var sellerObject = Seller(sellerInfo)
    return await new Promise(function (resolve, reject) {
        sellerObject.save(function (err, doc) {
            if (err) {
                console.log(err);
                reject(new Error('Ooops, something broke!'));
            } else {
                resolve(doc);
            }
        });
    });*/

}

/* ====================== 
Function: save dealer information
Params: dealer info object with name, email, phone, password etc.
Return: Promise
=======================================*/
async function saveDealerInfo(dealerInfo) {
    var dealerObject = Dealer(dealerInfo)
    return await new Promise(function (resolve, reject) {
        dealerObject.save(function (err, doc) {
            if (err) {
                reject(new Error('Ooops, something broke!'));
            } else {
                resolve(doc);
            }
        });
    });

}

/* ====================== 
Function: Fetch seller, dealer by id
Params: name, email, phone, socialLogin etc.
Return: Promise
=======================================*/
async function fetchUserById(email) {
    User.find({
        email: email
    }, function (err, doc) {
        return {
            doc
        };
    });
}

/* ====================== 
Function: save or update seller, dealer information
Params: 
Return: Promise
=======================================*/
async function insertOrUpdateUser(requestObject) {
    const model = requestObject.model

    //remove model paramater from request object
    delete requestObject.model
    delete requestObject.password

    return await new Promise(function (resolve, reject) {
        eval(model).findOneAndUpdate({
            email: requestObject.email
        }, requestObject, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }, (err, doc) => {

            if (err) {
                reject(err);
            } else {
                resolve(doc);
            }
        })
    });


}