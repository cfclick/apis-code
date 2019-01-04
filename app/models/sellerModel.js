// grab the things we need

var Schema = mongoose.Schema;
var findOrCreate = require('mongoose-findorcreate')
var MD5      = require('md5');
// create a seller schema 
var sellerSchema = new Schema({
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
        },
    },   
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true
    },
    
    username: { 
        type: String,        
        unique: true,
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
    phone:{ 
        type: String, 
        required: true,       
        trim: true
    }, 
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


sellerSchema.pre('save', function(next) {
    var user = this;   

    user.created_at = new Date();    
    var userEmailArr = (this.email).split('@');
    user.password = MD5(this.password);
    user.username = userEmailArr[0]
    if (!this.created_at){
        user.created_at = new Date();
    } 
     
    next();
});


//attaching the plugins to schema
sellerSchema.plugin(findOrCreate)

//creating the model Object
var Seller = mongoose.model('sellers', sellerSchema);

// make this available to our Node apis
module.exports = Seller;