const fs = require('fs'); //file system
const jwt = require('jsonwebtoken'); //generate json token
const mongoose = require('mongoose');
const _ = require('lodash'); //js utility lib


const adminSchema = new mongoose.Schema({
    
    email:{
        type:String,
        required:true,
        trim:true
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 8,
        maxlength: 50,
        trim: true
    }       
});




adminSchema.methods.generateAuthToken = function () {

    // PRIVATE and PUBLIC key

    let privateKEY = fs.readFileSync('/var/www/html/api/config/keys/private.key');

    const i = 'topautobid'; // Issuer 
    const s = 'info@topautobid.com'; // Subject 
    const a = 'http://topautobid.com'; // Audience
    // SIGNING OPTIONS
    const signOptions = {
        issuer: i,
        subject: s,
        audience: a,
        expiresIn: "1h",
        algorithm: "RS256"
    };
    const token = jwt.sign({
        _id: this._id,
        email: this.email,
        userType: this.userType,
    }, privateKEY, signOptions);
    return token;
}


module.exports = mongoose.model('Admin', adminSchema);//admin model