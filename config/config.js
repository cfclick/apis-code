require('dotenv').config();
const dbSettings = {
    db:process.env.DB || 'topautobid',    
    dbParameters: () => ({
        useNewUrlParser: true,
        useCreateIndex:true
      }),
    
}
const serverSettings = {
    port: process.env.PORT || 3000,
    //ssl: require('./ssl')
}

const AppConfig={
    jwt_Secret:process.env.JWT_SECRET || 'topAutoBid'
}
module.exports = Object.assign({}, { dbSettings, serverSettings, AppConfig })
  