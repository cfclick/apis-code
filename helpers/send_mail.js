nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');


var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'sandeep.may86@gmail.com',
        pass: 'idea9410469740'
    }
}))


const sendMail =(options)=>{
   
  
      
    transport.sendMail(options, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
    
        transport.close();

    });
    
}
module.exports = Object.assign({}, {sendMail})
