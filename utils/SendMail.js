const nodemailer = require("nodemailer");
const SendMail = async (email, subject, message) => {

  let transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    service:"gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
console.log("after transporter")
  // send mail with defined transport object
  await transporter.sendMail({
    from: process.env.SMTP_USER, // sender address
    to: email ,// list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
  });
  console.log("end");
//   res.json(info)
};

module.exports =  SendMail ;
