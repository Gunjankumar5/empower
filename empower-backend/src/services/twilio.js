const twilio = require('twilio');

let client = null;

const getClient = () => {
  if (client) {
    return client;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  client = twilio(accountSid, authToken);
  return client;
};

// Format phone number to E.164 format required by Twilio
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If already has +, validate it
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If 10 digits, assume US number
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // If 11 digits and starts with 1, it's US format
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // Otherwise assume +1 prefix for US
  if (cleaned.length <= 11) {
    return `+1${cleaned.replace(/^1/, '')}`;
  }
  
  // International format - add + if missing
  return `+${cleaned}`;
};

const formatMapsLink = (lat, lng) => {
  if (lat == null || lng == null) {
    return 'Location unavailable';
  }

  return `https://www.google.com/maps?q=${lat},${lng}`;
};

const sendSMS = async (to, message, meta = {}) => {
  const smsClient = getClient();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SID;

  if (!smsClient || !messagingServiceSid) {
    console.warn(`Twilio not configured. Skipping SMS to ${to}.`);
    return { success: false, skipped: true };
  }

  // Format phone number to E.164 format
  const formattedPhone = formatPhoneNumber(to);
  if (!formattedPhone) {
    console.error(`Invalid phone number format: ${to}`);
    return { success: false, error: `Invalid phone number: ${to}` };
  }

  const body = `${message}\n${meta.mapsLink ? `Maps: ${meta.mapsLink}\n` : ''}`.trim();

  try {
    const response = await smsClient.messages.create({
      messagingServiceSid,
      to: formattedPhone,
      body,
    });

    console.log(`✅ SMS sent to ${formattedPhone} (original: ${to}): ${response.sid}`);
    return { success: true, sid: response.sid };
  } catch (error) {
    console.error(`❌ SMS failed for ${formattedPhone} (original: ${to}):`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS, formatMapsLink, formatPhoneNumber };