const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dealerWishListSchema = new mongoose.Schema({   

        dealer_id: { 
            type:Schema.Types.ObjectId,
            ref:'Dealer'   
        },
        car_id: { 
            type:Schema.Types.ObjectId,
            ref:'Car'                    
        }

});

const DealerWishList = mongoose.model('Dealer_Wishlist', dealerWishListSchema);
module.exports = DealerWishList;