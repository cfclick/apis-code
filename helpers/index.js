const { errorHandler } = require('./error-handler')
const { authorize } = require('./authorize')
module.exports = Object.assign({}, {errorHandler,  authorize})
