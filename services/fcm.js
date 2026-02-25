const fetch = require("node-fetch");

async function sendPush(message) {
  try {
    if (!process.env.FCM_SERVER_KEY) {
      console.warn("⚠️ FCM_SERVER_KEY not configured in environment variables");
      return;
    }

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Authorization": `key=${process.env.FCM_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notification: {
          title: "🚨 Emergency Alert!",
          body: message,
          sound: "default",
          priority: "high",
        },
        to: "/topics/all",
        priority: "high",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FCM API error: ${response.status} - ${error}`);
    }

    console.log("✅ Push notification sent successfully");
    return response;
  } catch (err) {
    console.error("❌ Push notification error:", err.message);
    throw err;
  }
}

module.exports = sendPush;
