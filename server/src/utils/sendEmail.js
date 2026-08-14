const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || process.env.SMTP_EMAIL,
      pass: process.env.GMAIL_PASS || process.env.SMTP_PASSWORD,
    },
  });

  // Define the email options
  const message = {
    from: `${process.env.FROM_NAME || 'Real Estate App'} <${process.env.FROM_EMAIL || process.env.GMAIL_USER || 'noreply@realestate.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Support HTML email content
  };

  // Send the email
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
