const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const hideCarSchema = new mongoose.Schema({   

        dealer_id: { 
            type:Schema.Types.ObjectId,
            ref:'Dealer'   
        },
        car_id: { 
            type:Schema.Types.ObjectId,
            ref:'Car'                    
        }

});

const HideCar = mongoose.model('Dealer_Hidden_Car', hideCarSchema);
module.exports = HideCar;