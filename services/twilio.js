const twilio = require("twilio");

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to, message) {
  try {
    if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn("⚠️ Twilio credentials not configured in environment variables");
      return;
    }

    // Ensure phone number is in E.164 format (+[country code][number])
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
      to: formattedNumber,
    });
    
    console.log(`✅ SMS sent to ${formattedNumber} (SID: ${result.sid})`);
    return result;
  } catch (err) {
    console.error(`❌ SMS error to ${to}:`, err.message);
    throw err;
  }
}

module.exports = sendSMS;
