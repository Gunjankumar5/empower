const twilio = require('twilio');

let client = null;

const getClient = () => {
  if (client) return client;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('Twilio credentials missing in environment variables.');
    return null;
  }

  client = twilio(accountSid, authToken);
  return client;
};

// ── FORMAT PHONE NUMBER TO E.164 ──
// Handles Indian numbers correctly: 8178840076 → +918178840076
const formatPhoneNumber = (phone) => {
  if (!phone) return null;

  // Remove spaces, dashes, brackets — keep digits and leading +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Already in E.164 format (+91xxxxxxxxxx)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // 10 digits — Indian mobile number (no country code)
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // 12 digits starting with 91 — Indian with country code but no +
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  // 11 digits starting with 1 — US format
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // 10 digits starting with 0 — Indian landline style, strip 0
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+91${cleaned.slice(1)}`;
  }

  // Fallback — prepend + and hope for the best
  return `+${cleaned}`;
};

// ── FORMAT GOOGLE MAPS LINK ──
const formatMapsLink = (lat, lng) => {
  if (lat == null || lng == null) return null;
  return `https://maps.google.com/?q=${lat},${lng}`;
};

// ── SEND SMS ──
// Keeps message SHORT (under 160 chars = 1 segment) to avoid Twilio trial failures
const sendSMS = async (to, message, meta = {}) => {
  const smsClient        = getClient();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SID;

  if (!smsClient || !messagingServiceSid) {
    console.warn(`Twilio not configured. Skipping SMS to ${to}.`);
    return { success: false, skipped: true };
  }

  const formattedPhone = formatPhoneNumber(to);
  if (!formattedPhone) {
    console.error(`Invalid phone number: ${to}`);
    return { success: false, error: `Invalid phone number: ${to}` };
  }

  // ── SHORT MESSAGE (keeps under 160 chars / 1 segment) ──
  const mapsLink = meta.mapsLink || formatMapsLink(meta.lat, meta.lng);
  const time     = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  // Build compact body — max ~150 chars
  let body;
  if (mapsLink) {
    body = `🚨 SOS! ${message}\nLocation: ${mapsLink}\nTime: ${time}\n-Empower Safe`;
  } else {
    body = `🚨 SOS! ${message}\nLocation unavailable\nTime: ${time}\n-Empower Safe`;
  }

  // Safety trim — never exceed 300 chars (2 segments max)
  if (body.length > 300) {
    body = body.substring(0, 297) + '...';
  }

  try {
    const response = await smsClient.messages.create({
      messagingServiceSid,
      to: formattedPhone,
      body,
    });

    console.log(`✅ SMS sent to ${formattedPhone}: ${response.sid} (${body.length} chars)`);
    return { success: true, sid: response.sid };

  } catch (error) {
    console.error(`❌ SMS failed for ${formattedPhone}:`, error.message);
    return { success: false, error: error.message };
  }
};

// ── SEND SOS ALERT (helper used by alert routes) ──
// Call this directly from your routes with user + location data
const sendSOSAlert = async (contactPhone, userName, lat, lng) => {
  const mapsLink = formatMapsLink(lat, lng);

  return await sendSMS(
    contactPhone,
    `${userName} needs help!`,
    { mapsLink }
  );
};

module.exports = { sendSMS, sendSOSAlert, formatMapsLink, formatPhoneNumber };