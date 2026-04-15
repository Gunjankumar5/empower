const admin = require('firebase-admin');
const fs = require('fs');

let initialized = false;

const initializeFirebase = () => {
  if (initialized) {
    return admin;
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountPath) {
    console.warn('Firebase service account is not configured. Push notifications will be skipped.');
    return null;
  }

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn(`Firebase service account file not found: ${serviceAccountPath}`);
    return null;
  }

  const serviceAccount = require(serviceAccountPath);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  initialized = true;
  return admin;
};

const sendPushNotification = async (token, title, body, data = {}) => {
  if (!token) {
    console.warn('Push notification skipped because no token was provided.');
    return { success: false, skipped: true };
  }

  const firebaseAdmin = initializeFirebase();
  if (!firebaseAdmin) {
    return { success: false, skipped: true };
  }

  const message = {
    token,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    ),
  };

  const response = await firebaseAdmin.messaging().send(message);
  console.log(`Push notification sent to token ${token.slice(0, 12)}...`);
  return { success: true, messageId: response };
};

module.exports = { sendPushNotification };