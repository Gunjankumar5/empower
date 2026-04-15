SMS Gateway (phone-as-gateway) — Setup and usage

Overview

This project can use an HTTP-based SMS gateway (an Android phone running an SMS Gateway app) instead of Twilio to send SMS messages.

How it works

- Install an Android SMS Gateway app on your phone (examples below).
- Configure the app to expose a local or internet-accessible HTTP API (the app will document endpoints).
- Set `SMS_GATEWAY_URL` (and optionally `SMS_GATEWAY_API_KEY`) in your `.env` to point to the gateway API.
- The backend will POST `{ to: "+919...", message: "..." }` to that URL.

Recommended apps

- SMS Gateway API (many apps on Play Store) — exposes a simple REST endpoint to send SMS.
- TextBee (open-source) — can run on a phone or server and offers an API + dashboard.
- HTTP SMS Gateway (Android apps) — lightweight and easy to configure for local use.

Environment variables

- `SMS_GATEWAY_URL` — (required) full URL to the gateway endpoint, e.g. `http://192.168.1.10:8080/send`
- `SMS_GATEWAY_API_KEY` — (optional) API key for the gateway if it requires authentication
- `USE_SMS_GATEWAY=true` — (optional) force using the SMS gateway even if Twilio is configured

Example gateway payload (what the backend sends)

POST ${SMS_GATEWAY_URL}
Content-Type: application/json
Authorization: Bearer <API_KEY>  # optional

{
  "to": "+919876543210",
  "message": "Test message from EMPOWER SAFE"
}

Testing locally

1. Install an SMS gateway app on your phone and enable its HTTP API.
2. Ensure your phone and development machine are on the same network (for local IP) or use a tunnel (ngrok) if the phone is reachable from the server.
3. Add to `.env` in `empower-backend`:

SMS_GATEWAY_URL=http://192.168.1.10:8080/send
SMS_GATEWAY_API_KEY=optional_key_here
USE_SMS_GATEWAY=true

4. Run the backend and send a test SMS via the tools script:

```powershell
Set-Location -LiteralPath "empower-backend"
$env:TEST_SEND_TO="+919876543210"
node tools/twilio_test.js
```

Notes & troubleshooting

- If your phone is not reachable, use `ngrok http 8080` and point `SMS_GATEWAY_URL` to the generated public URL.
- Ensure the gateway expects the same JSON shape; adjust the gateway or the backend code accordingly.
- For production usage, prefer a server-hosted gateway or a paid SMS provider for reliability and compliance.
