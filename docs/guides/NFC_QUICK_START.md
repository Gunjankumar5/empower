# NFC Quick Start - 5 Minutes

## What You Need
- ✅ Android phone with NFC
- ✅ Google Chrome browser
- ✅ NFC tag (or use phone's NFC app to simulate)
- ✅ EMPOWER SAFE account

## Step-by-Step

### 1. Get an NFC Tag (If You Don't Have One)
- Buy from Amazon: Search "NFC NTAG216" (~$10 for 5 pack)
- Or use your phone: Download "NFC TagWriter" app to simulate tags

### 2. Login to Your App
```
Navigate to: http://localhost:3000 (or your deployment URL)
Login with your credentials
```

### 3. Register Your Tag
```
Go to: Dashboard → Features → Register Your NFC Tag
Click: "Scan NFC Tag"
Action: Hold tag near phone back
Result: Tag ID appears in "Current Tag ID"
```

### 4. Test the Alert
```
Option A - From Your Phone:
  1. Give phone to someone else
  2. Have them tap the NFC tag
  3. Should send alert to your contacts

Option B - From Backend:
  POST http://localhost:5000/api/nfc/scan
  Body: {"tagId": "YOUR_TAG_ID_HERE"}
  Should return: Alert created
```

## Verify It Works
- ✅ Check Features page shows your tag ID
- ✅ Check Profile shows your tag ID
- ✅ Check alert was created in History
- ✅ Check emergency contacts received notification

## Common Issues

| Issue | Fix |
|-------|-----|
| "Web NFC not supported" | Use Chrome on Android, not desktop |
| "Scan times out" | Hold tag closer, remove thick case |
| "Tag not found" | Verify tag works with NFC reader app |
| "Alert not sent" | Make sure you have emergency contacts |

## Next Steps
- [Full NFC Guide](./NFC_CONNECTION_GUIDE.md)
- [Test Script](./test-nfc.ps1)
