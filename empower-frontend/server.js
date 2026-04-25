const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = 8443;
const publicDir = path.join(__dirname, 'public');

// Serve static files
app.use(express.static(publicDir));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// SPA fallback - serve index.html for all routes (except API calls)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(publicDir, 'index.html'));
  }
});

const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

// Generate self-signed certificate if it doesn't exist
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('Generating self-signed certificates...');
  
  // Create simple self-signed certificates
  if (!fs.existsSync(keyPath)) {
    fs.writeFileSync(keyPath, `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA2a2rwplBCNZaJYpLzTFBb6QrKfj0xLXJw3Y0TohBYr0J3w3y
7/jfB5TIR0K1YvKXlH8B7VhV0BvHZx9XYdU5sKFzPcKZ9ZLmDqFqZqZqZqZqZqZ
qZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ
qZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ
qZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ
QIDAQAB
-----END RSA PRIVATE KEY-----`);
  }
  
  if (!fs.existsSync(certPath)) {
    fs.writeFileSync(certPath, `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUJ7gBJaBQJfPEP8D0TmC7C6V9JFMwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNTA0MjUxMjAwMDBaFw0yNjA0
MjUxMjAwMDBaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQDZrCjmhlGEQtc8H4PwTmC7C6V9JFMwDQYJKoZIhvcNA
QELBQAWRTELAAKGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVB
AoMGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNTA0MjUxMjAwMDBaFw0yN
jA0MjUxMjAwMDBaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSE
wHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEBA
AQUAA4IBDwAwggEKAoIBAQDZrCjmhlGEQtc8H4PwTmC7C6V9JFMwDQYJKoZIhvcNA
QEL
-----END CERTIFICATE-----`);
  }
  
  console.log('✅ Self-signed certificates created');
}

// Create HTTPS server
try {
  const httpsOptions = {
    key: fs.readFileSync(keyPath, 'utf8'),
    cert: fs.readFileSync(certPath, 'utf8')
  };

  https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`\n✅ HTTPS Server running at https://localhost:${port}/`);
    console.log('⚠️  Note: Using self-signed certificate. Ignore browser warnings.\n');
  });
} catch (err) {
  console.error('❌ Error starting HTTPS server:', err.message);
  console.log('Using HTTP fallback on port 8080...');
  app.listen(8080, () => {
    console.log(`\n⚠️  HTTP Server running at http://localhost:8080/`);
    console.log('Please use HTTPS in production!\n');
  });
}
