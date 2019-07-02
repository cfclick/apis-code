const Joi = require('joi');
const mongoose = require('mongoose');
const _ = require('lodash'); //js utility lib
const {  
    userSchema,
    userJoiSchema
  
} = require('./user');

const dealerSchema = userSchema.clone().add({
    location:{
        state:{ 
            type: String, 
            required: true,       
            trim: true
        },
        city:{ 
            type: String, 
            required: true,       
            trim: true
        },
        zipcode:{ 
            type: String, 
            required: true,       
            trim: true
        },
        coordinates: { 
            type: [Number], 
            index: '2dsphere'
        }
    },
	dealerships: [
		{
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
			location:{
                state:{ 
                    type: String, 
                    required: true,       
                    trim: true
                },
                city:{ 
                    type: String, 
                    required: true,       
                    trim: true
                },
                zipcode:{ 
                    type: String, 
                    required: true,       
                    trim: true
                }
            },
		}
	],   
    availabilitydate: { 
        year: { 
            type: Number,  
			required: true,
        },
        month: { 
            type: Number,  
			required: true,          
        },
        day: { 
            type: Number,  
			required: true,           
        }	
    },
	time: {
        hour: { 
            type: Number,  
			default: 13, 
        },
        minute: { 
            type: Number,  
			default: 30,          
        },
        second: { 
            type: Number,  
			default: 0,           
        }
    },   
    timezone: { 
        type: String, 
		required: true,       
		trim: true         
    },   
    language: { 
        type: String, 
		required: true,       
		trim: true         
    },
    rating:{
     type:Number,
     default:0
    }

});

//schema hooks to process/modify data before save
dealerSchema.pre('save', async function(next) {

    
    if(this.isModified('password')) {   
        this.password  = await this.generatePasswordHash(this.password)                                                        
    }

    if(this.isModified('emails')) {  
        // this.username = this.generateUsername(this.emails)                                                                  
    }
   
    if (!this.created_at){
        this.created_at = new Date();
    }    
     
    next();
});
dealerSchema.pre('findOneAndUpdate', function (next) {
  
   /* const emails = this.getUpdate().$set.emails;  
    const emailObject = emails.find(i => i.default == true);     
    const username = (emailObject)?_.dropRight((emailObject.email).split('@')):'';  
    this.getUpdate().$set.username = username */   
    next();
    
  });
const Dealer = mongoose.model('Dealer', dealerSchema);

const currentYear = (new Date()).getFullYear();
//joi validations
const dealerJoiSchema = {
    userJoiSchema,
    //match password and confirm password
    title: Joi.string().trim().min(2).max(50).required(),

    location: Joi.object({
        state: Joi.string().trim().min(2).max(50).required(),
        city: Joi.string().trim().min(2).max(50).required(),
        zipcode: Joi.string().trim().min(2).max(50).required(),
    }).required(), 


    
    dealerships: Joi.array().min(1).items(
        Joi.object().keys({
            legalcoroporationname: Joi.string().trim().min(2).max(50).required(),
            dealershipnumber: Joi.string().trim().min(2).max(50).required(),
            mainaddressline1: Joi.string().trim().required(),			
			location: Joi.object({
                state: Joi.string().trim().min(2).max(50).required(),
                city: Joi.string().trim().min(2).max(50).required(),
                zipcode: Joi.string().trim().min(2).max(50).required(),
            }).required(), 
        })
    ).required(),
    availabilitydate: Joi.object({
        year: Joi.number().min(1970).max(currentYear+10).positive().required(),
        month: Joi.number().min(1).max(12).positive().required(),
        day: Joi.number().min(1).max(31).positive().required()
    }).required(),  
    time: Joi.object({
        hour: Joi.number().min(1).max(24).positive().required(),
        minute: Joi.number().min(1).max(60).positive().required(),
        second: Joi.number().min(0).max(60).required()
    }).required(), 
    timezone: Joi.string().trim().required(),
    language: Joi.string().trim().required(),
    
}
function validateDealer(dealer) {
    console.log(dealer)
    return Joi.validate(dealer, dealerJoiSchema, { allowUnknown: true });
}


module.exports.Dealer = Dealer;
module.exports.validateDealer = validateDealer;
