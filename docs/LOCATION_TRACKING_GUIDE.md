# Location Tracking & Map Visualization Guide

## 🗺️ How Location Tracking Works in EMPOWER SAFE

### 1. **Location Capture**
When a user triggers an SOS alert, the app automatically:
- Requests device GPS coordinates from the user's browser
- Captures latitude, longitude, and accuracy radius
- Converts GPS coordinates to a human-readable address (reverse geocoding)
- Stores all location data with the alert record

**Technical Flow:**
```
User Triggers SOS
    ↓
Location.getCurrentLocation() → Browser Geolocation API
    ↓
GPS Coordinates (lat, lng)
    ↓
Reverse Geocoding → Human-Readable Address
    ↓
Send to Backend + Emergency Contacts
```

### 2. **Location Sources**

#### **Primary: Browser Geolocation API**
- Uses device GPS, WiFi triangulation, and IP geolocation
- Accuracy varies: 5-10 meters (GPS) to 100+ meters (IP-based)
- Requires user permission (shown in browser location prompt)
- Works on: Desktop, Mobile, Tablet

#### **Fallback Scenarios:**
- User denies location permission → Alert sent without location
- GPS unavailable → Uses WiFi/IP-based location
- Airplane mode or offline → Alert sent with cached location or "unknown location"

### 3. **Data Storage**

**Alert Record Structure:**
```json
{
  "id": "alert-123",
  "userId": "user-456",
  "timestamp": "2026-04-15T10:30:00Z",
  "location": {
    "lat": 28.7041,
    "lng": 77.1025,
    "address": "Delhi, India"
  },
  "locationTrail": [
    {
      "lat": 28.7041,
      "lng": 77.1025,
      "timestamp": "2026-04-15T10:30:00Z"
    },
    {
      "lat": 28.7050,
      "lng": 77.1030,
      "timestamp": "2026-04-15T10:31:00Z"
    }
  ],
  "status": "active",
  "notifiedContacts": [...]
}
```

### 4. **Data Flow: Alert → Emergency Contacts**

```
User Triggers SOS
    ↓
Location Captured (GPS/WiFi)
    ↓
Alert Created in Database
    ↓
SMS Notification Sent:
    - Contact Name
    - Location Address
    - Google Maps Link
    - Alert Time
    ↓
Push Notification (if enabled):
    - Alert Type: "Emergency SOS"
    - Location on Map
    ↓
Contact Acknowledges (SMS reply, App notification)
```

**Example SMS Received by Emergency Contact:**
```
🚨 EMERGENCY ALERT from Sarah
Location: MG Road, Bengaluru 560001 
View on Map: https://maps.google.com/?q=28.70,77.10
Time: 2026-04-15 10:30 AM
Status: PENDING RESPONSE
Reply: YES/NO/HELP
```

---

## 📱 Location Features in EMPOWER SAFE

### **1. Current Location Display**
- **Where:** Dashboard, Features page
- **Updates:** Real-time GPS when location permission granted
- **Display:** Latitude, Longitude, Accuracy radius

### **2. Safety Map Page**
- **URL:** `/map.html`
- **Features:**
  - Interactive OpenStreetMap (no API key required)
  - Current location marker (blue dot)
  - All past SOS alerts as markers (red/orange/green)
  - Click any marker to see details
  - Zoom in/out controls
  - Center on current location button

### **3. Alert History Map View**
- **Location:** History page
- **Feature:** Click "📍 Map" button on any alert
- **Display:** Full-screen map modal showing:
  - Exact coordinates
  - Address
  - Time triggered
  - Alert status

### **4. Location Trail (Coming Soon)**
- Tracks GPS path during ongoing alert
- Shows movement history
- Useful for investigation and safety review

---

## 🌐 Maps Technology

### **Current Implementation: Leaflet.js + OpenStreetMap**

**Why Leaflet.js?**
- ✅ No API key required
- ✅ Lightweight (39 KB minified)
- ✅ Open source (BSD 2-Clause)
- ✅ Mobile responsive
- ✅ Works offline (with cached tiles)

**Supported Features:**
- Pan and zoom
- Custom markers (different colors for different alert levels)
- Popups with alert details
- Responsive on mobile
- Works in all modern browsers

### **Alternative Map Providers (Future Options)**

| Provider | Pros | Cons |
|----------|------|------|
| Google Maps | Feature-rich | Requires API key, costs money |
| Mapbox | Beautiful tiles | Requires API key, paid after free tier |
| Azure Maps | Enterprise support | Subscription required |
| OpenStreetMap | Free, no key needed | Community-maintained |

---

## 🔒 Privacy & Security Considerations

### **Location Data Security**
1. **Encryption in Transit:** All location data sent over HTTPS
2. **Encryption at Rest:** Database encrypted with MongoDB encryption
3. **Access Control:** Only alert creator and notified contacts can view location
4. **Data Retention:** Alerts kept for 6 months, then archived/deleted per user preference
5. **Opt-Out:** Users can disable automatic location sharing in profile settings

### **User Privacy Controls**
```
Profile Settings
├── Auto-share location: ON/OFF
├── Location accuracy: High/Medium/Low
├── Shared with: Emergency contacts only
└── Data retention: User-configurable
```

---

## 🛠️ Technical Implementation Details

### **Backend Location Endpoints**

#### **Create SOS with Location**
```bash
POST /api/alerts/create
{
  "description": "Emergency SOS Alert",
  "location": {
    "lat": 28.7041,
    "lng": 77.1025,
    "address": "Delhi, India"
  },
  "alertLevel": "critical"
}
```

#### **Reverse Geocoding**
```bash
GET /api/location/geocode?lat=28.7041&lng=77.1025
Response: {
  "address": "MG Road, Bengaluru 560001",
  "city": "Bengaluru",
  "country": "India"
}
```

#### **Get Alert with Location**
```bash
GET /api/alerts/:alertId
Response: {
  "id": "alert-123",
  "location": { lat, lng, address },
  "locationTrail": [...]
}
```

### **Frontend Location APIs**

#### **JavaScript Location Helper**
```javascript
// In app.js - Location class
class Location {
  static async getCurrentLocation() {
    // Uses browser Geolocation API
    // Returns: { lat, lng, accuracy }
  }

  static async updateAlertLocation(lat, lng) {
    // Updates real-time location trail
  }

  static async shareLocation(contactIds) {
    // Shares location with specific contacts
  }
}
```

#### **Usage in SOS Trigger**
```javascript
// In dashboard.js
const location = await Location.getCurrentLocation();
const response = await api.createSOS(
  'Emergency SOS Alert',
  location,  // Automatically included
  alertType,
  alertLevel
);
```

---

## 📊 Map Markers & Legend

### **Marker Colors by Alert Status**

| Color | Emoji | Meaning | Action |
|-------|-------|---------|--------|
| 🔵 Blue | 📍 | Current user location | Real-time position |
| 🔴 Red | 🚨 | Critical SOS alert | Immediate danger |
| 🟠 Orange | ⚠️ | Warning alert | Caution zone |
| 🟢 Green | ✓ | Resolved alert | Safe/handled |

### **Marker Details**
- Click marker → Shows popup with:
  - Alert level
  - Address
  - Time triggered
  - Status
- Hover marker → Shows tip with address preview

---

## 🚀 Quick Start: Using Maps

### **1. View Your Current Location**
```
1. Go to Dashboard
2. Scroll to "Location Sharing" card
3. Click "Configure" → Opens map with your position
```

### **2. View All Alerts on Map**
```
1. Navigate to Map (navbar)
2. See all past SOS alerts marked
3. Click alert marker for details
4. Use zoom controls to explore
```

### **3. View Alert Location from History**
```
1. Go to History page
2. Find alert in table
3. Click "📍 Map" button
4. Full-screen map modal opens
5. Click details to see address + coordinates
```

### **4. Share Alert with Others**
```
1. View alert on map
2. Click "Share" button
3. Generate shareable link
4. Send to family/authorities
```

---

## ⚠️ Common Issues & Solutions

### **Issue: "Location unavailable"**
**Cause:** Browser location permission denied
**Solution:** 
- Chrome: Click 🔒 in address bar → Allow location
- Firefox: Settings → Privacy → Location → Allow
- iPhone: Settings → App Permissions → Location → Always

### **Issue: "Location is inaccurate"**
**Cause:** Using WiFi/IP-based location instead of GPS
**Solution:**
- Enable GPS in device settings
- Go outdoors for better GPS signal
- Wait 30 seconds for GPS to lock

### **Issue: "Map won't load"**
**Cause:** OpenStreetMap tiles blocked or internet issue
**Solution:**
- Check internet connection
- Try refreshing page
- Check if location services enabled
- Try different browser

### **Issue: "Can't see all alerts on map"**
**Cause:** Alerts without location data filtered out
**Solution:**
- Only alerts with GPS coordinates shown
- Some old alerts may not have location
- Check History page for details

---

## 🔐 Permissions Required

### **Browser Permissions**
```
┌─ Geolocation
│  ├─ Latitude & Longitude capture
│  ├─ Device GPS access
│  └─ Location: site-specific
├─ Notification
│  ├─ Alert confirmations
│  └─ Emergency contact replies
└─ Storage
   ├─ Auth token (localStorage)
   └─ Alert cache (IndexedDB)
```

### **Device Permissions (Mobile)**
```
iOS:
• Location (Always/While Using/Never)
• Notifications
• Camera (for photo uploads - future)
• Microphone (for audio recording - future)

Android:
• ACCESS_FINE_LOCATION (GPS)
• ACCESS_COARSE_LOCATION (WiFi/Mobile)
• POST_NOTIFICATIONS (alerts)
```

---

## 💡 Tips for Better Location Accuracy

1. **Enable GPS:** Go to device settings and enable GPS
2. **Clear line of sight:** Move to open area (outdoors better than indoors)
3. **Wait for lock:** GPS needs 30-60 seconds to acquire signal
4. **Check accuracy:** App shows accuracy radius (5-50 meters)
5. **Update OS:** Ensure device OS is updated for better GPS
6. **Disable airplane mode:** Airplane mode blocks GPS and cellular

---

## 🔄 Future Location Features

- [ ] Live location streaming (real-time trail)
- [ ] Geofencing (alert when leaving safe zones)
- [ ] Safe place directory (hospitals, police stations)
- [ ] Location history heatmap
- [ ] Offline caching of maps
- [ ] Integration with emergency services API
- [ ] Automatic location updates every 30 seconds during alert
- [ ] Multi-location tracking (follow group)

---

## 📞 Support

For location-related issues:
1. Check browser console for errors (F12 → Console)
2. Verify location permissions enabled
3. Try different browser
4. Clear browser cache and cookies
5. Contact support@empowersafe.com

---

**Last Updated:** April 15, 2026
**Version:** 2.0 - Full Map Integration
