const winston = require('winston'); //logging library
const mongoose = require('mongoose');
const config = require('config');

module.exports = function () {
    let conn_str = '';
    const db_localUrl = config.get('db.url.localUrl');
    const db_mlabUrl = config.get('db.url.mlabUrl');
    const db_name = config.get('db.name');
    const db_islocal = config.get('db.islocal');
    const db_user = config.get('db.user');
    const db_pass = config.get('db.pass');


    if (db_islocal)
        conn_str = db_localUrl + db_name;
    else
        conn_str = db_mlabUrl + db_user + ':' + db_pass + '@ds127944.mlab.com:27944/' + db_name;
     console.log('the data base urll is',conn_str);
        mongoose.connect(conn_str, {
            useNewUrlParser: true
        })
        .then(() => { // if all is ok we will be here
            winston.info(`Connected to ${conn_str} `)
        })
        .catch(err => { // we will not be here...
            console.error('App starting error:', err.stack);    
            winston.error(err.message, err);
            process.exit(1);
        });

   /* mongoose.connect(conn_str, {
        useNewUrlParser: true
    })
        .then(() => winston.info(`Connected to ${conn_str} `));*/

    
}