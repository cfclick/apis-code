const def = require('../models/def/statuses');
const mongoose = require('mongoose');

module.exports = function (req, res, next) {

    if (req.params.id) {
        const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
        if (!isValidId) return res.status(def.API_STATUS.CLIENT_ERROR.NOT_FOUND).send('Invalid Id.');
    } else if (req.body.id) {
        const isValidId = mongoose.Types.ObjectId.isValid(req.body.id);
        if (!isValidId) return res.status(def.API_STATUS.CLIENT_ERROR.NOT_FOUND).send('Invalid Id.');
    } else {
        return res.status(def.API_STATUS.CLIENT_ERROR.NOT_FOUND).send('Invalid Id.');
    }

    next();
}