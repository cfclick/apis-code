const config = require('config');
const webEndPoint = config.get('webEndPoint');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.get('sandgrid.apiKey'));



function sendMail(options) {
    const msg = {
        to: options.to,
        from: config.get('fromEmail'),
        subject: options.subject,
        html: options.message,
    };
    sgMail.send(options).then().catch(e => {
        console.log('the error is ', e);
    })
}


module.exports.sendMail = sendMail;