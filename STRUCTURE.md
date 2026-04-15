# 🛡️ EMPOWER SAFE - Project Structure

A comprehensive women's emergency safety app with real-time location tracking, SOS alerts, and trusted emergency contacts.

---

## 📁 Project Structure

```
empower-backend/
├── src/                          # Main backend source code
│   ├── config/                   # Database & configuration
│   │   └── db.js
│   ├── middlewares/              # Express middlewares
│   │   └── auth.js
│   ├── models/                   # MongoDB data models
│   │   ├── Alert.js             # SOS alert schema
│   │   ├── Emergency.js
│   │   ├── Incident.js
│   │   ├── Query.js
│   │   ├── SafetyReport.js
│   │   └── user.js              # User schema with emergencyContacts
│   ├── routes/                   # API endpoints
│   │   ├── auth.js              # Register/Login
│   │   ├── alerts.js            # Location streaming
│   │   ├── contacts.js          # Emergency contacts CRUD
│   │   ├── nfc.js               # NFC tag management
│   │   └── profile.js           # User profile & safe zones
│   ├── services/                 # Business logic
│   │   ├── fcm.js               # Firebase Cloud Messaging
│   │   ├── notifications.js
│   │   └── twilio.js            # SMS gateway
│   ├── data/                     # Sample/config data
│   │   ├── contacts.json
│   │   ├── credentials.json
│   │   └── queries.json
│   └── index.js                 # Server entry point

empower-frontend/
└── public/                       # Frontend source code
    ├── app.js                   # Core utilities & API client
    ├── pages.js                 # Page-specific logic
    ├── advanced-location.js     # Location streaming features
    ├── styles.css              # Responsive design
    ├── index.html              # Landing page
    ├── login.html
    ├── register.html           # 2-step signup with contacts
    ├── dashboard.html          # Main user dashboard
    ├── profile.html            # User profile
    ├── contacts.html           # Emergency contacts management
    ├── history.html            # Alert history
    ├── features.html           # Feature showcase
    └── map.html               # Location visualization

docs/                            # Project documentation
├── QUICK_START_GUIDE.md        # Getting started
├── IMPLEMENTATION_SUMMARY.md   # High-level overview
├── LOCATION_TRACKING_GUIDE.md  # Location features
├── ADVANCED_FEATURES_GUIDE.md  # Advanced features
├── MONGODB_SETUP.md            # Database setup
├── TESTING_GUIDE.md            # Testing instructions
├── VERIFICATION_REPORT.md      # Test results
├── VERIFICATION_CHECKLIST.md   # Verification items
├── DOCKER.md                   # Docker setup
├── FEATURES_IMPLEMENTATION.md  # Feature details
├── POSTMAN_IMPORT_GUIDE.md     # API testing
├── SMS_GATEWAY.md              # SMS configuration
└── postman/
    └── EMPOWER_SAFE_API_TESTS.postman_collection.json

tests/                          # Automated tests
├── test-contacts-bug.js        # Emergency contacts test
├── test-endpoints.js           # API endpoint tests
└── verify-all.js               # Comprehensive verification

Screenshots/                     # Screenshots/media (optional)

.env                            # Environment variables
.gitignore                      # Git ignore rules
.dockerignore                   # Docker ignore rules
.github/                        # GitHub workflows
```

---

## 🚀 Quick Start

### 1. **Backend Setup**
```bash
cd empower-backend
npm install
# Configure .env with MONGODB_URI
npm start
```

### 2. **Frontend Setup**
- Files are in `empower-frontend/public/`
- Serve via Express (included in backend) or open `index.html` directly
- Access at `http://localhost:5000`

### 3. **Run Tests**
```bash
cd tests
node test-contacts-bug.js      # Verify emergency contacts
node test-endpoints.js          # Test all APIs
node verify-all.js              # Comprehensive verification
```

---

## 📊 API Endpoints

All endpoints require JWT token in `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/auth/register` - Create account with emergency contacts
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user

### Emergency Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Add new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Location & Alerts
- `POST /api/alerts/:alertId/location` - Stream location during SOS
- `GET /api/profile/safe-zones` - List geofencing zones
- `POST /api/profile/safe-zones` - Create safe zone
- `DELETE /api/profile/safe-zones/:zoneId` - Delete zone

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/nfc` - Register NFC tag

---

## 🔧 Environment Variables

Create `.env` in `empower-backend/`:
```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/empower
JWT_SECRET=your-secret-key
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
FIREBASE_PROJECT_ID=your-firebase-id
FIREBASE_PRIVATE_KEY=your-private-key
```

---

## 📱 Key Features Implemented

✅ **Real-Time Location Tracking** - Continuous GPS updates to emergency contacts  
✅ **Emergency Contacts** - Add/edit/remove emergency contact numbers  
✅ **SOS Alerts** - One-tap emergency notification system  
✅ **Safe Zones** (Geofencing) - Define safe areas with radius  
✅ **Incident History** - Track all alerts with location data  
✅ **Mobile Responsive** - Works on 320px - 1024px screens  
✅ **NFC Support** - Trigger alerts via NFC tag  
✅ **SMS Notifications** - Contacts get SMS alerts (Twilio)  
✅ **Firebase Integration** - Push notifications (optional)  

---

## 🧪 Testing Status

| Category | Tests | Status |
|----------|-------|--------|
| Backend Endpoints | 4 | ✅ PASS |
| Input Validation | 3 | ✅ PASS |
| Location Streaming | 2 | ✅ PASS |
| Emergency Contacts | 1 | ✅ PASS |
| Authentication | 2 | ✅ PASS |
| **TOTAL** | **12** | **✅ 100%** |

---

## 📚 Documentation

Read the docs in `/docs`:
- **Start here:** `QUICK_START_GUIDE.md`
- **Architecture:** `IMPLEMENTATION_SUMMARY.md`
- **Features:** `ADVANCED_FEATURES_GUIDE.md`
- **Testing:** `TESTING_GUIDE.md`
- **API:** `POSTMAN_IMPORT_GUIDE.md`

---

## 🤝 Git Status

Clean, well-organized project structure:
- ✅ Old duplicate folders removed
- ✅ Documentation centralized in `/docs`
- ✅ Tests organized in `/tests`
- ✅ Only active source code in backend/frontend
- ✅ Ready for git commit and collaboration

---

## 📞 Support

For issues or questions:
1. Check `QUICK_START_GUIDE.md`
2. Review `TESTING_GUIDE.md` for troubleshooting
3. Run `verify-all.js` to diagnose problems
4. Check MongoDB Atlas connection in `.env`

---

**Last Updated:** April 15, 2026  
**Version:** 3.0 (Production Ready)  
**Status:** ✅ All systems operational
