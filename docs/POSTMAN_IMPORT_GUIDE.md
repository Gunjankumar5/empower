# 📮 Postman Collection - Import & Usage Guide

## ✅ Quick Import Instructions

### Step 1: Import the Collection

1. Open **Postman** (Desktop or Web)
2. Click **Import** button (top-left)
3. Select **Upload Files** tab
4. Choose: `EMPOWER_SAFE_API_TESTS.postman_collection.json`
5. Click **Import**

You should now see the collection in your left sidebar with folders for:
- 🔐 Authentication & Setup
- 📍 Real-Time Location Streaming
- 🏠 Safe Zones (Geofencing)
- 🔄 Complete Test Workflow
- 🐛 Troubleshooting

---

## ⚙️ Setup Environment Variables

### Create a Local Environment

1. Click the **Environment** dropdown (top-right)
2. Select **Create new environment**
3. Name it: `EMPOWER SAFE Local`
4. Add these variables:

| Variable | Example | Notes |
|----------|---------|-------|
| `base_url` | `http://localhost:5000` | Your backend address |
| `token` | `eyJhbGc...` | JWT token from login |
| `alert_id` | `63f7a1b2c3d...` | Active alert ID |
| `zone_id` | `a1b2c3d4e5f...` | Safe zone ID |

### How to Get These Variables

**base_url:**
```
Default: http://localhost:5000
Change if running on different host/port
```

**token:**
1. Open your app on `http://localhost:5000`
2. Go to Login page
3. Enter credentials
4. Check browser DevTools → Console
5. Copy token from response or localStorage
6. Paste into Postman environment

**alert_id:**
1. In your app, trigger a SOS alert
2. Check backend logs or network tab
3. Copy the alert ID from response
4. Paste into Postman `alert_id` variable

**zone_id:**
1. Run POST /api/profile/safe-zones
2. Copy `id` from response
3. Paste into Postman `zone_id` variable

---

## 🚀 Testing the Endpoints

### Recommended Test Order

#### **Test 1: Health Check** (Verify Backend)
```
GET http://localhost:5000/api/health
```
Expected: `{"status":"ok","message":"EMPOWER SAFE Backend is running"}`

---

#### **Test 2: Get Safe Zones** (Check if empty)
```
GET {{base_url}}/api/profile/safe-zones
Authorization: Bearer {{token}}
```
Expected: `{"success":true,"data":{"zones":[]}}`

---

#### **Test 3: Create a Zone**
```
POST {{base_url}}/api/profile/safe-zones
Authorization: Bearer {{token}}
Body:
{
  "name": "My Home",
  "lat": 28.6139,
  "lng": 77.2090,
  "radius": 1000
}
```
Expected: `201 Created` with zone details including `id`

---

#### **Test 4: List Zones** (Verify creation)
```
GET {{base_url}}/api/profile/safe-zones
Authorization: Bearer {{token}}
```
Expected: `{"success":true,"data":{"zones":[{...your zone...}]}}`

---

#### **Test 5: Stream Location** (Active alert required)
```
POST {{base_url}}/api/alerts/{{alert_id}}/location
Authorization: Bearer {{token}}
Body:
{
  "lat": 28.6139,
  "lng": 77.2090,
  "accuracy": 25
}
```
Expected: `200 OK` with `{"success":true,"data":{"message":"Location updated","trailLength":1}}`

---

#### **Test 6: Delete Zone**
```
DELETE {{base_url}}/api/profile/safe-zones/{{zone_id}}
Authorization: Bearer {{token}}
```
Expected: `200 OK` with deleted confirmation

---

## 🧪 Collection Features

### Automatic Variable Extraction
The collection automatically extracts and stores variables from responses:

- **GET Safe Zones** → Extracts first zone's ID to `zone_id`
- **POST Create Zone** → Extracts new zone ID to `zone_id`
- **POST Stream Location** → Logs trail length to console

### Pre-Request Scripts
Automatically run before each request:
- Generate unique zone names with timestamps
- Log request details for debugging
- Validate token is set

### Test Scripts
Automatically run after each response:
- Validate status codes
- Check response structure
- Extract variables for next request
- Log succcess/failure messages

---

## 📊 Example Workflow: Complete Test

### Scenario: Create Zone → Stream Location → Delete Zone

**Step 1: Import Collection**
- File: `EMPOWER_SAFE_API_TESTS.postman_collection.json`
- Status: ✅

**Step 2: Set Environment Variables**
- `base_url`: `http://localhost:5000`
- `token`: (from your login)
- `alert_id`: (from your app)

**Step 3: Run Tests in Order**
```
1. GET /api/health
   ✅ Verify backend is running

2. GET /api/profile/safe-zones
   ✅ Check zones list (empty)

3. POST /api/profile/safe-zones
   {
     "name": "My Home",
     "lat": 28.6139,
     "lng": 77.2090,
     "radius": 1000
   }
   ✅ Zone created (zone_id auto-set)

4. GET /api/profile/safe-zones
   ✅ Verify zone appears in list

5. POST /api/alerts/{alert_id}/location
   {
     "lat": 28.6139,
     "lng": 77.2090,
     "accuracy": 25
   }
   ✅ Location streamed (trail recorded)

6. DELETE /api/profile/safe-zones/{zone_id}
   ✅ Zone deleted

7. GET /api/profile/safe-zones
   ✅ Verify zone is gone (empty list)
```

**Expected Results:**
- ✅ All requests return 200/201
- ✅ All tests pass
- ✅ Zone successfully created and deleted
- ✅ Location stored in trail

---

## 📚 API Response Examples

### Success: Create Zone (201)
```json
{
  "success": true,
  "data": {
    "zone": {
      "id": "a1b2c3d4e5f6g7h8i9j0k1",
      "name": "My Home",
      "lat": 28.6139,
      "lng": 77.2090,
      "radius": 1000,
      "createdAt": "2026-04-15T10:30:00.000Z"
    }
  }
}
```

### Success: Stream Location (200)
```json
{
  "success": true,
  "data": {
    "message": "Location updated",
    "trailLength": 5
  }
}
```

### Success: List Zones (200)
```json
{
  "success": true,
  "data": {
    "zones": [
      {
        "id": "a1b2c3d4e5f6g7h8i9j0k1",
        "name": "My Home",
        "lat": 28.6139,
        "lng": 77.2090,
        "radius": 1000,
        "createdAt": "2026-04-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Error: Invalid Token (401)
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### Error: Zone Not Found (404)
```json
{
  "success": false,
  "error": "Zone not found"
}
```

### Error: Invalid Coordinates (400)
```json
{
  "success": false,
  "error": "Invalid latitude/longitude values"
}
```

---

## 🛠️ Troubleshooting in Postman

### Check Request Body
```
1. Click "Body" tab
2. Verify JSON is valid
3. Check field names match API spec
4. Ensure quotes and braces are correct
```

### View Response Details
```
1. Look at "Status" code (200, 201, 400, 401, 404, 500)
2. Click "Tests" tab - see what passed/failed
3. Click "Console" tab (Cmd+Alt+C) - see logs
```

### View Network Details
```
1. Click the request result
2. Check "Headers" sent
3. Check "Response" body
4. Check timing information
```

### Debug Environment Variables
```
1. Hover over {{variable}} in URL
2. Should show resolved value
3. If showing {{variable}}, not set in environment
4. Go to environment settings and add value
```

---

## 📋 Quick Reference

### Location Streaming
- **Endpoint:** `POST /api/alerts/:alertId/location`
- **Auth:** Bearer token required
- **Body:** `{lat, lng, accuracy}`
- **Use Case:** Real-time SOS tracking
- **Response:** `{success, trailLength}`

### Safe Zone Management
- **Create:** `POST /api/profile/safe-zones`
- **List:** `GET /api/profile/safe-zones`
- **Delete:** `DELETE /api/profile/safe-zones/:zoneId`
- **Auth:** Bearer token required
- **Use Case:** Geofencing, location monitoring

### Valid Coordinate Ranges
- **Latitude:** -90 to 90
- **Longitude:** -180 to 180
- **Radius:** 100-50000 meters
- **Accuracy:** 0-1000 meters

---

## ✨ Pro Tips

1. **Run whole folder**: Right-click folder → Run
2. **Set Base URL**: Use collection variables, not hardcoded URLs
3. **Save responses**: Use Tests tab to extract data
4. **Add delays**: Tests tab → `pm.sleep(1000)` between requests
5. **Bulk test**: Use Postman Runner for automation
6. **Export results**: Runner generates HTML reports

---

## 🎓 Learning Resources

- **Postman Docs:** https://learning.postman.com
- **API Testing:** https://learning.postman.com/docs/writing-scripts/test-scripts
- **Environment Variables:** https://learning.postman.com/docs/sending-requests/managing-environments
- **Collection Runner:** https://learning.postman.com/docs/running-collections/intro-to-collection-runs

---

**Version:** 1.0  
**Created:** April 15, 2026  
**Status:** Ready for Testing ✅
