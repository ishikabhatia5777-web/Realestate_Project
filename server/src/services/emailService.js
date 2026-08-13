const nodemailer = require('nodemailer');

// ─── Create Transporter ─────────────────────────────────────────────────────
const createTransporter = () => {
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
  }
  return null; // No SMTP configured — will log to console
};

// ─── Helper: send or log ────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('\n📧 [EMAIL FALLBACK — No SMTP configured]');
    console.log(`   To     : ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log('─'.repeat(60));
    return;
  }
  try {
    await transporter.sendMail({
      from: `"AuraEstates Platform" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
  }
};

// ─── Property Submission Acknowledgement ────────────────────────────────────
const sendPropertySubmissionEmail = async ({ toEmail, toName, propertyTitle }) => {
  await sendEmail({
    to: toEmail,
    subject: `📝 Property Listing Received — "${propertyTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
        <h2 style="color:#f59e0b;margin-bottom:8px;">AuraEstates</h2>
        <p style="color:#94a3b8;font-size:13px;">Luxury Real Estate Platform</p>
        <hr style="border-color:#1e293b;margin:20px 0;" />
        <p>Hi <strong>${toName}</strong>,</p>
        <p>Your property listing <strong>"${propertyTitle}"</strong> has been submitted successfully and is now <strong>Pending Review</strong> by our team.</p>
        <p>You will receive an email once the admin reviews your listing (usually within 24 hours).</p>
        <hr style="border-color:#1e293b;margin:20px 0;" />
        <p style="font-size:12px;color:#64748b;">This is an automated message from AuraEstates. Please do not reply to this email.</p>
      </div>
    `
  });
};

// ─── Property Approved ───────────────────────────────────────────────────────
const sendPropertyApprovalEmail = async ({ toEmail, toName, propertyTitle, propertyId }) => {
  const propertyUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/properties/${propertyId}`;
  await sendEmail({
    to: toEmail,
    subject: `✅ Property Approved — "${propertyTitle}" is now Live!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
        <h2 style="color:#f59e0b;margin-bottom:8px;">AuraEstates</h2>
        <p style="color:#94a3b8;font-size:13px;">Luxury Real Estate Platform</p>
        <hr style="border-color:#1e293b;margin:20px 0;" />
        <p>Hi <strong>${toName}</strong>,</p>
        <p style="background:#065f46;border-radius:8px;padding:12px;">🎉 Great news! Your listing <strong>"${propertyTitle}"</strong> has been <strong style="color:#34d399;">APPROVED</strong> and is now published on AuraEstates.</p>
        <p>Your property is now live and visible to thousands of potential buyers.</p>
        <a href="${propertyUrl}" style="display:inline-block;margin-top:16px;background:#f59e0b;color:#0f172a;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">View Your Listing →</a>
        <hr style="border-color:#1e293b;margin:20px 0;" />
        <p style="font-size:12px;color:#64748b;">AuraEstates — Luxury Real Estate Platform</p>
      </div>
    `
  });
};

// ─── Property Rejected ───────────────────────────────────────────────────────
const sendPropertyRejectionEmail = async ({ toEmail, toName, propertyTitle, reason }) => {
  await sendEmail({
    to: toEmail,
    subject: `❌ Property Listing Update — "${propertyTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
        <h2 style="color:#f59e0b;margin-bottom:8px;">AuraEstates</h2>
        <p style="color:#94a3b8;font-size:13px;">Luxury Real Estate Platform</p>
        <hr style="border-color:#1e293b;margin:20px 0;" />
        <p>Hi <strong>${toName}</strong>,</p>
        <p>We have reviewed your property listing <strong>"${propertyTitle}"</strong> and unfortunately it could not be approved at this time.</p>
        <div style="background:#450a0a;border-left:4px solid #ef4444;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0;font-weight:bold;color:#fca5a5;">Reason:</p>
          <p style="margin:8px 0 0;color:#fecaca;">${reason || 'The listing did not meet our platform guidelines. Please review and resubmit.'}</p>
        </div>
        <p>You may update your listing and resubmit it for review. Please contact our support team if you have any questions.</p>
        <hr style="border-color:#1e293b;margin:20px 0;" />
        <p style="font-size:12px;color:#64748b;">AuraEstates — Luxury Real Estate Platform</p>
      </div>
    `
  });
};

// ─── Expert Connection Alert (Buyer requested to connect with agent) ─────────
const sendExpertConnectionAlert = async ({ agentEmail, agentName, buyerName, buyerEmail, propertyTitle, propertyId, buyerMessage }) => {
  const propertyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/properties/${propertyId}`;
  const now = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' });

  await sendEmail({
    to: agentEmail,
    subject: `🔔 Buyer Wants to Connect — "${propertyTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
        <h2 style="color:#f59e0b;margin-bottom:4px;">AuraEstates</h2>
        <p style="color:#94a3b8;font-size:13px;margin-top:0;">Luxury Real Estate Platform — Expert Connection Alert</p>
        <hr style="border-color:#1e293b;margin:20px 0;" />

        <div style="background:#1e3a5f;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin-bottom:20px;">
          <p style="margin:0;font-size:14px;font-weight:bold;color:#fbbf24;">🔔 A buyer is requesting to speak with you!</p>
          <p style="margin:8px 0 0;font-size:13px;color:#93c5fd;">Please reach out to them at your earliest convenience.</p>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
          <tr>
            <td style="padding:8px 0;color:#94a3b8;width:140px;">👤 Buyer Name</td>
            <td style="padding:8px 0;font-weight:bold;color:#f1f5f9;">${buyerName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;">✉️ Buyer Email</td>
            <td style="padding:8px 0;font-weight:bold;color:#f1f5f9;">${buyerEmail || 'Not available'}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;">🏡 Property</td>
            <td style="padding:8px 0;font-weight:bold;color:#f1f5f9;">${propertyTitle}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;">🕐 Requested At</td>
            <td style="padding:8px 0;color:#f1f5f9;">${now} (AEDT)</td>
          </tr>
        </table>

        ${buyerMessage ? `
        <div style="background:#1e293b;border-radius:8px;padding:14px;margin-bottom:20px;">
          <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;">Buyer's Message</p>
          <p style="margin:8px 0 0;color:#e2e8f0;font-style:italic;">"${buyerMessage}"</p>
        </div>` : ''}

        <a href="${propertyUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;margin-bottom:20px;">View Property Listing →</a>

        <hr style="border-color:#1e293b;margin:20px 0;" />
        <p style="font-size:12px;color:#64748b;">This alert was automatically sent by the AuraEstates 24/7 Chat System. Please contact the buyer at your earliest convenience.</p>
      </div>
    `
  });
};

// ─── New Offer Alert ────────────────────────────────────────────────────────
const sendNewOfferEmail = async ({ toEmail, toName, buyerName, propertyTitle, offerAmount, conditions, propertyId }) => {
  const propertyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/properties/${propertyId}`;

  await sendEmail({
    to: toEmail,
    subject: `💰 New Offer Received — "${propertyTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:32px;">
        <h2 style="color:#10b981;margin-bottom:8px;">AuraEstates</h2>
        <p style="color:#94a3b8;font-size:13px;">Luxury Real Estate Platform</p>
        <hr style="border-color:#1e293b;margin:20px 0;" />
        <p>Hi <strong>${toName}</strong>,</p>
        <p style="background:#064e3b;border-left:4px solid #10b981;border-radius:8px;padding:16px;">
          🎉 You have received a new offer from <strong>${buyerName}</strong> for <strong>"${propertyTitle}"</strong>!
        </p>
        
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr>
            <td style="padding:10px 0;color:#94a3b8;border-bottom:1px solid #1e293b;">Offer Amount</td>
            <td style="padding:10px 0;font-weight:bold;color:#f1f5f9;border-bottom:1px solid #1e293b;">$${offerAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#94a3b8;border-bottom:1px solid #1e293b;">Conditions</td>
            <td style="padding:10px 0;font-style:italic;color:#e2e8f0;border-bottom:1px solid #1e293b;">${conditions || 'None specified'}</td>
          </tr>
        </table>
        
        <p>Please log in to your dashboard to review and respond to this offer.</p>
        <a href="${propertyUrl}" style="display:inline-block;margin-top:16px;background:#10b981;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">View Property Dashboard →</a>
        <hr style="border-color:#1e293b;margin:20px 0;" />
        <p style="font-size:12px;color:#64748b;">AuraEstates — Luxury Real Estate Platform</p>
      </div>
    `
  });
};

module.exports = {
  sendPropertySubmissionEmail,
  sendPropertyApprovalEmail,
  sendPropertyRejectionEmail,
  sendExpertConnectionAlert,
  sendNewOfferEmail
};
