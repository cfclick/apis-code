const def = require('../models/def/statuses');

module.exports = function (err, req, res, next) {
    console.log(err);
    res.status(def.API_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR).send('Unexpected error.');
}