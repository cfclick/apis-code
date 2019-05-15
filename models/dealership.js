const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash'); //js utility lib

const dealershipSchema = new mongoose.Schema({

    legalcoroporationname: {
        type: String,
        trim: true,
        required: true
    },
    dealershipnumber: {
        type: String,
        trim: true,
        required: true
    },
    mainaddressline1: {
        type: String,
        trim: true,
        required: true
    },
    mainaddressline2: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    zip: {
        type: String,
        required: true,
        trim: true
    },
    dealer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Dealer'
    },
    created_at: Date,
    profile_pic: {
        type: String,
        trim: true,
    },
    legal_contacts: [
        {
            name: {

                prefix: {
                    type: String,
                    trim: true,
                    default: 'Mr.',
                },
                first_name: {
                    type: String,
                    trim: true,
                    minlength: 2,
                    required: true,
                    maxlength: 50,
                },
                last_name: {
                    type: String,
                    trim: true,
                    minlength: 2,
                    required: true,
                    maxlength: 50,
                }
            },
            emails: [
                {
                    email: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    type: {
                        type: String,
                    },
                    default: {
                        type: Boolean,
                        required: true,
                        default: false
                    }
                }
            ],
            faxs: [
                {
                    number: {
                        type: Number,
                        required: true,
                        trim: true
                    },
                    type: {
                        type: String,
                    },
                    default: {
                        type: Boolean,
                        required: true,
                        default: false
                    },
                    country_code: {
                        type: String,
                        required: true,
                        default:'+1'
                    },
                }
            ],
            phones: [
                {
                    phone: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    type: {
                        type: String,
                    },
                    default: {
                        type: Boolean,
                        required: true,
                        default: false
                    },
                    country_code: {
                        type: String,
                        required: true,
                        default:'+1'
                    },
                }
            ],
            profile_pic: {
                type: String,
                trim: true,
            },
            title: {
                type: String,
                trim: true,
            },
            address_1: {
                type: String,
                trim: true,
            },
            address_2: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                required: true,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            },
            zip: {
                type: String,
                required: true,
                trim: true
            },
            created_at: Date,
            default_legal_contact: {
                type: Boolean,
                default: false
            },
        }
    ]
});

//dealershipSchema.index({ legalcoroporationname: 'text', dealershipnumber: 'text', city: 'text', state:'text',zip:'text','legal_contacts.name.first_name':'text','legal_contacts.name.last_name':'text' });

//schema hooks to process/modify data before save
dealershipSchema.pre('save', async function (next) {

    if (!this.created_at) {
        this.created_at = new Date();
    }

    next();
});

const Dealership = mongoose.model('Dealership', dealershipSchema);

const currentYear = (new Date()).getFullYear();
/*
Joi Validations
*/
//Dealership validation
const dealershipJoiSchema = Joi.array().min(1).items(
    Joi.object().keys({
        dealer_id:Joi.objectId().required(),
        legalcoroporationname: Joi.string().trim().min(2).max(50).required(),
        dealershipnumber: Joi.string().trim().min(2).max(50).required(),
        mainaddressline1: Joi.string().trim().required(),
        mainaddressline2:Joi.string().allow(null).optional().trim(),    
        state: Joi.string().trim().min(2).max(50).required(),
        city: Joi.string().trim().min(2).max(50).required(),
        zip: Joi.string().trim().min(2).max(50).required(),
        profile_pic: Joi.string().allow(null).optional().trim()                            
    })
).required()

//Legal contact validation
const contactJoiSchema = {
    id: Joi.objectId().required(),
    contacts: Joi.array().min(1).items(
        Joi.object().keys({         
            name: Joi.object({
                prefix: Joi.string().required(),
                first_name: Joi.string().trim().min(2).max(50).required(),
                last_name: Joi.string().trim().min(2).max(50).required()
            }).required(),
            emails: Joi.array().min(1).items(
                Joi.object().keys({
                    email: Joi.string().trim().email().required(),
                    default: Joi.boolean().required()
                })
            ).required(),
            faxs: Joi.array().min(1).items(
                Joi.object().keys({
                    number: Joi.number().required(),
                    default: Joi.boolean().required()
                })
            ).required(),

            // phones array validation                    
            phones: Joi.array().min(1).items(
                Joi.object().keys({
                    phone: Joi.string().trim().min(10).max(15).required(),
                    default: Joi.boolean().required(),
                    country_code: Joi.string().min(2).max(3).required()
                })
            ).required(),
            title: Joi.string().trim().required(),
            address_1: Joi.string().trim().required(),
            address_2: Joi.string().allow(null).optional().trim(),   
            state: Joi.string().trim().min(2).max(50).required(),
            city: Joi.string().trim().min(2).max(50).required(),
            zip: Joi.string().trim().min(2).max(50).required(),
            profile_pic: Joi.string().allow(null).optional().trim(),
            default_legal_contact:Joi.boolean().required()
        })
    ).required()

}

// validating listing schema 
const listingJoiSchema = {  
    dealer_id:Joi.objectId().required(),  
    search: Joi.string().allow('').optional().trim(),     
    sortDirection:Joi.string().trim().required(),
    sortProperty:Joi.string().trim().required(),
    pageNumber:Joi.number().min(0).required(), 
    size :Joi.number().min(6).max(96).positive().required(),
}

// validating remove 
const dealershipRemoveJoiSchema = {  
    id:Joi.objectId().required(), 
    dealer_id:Joi.objectId().required(),   
}


function validateDealership(dealership) {
    console.log(dealership)
    return Joi.validate(dealership, dealershipJoiSchema, { allowUnknown: true });
}
function validateLegalContact(contact) {
    console.log(contact)
    return Joi.validate(contact, contactJoiSchema, { allowUnknown: true });
}
function validateListing(data) {
    console.log(data)
    return Joi.validate(data, listingJoiSchema, { allowUnknown: true });
}

function validateRemoveDealership(data) {
    console.log(data)
    return Joi.validate(data, dealershipRemoveJoiSchema, { allowUnknown: true });
}

module.exports.Dealership = Dealership;
module.exports.validateDealership = validateDealership;
module.exports.validateLegalContact = validateLegalContact;
module.exports.validateListing = validateListing;
module.exports.validateRemoveDealership = validateRemoveDealership;

