const fetch = require('node-fetch');
const Alert = require('../models/Alert');
const User = require('../models/user');
const { sendSMS, formatMapsLink } = require('./twilio');
const { sendPushNotification } = require('./fcm');

// ── REVERSE GEOCODE ──
const reverseGeocode = async (lat, lng) => {
  if (lat == null || lng == null) return '';

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EMPOWER-SAFE/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) return '';
    const data = await response.json();
    return data.display_name || '';
  } catch (err) {
    console.warn('Reverse geocode failed:', err.message);
    return '';
  }
};

// ── SHORT SMS MESSAGE (max ~150 chars = 1 segment) ──
const buildEmergencyMessage = (userName, mapsLink) => {
  const time = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (mapsLink) {
    return `🚨 SOS! ${userName} needs help!\nLocation: ${mapsLink}\nTime: ${time}\n-Empower Safe`;
  }

  return `🚨 SOS! ${userName} needs help!\nLocation unavailable\nTime: ${time}\n-Empower Safe`;
};

// ── CREATE ALERT AND NOTIFY CONTACTS ──
const createAndNotifyAlert = async ({ user, lat, lng, type = 'sos' }) => {

  // Reverse geocode in background — don't block SMS
  const address = await reverseGeocode(lat, lng).catch(() => '');

  // Create alert in DB
  const alert = await Alert.create({
    userId: user._id,
    location: { lat, lng, address },
    timestamp: new Date(),
    type,
    resolved: false,
    notifiedContacts: (user.emergencyContacts || []).map((c) => ({
      name: c.name,
      phone: c.phone,
      status: 'pending',
      error: '',
    })),
  });

  // Build SHORT message — one maps link, no duplication
  const mapsLink = formatMapsLink(lat, lng);
  const message  = buildEmergencyMessage(user.name, mapsLink);

  console.log(`📤 SMS message (${message.length} chars):\n${message}`);
  console.log(`📋 Contacts to notify: ${(user.emergencyContacts || []).length}`);

  const notifiedContacts = [];

  // Send SMS to each emergency contact
  for (const contact of user.emergencyContacts || []) {
    console.log(`📱 Sending SMS to: ${contact.phone}`);

    try {
      // Pass message directly — NO meta.mapsLink to avoid duplication
      const smsResult = await sendSMS(contact.phone, message);

      const status = smsResult?.success === true
        ? 'sent'
        : smsResult?.skipped
        ? 'skipped'
        : 'failed';

      console.log(`${status === 'sent' ? '✅' : '❌'} SMS to ${contact.phone}: ${status}`);

      notifiedContacts.push({
        name:   contact.name,
        phone:  contact.phone,
        status,
        error:  smsResult?.error || '',
      });

    } catch (error) {
      console.error(`❌ SMS failed for ${contact.phone}:`, error.message);
      notifiedContacts.push({
        name:   contact.name,
        phone:  contact.phone,
        status: 'failed',
        error:  error.message,
      });
    }
  }

  // Send push notifications if FCM tokens exist
  if (Array.isArray(user.fcmTokens) && user.fcmTokens.length > 0) {
    for (const token of user.fcmTokens) {
      try {
        await sendPushNotification(
          token,
          '🚨 Emergency Alert',
          `${user.name} triggered an SOS alert`,
          { alertId: alert._id.toString(), type }
        );
      } catch (error) {
        console.error('Push notification failed:', error.message);
      }
    }
  }

  // Update user stats
  user.lastKnownLocation = { lat, lng, address, updatedAt: new Date() };
  user.totalAlerts = (user.totalAlerts || 0) + 1;
  await user.save();

  // Save final contact statuses
  alert.notifiedContacts = notifiedContacts;
  await alert.save();

  console.log(`✅ Alert created. Notified: ${notifiedContacts.filter(c => c.status === 'sent').length}/${notifiedContacts.length} contacts`);

  return alert.populate('userId', 'name email phone');
};

module.exports = { createAndNotifyAlert, reverseGeocode };