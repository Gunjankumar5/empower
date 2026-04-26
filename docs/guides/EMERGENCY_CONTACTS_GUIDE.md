# Emergency Contacts Setup Guide

## Phone Number Format Requirements

EMPOWER SAFE uses **Twilio** to send emergency SMS alerts. Twilio requires phone numbers in **E.164 format**, which includes the country code.

### Supported Formats

The app accepts phone numbers in several formats and automatically converts them to the correct E.164 format:

#### ✅ Accepted Formats (Will be converted automatically)
- **10-digit US number**: `2125551234` → converts to `+12125551234`
- **US number with hyphens**: `212-555-1234` → converts to `+12125551234`
- **US number with parentheses**: `(212) 555-1234` → converts to `+12125551234`
- **US number with country code**: `+1-212-555-1234` → converts to `+12125551234`
- **International format**: `+44 20 7946 0958` (UK) → converts to `+442079460958`
- **International with hyphens**: `+49-30-12345678` (Germany) → converts to `+493012345678`

#### E.164 Format Examples
- **USA**: `+1` + 10 digits = `+12025551234`
- **UK**: `+44` + 9-10 digits = `+442079460958`
- **India**: `+91` + 10 digits = `+919876543210`
- **Canada**: `+1` + 10 digits = `+14165551234`
- **Germany**: `+49` + 9-11 digits = `+493012345678`

## How to Add Emergency Contacts

1. **Go to Contacts Page**
   - Click "Contacts" in the navigation menu
   - Click "Add Contact" button

2. **Fill in Contact Details**
   - **Name**: Contact person's name (e.g., "Mom", "Best Friend Amy")
   - **Phone Number**: Enter in any of the accepted formats above
   - **Email**: (Optional) Contact's email address
   - **Relation**: (Optional) Relationship like "Mother", "Friend", "Sister"

3. **Example Entry**
   ```
   Name: Sarah's Mom
   Phone: 212-555-1234  (or +1-212-555-1234, or 2125551234)
   Email: mom@example.com
   Relation: Mother
   ```
   
   The system will automatically format to: `+12125551234`

4. **Save Contact**
   - Click "Save Contact"
   - You'll see confirmation message

## What Happens During SOS

When you trigger an SOS alert:

1. **Location is captured** - Your current GPS location
2. **Location is geocoded** - Converted to a readable address
3. **Emergency contacts are notified** - SMS sent to each contact with:
   - Alert message: "EMERGENCY ALERT - Help needed!"
   - Location: Address and Google Maps link
   - Your name and emergency status

4. **Phone numbers must be valid**
   - Each contact's phone number is verified
   - Must be in E.164 format or convertible to it
   - Contact must be real and reachable

## Troubleshooting

### ❌ "Invalid phone number format" Error
- **Cause**: Phone number cannot be converted to E.164 format
- **Solution**: 
  - For US numbers, use format: `212-555-1234` or `+1-212-555-1234`
  - For international, include country code: `+44 20 7946 0958`
  - Remove spaces, parentheses if app still rejects it

### ❌ SMS Not Received
- **Possible Causes**:
  1. Phone number is test/invalid
  2. Twilio account has no balance
  3. Phone number is blocked or on Do Not Disturb
  4. SMS timeout (may take 1-2 minutes)

- **Solution**:
  1. Verify phone numbers are real and active
  2. Check Twilio balance at https://www.twilio.com/console
  3. Add real phone numbers for testing
  4. Wait 2-3 minutes before assuming SMS failed
  5. Check Twilio logs: https://www.twilio.com/console/sms/logs

### ❌ Contact Edit Shows Strange Format
- **Cause**: Phone numbers are saved in E.164 format (+1234567890)
- **Normal behavior** - When editing, you can type in any accepted format
- **Solution**: Type new number in any format, system will convert it

## Testing Your Setup

### Step 1: Add Real Emergency Contacts
1. Use real, active phone numbers
2. Numbers you can actually receive SMS on
3. Include country code for international numbers

### Step 2: Verify in Contact List
1. Go to Contacts page
2. Check that all contacts are listed
3. Phone numbers should show in full format

### Step 3: Send Test SOS
1. Go to Dashboard
2. Click SOS button (or use your NFC tag)
3. Allow location access when prompted
4. Check your phone for SMS messages

### Step 4: Monitor Alert History
1. Go to History page
2. Click on alert to see details
3. Check notification status:
   - ✅ **Sent** = SMS successfully queued with Twilio
   - ❌ **Failed** = Phone number invalid or Twilio error
   - ⏭️ **Skipped** = Twilio not configured

## Support

If you're still having issues:

1. **Check backend logs** - See which phone numbers are being sent
2. **Verify Twilio credentials** - Ensure account SID and auth token are correct
3. **Check account balance** - Twilio requires credit to send SMS
4. **Test with a simple SMS service** - Ensure your phone can receive SMS
5. **Contact support** - Report the issue with phone number format used

## Security Notes

- ⚠️ Phone numbers are stored in your database
- ⚠️ Keep your Twilio credentials secure
- ⚠️ Only add contacts you trust
- ✅ SMS messages include your location - only send to trusted people
- ✅ SOS alerts are logged for safety verification
