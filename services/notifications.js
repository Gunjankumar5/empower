const User = require("../models/user");
const sendSMS = require("./twilio");
const sendPush = require("./fcm");

async function sendNotification(userId, location) {
  try {
    const user = await User.findById(userId);

    if (!user) return;

    const message = `🚨 Emergency Alert! User ${user.name} may be in danger at ${location}.`;

    // Send SMS
    for (let contact of user.emergencyContacts) {
      await sendSMS(contact, message);
    }

    // Send Push Notification
    await sendPush(message);

  } catch (err) {
    console.error("❌ Notification error:", err.message);
  }
}

module.exports = sendNotification;
