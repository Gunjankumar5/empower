const fetch = require("node-fetch");

async function sendPush(message) {
  try {
    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Authorization": `key=${process.env.FCM_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notification: {
          title: "🚨 Emergency Alert!",
          body: message,
        },
        to: "/topics/all",
      }),
    });
    console.log("📲 Push notification sent");
  } catch (err) {
    console.error("❌ Push error:", err.message);
  }
}

module.exports = sendPush;
