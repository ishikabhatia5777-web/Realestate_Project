const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email System Error: GMAIL_USER or GMAIL_PASS environment variables are missing on the production server.');
  }

  const message = {
    from: `${process.env.FROM_NAME || 'AuraEstates'} <${process.env.FROM_EMAIL || user}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Try TLS (port 587) first
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      socketTimeout: 15000
    });
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (err1) {
    console.error('TLS email attempt failed:', err1.message);
  }

  // Fallback to SSL (port 465)
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      socketTimeout: 15000
    });
    const info = await transporter.sendMail(message);
    console.log('Message sent via SSL: %s', info.messageId);
    return info;
  } catch (err2) {
    console.error('SSL email attempt also failed:', err2.message);
    throw err2;
  }
};

module.exports = sendEmail;
