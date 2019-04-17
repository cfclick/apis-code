const config = require('config');
const ses = require('node-ses');
const winston = require('winston'); //logging library
const webEndPoint = config.get('webEndPoint');
const logoPath = config.get('webEndPoint')+"/assets/images/logo-dark.png"
const client = ses.createClient({ key: config.get('aws.accessKey'), secret: config.get('aws.secretKey') });
const headerText = '<table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff"><tbody><tr><td align="center"><table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590"><tbody><tr><td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td></tr><tr><td align = "center" ><table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590"><tbody><tr><td align="center" height="70" style="height:70px;"><a href="'+webEndPoint+'" style="display: block; border-style: none !important; border: 0 !important;"><img width="100" border="0" style="display: block; width: 100px;" src="'+logoPath+'" alt=""></a></td></tr></tbody></table></td></tr ><tr><td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td></tr></tbody ></table ></td ></tr ></tbody ></table > ';

//const FooterText = '<table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="2a2e36"><tbody><tr><td align="center" style="background-image: url(https://mdbootstrap.com/img/Photos/Others/slide.jpg); background-size: cover; background-position: top center; background-repeat: no-repeat;" background="https://mdbootstrap.com/img/Photos/Others/slide.jpg"><table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590"><tbody><tr><td height="50" style="font-size: 50px; line-height: 50px;">&nbsp;</td></tr><tr><td align="center"><table border="0" width="380" align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" class="container590"><tbody><tr><td align="center"><table border="0" align="center" cellpadding="0" cellspacing="0" class="container580"><tbody><tr><td align="center" style="color: #cccccc; font-size: 16px; line-height: 26px;"> <div style="line-height: 26px">The all new AW16 range is out. View an exclusive preview. </div></td></tr></tbody></table></td></tr> </tbody></table></td></tr><tr><td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td></tr> <tr><td align="center"><table border="0" align="center" width="250" cellpadding="0" cellspacing="0" style="border:2px solid #ffffff;"><tbody><tr><td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td></tr><tr><td align="center" style="color: #ffffff; font-size: 14px; line-height: 22px; letter-spacing: 2px;"><div style="line-height: 22px;"> <a href="" style="color: #fff; text-decoration: none;">VIEW THE COLLECTION</a> </div></td></tr>  <tr> <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>  </tr> </tbody></table></td> </tr><tr> <td height="50" style="font-size: 50px; line-height: 50px;">&nbsp;</td> </tr></tbody></table> </td></tr></tbody></table>';

const messageWrapper = '<table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" class="bg_color"><tbody><tr><td align="center"> <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590"><tbody><tr><td align="center" style="color: #343434; font-size: 24px; font-family: Quicksand, Calibri, sans-serif; font-weight:700;letter-spacing: 3px; line-height: 35px;" class="main-header"><div style="line-height: 35px">Welcome to  <span style="color: #5caad2;">TopAutoBid</span></div></td></tr><tr><td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td></tr><tr> <td align="center"> <table border="0" width="40" align="center" cellpadding="0" cellspacing="0" bgcolor="eeeeee"> <tbody><tr><td height="2" style="font-size: 2px; line-height: 2px;">&nbsp;</td></tr></tbody></table></td> </tr><tr> <td height="20" style="font-size: 20px; line-height: 20px;">&nbsp;</td></tr><tr><td align="left"><table border="0" width="590" align="center" cellpadding="0" cellspacing="0" class="container590"><tbody><tr><td align="left" style="color: #888888; font-size: 16px;line-height: 24px;">messageBody<p style="line-height: 24px">Love,<br/> The TopAutoBid team</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr></tbody></table>'

function sendMail(options) {
    try {
        const message = messageWrapper.replace("messageBody", options.message);
       // console.log(message)
        // Give SES the details and let it construct the message for you.
        client.sendEmail({
            to: options.to,
            from: config.get('fromEmail'),
            subject: options.subject,
            message: headerText+message//+FooterText

        }, function (err, data, res) {
            console.log(err)
        });
        //next();
    } catch (e) {
        console.log(e.message)
        winston.error(e.message, e);
        //res.status(def.API_STATUS.CLIENT_ERROR.BAD_REQUEST).send('Oops! could not send mail.');
    }
}


module.exports.sendMail = sendMail;

