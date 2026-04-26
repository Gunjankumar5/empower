const twilio = require('twilio');

let client = null;

const getClient = () => {
  if (client) return client;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('Twilio credentials missing.');
    return null;
  }

  client = twilio(accountSid, authToken);
  return client;
};

// ── FORMAT PHONE TO E.164 ──
const formatPhoneNumber = (phone) => {
  if (!phone) return null;

  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) return cleaned;

  // 10 digits — Indian mobile
  if (cleaned.length === 10) return `+91${cleaned}`;

  // 12 digits starting with 91 — Indian with country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;

  // 11 digits starting with 1 — US
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;

  // 11 digits starting with 0 — Indian with leading 0
  if (cleaned.length === 11 && cleaned.startsWith('0')) return `+91${cleaned.slice(1)}`;

  return `+${cleaned}`;
};

// ── FORMAT MAPS LINK ──
const formatMapsLink = (lat, lng) => {
  if (lat == null || lng == null) return null;
  return `https://maps.google.com/?q=${lat},${lng}`;
};

// ── SEND SMS ──
// message should already be fully built — no extra appending here
const sendSMS = async (to, message) => {
  const smsClient           = getClient();
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

  // Safety trim — never exceed 320 chars (2 segments max)
  const body = message.length > 320
    ? message.substring(0, 317) + '...'
    : message;

  console.log(`📤 Sending SMS to ${formattedPhone} (${body.length} chars)`);

  try {
    const response = await smsClient.messages.create({
      messagingServiceSid,
      to: formattedPhone,
      body,
    });

    console.log(`✅ SMS sent to ${formattedPhone}: SID ${response.sid}`);
    return { success: true, sid: response.sid };

  } catch (error) {
    console.error(`❌ SMS failed for ${formattedPhone}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS, formatMapsLink, formatPhoneNumber };