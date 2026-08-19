require('dotenv').config();
const nodemailer = require('nodemailer');

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_PASS;

console.log("Testing with GMAIL_USER:", user);
// Mask the password for security
console.log("Testing with GMAIL_PASS:", pass ? pass.substring(0, 3) + '***' : "undefined");

if (!user || !pass) {
  console.error("Missing GMAIL_USER or GMAIL_PASS");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass },
  tls: { rejectUnauthorized: false }
});

transporter.sendMail({
  from: user,
  to: user,
  subject: "AuraEstates Test Email",
  text: "This is a test email to verify credentials."
}).then(info => {
  console.log("Email sent successfully!", info.messageId);
}).catch(err => {
  console.error("Email failed:", err.message);
});
