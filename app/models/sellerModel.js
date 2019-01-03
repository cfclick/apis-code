// grab the things we need
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var Schema = mongoose.Schema;
var findOrCreate = require('mongoose-findorcreate')
var MD5 = require('md5');
// create a seller schema 
var sellerSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [emailRegex, "Please enter a valid email address"],
        trim: true
    },

    username: {
        type: String,
        required: true,
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
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    created_at: Date,
    updated_at: Date,
});

//attaching the behaviour to document's attributes before saving in collection named 'sellers' 
/*sellerSchema.pre('findOneAndUpdate', function(next) { 
    var update = this.getUpdate();
    update.$set.created_at = new Date();
    update.$set.created_at = new Date();
    this.password = (this.password)?MD5(this.password):''
    this.created_at = new Date();
    if (!this.created_at){
      this.created_at = new Date();
    }
    next();
});*/


sellerSchema.pre('findOneAndUpdate', function (next) {
    var update = this.getUpdate();
    update.updated_at = new Date();
    update.$setOnInsert.created_at = new Date();
    next();
});
//attaching the plugins to schema
sellerSchema.plugin(findOrCreate)

//creating the model Object
var Seller = mongoose.model('sellers', sellerSchema);

// make this available to our Node apis
module.exports = Seller;