# 📱 SMS Setup & Troubleshooting Guide

## Issue: SMS Not Sending After NFC Tag Tap

### Root Cause
Your `.env` file has the wrong Twilio variable names. The code expects:
- ✅ `TWILIO_ACCOUNT_SID` (you have `TWILIO_SID`)
- ✅ `TWILIO_AUTH_TOKEN` (correct)
- ✅ `TWILIO_MESSAGING_SID` (missing entirely)

---

## ✅ Solution: Update Twilio Configuration

### Step 1: Get Your Twilio Credentials

1. Go to [Twilio Console](https://www.twilio.com/console)
2. Login to your account
3. Find your credentials:
   - **Account SID**: Click on your Account name → Account Settings → Account SID
   - **Auth Token**: In same Account Settings panel
   - **Messaging Service SID**: See below

### Step 2: Create/Find Messaging Service SID

A Messaging Service allows SMS from multiple phone numbers:

**If you already have a Messaging Service:**
1. Go to Messaging → Services in Twilio Console
2. Click on your service
3. Copy the "Service SID" (starts with `MG`)

**If you need to create one:**
1. Go to Messaging → Services
2. Click "Create Messaging Service"
3. Name: "EMPOWER SAFE SOS Alerts"
4. Purpose: "Application-to-Person (A2P)"
5. Create Service
6. Add a Sender ID (phone number or long code)
7. Save the Service SID

### Step 3: Update .env File

Replace the Twilio section in `.env`:

```env
# Twilio Configuration (for SMS notifications)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_MESSAGING_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Example:**
```env
# Twilio Configuration (for SMS notifications)
TWILIO_ACCOUNT_SID=AC07b88f5485e11a0a5bd803168681f024
TWILIO_AUTH_TOKEN=7a23bc92574ef11385b4fa9ce85fad1f
TWILIO_MESSAGING_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Restart Backend

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm start
```

---

## 🔍 Verify SMS Configuration

### Check Twilio Code in Backend

The code looks for these environment variables in `src/services/twilio.js`:

```javascript
const accountSid = process.env.TWILIO_ACCOUNT_SID;    // ← Check this
const authToken = process.env.TWILIO_AUTH_TOKEN;      // ← Check this
const messagingServiceSid = process.env.TWILIO_MESSAGING_SID;  // ← Check this
```

### Test SMS Sending

Run this test to verify Twilio is configured:

```powershell
# In the backend directory
node -e "
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

console.log('Testing Twilio connection...');
console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...');
console.log('Messaging SID:', process.env.TWILIO_MESSAGING_SID?.substring(0, 10) + '...');
console.log('✅ Credentials loaded successfully!');
"
```

---

## 📋 Complete NFC → SMS Flow

### What Should Happen When NFC Tag is Tapped:

1. **Frontend (nfc.html)**
   - Shows 3-second countdown
   - Gets GPS location using navigator.geolocation
   - Calls `/api/nfc/scan` with `{tagId, lat, lng}`

2. **Backend (routes/nfc.js)**
   - Finds user by `nfcTagId`
   - Calls `createAndNotifyAlert()` service

3. **Alert Service (services/alertService.js)**
   - Creates Alert record in MongoDB
   - Gets address from GPS coordinates
   - For each emergency contact:
     - Sends SMS via Twilio

4. **Twilio Service (services/twilio.js)**
   - Formats phone number to E.164 format (e.g., +919876543210)
   - Sends SMS using Messaging Service
   - Returns success/failure status

5. **Frontend Response**
   - Shows "Alert Sent!" message
   - Displays number of contacts notified
   - Shows live location on map

---

## ⚙️ Emergency Contacts Setup

### Add Contacts Before Testing NFC

1. Login to EMPOWER SAFE app
2. Go to **Contacts** page
3. Click **Add Contact**
4. Fill in:
   - **Name**: Contact's name
   - **Phone**: Format as `9876543210` or `+91-9876543210`
   - **Email**: (optional)
   - **Relation**: (optional, e.g., "Mother")
5. Click **Save Contact**

### Important: Phone Format

The system automatically converts:
- `9876543210` → `+919876543210` (India)
- `+91-9876543210` → `+919876543210`
- `+1-201-555-0123` → `+12015550123` (US)

---

## 🧪 Testing SMS

### Test 1: Check Emergency Contacts

```bash
curl -X GET "http://localhost:5000/api/contacts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Should show your saved contacts with formatted phone numbers.

### Test 2: Trigger SOS via cURL

```bash
curl -X POST "http://localhost:5000/api/nfc/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "tagId": "YOUR_NFC_TAG_ID",
    "lat": 19.0760,
    "lng": 72.8777
  }'
```

Check the response for:
- `success: true`
- `contactsNotified: X` (should be > 0)

### Test 3: Monitor Backend Logs

When SMS is sent, you should see in console:
```
✅ SMS sent to +919876543210: SMxxxxxxxxxxxxxxxx
```

If SMS fails, you'll see:
```
❌ SMS failed for +919876543210: reason here
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Twilio not configured"

**Symptom:** Console shows "Twilio not configured. Skipping SMS"

**Fix:** 
- Check `.env` has all three Twilio variables
- Verify `TWILIO_ACCOUNT_SID` starts with `AC`
- Verify `TWILIO_MESSAGING_SID` starts with `MG`
- Restart server after updating `.env`

### Issue 2: "Invalid phone number format"

**Symptom:** SMS fails with "Invalid phone number" error

**Fix:**
- Save phone as `9876543210` (without country code)
- Or use `+91-9876543210` format
- Avoid spaces: use `9876543210` not `98 7654 3210`

### Issue 3: Contacts showing but SMS not sent

**Symptom:** `contactsNotified: 0` in response

**Fix:**
- Confirm emergency contacts are saved
- Run test above to see actual error messages
- Check console for error details

### Issue 4: "Messaging Service SID not found"

**Symptom:** Twilio API error about missing service

**Fix:**
- Create Messaging Service in Twilio Console
- Get the SID (starts with `MG`)
- Add to `.env` as `TWILIO_MESSAGING_SID`
- Restart backend

---

## 🔄 NFC Tag Setup

### Register NFC Tag

Before tapping NFC tag:

1. Go to Features page → **NFC Tag Registration**
2. Enter or scan your NFC tag ID
3. Click **Register Tag**
4. You'll see "✅ Tag registered successfully"

### Verify Registration

```bash
curl -X GET "http://localhost:5000/api/nfc/get-registered" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Trigger Alert via NFC

1. In browser: Open `https://your-domain.com/nfc.html?tag=YOUR_TAG_ID`
2. Wait 3 seconds for countdown
3. Alert sends automatically with current location
4. SMS goes to all emergency contacts
5. See "Alert Sent!" message with contact count

---

## 📊 Debug Mode

### Enable Detailed Logging

Add this to `.env`:
```env
DEBUG=empower:*
```

Or in `src/index.js`:
```javascript
const debug = require('debug')('empower:sms');
```

Then check console for detailed SMS logs.

---

## ✅ Verification Checklist

Before NFC testing:

- [ ] `.env` has `TWILIO_ACCOUNT_SID` (starts with `AC`)
- [ ] `.env` has `TWILIO_AUTH_TOKEN`
- [ ] `.env` has `TWILIO_MESSAGING_SID` (starts with `MG`)
- [ ] Backend restarted after `.env` update
- [ ] At least 1 emergency contact added
- [ ] Contact phone number in `9876543210` format
- [ ] NFC tag registered in Features page
- [ ] Browser console shows no errors
- [ ] Backend console shows "SMS sent" messages

---

## 🆘 Still Not Working?

1. Check backend logs for exact error message
2. Verify Twilio Messaging Service is active
3. Check Twilio account has SMS credits
4. Verify phone number isn't blacklisted
5. Test with a different contact number
6. Check if running on production (Render.com) vs localhost

---

**Updated:** April 26, 2026  
**Status:** Complete Setup Guide
