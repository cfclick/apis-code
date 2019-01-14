// grab the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const Joi = require('joi');
const jwt = require('jsonwebtoken')
const config = require('config');
const PasswordComplexity = require('joi-password-complexity');



// create a delaer schema 
const dealerSchema = new Schema({
    name: {
        prefix: { 
            type: String, 
            trim: true,
            default: 'Mr.', 
        },
        first_name: { 
            type: String, 
            trim: true,
            default: '',          
        },
        last_name: { 
            type: String, 
            trim: true,
            default: '',           
        }
    },  
    emails: [
        {
            email:{ 
                type: String, 
                required: true,               
                trim: true
            },
            default:{ 
                type: Boolean, 
                required: true,               
                default: false
            }
        }
    ],
    phones: [
        {
            phone:{ 
                type: String, 
                required: true,               
                trim: true
            },
            default:{ 
                type: Boolean, 
                required: true,               
                default: false
            }
        }
    ],   
    username: { 
        type: String,        
        //unique: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true, 
        trim: true
    },
    social_login: { 
        type: String, 
        default: 'Web',      
        trim: true
    },
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
    zip:{ 
        type: String, 
        required: true,       
        trim: true
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
			nooflocations: { 
				type: Number,  
				default: 1,          
				required: true           
			},
			locations: [
				{
					mainaddressline1: { 
						type: String, 
						trim: true,
						required: true 
					},
					mainaddressline2: { 
						type: String          
					},
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
					zip:{ 
						type: String, 
						required: true,       
						trim: true
					}
				}
			]	
		}
	],	
    active: { 
        type: Boolean, 
        default: true
    },   
    created_at: { 
        type: Date         
    },  
    updated_at: { 
        type: Date,       
        default: new Date(),    
    }   
});  





//schema hooks to process/modify data before save
dealerSchema.pre('save', async function(next) {

    
    if(this.isModified('password')) {   
        this.password  = await this.generatePasswordHash(this.password)      
        console.log('password:'+this.password);                                                            
    }

    if(this.isModified('emails')) {  
        this.username = this.generateUsername(this.emails)                                                                  
    }
   
    if (!this.created_at){
        this.created_at = new Date();
    }    
     
    next();
});


// Add custom instance methods to our Dealer Schema
dealerSchema.methods = {

    

    // Hash the password
    generateAuthToken: function() {
        const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'))
        return token;
    },

    // Hash the password
     generatePasswordHash: async (password) =>{  
         
        const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));       
        return hashPassword;       
    },

   // generate the username
    generateUsername: function(emails) {
       
        const emailObject = emails.find(i => i.default == true);     
        const userEmailArr = (emailObject)?(emailObject.email).split('@'):'';  
        console.log(userEmailArr) 
        return userEmailArr[0];    
       
    }
};


// Add custom class or model methods to our Dealer Schema
dealerSchema.statics = {

    //validate  dealer signup fields
    validateSignup:function(dealer){

        // define the validation schema
        let schema = Joi.object().keys({         
            
            name: Joi.object({
                prefix: Joi.string().required(),
                first_name: Joi.string().trim().min(5).max(150).required(),
                last_name: Joi.string().trim().min(5).max(150).required()
            }).required(),

            // emails array validation           
            emails:Joi.array().items(
                Joi.object().keys({
                    email: Joi.string().trim().email().required(),
                    default: Joi.boolean().required()
                })
            ),

            // phones array validation                    
            phones:Joi.array().items(
                Joi.object().keys({
                    phone: Joi.string().trim().min(10).max(15).required(),
                    default: Joi.boolean().required()
                })
            ),

            // password is required
            // password must have minimum 10 and maximum 50 characters
            password: Joi.string().trim().min(10).max(250).required(), 
			
			// no of locations validation
			nooflocations: Joi.number().positive().required(),		

        }).unknown(true);
        return Joi.validate(dealer, schema);
    },

    
    
    //validate  dealer profile fields
    validateProfile:function(dealer){

        // define the validation schema
        let schema = Joi.object().keys({
            name: Joi.object({
                prefix: Joi.string().required(),
                first_name: Joi.string().trim().min(5).max(150).required(),
                last_name: Joi.string().trim().min(5).max(150).required()
            }).required(),

            // emails array validation           
            emails:Joi.array().items(
                Joi.object().keys({
                    email: Joi.string().trim().email().required(),
                    default: Joi.boolean().required()
                })
            ),

            // phones array validation                    
            phones:Joi.array().items(
                Joi.object().keys({
                    phone: Joi.string().trim().min(10).max(15).required(),
                    default: Joi.boolean().required()
                })
            ),
        }).unknown(true);
        return Joi.validate(dealer, schema);
    }

};




//creating the model Object
const Dealer = mongoose.model('Dealer', dealerSchema);

// make this available to our Node apis

module.exports.Dealer = Dealer;


