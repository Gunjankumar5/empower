# 📁 EMPOWER Backend - Project Structure

## Root Directory
Essential configuration files only:
- `package.json` - npm dependencies and scripts
- `docker-compose.yml` - Docker setup
- `.env` - Environment variables (local, not in git)
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules
- `README.md` - Main project documentation
- `render.yaml` - Deployment configuration

---

## 📁 Project Folders

### `/empower-backend` - Node.js Backend Server
```
empower-backend/
├── src/
│   ├── index.js                 # Main server entry point
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── data/
│   │   ├── contacts.json       # Emergency contacts data
│   │   ├── credentials.json    # API credentials
│   │   └── queries.json        # Database queries
│   ├── middlewares/
│   │   └── auth.js             # Authentication middleware
│   ├── models/
│   │   ├── Alert.js            # Alert schema (location tracking)
│   │   ├── Geofence.js         # Geofence zones schema
│   │   └── user.js             # User schema (NFC tags)
│   ├── routes/
│   │   ├── alerts.js           # Alert endpoints
│   │   ├── auth.js             # Login/register endpoints
│   │   ├── contacts.js         # Emergency contacts endpoints
│   │   ├── geofences.js        # Geofencing endpoints
│   │   ├── nfc.js              # NFC tag scanning
│   │   └── profile.js          # User profile endpoints
│   └── services/
│       ├── alertService.js     # Alert business logic
│       ├── fcm.js              # Firebase Cloud Messaging
│       ├── geofenceService.js  # Geofencing logic
│       └── twilio.js           # SMS sending service
├── Dockerfile                  # Docker container setup
├── docker-compose.yml          # Docker compose config
├── package.json                # Backend dependencies
└── README.md                   # Backend documentation
```

**Key Features:**
- REST API with Express.js
- MongoDB with Mongoose ODM
- Real-time location tracking with polylines
- Geofence monitoring (radius-based)
- Twilio SMS integration
- Firebase Cloud Messaging (push notifications)
- NFC tag registration and scanning

---

### `/empower-frontend` - Frontend Application
```
empower-frontend/
├── public/
│   ├── index.html              # Landing page
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── dashboard.html          # Main dashboard
│   ├── profile.html            # User profile
│   ├── features.html           # Feature showcase
│   ├── contacts.html           # Emergency contacts
│   ├── nfc.html                # NFC alert page with live map
│   ├── history.html            # Alert history with trails
│   ├── geofences.html          # Geofence view (user)
│   ├── admin-geofences.html    # Geofence creation (address search)
│   ├── map.html                # Map page
│   ├── app.js                  # Global utilities & API calls
│   ├── pages.js                # Page initialization logic
│   ├── features.js             # Feature-specific logic
│   ├── advanced-location.js    # Location tracking utilities
│   └── styles.css              # Global styles
├── server.js                   # Frontend server
├── package.json                # Frontend dependencies
└── README.md                   # Frontend documentation
```

**Key Features:**
- Responsive HTML5 UI
- Real-time location tracking with Leaflet.js maps
- Address search with Nominatim API (OpenStreetMap)
- Interactive geofence creation with drag-to-adjust
- Alert history with movement trails
- Emergency contacts management
- NFC tag registration and triggering
- Mobile-friendly responsive design

---

### `/docs` - Project Documentation
```
docs/
├── guides/                     # User guides and tutorials
│   ├── QUICK_START.md         # Getting started guide
│   ├── NFC_QUICK_START.md     # NFC tag setup guide
│   ├── NFC_CONNECTION_GUIDE.md # Detailed NFC connection
│   ├── GEOFENCING_GUIDE.md    # Geofencing features
│   ├── GEOFENCING_TESTING_GUIDE.md # Testing geofences
│   ├── EMERGENCY_CONTACTS_GUIDE.md # Setting up contacts
│   ├── SOS_SMS_TESTING_GUIDE.md # Testing SMS alerts
│   └── SMS_FIX_SUMMARY.md     # SMS troubleshooting
├── reports/                    # Status and diagnostic reports
│   ├── FINAL_STATUS_REPORT.md # Overall project status
│   ├── GEOFENCING_IMPLEMENTATION_STATUS.md # Feature status
│   ├── SMS_FIX_STATUS_REPORT.md # SMS fixes and status
│   └── SMS_NOT_RECEIVING_DIAGNOSTIC.md # SMS diagnostics
└── screenshots/               # UI screenshots
```

---

### `/tests` - Testing Scripts
```
tests/
├── test-nfc.ps1               # NFC tag testing
├── test-sms-simple.ps1        # Basic SMS test
├── test-sms-comprehensive.ps1 # Full SMS test suite
├── test-sos-feature.ps1       # SOS feature testing
└── test-sos-final.ps1         # Final SOS integration tests
```

**Run tests:**
```powershell
./tests/test-nfc.ps1
./tests/test-sms-simple.ps1
./tests/test-sos-feature.ps1
```

---

### `/scripts` - Build and Deployment Scripts
```
scripts/
├── build.sh                   # Build automation
└── start.sh                   # Server startup script
```

**Run scripts:**
```bash
./scripts/build.sh
./scripts/start.sh
```

---

### `/.github` - GitHub Configuration
```
.github/
├── workflows/                 # CI/CD pipeline files
└── .gitignore                # GitHub-specific ignores
```

---

## 🎯 Quick Start

### Development Setup
```bash
# Install dependencies
cd empower-backend
npm install

cd ../empower-frontend
npm install

# Run servers
# Terminal 1 - Backend (port 5000)
cd empower-backend
npm start

# Terminal 2 - Frontend (port 3000)
cd empower-frontend
npm start
```

### Docker Deployment
```bash
docker-compose up -d
```

---

## 📌 File Organization Rules

### ✅ Keep in Root Only:
- `README.md` - Main documentation
- `package.json` - Package configuration
- `docker-compose.yml` - Docker setup
- `.env`, `.env.example` - Environment config
- `.gitignore` - Git ignore rules
- `render.yaml` - Deployment config

### 📁 Should Be Organized:
- Test files → `/tests`
- Documentation → `/docs/guides`
- Reports → `/docs/reports`
- Scripts → `/scripts`
- Screenshots → `/docs/screenshots`

---

## 🔧 Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Twilio (SMS)
- Firebase Cloud Messaging
- JWT Authentication

**Frontend:**
- HTML5
- CSS3 + Responsive Design
- Vanilla JavaScript
- Leaflet.js (Maps)
- Nominatim API (Address Search)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Render (Hosting)

---

## 📖 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](docs/guides/QUICK_START.md) | Getting started |
| [NFC_QUICK_START.md](docs/guides/NFC_QUICK_START.md) | NFC setup |
| [GEOFENCING_GUIDE.md](docs/guides/GEOFENCING_GUIDE.md) | Geofencing features |
| [GEOFENCING_TESTING_GUIDE.md](docs/guides/GEOFENCING_TESTING_GUIDE.md) | Testing geofences |
| [SOS_SMS_TESTING_GUIDE.md](docs/guides/SOS_SMS_TESTING_GUIDE.md) | SMS testing |
| [FINAL_STATUS_REPORT.md](docs/reports/FINAL_STATUS_REPORT.md) | Project status |

---

## 🐛 Common Issues

### Location Tracking Not Working?
→ Check [docs/guides/QUICK_START.md](docs/guides/QUICK_START.md#location-tracking)

### SMS Not Sending?
→ See [docs/guides/SMS_FIX_SUMMARY.md](docs/guides/SMS_FIX_SUMMARY.md)

### Geofencing Issues?
→ Read [docs/guides/GEOFENCING_TESTING_GUIDE.md](docs/guides/GEOFENCING_TESTING_GUIDE.md)

### NFC Tag Problems?
→ Check [docs/guides/NFC_CONNECTION_GUIDE.md](docs/guides/NFC_CONNECTION_GUIDE.md)

---

## 📊 Project Statistics

- **Backend Files:** 20+ (routes, models, services)
- **Frontend Files:** 17 (HTML, JS, CSS)
- **Documentation:** 12 guides and reports
- **Test Scripts:** 5 comprehensive test suites
- **Features:** NFC, GPS Tracking, Geofencing, SMS Alerts, Emergency Contacts

---

**Last Updated:** April 26, 2026
