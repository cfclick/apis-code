const {dbSettings, serverSettings, jwtSecret} = require('./config')
const db = require('./mongoose')
module.exports = Object.assign({}, {dbSettings, serverSettings, db, jwtSecret})