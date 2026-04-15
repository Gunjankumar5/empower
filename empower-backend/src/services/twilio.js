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

const formatMapsLink = (lat, lng) => {
  if (lat == null || lng == null) {
    return 'Location unavailable';
  }

  return `https://www.google.com/maps?q=${lat},${lng}`;
};

const sendSMS = async (to, message, meta = {}) => {
  const smsClient = getClient();
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!smsClient || !from) {
    console.warn(`Twilio not configured. Skipping SMS to ${to}.`);
    return { success: false, skipped: true };
  }

  const body = `${message}\n${meta.mapsLink ? `Maps: ${meta.mapsLink}\n` : ''}`.trim();

  const response = await smsClient.messages.create({
    from,
    to,
    body,
  });

  console.log(`SMS sent to ${to}: ${response.sid}`);
  return { success: true, sid: response.sid };
};

module.exports = { sendSMS, formatMapsLink };