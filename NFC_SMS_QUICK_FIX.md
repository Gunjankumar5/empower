# ✅ NFC → SMS Setup Checklist

## Critical Fix Required ⚠️

Your `.env` file has been updated to use correct Twilio variable names:

**OLD (Not Working):**
```env
TWILIO_SID=AC...
TWILIO_PHONE_NUMBER=+918178840076
```

**NEW (Fixed):**
```env
TWILIO_ACCOUNT_SID=AC07b88f5485e11a0a5bd803168681f024
TWILIO_MESSAGING_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ← NEEDS YOUR VALUE
```

---

## 🔥 Action Items (In Order)

### 1️⃣ Get Your Twilio Messaging Service SID

**Steps:**
1. Go to [Twilio Console](https://www.twilio.com/console)
2. Click **Messaging** → **Services**
3. Find your service (or create one)
4. Copy the **Service SID** (starts with `MG`)

**Example:**
```
MGa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
```

### 2️⃣ Update .env File

Replace `MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual Messaging Service SID:

```env
TWILIO_MESSAGING_SID=MGa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
```

### 3️⃣ Restart Backend Server

```bash
# Stop current server (Ctrl+C)
# Wait 2 seconds
# Restart
npm start
```

Wait for: `✅ Server running on port 5000`

### 4️⃣ Add Emergency Contacts

If not already added:

1. Login to app
2. Go to **Contacts** page
3. Click **Add Contact**
4. Enter: Name, Phone (format: `9876543210`), Email (optional), Relation
5. Click **Save Contact**

**Format matters:**
- ✅ `9876543210` 
- ✅ `+91-9876543210`
- ❌ `+91 9876543210` (space breaks it)
- ❌ `(98) 7654 3210` (special chars)

### 5️⃣ Register NFC Tag

1. Go to **Features** page
2. Scroll to **NFC Tag Registration**
3. Enter your tag ID (or scan with NFC)
4. Click **Register**
5. See "✅ Tag registered successfully"

### 6️⃣ Test NFC Alert

1. Open browser to: `http://localhost:5000/nfc.html?tag=YOUR_TAG_ID`
2. Wait 3 seconds (countdown shows)
3. Alert sends automatically
4. Check your phone for SMS
5. See success message with contact count

---

## 🐛 Troubleshooting

### SMS Still Not Sending?

Check these in order:

**Step 1:** Verify `.env` variables
```bash
# In backend folder, run:
npm start
# Look for console output, check if "Twilio not configured" appears
```

**Step 2:** Verify emergency contacts saved
1. Go to Contacts page
2. Phone numbers should show with `+91` prefix
3. At least 1 contact required

**Step 3:** Check backend console for errors
When you trigger NFC, console should show:
```
✅ SMS sent to +919876543210: SMa1b2c3d4e5f6g7h8i9j0k1l2m
```

If you see error messages, copy them and check against this list:

| Error | Cause | Fix |
|-------|-------|-----|
| "Twilio not configured" | Missing env vars | Add all 3 Twilio vars to .env |
| "Invalid phone number" | Wrong format | Use `9876543210` format |
| "Service not found" | Wrong MESSAGING_SID | Get correct SID from Twilio |
| "Invalid credentials" | Wrong ACCOUNT_SID/TOKEN | Copy from Twilio Console |

---

## 📱 Expected Behavior

When you tap NFC tag:

### ✅ What Should Happen:
1. **Page opens** with countdown: `3 2 1`
2. **Location found** with map showing
3. **SMS sending** status appears
4. **Success message** shows "Alert Sent! X contact(s) notified"
5. **Your phone rings/vibrates** with SMS from EMPOWER SAFE
6. SMS contains: Your name, emergency alert, Google Maps link

### ❌ What Means Failure:
1. Countdown reaches 0 but nothing happens
2. "Alert Failed" message appears
3. No SMS received on phone
4. Console shows error starting with `❌ SMS failed`

---

## 🔗 Important Links

- **SMS Setup Guide**: `docs/guides/SMS_SETUP_GUIDE.md`
- **Twilio Console**: https://www.twilio.com/console
- **Twilio Messaging Services**: https://www.twilio.com/console/sms/services

---

## 📞 SMS Message Format

When NFC triggers, contacts receive:

```
🚨 EMERGENCY ALERT from [Your Name]! Location: https://www.google.com/maps?q=19.0760,72.8777. Please check on them immediately. Time: 26/4/2026 10:30:45 AM
```

---

## 💾 File Updated

✅ `.env` - Fixed Twilio configuration

**Next Step:** Update `TWILIO_MESSAGING_SID` with your actual Messaging Service SID and restart backend.

---

**Last Updated:** April 26, 2026
