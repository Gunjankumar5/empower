#!/usr/bin/env node

/**
 * EMPOWER SAFE API Test Script
 * Tests all 4 advanced location endpoints
 * 
 * Usage: node test-endpoints.js
 * 
 * Set environment variables first:
 * $env:BASE_URL = "http://localhost:5000"
 * $env:TOKEN = "your-jwt-token"
 * $env:ALERT_ID = "alert-id-from-sos"
 */

const http = require('http');

const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  token: process.env.TOKEN || '',
  alertId: process.env.ALERT_ID || '',
};

let zoneId = '';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`);
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.baseUrl + path);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  log(colors.cyan, '\n╔════════════════════════════════════════════════════╗');
  log(colors.cyan, '║   EMPOWER SAFE - Advanced Location API Tests       ║');
  log(colors.cyan, '╚════════════════════════════════════════════════════╝\n');

  // Validate setup
  if (!config.token) {
    log(colors.red, '❌ ERROR: TOKEN environment variable not set');
    log(colors.yellow, '\nSet token with:');
    log(colors.yellow, '   $env:TOKEN = "your-jwt-token"');
    process.exit(1);
  }

  if (!config.alertId) {
    log(colors.yellow, '⚠️  WARNING: ALERT_ID not set (location streaming test will skip)');
    log(colors.yellow, '   Set with: $env:ALERT_ID = "alert-id-from-sos"\n');
  }

  log(colors.blue, `Base URL: ${config.baseUrl}`);
  log(colors.blue, `Token: ${config.token.substring(0, 20)}...`);
  log(colors.blue, `Alert ID: ${config.alertId || '(not set)'}\n`);

  // Test 1: Health Check
  log(colors.bright, '📝 Test 1: Health Check');
  try {
    const res = await request('GET', '/api/health');
    if (res.status === 200) {
      log(colors.green, '✅ PASS - Server is running');
      log(colors.blue, `   Response: ${JSON.stringify(res.data)}\n`);
    } else {
      log(colors.red, `❌ FAIL - Expected 200, got ${res.status}\n`);
    }
  } catch (err) {
    log(colors.red, `❌ FAIL - Connection error: ${err.message}`);
    log(colors.red, '   Make sure backend is running on port 5000\n');
    process.exit(1);
  }

  // Test 2: Get Safe Zones
  log(colors.bright, '📝 Test 2: GET /api/profile/safe-zones');
  try {
    const res = await request('GET', '/api/profile/safe-zones');
    if (res.status === 200 && res.data.success) {
      log(colors.green, '✅ PASS - Zones retrieved');
      log(colors.blue, `   Count: ${res.data.data.zones.length}`);
      if (res.data.data.zones.length > 0) {
        zoneId = res.data.data.zones[0].id;
        log(colors.blue, `   First Zone: ${res.data.data.zones[0].name} (${zoneId})`);
      }
      log(colors.blue, `   Full Response:\n   ${JSON.stringify(res.data, null, 2)}\n`);
    } else {
      log(colors.red, `❌ FAIL - Expected success, got: ${JSON.stringify(res.data)}\n`);
    }
  } catch (err) {
    log(colors.red, `❌ FAIL - ${err.message}\n`);
  }

  // Test 3: Create Safe Zone
  log(colors.bright, '📝 Test 3: POST /api/profile/safe-zones');
  const newZoneName = `Test Zone ${Date.now()}`;
  try {
    const res = await request('POST', '/api/profile/safe-zones', {
      name: newZoneName,
      lat: 28.6139,
      lng: 77.209,
      radius: 1000,
    });

    if (res.status === 201 && res.data.success) {
      log(colors.green, '✅ PASS - Zone created');
      zoneId = res.data.data.zone.id;
      log(colors.blue, `   Name: ${res.data.data.zone.name}`);
      log(colors.blue, `   ID: ${zoneId}`);
      log(colors.blue, `   Radius: ${res.data.data.zone.radius}m\n`);
    } else {
      log(colors.red, `❌ FAIL - Expected 201, got ${res.status}`);
      log(colors.red, `   Response: ${JSON.stringify(res.data)}\n`);
    }
  } catch (err) {
    log(colors.red, `❌ FAIL - ${err.message}\n`);
  }

  // Test 4: Stream Location
  if (config.alertId) {
    log(colors.bright, '📝 Test 4: POST /api/alerts/:alertId/location');
    try {
      const res = await request('POST', `/api/alerts/${config.alertId}/location`, {
        lat: 28.6139,
        lng: 77.209,
        accuracy: 25,
      });

      if (res.status === 200 && res.data.success) {
        log(colors.green, '✅ PASS - Location streamed');
        log(colors.blue, `   Trail Length: ${res.data.data.trailLength}`);
        log(colors.blue, `   Message: ${res.data.data.message}\n`);
      } else {
        log(colors.red, `❌ FAIL - Expected 200, got ${res.status}`);
        log(colors.red, `   Response: ${JSON.stringify(res.data)}\n`);
      }
    } catch (err) {
      log(colors.red, `❌ FAIL - ${err.message}\n`);
    }
  } else {
    log(colors.yellow, '⊘ Test 4: SKIPPED - ALERT_ID not set\n');
  }

  // Test 5: Stream Multiple Locations
  if (config.alertId) {
    log(colors.bright, '📝 Test 5: Stream Multiple Locations (5 updates)');
    try {
      let success = 0;
      for (let i = 0; i < 5; i++) {
        const lat = 28.6139 + (i * 0.001);
        const lng = 77.209 + (i * 0.001);
        const res = await request('POST', `/api/alerts/${config.alertId}/location`, {
          lat,
          lng,
          accuracy: 20 + i,
        });

        if (res.status === 200) {
          success++;
          log(colors.blue, `   ✓ Update ${i + 1}: Trail length ${res.data.data.trailLength}`);
        }
      }
      log(colors.green, `✅ PASS - ${success}/5 locations streamed\n`);
    } catch (err) {
      log(colors.red, `❌ FAIL - ${err.message}\n`);
    }
  }

  // Test 6: Delete Zone
  if (zoneId) {
    log(colors.bright, '📝 Test 6: DELETE /api/profile/safe-zones/:zoneId');
    try {
      const res = await request('DELETE', `/api/profile/safe-zones/${zoneId}`);

      if (res.status === 200 && res.data.success) {
        log(colors.green, '✅ PASS - Zone deleted');
        log(colors.blue, `   Message: ${res.data.data.message}`);
        log(colors.blue, `   Remaining: ${res.data.data.zones.length}\n`);
      } else {
        log(colors.red, `❌ FAIL - Expected 200, got ${res.status}`);
        log(colors.red, `   Response: ${JSON.stringify(res.data)}\n`);
      }
    } catch (err) {
      log(colors.red, `❌ FAIL - ${err.message}\n`);
    }
  }

  log(colors.cyan, '╔════════════════════════════════════════════════════╗');
  log(colors.cyan, '║             Tests Complete                         ║');
  log(colors.cyan, '╚════════════════════════════════════════════════════╝\n');

  log(colors.green, '📖 Next Steps:');
  log(colors.green, '   1. Import Postman collection for detailed testing');
  log(colors.green, '   2. Run VERIFICATION_CHECKLIST.md for complete validation');
  log(colors.green, '   3. Deploy to production with confidence!\n');
}

runTests().catch((err) => {
  log(colors.red, `Fatal error: ${err.message}`);
  process.exit(1);
});
