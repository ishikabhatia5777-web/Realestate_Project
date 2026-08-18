const nodemailer = require('nodemailer');

// ─── Production URL (used as fallback for email links) ───────────────────────
const PRODUCTION_CLIENT_URL = 'https://realestate-project-lake.vercel.app';

// ─── Get Client URL (always prefers env, falls back to production URL) ───────
const getClientUrl = () => {
  const url = process.env.CLIENT_URL || PRODUCTION_CLIENT_URL;
  // Never use localhost in production
  if (url.includes('localhost') && process.env.NODE_ENV === 'production') {
    return PRODUCTION_CLIENT_URL;
  }
  return url;
};

// ─── Get Gmail credentials ───────────────────────────────────────────────────
const getGmailCreds = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  
  if (!user || !pass) {
    throw new Error('Email System Error: GMAIL_USER or GMAIL_PASS environment variables are missing on the production server.');
  }
  
  return { user, pass };
};

// ─── Create a fresh Gmail transporter (TLS port 587) ────────────────────────
const createTransporterTLS = () => {
  const { user, pass } = getGmailCreds();
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    socketTimeout: 15000,
    greetingTimeout: 10000,
    pool: false
  });
};

// ─── Create a fresh Gmail transporter (SSL port 465) ────────────────────────
const createTransporterSSL = () => {
  const { user, pass } = getGmailCreds();
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    socketTimeout: 15000,
    greetingTimeout: 10000,
    pool: false
  });
};

// ─── Helper: send email with multiple fallback strategies ────────────────────
const sendEmail = async ({ to, subject, html, replyTo }) => {
  const { user } = getGmailCreds();
  const mailOptions = {
    from: `"AuraEstates Platform" <${user}>`,
    to,
    replyTo: replyTo || user,
    subject,
    html
  };

  console.log(`📧 [EMAIL] Attempting to send "${subject}" to ${to}`);
  console.log(`   GMAIL_USER configured: ${!!process.env.GMAIL_USER}, NODE_ENV: ${process.env.NODE_ENV}`);

  // Attempt 1: TLS on port 587
  try {
    const transporter = createTransporterTLS();
    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Sent successfully via TLS (587) to ${to}: "${subject}"`);
    return { success: true, method: 'TLS-587' };
  } catch (err) {
    console.error(`⚠️ [EMAIL] TLS-587 failed: ${err.code || err.message}`);
  }

  // Attempt 2: SSL on port 465
  try {
    const transporter = createTransporterSSL();
    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Sent successfully via SSL (465) to ${to}: "${subject}"`);
    return { success: true, method: 'SSL-465' };
  } catch (err) {
    console.error(`⚠️ [EMAIL] SSL-465 failed: ${err.code || err.message}`);
  }

  // Attempt 3: Gmail service shorthand
  try {
    const { pass } = getGmailCreds();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Sent successfully via Gmail service to ${to}: "${subject}"`);
    return { success: true, method: 'Gmail-Service' };
  } catch (err) {
    console.error(`❌ [EMAIL] All transport attempts failed for ${to} — ${err.message}`);
    console.error(`   GMAIL_USER configured: ${!!process.env.GMAIL_USER}, NODE_ENV: ${process.env.NODE_ENV}`);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
};

// ─── Email verification helper (for health check endpoint) ──────────────────
const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporterTLS();
    await transporter.verify();
    return { ok: true, method: 'TLS-587' };
  } catch (e1) {
    try {
      const transporter = createTransporterSSL();
      await transporter.verify();
      return { ok: true, method: 'SSL-465' };
    } catch (e2) {
      return { ok: false, error: e2.message };
    }
  }
};

// ─── Shared Header/Footer HTML ────────────────────────────────────────────────
const emailHeader = (subtitle) => `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:620px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.4);">
    <div style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:28px 32px;border-bottom:2px solid #f59e0b;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td>
            <h1 style="margin:0;font-size:22px;color:#f59e0b;letter-spacing:1px;">🏡 AuraEstates</h1>
            <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;letter-spacing:0.5px;">${subtitle}</p>
          </td>
          <td style="text-align:right;">
            <span style="font-size:11px;color:#475569;">Luxury Real Estate Platform</span>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding:32px;">
`;

const emailFooter = () => `
    </div>
    <div style="background:#1e293b;padding:16px 32px;border-top:1px solid #1e3a5f;">
      <p style="margin:0;font-size:11px;color:#475569;text-align:center;">
        This is an automated notification from AuraEstates — Luxury Real Estate Platform.<br/>
        Please do not reply to this email.
      </p>
    </div>
  </div>
`;

// ─── Property Submission Acknowledgement ────────────────────────────────────
const sendPropertySubmissionEmail = async ({ toEmail, toName, propertyTitle }) => {
  await sendEmail({
    to: toEmail,
    subject: `📝 Property Listing Received — "${propertyTitle}"`,
    html: `
      ${emailHeader('Property Listing Submission Acknowledgement')}
      <p>Hi <strong>${toName}</strong>,</p>
      <p>Your property listing <strong>"${propertyTitle}"</strong> has been submitted successfully and is now <strong>Pending Review</strong> by our team.</p>
      <div style="background:#1e3a5f;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#93c5fd;">⏳ Our team typically reviews listings within <strong>24 hours</strong>. You will receive an email notification once your listing is approved or if we need any changes.</p>
      </div>
      <p>Thank you for choosing AuraEstates to list your property!</p>
      ${emailFooter()}
    `
  });
};

// ─── Property Approved ───────────────────────────────────────────────────────
const sendPropertyApprovalEmail = async ({ toEmail, toName, propertyTitle, propertyId }) => {
  const propertyUrl = `${getClientUrl()}/properties/${propertyId}`;
  await sendEmail({
    to: toEmail,
    subject: `✅ Property Approved — "${propertyTitle}" is now Live!`,
    html: `
      ${emailHeader('Property Listing Approved')}
      <p>Hi <strong>${toName}</strong>,</p>
      <div style="background:#065f46;border-left:4px solid #34d399;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:15px;">🎉 Your listing <strong>"${propertyTitle}"</strong> has been <strong style="color:#34d399;">APPROVED</strong> and is now published on AuraEstates!</p>
      </div>
      <p>Your property is now live and visible to thousands of potential buyers and renters across the platform.</p>
      <a href="${propertyUrl}" style="display:inline-block;margin-top:16px;background:#f59e0b;color:#0f172a;padding:12px 28px;border-radius:8px;font-weight:bold;text-decoration:none;">View Your Live Listing →</a>
      ${emailFooter()}
    `
  });
};

// ─── Property Rejected ───────────────────────────────────────────────────────
const sendPropertyRejectionEmail = async ({ toEmail, toName, propertyTitle, reason }) => {
  await sendEmail({
    to: toEmail,
    subject: `❌ Property Listing Update — "${propertyTitle}"`,
    html: `
      ${emailHeader('Property Listing Status Update')}
      <p>Hi <strong>${toName}</strong>,</p>
      <p>We have reviewed your property listing <strong>"${propertyTitle}"</strong> and unfortunately it could not be approved at this time.</p>
      <div style="background:#450a0a;border-left:4px solid #ef4444;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-weight:bold;color:#fca5a5;">Reason for Rejection:</p>
        <p style="margin:8px 0 0;color:#fecaca;">${reason || 'The listing did not meet our platform guidelines. Please review and resubmit.'}</p>
      </div>
      <p>You may update your listing and resubmit it for review. Please contact our support team if you have any questions.</p>
      ${emailFooter()}
    `
  });
};

// ─── Expert Connection Alert ──────────────────────────────────────────────────
const sendExpertConnectionAlert = async ({ agentEmail, agentName, buyerName, buyerEmail, propertyTitle, propertyId, buyerMessage }) => {
  const propertyUrl = `${getClientUrl()}/properties/${propertyId}`;
  const now = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' });

  await sendEmail({
    to: agentEmail,
    subject: `🔔 Buyer Wants to Connect — "${propertyTitle}"`,
    html: `
      ${emailHeader('Expert Connection Request — New Buyer Inquiry')}
      <p>Hi <strong>${agentName || 'Agent/Seller'}</strong>,</p>
      <div style="background:#1e3a5f;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:14px;font-weight:bold;color:#fbbf24;">🔔 A buyer is requesting to speak with you!</p>
        <p style="margin:8px 0 0;font-size:13px;color:#93c5fd;">Please reach out to them at your earliest convenience.</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
        <tr><td style="padding:8px 0;color:#94a3b8;width:140px;">👤 Buyer Name</td><td style="padding:8px 0;font-weight:bold;color:#f1f5f9;">${buyerName}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;">✉️ Buyer Email</td><td style="padding:8px 0;font-weight:bold;color:#f1f5f9;">${buyerEmail || 'Not available'}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;">🏡 Property</td><td style="padding:8px 0;font-weight:bold;color:#f1f5f9;">${propertyTitle}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;">🕐 Requested At</td><td style="padding:8px 0;color:#f1f5f9;">${now} (AEDT)</td></tr>
      </table>
      ${buyerMessage ? `<div style="background:#1e293b;border-radius:8px;padding:14px;margin-bottom:20px;"><p style="margin:0;color:#94a3b8;font-size:12px;font-weight:bold;">BUYER'S MESSAGE</p><p style="margin:8px 0 0;color:#e2e8f0;font-style:italic;">"${buyerMessage}"</p></div>` : ''}
      <a href="${propertyUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">View Property Listing →</a>
      ${emailFooter()}
    `
  });
};

// Helper to generate unique reference code so Gmail treats each email as a new standalone message
const genRef = () => Math.floor(10000 + Math.random() * 90000);

// In-memory deduplication cache to prevent sending duplicate emails if a user double-clicks submit
const recentAlertCache = new Map();

const isDuplicateAlert = (key) => {
  const now = Date.now();
  if (recentAlertCache.has(key)) {
    const lastTime = recentAlertCache.get(key);
    if (now - lastTime < 10000) { // 10-second window
      return true;
    }
  }
  recentAlertCache.set(key, now);
  if (recentAlertCache.size > 500) {
    for (const [k, v] of recentAlertCache.entries()) {
      if (now - v > 60000) recentAlertCache.delete(k);
    }
  }
  return false;
};

// ─── INSPECTION REQUEST: Buyer → Seller/Agent ─────────────────────────────────
const sendInspectionRequestAlert = async ({ toEmail, toName, buyerName, buyerEmail, buyerPhone, propertyTitle, propertyId, date, timeSlot, type, notes }) => {
  if (!toEmail) {
    console.warn('[EMAIL] sendInspectionRequestAlert called with no toEmail — skipping.');
    return;
  }
  // NOTE: dedup key intentionally does NOT include toEmail so the same booking
  // can still be sent to both the agent AND the admin without one blocking the other.
  const dedupKey = `inspection_${buyerEmail}_${propertyId}_${date}_${timeSlot}`;
  if (isDuplicateAlert(dedupKey)) {
    console.log(`⚠️ Suppressed duplicate inspection alert email for ${buyerEmail}`);
    return;
  }
  const propertyUrl = `${getClientUrl()}/properties/${propertyId || ''}`;
  const formattedDate = date ? new Date(date).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : date;

  await sendEmail({
    to: toEmail,
    replyTo: buyerEmail,
    subject: `📅 New Inspection Booking — "${propertyTitle}" [#REF-${genRef()}]`,
    html: `
      ${emailHeader('Property Inspection Request — Action Required')}
      <p>Hi <strong>${toName || 'Admin'}</strong>,</p>
      <p>A buyer has clicked <strong>"Book Inspection"</strong> on AuraEstates and submitted an appointment request. Please review the details below:</p>

      <div style="background:#1e293b;border-left:4px solid #f59e0b;border-radius:10px;padding:20px;margin:20px 0;">
        <h3 style="margin:0 0 16px;color:#fbbf24;font-size:15px;letter-spacing:0.5px;">📅 INSPECTION BOOKING DETAILS</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;width:160px;">🔘 Form Used</td>
            <td style="padding:10px 0;font-weight:bold;color:#fbbf24;">Book Inspection (Confirm Appointment)</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;vertical-align:top;">🏡 Property</td>
            <td style="padding:10px 0;font-weight:bold;color:#f1f5f9;">${propertyTitle}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">👤 Buyer Name</td>
            <td style="padding:10px 0;font-weight:bold;color:#f1f5f9;">${buyerName || 'Buyer'}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">✉️ Buyer Email</td>
            <td style="padding:10px 0;color:#60a5fa;font-weight:bold;">${buyerEmail || 'Not specified'}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">📞 Buyer Phone</td>
            <td style="padding:10px 0;color:#f1f5f9;">${buyerPhone || 'Not provided'}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">📅 Inspection Date</td>
            <td style="padding:10px 0;font-weight:bold;color:#34d399;">${formattedDate || date}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">🕐 Time Slot</td>
            <td style="padding:10px 0;font-weight:bold;color:#34d399;">${timeSlot}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">🔍 Format</td>
            <td style="padding:10px 0;color:#f1f5f9;">${type || 'In-Person'}</td>
          </tr>
          ${notes ? `<tr><td style="padding:10px 0;color:#94a3b8;vertical-align:top;">📝 Special Notes</td><td style="padding:10px 0;color:#e2e8f0;font-style:italic;">"${notes}"</td></tr>` : ''}
        </table>
      </div>

      <div style="background:#1e3a5f;border-radius:8px;padding:14px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#93c5fd;">⚡ Log in to your <strong>Admin Dashboard</strong> to <strong style="color:#34d399;">Confirm</strong> or <strong style="color:#f87171;">Cancel</strong> this inspection booking. The buyer will be notified automatically.</p>
      </div>

      <a href="${propertyUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 28px;border-radius:8px;font-weight:bold;text-decoration:none;">View Property Listing →</a>
      ${emailFooter()}
    `
  });
};

// ─── INSPECTION STATUS UPDATE: Seller/Agent → Buyer ──────────────────────────
const sendInspectionStatusUpdate = async ({ toEmail, toName, propertyTitle, date, timeSlot, status, updatedBy }) => {
  if (!toEmail) return;
  const isConfirmed = status === 'Confirmed' || status === 'Completed';
  const isCancelled = status === 'Cancelled';
  const statusColor = isConfirmed ? '#34d399' : isCancelled ? '#ef4444' : '#f59e0b';
  const statusBg = isConfirmed ? '#065f46' : isCancelled ? '#450a0a' : '#78350f';
  const formattedDate = date ? new Date(date).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : date;
  const emoji = isConfirmed ? '✅' : isCancelled ? '❌' : '⏳';

  await sendEmail({
    to: toEmail,
    subject: `${emoji} Inspection ${status} — "${propertyTitle}"`,
    html: `
      ${emailHeader('Property Inspection — Status Update')}
      <p>Hi <strong>${toName}</strong>,</p>
      <p>Your inspection request for <strong>"${propertyTitle}"</strong> has been reviewed by the agent/seller.</p>

      <div style="background:${statusBg};border-left:4px solid ${statusColor};border-radius:10px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:bold;">
          ${emoji} Inspection Status: <span style="color:${statusColor};text-transform:uppercase;">${status}</span>
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;">
          <tr><td style="padding:6px 0;color:#cbd5e1;width:130px;">🏡 Property:</td><td style="color:#f1f5f9;font-weight:bold;">${propertyTitle}</td></tr>
          <tr><td style="padding:6px 0;color:#cbd5e1;">📅 Date:</td><td style="color:#f1f5f9;font-weight:bold;">${formattedDate}</td></tr>
          <tr><td style="padding:6px 0;color:#cbd5e1;">🕐 Time Slot:</td><td style="color:#f1f5f9;font-weight:bold;">${timeSlot}</td></tr>
          <tr><td style="padding:6px 0;color:#cbd5e1;">👤 Updated By:</td><td style="color:#f1f5f9;">${updatedBy || 'Agent/Seller'}</td></tr>
        </table>
      </div>

      <p style="font-size:14px;">
        ${isConfirmed
        ? '🎉 Great news! The agent/seller has <strong>confirmed</strong> your inspection booking. Please arrive on time at the scheduled slot. If you need to make any changes, contact the agent directly.'
        : isCancelled
          ? 'We\'re sorry, your inspection booking has been <strong>cancelled</strong> by the agent/seller. Please log in to book a new time slot that works for both of you.'
          : 'Your inspection request status has been updated. Please log in to your dashboard for more details.'}
      </p>
      ${emailFooter()}
    `
  });
};

// ─── OFFER REQUEST: Buyer → Seller/Agent ──────────────────────────────────────
const sendOfferRequestAlert = async ({ toEmail, toName, buyerName, buyerEmail, buyerPhone, propertyTitle, propertyId, offerAmount, depositAmount, conditions }) => {
  if (!toEmail) {
    console.warn('[EMAIL] sendOfferRequestAlert called with no toEmail — skipping.');
    return;
  }
  // NOTE: dedup key does NOT include toEmail — see sendInspectionRequestAlert note above.
  const dedupKey = `offer_${buyerEmail}_${propertyId}_${offerAmount}`;
  if (isDuplicateAlert(dedupKey)) {
    console.log(`⚠️ Suppressed duplicate offer alert email for ${buyerEmail}`);
    return;
  }
  const propertyUrl = `${getClientUrl()}/properties/${propertyId || ''}`;
  const formattedOffer = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(offerAmount || 0);
  const formattedDeposit = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(depositAmount || 0);
  const now = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' });

  await sendEmail({
    to: toEmail,
    replyTo: buyerEmail,
    subject: `💰 New Purchase Offer — "${propertyTitle}" [#REF-${genRef()}]`,
    html: `
      ${emailHeader('New Purchase Offer Received — Action Required')}
      <p>Hi <strong>${toName || 'Admin'}</strong>,</p>
      <p>A buyer has clicked <strong>"Make an Offer"</strong> on AuraEstates and submitted a formal proposal. Details below:</p>

      <div style="background:#1e293b;border-left:4px solid #f59e0b;border-radius:10px;padding:20px;margin:20px 0;">
        <h3 style="margin:0 0 16px;color:#fbbf24;font-size:15px;letter-spacing:0.5px;">💰 OFFER SUMMARY</h3>

        <div style="background:#0f172a;border-radius:8px;padding:14px;margin-bottom:16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Proposed Offer Amount</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#34d399;">${formattedOffer}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;width:160px;">🔘 Form Used</td>
            <td style="padding:10px 0;font-weight:bold;color:#fbbf24;">Make an Offer (Submit Digital Offer)</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;vertical-align:top;">🏡 Property</td>
            <td style="padding:10px 0;font-weight:bold;color:#f1f5f9;">${propertyTitle}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">🏦 Proposed Initial Deposit</td>
            <td style="padding:10px 0;font-weight:bold;color:#34d399;">${formattedDeposit}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">👤 Buyer Name</td>
            <td style="padding:10px 0;font-weight:bold;color:#f1f5f9;">${buyerName || 'Buyer'}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">✉️ Buyer Email</td>
            <td style="padding:10px 0;color:#60a5fa;font-weight:bold;">${buyerEmail || 'Not specified'}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">📞 Buyer Phone</td>
            <td style="padding:10px 0;color:#f1f5f9;">${buyerPhone || 'Not provided'}</td>
          </tr>
          ${conditions ? `<tr style="border-bottom:1px solid #334155;"><td style="padding:10px 0;color:#94a3b8;vertical-align:top;">📜 Special Conditions</td><td style="padding:10px 0;color:#e2e8f0;font-style:italic;">"${conditions}"</td></tr>` : ''}
          <tr><td style="padding:10px 0;color:#94a3b8;">🕐 Submitted At</td><td style="padding:10px 0;color:#f1f5f9;">${now} (AEDT)</td></tr>
        </table>
      </div>

      <div style="background:#1e3a5f;border-radius:8px;padding:14px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#93c5fd;">⚡ Log in to your <strong>Admin Dashboard</strong> to <strong style="color:#34d399;">Accept</strong>, <strong style="color:#f59e0b;">Counter</strong>, or <strong style="color:#f87171;">Reject</strong> this offer. The buyer will be notified automatically.</p>
      </div>

      <a href="${propertyUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 28px;border-radius:8px;font-weight:bold;text-decoration:none;">Review Offer in Dashboard →</a>
      ${emailFooter()}
    `
  });
};

// ─── OFFER STATUS UPDATE: Seller/Agent → Buyer ────────────────────────────────
const sendOfferStatusUpdate = async ({ toEmail, toName, propertyTitle, offerAmount, status, counterAmount, note, updatedBy }) => {
  if (!toEmail) return;
  const isAccepted = status === 'Accepted';
  const isCountered = status === 'Countered';
  const isRejected = status === 'Rejected';
  const statusColor = isAccepted ? '#34d399' : isCountered ? '#f59e0b' : '#ef4444';
  const statusBg = isAccepted ? '#065f46' : isCountered ? '#78350f' : '#450a0a';
  const emoji = isAccepted ? '🎉' : isCountered ? '🔄' : '❌';
  const formattedOffer = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(offerAmount || 0);
  const formattedCounter = counterAmount ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(counterAmount) : null;

  await sendEmail({
    to: toEmail,
    subject: `${emoji} Your Offer on "${propertyTitle}" — ${status}`,
    html: `
      ${emailHeader('Offer Status Update — Response from Agent/Seller')}
      <p>Hi <strong>${toName}</strong>,</p>
      <p>The agent/seller has reviewed your offer for <strong>"${propertyTitle}"</strong> and has responded.</p>

      <div style="background:${statusBg};border-left:4px solid ${statusColor};border-radius:10px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 12px;font-size:16px;font-weight:bold;">
          ${emoji} Offer Status: <span style="color:${statusColor};text-transform:uppercase;">${status}</span>
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr><td style="padding:6px 0;color:#cbd5e1;width:160px;">🏡 Property:</td><td style="color:#f1f5f9;font-weight:bold;">${propertyTitle}</td></tr>
          <tr><td style="padding:6px 0;color:#cbd5e1;">💵 Your Offer:</td><td style="color:#f1f5f9;font-weight:bold;">${formattedOffer}</td></tr>
          ${isCountered && formattedCounter ? `<tr><td style="padding:6px 0;color:#cbd5e1;">🔄 Counter Offer:</td><td style="color:#fbbf24;font-size:16px;font-weight:bold;">${formattedCounter}</td></tr>` : ''}
          ${note ? `<tr><td style="padding:6px 0;color:#cbd5e1;vertical-align:top;">💬 Agent Note:</td><td style="color:#e2e8f0;font-style:italic;">"${note}"</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#cbd5e1;">👤 Responded By:</td><td style="color:#f1f5f9;">${updatedBy || 'Agent/Seller'}</td></tr>
        </table>
      </div>

      <p style="font-size:14px;">
        ${isAccepted
        ? '🎉 <strong>Congratulations!</strong> Your offer has been <strong style="color:#34d399;">ACCEPTED</strong> by the seller/agent. They will contact you shortly to proceed with the contract and settlement process.'
        : isCountered
          ? '🔄 The seller/agent has submitted a <strong>counter-offer</strong>. Please log in to your dashboard to review the counter-offer and respond — Accept or Decline.'
          : '❌ Unfortunately, your offer was <strong>not accepted</strong> by the seller/agent at this time. You may submit a revised offer or explore other properties on AuraEstates.'}
      </p>
      ${emailFooter()}
    `
  });
};

// ─── RESERVATION / BUY PROPERTY: Buyer → Seller/Agent ────────────────────────
const sendReservationAlert = async ({ toEmail, toName, buyerName, buyerEmail, buyerPhone, propertyTitle, propertyId, amount, packageType, paymentMethod }) => {
  if (!toEmail) {
    console.warn('[EMAIL] sendReservationAlert called with no toEmail — skipping.');
    return;
  }
  // NOTE: dedup key does NOT include toEmail — see sendInspectionRequestAlert note above.
  const dedupKey = `reservation_${buyerEmail}_${propertyId}_${amount}`;
  if (isDuplicateAlert(dedupKey)) {
    console.log(`⚠️ Suppressed duplicate reservation alert email for ${buyerEmail}`);
    return;
  }
  const propertyUrl = `${getClientUrl()}/properties/${propertyId || ''}`;
  const formattedAmount = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(amount || 0);
  const now = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' });

  await sendEmail({
    to: toEmail,
    replyTo: buyerEmail,
    subject: `🏠 Property Reservation Deposit — "${propertyTitle}" [#REF-${genRef()}]`,
    html: `
      ${emailHeader('Property Reservation / Purchase — Action Required')}
      <p>Hi <strong>${toName || 'Admin'}</strong>,</p>
      <p>A buyer has clicked <strong>"Buy Property (Reserve Now)"</strong> on AuraEstates and completed a reservation payment. Details below:</p>

      <div style="background:#1e293b;border-left:4px solid #a78bfa;border-radius:10px;padding:20px;margin:20px 0;">
        <h3 style="margin:0 0 16px;color:#a78bfa;font-size:15px;letter-spacing:0.5px;">🏠 RESERVATION DETAILS</h3>

        <div style="background:#0f172a;border-radius:8px;padding:14px;margin-bottom:16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Reservation Deposit Paid</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#a78bfa;">${formattedAmount}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${packageType || 'Holding Deposit'}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;width:160px;">🔘 Form Used</td>
            <td style="padding:10px 0;font-weight:bold;color:#a78bfa;">Buy Property (Reserve Now)</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;vertical-align:top;">🏡 Property</td>
            <td style="padding:10px 0;font-weight:bold;color:#f1f5f9;">${propertyTitle}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">👤 Buyer Name</td>
            <td style="padding:10px 0;font-weight:bold;color:#f1f5f9;">${buyerName || 'Buyer'}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">✉️ Buyer Email</td>
            <td style="padding:10px 0;color:#60a5fa;font-weight:bold;">${buyerEmail || 'Not specified'}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">📞 Buyer Phone</td>
            <td style="padding:10px 0;color:#f1f5f9;">${buyerPhone || 'Not provided'}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:10px 0;color:#94a3b8;">💳 Payment Method</td>
            <td style="padding:10px 0;color:#f1f5f9;">${paymentMethod || 'Online Payment'}</td>
          </tr>
          <tr><td style="padding:10px 0;color:#94a3b8;">🕐 Reserved At</td><td style="padding:10px 0;color:#f1f5f9;">${now} (AEDT)</td></tr>
        </table>
      </div>

      <div style="background:#1e3a5f;border-radius:8px;padding:14px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#93c5fd;">⚡ The buyer has paid a reservation deposit. Please contact them at <strong>${buyerEmail}</strong> to arrange contract exchange and settlement.</p>
      </div>

      <a href="${propertyUrl}" style="display:inline-block;background:#a78bfa;color:#0f172a;padding:12px 28px;border-radius:8px;font-weight:bold;text-decoration:none;">View Property Listing →</a>
      ${emailFooter()}
    `
  });
};

// ─── RESERVATION CONFIRMATION: Platform → Buyer ───────────────────────────────
const sendReservationConfirmation = async ({ toEmail, toName, propertyTitle, propertyId, amount, packageType, paymentMethod, transactionId }) => {
  if (!toEmail) return;
  const propertyUrl = `${getClientUrl()}/properties/${propertyId || ''}`;
  const formattedAmount = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(amount || 0);
  const now = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' });

  await sendEmail({
    to: toEmail,
    subject: `🏠 Reservation Confirmed — "${propertyTitle}"`,
    html: `
      ${emailHeader('Property Reservation Confirmed — Payment Receipt')}
      <p>Hi <strong>${toName}</strong>,</p>
      <p>Your reservation / purchase deposit for <strong>"${propertyTitle}"</strong> has been successfully processed!</p>

      <div style="background:#1a0533;border-left:4px solid #a78bfa;border-radius:10px;padding:20px;margin:20px 0;">
        <h3 style="margin:0 0 16px;color:#a78bfa;font-size:15px;letter-spacing:0.5px;">🧾 PAYMENT RECEIPT</h3>

        <div style="background:#0f172a;border-radius:8px;padding:14px;margin-bottom:16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Amount Paid</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#a78bfa;">${formattedAmount}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#34d399;">✅ Payment Successful</p>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="border-bottom:1px solid #334155;"><td style="padding:10px 0;color:#94a3b8;width:160px;">🏡 Property</td><td style="padding:10px 0;font-weight:bold;color:#f1f5f9;">${propertyTitle}</td></tr>
          <tr style="border-bottom:1px solid #334155;"><td style="padding:10px 0;color:#94a3b8;">📦 Package Type</td><td style="padding:10px 0;color:#f1f5f9;">${packageType || 'Property Reservation'}</td></tr>
          <tr style="border-bottom:1px solid #334155;"><td style="padding:10px 0;color:#94a3b8;">💳 Payment Method</td><td style="padding:10px 0;color:#f1f5f9;">${paymentMethod || 'Online Payment'}</td></tr>
          ${transactionId ? `<tr style="border-bottom:1px solid #334155;"><td style="padding:10px 0;color:#94a3b8;">🔖 Transaction ID</td><td style="padding:10px 0;color:#f1f5f9;font-size:11px;">${transactionId}</td></tr>` : ''}
          <tr><td style="padding:10px 0;color:#94a3b8;">🕐 Paid At</td><td style="padding:10px 0;color:#f1f5f9;">${now} (AEDT)</td></tr>
        </table>
      </div>

      <p style="font-size:14px;">The agent/seller has been notified and will contact you shortly to arrange the next steps including <strong>contract exchange and settlement</strong>. Keep this email as your payment receipt.</p>

      <a href="${propertyUrl}" style="display:inline-block;background:#a78bfa;color:#0f172a;padding:12px 28px;border-radius:8px;font-weight:bold;text-decoration:none;">View Property →</a>
      ${emailFooter()}
    `
  });
};

module.exports = {
  sendPropertySubmissionEmail,
  sendPropertyApprovalEmail,
  sendPropertyRejectionEmail,
  sendExpertConnectionAlert,
  sendInspectionRequestAlert,
  sendInspectionStatusUpdate,
  sendOfferRequestAlert,
  sendOfferStatusUpdate,
  sendReservationAlert,
  sendReservationConfirmation,
  verifyEmailConnection,
  sendEmail
};
