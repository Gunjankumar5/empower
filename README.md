# EMPOWER SAFE - Women's Emergency Safety App

A production-grade, modern web application for women's personal safety with real-time emergency alerts, location sharing, and contact management.

## 🎯 Features

### Core Safety Features
- **One-Tap SOS Emergency Alert** - Trigger emergency alerts with a single tap
- **Live Location Sharing** - Automatically share your real-time location with emergency contacts
- **Instant Notifications** - SMS and push notifications to trusted contacts
- **Emergency Contact Management** - Add, edit, and manage trusted contacts
- **Incident History** - Track all SOS events with timestamps and status
- **NFC Device Support** - Register NFC cards for alternative emergency triggering

### User Management
- Secure user authentication with JWT tokens
- Profile management and safety preferences
- Emergency message customization
- Device status monitoring

### User Experience
- **Mobile-First Design** - Fully responsive and touch-optimized
- **Dark Mode Support** - Optional dark theme for low-light situations
- **Accessible Interface** - Large buttons and clear typography for panic situations
- **One-Hand Usable** - SOS button designed for single-hand operation
- **Production-Quality Code** - No frameworks, vanilla JS with best practices

## 📂 Project Structure

```
empower-backend/
├── src/
│   ├── public/                 # Frontend files (all HTML, CSS, JS)
│   │   ├── index.html         # Home page
│   │   ├── login.html         # Login page
│   │   ├── register.html      # Registration with contact setup
│   │   ├── dashboard.html     # Main app dashboard with SOS button
│   │   ├── contacts.html      # Emergency contacts management
│   │   ├── profile.html       # User profile & safety settings
│   │   ├── history.html       # Incident history & tracking
│   │   ├── styles.css         # Complete styling system
│   │   └── app.js             # Shared utilities and API client
│   ├── routes/                 # API endpoints
│   ├── models/                 # Database models
│   ├── config/                 # Configuration files
│   ├── services/               # Business logic
│   └── index.js               # Server entry point
├── package.json
├── .env                        # Environment variables
└── README.md
```

## 🛠 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern design with CSS variables and gradients
- **JavaScript (ES6+)** - No frameworks, production-level vanilla JS
- **Socket.io Client** - Real-time notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Socket.io** - Real-time communication

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB connection string
- NPM or Yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   cd empower-backend
   npm install
   ```

2. **Configure environment**
   ```bash
   # .env file already contains:
   MONGO_URI=mongodb+srv://...
   PORT=5000
   ```

3. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

4. **Access the app**
   - Open http://localhost:5000 in your browser
   - Home page loads automatically

## 📱 Pages Overview

### 1. **Home Page** (`/`)
- Attractive hero section with safety slogan
- Feature highlights with emojis
- How it works section
- Safety statistics
- User testimonials
- Call-to-action buttons

### 2. **Register** (`/register.html`)
- Two-step registration process
- Step 1: Personal information (name, email, phone, password)
- Step 2: Emergency contacts (minimum 2 required)
- Real-time form validation
- Smooth transitions between steps

### 3. **Login** (`/login.html`)
- Email/password authentication
- JWT token storage
- "Forgot password" link
- Persistent session
- Error handling with user feedback

### 4. **Dashboard** (`/dashboard.html`)
- Welcome message personalized with user's name
- **Large SOS Button** - Pulsing, accessible, panic-friendly
- Quick action cards (Contacts, Settings, History)
- System status indicators
- Recent activity feed
- Safety tips section

### 5. **Emergency Contacts** (`/contacts.html`)
- List all emergency contacts
- Add new contacts with name, relation, phone
- Edit existing contacts
- Delete contacts with confirmation
- Contact count display
- Modal-based add contact form

### 6. **Profile & Settings** (`/profile.html`)
- Personal information (name, email, phone)
- Emergency message customization
- Safety preferences (auto-location, notifications)
- NFC device registration
- Device status (geolocation, notifications)
- Password change option
- Account deletion (security-protected)

### 7. **Incident History** (`/history.html`)
- Complete list of all SOS events
- Filter by status (pending, acknowledged, resolved)
- Filter by date range (today, week, month)
- Click to view detailed incident information
- Location, timestamp, and metadata display
- Status badge indicators

## 🎨 Design System

### Color Palette
- **Primary:** #6d28d9 (Purple) - Trust and safety
- **Accent:** #ec4899 (Pink) - Empowerment
- **Danger:** #dc2626 (Red) - Emergency/SOS
- **Success:** #10b981 (Green) - Confirmation
- **Warning:** #f59e0b (Amber) - Caution

### Typography
- Font: System fonts for best performance
- Large, readable fonts (min 16px on mobile)
- Clear hierarchy and spacing

### Components
- **Cards** - Content containers with hover effects
- **Buttons** - Multiple styles (primary, secondary, danger, ghost)
- **Forms** - Large inputs with clear labels and validation feedback
- **Badges** - Status indicators
- **Modals** - User confirmations and details
- **Alerts** - Success, error, warning, info messages

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt rounds
- **CORS** - Cross-origin protection
- **Input Validation** - Client and server-side
- **Protected Routes** - Auth middleware for private pages
- **Session Management** - LocalStorage for tokens
- **Error Handling** - Graceful error messages without exposing sensitive data

## 📲 API Integration

### Authentication Endpoints
```
POST /api/auth/register    - Create new account
POST /api/auth/login       - Login user
```

### User Endpoints
```
GET  /api/users/profile          - Get user profile
PATCH /api/users/profile         - Update profile
POST /api/users/contacts         - Add contact
GET  /api/users/contacts         - Get all contacts
DELETE /api/users/contacts/:id   - Remove contact
```

### Emergency Endpoints
```
POST /api/incident/create        - Create SOS alert
GET  /api/incident/history       - Get incident history
GET  /api/incident/:id           - Get specific incident
```

### NFC Endpoints
```
POST /api/nfc/register           - Register NFC device
```

## 🎯 Accessibility & UX Features

### For Panic Situations
- **Large SOS Button** - 140px diameter, easily tappable
- **Pulsing Animation** - Visual feedback that button is active
- **High Contrast** - Red gradient against white/light backgrounds
- **Minimal Friction** - SOS accessible from dashboard immediately after login
- **Confirmation Modal** - Prevents accidental triggers
- **One-Hand Operation** - All important controls within thumb reach

### For Low-Light Usage
- **Dark Mode Support** - Full dark theme with `data-theme="dark"`
- **High Contrast Text** - WCAG AA compliant
- **Large Touch Targets** - Minimum 48px for buttons
- **Clear Visual Feedback** - All interactions provide visual response

### General Accessibility
- **Semantic HTML** - Proper heading hierarchy
- **Form Labels** - All inputs have associated labels
- **ARIA Labels** - Screen reader support
- **Focus Indicators** - Clear keyboard navigation
- **Color Independence** - Don't rely on color alone for information

## 📊 Frontend Architecture

### Shared Utilities (app.js)

**API Class**
- RESTful API client with JWT support
- Handles all backend communication
- Centralized error handling
- Token management

**DOM Class**
- Query selectors
- Element manipulation
- Event handling
- CSS class management

**UI Class**
- Toast notifications
- Modal management
- Loading states
- Confirmation dialogs

**Auth Class**
- Authentication state management
- User session handling
- Login/logout flows
- Protected route redirects

**Validator Class**
- Email, phone, password validation
- Form error displays
- Real-time validation feedback

**Location Class**
- Geolocation API wrapper
- Error handling
- Permission management

### Page Structure
Each HTML page includes:
1. Meta tags (viewport, description, theme-color)
2. Navigation bar (sticky, responsive)
3. Page content (main container)
4. Footer
5. Scripts (shared app.js + page-specific logic)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Home page loads and displays correctly
- [ ] Registration flow works end-to-end
- [ ] Login authentication works
- [ ] Dashboard loads user data
- [ ] SOS button triggers emergency alert
- [ ] Contacts can be added/edited/deleted
- [ ] Profile updates save correctly
- [ ] Incident history displays and filters
- [ ] Responsive design on mobile devices
- [ ] Dark mode toggle works
- [ ] Logout clears session

## 📈 Performance Optimizations

- Minimal CSS (production-optimized)
- No external dependencies required
- LocalStorage for session persistence
- Efficient DOM queries
- Debounced filters
- Lazy loading for images (if used)

## 🚨 Emergency Response Flow

1. User taps SOS button
2. Confirmation modal appears
3. User confirms alert
4. Geolocation requested
5. API creates incident record
6. All emergency contacts notified via SMS/push
7. Incident status tracked in real-time
8. User can view status in history

## 📞 Support & Contact

For issues or feature requests, contact the development team through the app's contact page.

## 📄 License

EMPOWER SAFE © 2026. All rights reserved.

---

**Built with 🛡️ for women's safety.**
