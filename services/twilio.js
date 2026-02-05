const twilio = require("twilio");

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to, message) {
  try {
    await client.messages.create({
      body: message,
      from: "+1234567890", // replace with your Twilio number
      to,
    });
    console.log(`📩 SMS sent to ${to}`);
  } catch (err) {
    console.error("❌ SMS error:", err.message);
  }
}

module.exports = sendSMS;
