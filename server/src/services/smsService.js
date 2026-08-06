// ─── SMS Notification Service ─────────────────────────────────────────────────
// Uses Twilio if configured, falls back to console log
const sendSMS = async ({ to, body }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log('\n📱 [SMS FALLBACK — Twilio not configured]');
    console.log(`   To  : ${to}`);
    console.log(`   Msg : ${body}`);
    console.log('─'.repeat(60));
    return;
  }

  try {
    const twilio = require('twilio')(accountSid, authToken);
    const message = await twilio.messages.create({ body, from: fromNumber, to });
    console.log(`✅ SMS sent to ${to}: ${message.sid}`);
  } catch (err) {
    console.error(`❌ SMS failed to ${to}:`, err.message);
  }
};

// ─── Expert Connection SMS to Agent ──────────────────────────────────────────
const sendExpertConnectionSMS = async ({ agentPhone, agentName, buyerName, propertyTitle, buyerEmail }) => {
  if (!agentPhone) {
    console.log('📱 [SMS SKIPPED — No agent phone number available]');
    return;
  }

  const body = `🔔 AuraEstates Alert — ${agentName}, a buyer "${buyerName}" wants to connect with you about "${propertyTitle}". Contact them at: ${buyerEmail || 'email not provided'}. Login to AuraEstates for full details.`;

  await sendSMS({ to: agentPhone, body });
};

module.exports = { sendSMS, sendExpertConnectionSMS };
