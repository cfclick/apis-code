// grab the things we need
var Schema = mongoose.Schema;
// create a schema 
var dealerSchema = new Schema({
    name:String,
    email: String,
    username: String,
    password: String,
    type: String,
    phone:String,    
});  
var Dealer = mongoose.model('dealers', dealerSchema);

// make this available to our Users in our Node applications
module.exports = Dealer;