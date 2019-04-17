const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const stateSchema = new mongoose.Schema({   

        name: { 
            type: String, 
            trim: true     
        },
        abbreviation: { 
            type: String, 
            trim: true                    
        }

});

const State = mongoose.model('State', stateSchema);
module.exports.State = State;