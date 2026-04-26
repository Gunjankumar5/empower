# EMPOWER SAFE - NFC Tag Connection Guide

## Overview
NFC (Near Field Communication) tags provide an alternative way to trigger emergency alerts in your EMPOWER SAFE application. When someone taps a registered NFC tag with an NFC-enabled Android phone, it automatically sends an SOS alert to your emergency contacts.

---

## System Architecture

### Backend Flow
1. **Register Tag** → `/api/profile/nfc` → Stores `tagId` in user's profile
2. **Scan Tag** → `/api/nfc/scan` → Creates alert with location → Notifies contacts

### Frontend Flow
1. Navigate to Features page
2. Use Web NFC API to read tag (if supported)
3. Send tag ID to backend
4. Backend registers tag to user profile

---

## Setup Instructions

### Step 1: Enable NFC on Your Device
- Device must support NFC (most modern Android phones)
- Enable NFC in device settings
- Use Chrome browser (other browsers may not support Web NFC API)

### Step 2: Create/Obtain an NFC Tag
Physical NFC tags you can use:
- **NTAG216** - Most common, readable
- **MIFARE Classic**
- **ISO14443 Type 2 compatible tags**

**Where to get tags:**
- Amazon: Search "NFC tags NTAG"
- Electronics stores: Stickers, cards, or keychains
- Price: ~$0.50-$2 per tag

### Step 3: Register Your NFC Tag

#### Method A: Automatic Scanning (Recommended)
```
1. Log in to EMPOWER SAFE
2. Go to Features → Register Your NFC Tag
3. Click "Scan NFC Tag" button
4. Hold tag near back of Android device
5. Wait for tag ID to be detected
6. Tag is now registered!
```

#### Method B: Manual Entry
```
1. Use an NFC reader app to get the tag ID
2. On Features page, enter tag ID in "Manual Tag Registration"
3. Click "Save Tag ID"
4. Tag is now registered!
```

---

## NFC Tag Components

### 1. Tag ID / Serial Number
- Unique identifier for each tag
- Auto-detected by Web NFC API
- Examples: `04:2A:5B:82:D1:42:71` or `NFC-EMPOWER-001`

### 2. NDEF Data (Optional)
- Encoded data on the tag (URLs, text, etc.)
- For basic alert triggering, only Serial Number is needed
- Can add custom data if desired

---

## API Endpoints Reference

### Register Tag to Profile
```http
POST /api/profile/nfc
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "tagId": "04:2A:5B:82:D1:42:71"
}

Response:
{
  "success": true,
  "data": {
    "nfcTagId": "04:2A:5B:82:D1:42:71"
  }
}
```

### Scan/Tap Tag (Public)
```http
POST /api/nfc/scan
Content-Type: application/json

{
  "tagId": "04:2A:5B:82:D1:42:71"
}

Response:
{
  "success": true,
  "data": {
    "userId": "user_id_here",
    "alert": {
      "id": "alert_id",
      "type": "nfc",
      "status": "pending",
      "notificationsSent": 3
    }
  }
}
```

---

## Use Cases

### 1. Keychain Tags
- Attach NFC tag to keychain
- Keep with you at all times
- Quick emergency alert trigger

### 2. Bedside Tags
- Place NFC tag on nightstand
- Tap in case of emergency at home
- Alerts contacts with location

### 3. Vehicle Tags
- Place in car dashboard
- Tap for emergencies while driving
- Location-based alert to contacts

### 4. Safe Zone Tags
- Register tags in safe locations (workplace, gym, library)
- Tap if you feel unsafe, immediately alerts contacts

---

## Troubleshooting

### Issue: "Web NFC is not supported in this browser"
**Solution:** Use Google Chrome on Android (Web NFC requires Chrome 69+)

### Issue: "NFC scan timed out"
**Solution:** 
- Hold device still
- Place tag closer to device back
- Remove any thick phone case
- Ensure tag is not damaged

### Issue: Tag ID not detecting
**Solution:**
- Try a different NFC reader app to verify tag works
- Replace tag if it's not responding
- Check if phone's NFC is enabled

### Issue: Alert not sent after scanning
**Solution:**
- Verify tag is registered in Features page
- Check if user has emergency contacts added
- Verify location services are enabled
- Check backend logs for errors

---

## Technical Details

### Web NFC API Support
- **Status:** Available in Chrome 75+ on Android
- **Limitations:** 
  - Desktop/iOS: Not supported (use manual registration)
  - Tag must be Type 2 NDEF compatible
  - Scan timeout: 20 seconds

### What Happens When Tag is Scanned
1. Backend receives tag ID
2. Finds associated user
3. Retrieves user's last known location
4. Creates alert record
5. Sends SMS/notifications to emergency contacts
6. Logs alert in history

---

## Advanced: Programming NFC Tags

### Option 1: Mobile App (Easy)
1. Download "NFC Tools" or "TagWriter" from Play Store
2. Open app
3. Tap "Write"
4. Select tag type (NDEF)
5. Add record: Text = tag ID or URL
6. Tap tag to write

### Option 2: Web Interface
Use NTAG I²C Plus web interface or similar tools to:
- Write NDEF records
- Add custom metadata
- Set password protection

### Option 3: Desktop Tool
- Download NXP Tagwriter desktop software
- Connect USB NFC reader
- Write tags in bulk for distribution

---

## Security Considerations

⚠️ **Important:**
- NFC tags are **publicly readable** - anyone can tap them
- This is by design - anyone can trigger alerts for a registered user
- Perfect for:
  - Allowing trusted people to summon help
  - Emergency responders to contact you
  - Quick alert without phone access

🔐 **Best Practices:**
- Keep tags in accessible but safe locations
- Add context (e.g., "Press in emergency only")
- Monitor alert history for false activations
- Update emergency contacts regularly

---

## Testing Checklist

- [ ] Device has NFC enabled
- [ ] Using Chrome browser on Android
- [ ] Have an NFC tag (physical or via app)
- [ ] Logged in to EMPOWER SAFE
- [ ] Added at least one emergency contact
- [ ] Can scan tag without errors
- [ ] Tag appears in Features page
- [ ] Tag is showing in Profile
- [ ] Emergency contacts received alert after scan
- [ ] Alert location is accurate

---

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Review backend logs for API errors
3. Test with multiple NFC tags
4. Try on different Android device if available
5. Ensure backend server is running

---

## Future Enhancements

Potential features to add:
- [ ] NFC tag loss alerts
- [ ] Multiple tags per user
- [ ] Tag geofence triggers
- [ ] Encrypted NDEF payloads
- [ ] Tag activity logging
- [ ] Custom alert messages for NFC scans
