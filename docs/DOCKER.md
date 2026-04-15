# Docker Setup - EMPOWER SAFE Backend + MongoDB

Run the app and database together in containers with a single command.

## Prerequisites

- Docker and Docker Compose installed
- Clone of the EMPOWER SAFE repository

## Quick Start

### 1. Configure Environment

```bash
cd empower-backend
cp .env.example .env
```

Edit `.env` and add your credentials:
- **JWT_SECRET** (required): Any random string, e.g. `openssl rand -base64 32`
- **TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER** (optional for SMS)
- **FIREBASE_SERVICE_ACCOUNT** (optional for push notifications)

### 2. Start Services

```bash
docker-compose up --build
```

Or in the background:

```bash
docker-compose up -d --build
```

### 3. Verify It's Running

```bash
curl http://localhost:5000/api/health
```

Expected response: `{"status":"ok","message":"EMPOWER SAFE Backend is running"}`

### 4. Access the App

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/*
- **MongoDB**: localhost:27017 (internal service, use connection string in backend)

## Common Commands

```bash
# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Remove volumes (clears database)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# Enter MongoDB shell
docker exec -it empower-mongodb mongosh -u admin -p password --authenticationDatabase admin
```

## Development Mode (Hot Reload)

Uncomment the volumes section in `docker-compose.yml`:

```yaml
volumes:
  - .:/app
  - /app/node_modules
```

Then restart with:

```bash
docker-compose down
docker-compose up
```

Changes to source files will now auto-reload via nodemon.

## Services Running

| Service | URL | Credentials |
|---------|-----|-------------|
| Backend | http://localhost:5000 | JWT token from login |
| MongoDB | localhost:27017 | admin / password (from .env) |

## Troubleshooting

### Backend fails to start: "MongoDB connection refused"
- Wait 10-15 seconds for MongoDB to initialize
- Check logs: `docker-compose logs mongodb`

### Port 5000 already in use
```bash
# Use a different port (edit docker-compose.yml ports)
ports:
  - "8000:5000"  # Access on localhost:8000
```

### MongoDB data persists after restart
- Data is stored in Docker volumes (empower-backend_mongodb_data)
- To clear: `docker-compose down -v`

## Environment Variables

All variables from `.env` are auto-loaded. No code changes needed:

```bash
# SMS will skip gracefully if Twilio is not configured
TWILIO_ACCOUNT_SID=  # Leave blank to skip SMS

# Push notifications will skip if Firebase is not configured
FIREBASE_SERVICE_ACCOUNT=  # Leave blank to skip push
```

## Production Deployment

For production:

1. **Change JWT_SECRET**: Use `openssl rand -base64 32`
2. **Change MongoDB credentials**: Use strong password
3. **Use environment variables**: Don't commit `.env`
4. **Enable HTTPS**: Add reverse proxy (nginx)
5. **Set resource limits**: Add to docker-compose.yml

Example for production:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```
