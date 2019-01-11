const winston = require('winston'); //logging library
const mongoose = require('mongoose');
const config = require('config');

module.exports = function () {
    let conn_str = '';
    const db_url = config.get('db.url');
    const db_name = config.get('db.name');
    const db_islocal = config.get('db.islocal');
    const db_user = config.get('db.user');
    const db_pass = config.get('db.pass');

    if (db_islocal)
        conn_str = db_url + db_name;
    else
        conn_str = db_url + db_user + ':' + db_pass + '@ds127944.mlab.com:27944/' + db_name;

    mongoose.connect(conn_str, {
            useNewUrlParser: true
        })
        .then(() => winston.info(`Connected to ${conn_str} `));
}