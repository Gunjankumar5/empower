const fetch = require('node-fetch');
const Alert = require('../models/Alert');
const User = require('../models/user');
const { sendSMS, formatMapsLink } = require('./twilio');
const { sendPushNotification } = require('./fcm');

const reverseGeocode = async (lat, lng) => {
  if (lat == null || lng == null) {
    return '';
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'EMPOWER-SAFE/1.0 (development)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.display_name || '';
};

const buildEmergencyMessage = (user, alert, mapsLink) => {
  const timestamp = new Date(alert.timestamp || Date.now()).toLocaleString();
  return `🚨 EMERGENCY ALERT from ${user.name}! Location: ${mapsLink}. Please check on them immediately. Time: ${timestamp}`;
};

const createAndNotifyAlert = async ({ user, lat, lng, type = 'sos' }) => {
  const address = await reverseGeocode(lat, lng).catch((error) => {
    console.warn('Reverse geocode failed:', error.message);
    return '';
  });

  const alert = await Alert.create({
    userId: user._id,
    location: { lat, lng, address },
    timestamp: new Date(),
    type,
    resolved: false,
    notifiedContacts: (user.emergencyContacts || []).map((contact) => ({
      name: contact.name,
      phone: contact.phone,
      status: 'pending',
      error: '',
    })),
  });

  const mapsLink = formatMapsLink(lat, lng);
  const message = buildEmergencyMessage(user, alert, mapsLink);
  const notifiedContacts = [];

  for (const contact of user.emergencyContacts || []) {
    try {
      const smsResult = await sendSMS(contact.phone, message, { mapsLink });
      const sent = smsResult && smsResult.success === true;
      notifiedContacts.push({
        name: contact.name,
        phone: contact.phone,
        status: sent ? 'sent' : smsResult?.skipped ? 'skipped' : 'failed',
        error: '',
      });
    } catch (error) {
      console.error(`SMS failed for ${contact.phone}:`, error.message);
      notifiedContacts.push({
        name: contact.name,
        phone: contact.phone,
        status: 'failed',
        error: error.message,
      });
    }
  }

  if (Array.isArray(user.fcmTokens)) {
    for (const token of user.fcmTokens) {
      try {
        await sendPushNotification(token, '🚨 Emergency Alert', message, {
          alertId: alert._id.toString(),
          type,
        });
      } catch (error) {
        console.error('Push notification failed:', error.message);
      }
    }
  }

  user.lastKnownLocation = {
    lat,
    lng,
    address,
    updatedAt: new Date(),
  };
  user.totalAlerts = (user.totalAlerts || 0) + 1;
  await user.save();

  alert.notifiedContacts = notifiedContacts;
  await alert.save();

  return alert.populate('userId', 'name email phone');
};

module.exports = {
  createAndNotifyAlert,
  reverseGeocode,
};