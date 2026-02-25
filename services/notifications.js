const User = require("../models/user");
const sendSMS = require("./twilio");
const sendPush = require("./fcm");

async function sendNotification(userId, location) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error("User not found:", userId);
      return;
    }

    const message = `🚨 Emergency Alert! User ${user.name} may be in danger at ${location}.`;
    
    console.log(`📢 Sending notifications for user: ${user.name}`);
    console.log(`📍 Location: ${location}`);
    console.log(`👥 Emergency contacts: ${user.emergencyContacts?.length || 0}`);

    // Send SMS to each emergency contact
    if (user.emergencyContacts && user.emergencyContacts.length > 0) {
      for (let contact of user.emergencyContacts) {
        try {
          const phoneNumber = contact.phone || contact;
          await sendSMS(phoneNumber, message);
          console.log(`✅ SMS sent to ${phoneNumber}`);
        } catch (err) {
          console.error(`❌ Failed to send SMS to ${contact}:`, err.message);
        }
      }
    } else {
      console.warn("⚠️ No emergency contacts found for user");
    }

    // Send Push Notification
    try {
      await sendPush(message);
      console.log("✅ Push notification sent");
    } catch (err) {
      console.error("❌ Push notification failed:", err.message);
    }

  } catch (err) {
    console.error("❌ Notification error:", err.message);
  }
}

module.exports = sendNotification;
