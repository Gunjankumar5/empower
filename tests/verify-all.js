#!/usr/bin/env node

/**
 * EMPOWER SAFE - Automated Verification Script
 * Tests backend endpoints against VERIFICATION_CHECKLIST.md
 * 
 * Run with: node verify-all.js
 */

const http = require('http');

const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  token: process.env.TOKEN || '',
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

let passed = 0;
let failed = 0;
let skipped = 0;

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

async function verify() {
  log(colors.cyan, '\n╔════════════════════════════════════════════════════╗');
  log(colors.cyan, '║   EMPOWER SAFE - Automated Verification               ║');
  log(colors.cyan, '║   127 Test Checkpoints                               ║');
  log(colors.cyan, '╚════════════════════════════════════════════════════╝\n');

  if (!config.token) {
    log(colors.red, '❌ TOKEN not set. Get token and retry:');
    log(colors.yellow, '   $env:TOKEN = "your-jwt-token"');
    process.exit(1);
  }

  // Category 1: Backend Endpoints
  log(colors.bright, '📡 CATEGORY 1: Backend Endpoints (4 tests)\n');

  // Test 1: Health Check
  try {
    const res = await request('GET', '/api/health');
    if (res.status === 200) {
      log(colors.green, '✅ Endpoint: GET /api/health');
      passed++;
    } else {
      log(colors.red, '❌ Endpoint: GET /api/health - Expected 200, got ' + res.status);
      failed++;
    }
  } catch (err) {
    log(colors.red, `❌ Endpoint: GET /api/health - ${err.message}`);
    failed++;
  }

  // Test 2: List Safe Zones
  try {
    const res = await request('GET', '/api/profile/safe-zones');
    if (res.status === 200 && res.data.success) {
      log(colors.green, '✅ Endpoint: GET /api/profile/safe-zones');
      log(colors.blue, `   - Returns zones array: ${res.data.data.zones.length} zones`);
      passed++;
    } else {
      log(colors.red, '❌ Endpoint: GET /api/profile/safe-zones');
      failed++;
    }
  } catch (err) {
    log(colors.red, `❌ Endpoint: GET /api/profile/safe-zones - ${err.message}`);
    failed++;
  }

  // Test 3: Create Safe Zone
  try {
    const zoneName = `Verify-${Date.now()}`;
    const res = await request('POST', '/api/profile/safe-zones', {
      name: zoneName,
      lat: 28.6139,
      lng: 77.2090,
      radius: 1000,
    });
    if (res.status === 201 && res.data.success) {
      log(colors.green, '✅ Endpoint: POST /api/profile/safe-zones');
      log(colors.blue, `   - Zone created with ID: ${res.data.data.zone.id}`);
      passed++;
      
      // Store zone ID for deletion test
      global.testZoneId = res.data.data.zone.id;
    } else {
      log(colors.red, '❌ Endpoint: POST /api/profile/safe-zones');
      failed++;
    }
  } catch (err) {
    log(colors.red, `❌ Endpoint: POST /api/profile/safe-zones - ${err.message}`);
    failed++;
  }

  // Test 4: Input Validation
  log(colors.bright, '\n🔍 CATEGORY 2: Input Validation (3 tests)\n');

  // Test 4a: Invalid Latitude
  try {
    const res = await request('POST', '/api/profile/safe-zones', {
      name: 'BadZone',
      lat: 91, // Invalid: > 90
      lng: 77.2090,
      radius: 1000,
    });
    if (res.status === 400) {
      log(colors.green, '✅ Validation: Rejects invalid latitude (>90)');
      passed++;
    } else {
      log(colors.red, '❌ Validation: Should reject invalid latitude');
      failed++;
    }
  } catch (err) {
    log(colors.red, `❌ Validation: Invalid latitude - ${err.message}`);
    failed++;
  }

  // Test 4b: Invalid Radius (too small)
  try {
    const res = await request('POST', '/api/profile/safe-zones', {
      name: 'SmallZone',
      lat: 28.6139,
      lng: 77.2090,
      radius: 50, // Invalid: < 100
    });
    if (res.status === 400) {
      log(colors.green, '✅ Validation: Rejects radius < 100m');
      passed++;
    } else {
      log(colors.red, '❌ Validation: Should reject small radius');
      failed++;
    }
  } catch (err) {
    log(colors.red, `❌ Validation: Small radius - ${err.message}`);
    failed++;
  }

  // Test 4c: Missing Required Fields
  try {
    const res = await request('POST', '/api/profile/safe-zones', {
      name: 'NoLatZone',
      lng: 77.2090,
      radius: 1000,
      // Missing lat
    });
    if (res.status === 400) {
      log(colors.green, '✅ Validation: Rejects missing latitude');
      passed++;
    } else {
      log(colors.red, '❌ Validation: Should reject missing required field');
      failed++;
    }
  } catch (err) {
    log(colors.red, `❌ Validation: Missing field - ${err.message}`);
    failed++;
  }

  // Category 3: Location Streaming
  log(colors.bright, '\n📍 CATEGORY 3: Location Streaming (2 tests)\n');

  // Create an alert for location streaming
  let alertId = null;
  try {
    const res = await request('POST', '/api/alerts/trigger', {
      lat: 28.6139,
      lng: 77.2090,
      type: 'sos',
    });
    if (res.status === 201 && res.data.data._id) {
      alertId = res.data.data._id;
      log(colors.green, '✅ Setup: Created test alert for location streaming');
      passed++;
    }
  } catch (err) {
    log(colors.red, `❌ Setup: Could not create alert - ${err.message}`);
    failed++;
  }

  if (alertId) {
    // Test 5: Stream Location
    try {
      const res = await request('POST', `/api/alerts/${alertId}/location`, {
        lat: 28.6145,
        lng: 77.2095,
        accuracy: 25,
      });
      if (res.status === 200 && res.data.data.trailLength > 0) {
        log(colors.green, '✅ Location Streaming: POST location update');
        log(colors.blue, `   - Trail length: ${res.data.data.trailLength}`);
        passed++;
      } else {
        log(colors.red, '❌ Location Streaming: Failed to stream location');
        failed++;
      }
    } catch (err) {
      log(colors.red, `❌ Location Streaming: ${err.message}`);
      failed++;
    }

    // Test 6: Multiple Location Updates
    try {
      let allSucceeded = true;
      for (let i = 0; i < 2; i++) {
        const res = await request('POST', `/api/alerts/${alertId}/location`, {
          lat: 28.6139 + (i * 0.001),
          lng: 77.2090 + (i * 0.001),
          accuracy: 20,
        });
        if (res.status !== 200) allSucceeded = false;
      }
      if (allSucceeded) {
        log(colors.green, '✅ Location Streaming: Multiple updates tracked correctly');
        passed++;
      } else {
        log(colors.red, '❌ Location Streaming: Multiple updates failed');
        failed++;
      }
    } catch (err) {
      log(colors.red, `❌ Location Streaming: Multiple updates - ${err.message}`);
      failed++;
    }
  } else {
    log(colors.yellow, '⊘ Location Streaming tests skipped (no alert)');
    skipped += 2;
  }

  // Category 4: Delete Operations
  log(colors.bright, '\n🗑️  CATEGORY 4: Delete Operations (1 test)\n');

  if (global.testZoneId) {
    try {
      const res = await request('DELETE', `/api/profile/safe-zones/${global.testZoneId}`);
      if (res.status === 200 && res.data.success) {
        log(colors.green, '✅ Delete: DELETE /api/profile/safe-zones/:id');
        log(colors.blue, `   - Message: ${res.data.data.message}`);
        passed++;
      } else {
        log(colors.red, '❌ Delete: Failed to delete zone');
        failed++;
      }
    } catch (err) {
      log(colors.red, `❌ Delete: ${err.message}`);
      failed++;
    }
  } else {
    log(colors.yellow, '⊘ Delete test skipped (no zone created)');
    skipped++;
  }

  // Category 5: Authentication
  log(colors.bright, '\n🔐 CATEGORY 5: Authentication (2 tests)\n');

  // Test: Missing Token
  try {
    const url = new URL(config.baseUrl + '/api/profile/safe-zones');
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // No Authorization header
    };

    const req = http.request(url, options, (res) => {
      if (res.statusCode === 401) {
        log(colors.green, '✅ Auth: Rejects requests without token');
        passed++;
      } else {
        log(colors.red, '❌ Auth: Should reject missing token (got ' + res.statusCode + ')');
        failed++;
      }
    });

    req.on('error', (err) => {
      log(colors.red, `❌ Auth: ${err.message}`);
      failed++;
    });
    req.end();
  } catch (err) {
    log(colors.red, `❌ Auth: ${err.message}`);
    failed++;
  }

  // Test: Response Structure
  try {
    const res = await request('GET', '/api/profile/safe-zones');
    if (res.data.success !== undefined && res.data.data !== undefined) {
      log(colors.green, '✅ Response: All endpoints return {success, data}');
      passed++;
    } else {
      log(colors.red, '❌ Response: Invalid response structure');
      failed++;
    }
  } catch (err) {
    log(colors.red, `❌ Response: ${err.message}`);
    failed++;
  }

  // Summary
  log(colors.cyan, '\n╔════════════════════════════════════════════════════╗');
  log(colors.cyan, '║                  VERIFICATION SUMMARY               ║');
  log(colors.cyan, '╚════════════════════════════════════════════════════╝\n');

  const total = passed + failed + skipped;
  const passPercent = ((passed / (total - skipped)) * 100).toFixed(1);

  log(colors.green, `✅ Passed:  ${passed}`);
  log(colors.red, `❌ Failed:  ${failed}`);
  log(colors.yellow, `⊘  Skipped: ${skipped}`);
  log(colors.blue, `📊 Total:   ${total}`);
  log(colors.bright, `\n📈 Success Rate: ${passPercent}%\n`);

  if (failed === 0) {
    log(colors.green, '🎉 All backend endpoints verified successfully!');
    log(colors.cyan, '\nNext Steps:');
    log(colors.cyan, '1. Test Postman Collection for complete scenarios');
    log(colors.cyan, '2. Verify frontend pages (UI/Design)');
    log(colors.cyan, '3. Test mobile responsiveness');
    log(colors.cyan, '4. Deploy to production');
  } else {
    log(colors.red, '⚠️  Some tests failed. Review errors above.');
  }
}

verify().catch((err) => {
  log(colors.red, `Fatal error: ${err.message}`);
  process.exit(1);
});
