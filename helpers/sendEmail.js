const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: "465",
  ssl: true,
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function sendEmail(to, subject, text){

    const mailOptions = {
      from: process.env.MAIL_ID,
      to,
      subject,
      html: text,
    };

    console.log("Sending mail");
    const mail = await transporter.sendMail(mailOptions)
    if(mail){
      return true
    } else {
      return false
    }
}
module.exports = {
    sendEmail
}
