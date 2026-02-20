# EMPOWER SAFE - Deployment Guide

This guide explains how to deploy the EMPOWER SAFE application to **DigitalOcean App Platform** (free tier) using GitHub.

## Prerequisites

1. **GitHub Account** - [Create one here](https://github.com)
2. **DigitalOcean Account** - [Get free $200 credit for 60 days](https://www.digitalocean.com/?refcode=YOUR_REF_CODE)
3. **MongoDB Atlas Account** - [Free cloud MongoDB](https://www.mongodb.com/cloud/atlas)

## Step 1: Prepare Your Environment Variables

1. Create a `.env` file in the root directory (already done)
2. Ensure you have:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Your JWT secret key
   - Other API keys (Twilio, Firebase, etc.)

**Note:** Never commit `.env` to GitHub. It's already in your `.gitignore`.

## Step 2: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - ready for deployment"

# Create a new repository on GitHub: https://github.com/new

# Push to GitHub (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/empower-backend.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to DigitalOcean App Platform

### Option A: Using DigitalOcean Dashboard (Recommended for Beginners)

1. **Log in** to [DigitalOcean Console](https://cloud.digitalocean.com)
2. Click **"Create"** → **"Apps"**
3. **Connect GitHub Repository:**
   - Click "GitHub" (authorize DigitalOcean to access your account)
   - Select your `empower-backend` repository
   - Click "Next"

4. **Configure Your App:**
   - **App Name:** `empower-safe-backend`
   - **Resource Type:** Node.js
   - Leave other defaults as is
   - Click "Next"

5. **Set Environment Variables:**
   - Click "Edit"
   - Add the following variables:
     ```
     MONGO_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/database_name
     JWT_SECRET=your_secret_key
     TWILIO_ACCOUNT_SID=your_twilio_sid
     TWILIO_AUTH_TOKEN=your_twilio_token
     TWILIO_PHONE_NUMBER=your_twilio_number
     ```
   - Click "Save"

6. **Review and Deploy:**
   - Verify all settings
   - Click "Create Resources" to deploy
   - DigitalOcean will build and deploy your app automatically

### Option B: Using DigitalOcean CLI

```bash
# Install DigitalOcean CLI
npm install -g doctl

# Authenticate
doctl auth init

# Create app from specification
doctl apps create --spec app.yaml
```

## Step 4: Configure Frontend (Optional - if separate from backend)

If you want to serve the frontend from a separate domain:

1. Go to **"Apps"** → Your app
2. Click **"Components"** → **"Create Component"**
3. Select **"Static Site"**
4. Connect same GitHub repo, point to `/src/public` as source directory

**OR** deploy frontend to free services:
- **Vercel** - [Free tier with GitHub integration](https://vercel.com)
- **Netlify** - [Free tier static hosting](https://netlify.com)
- **GitHub Pages** - [Completely free](https://pages.github.com)

## Step 5: Verify Deployment

1. Your app will be available at: `https://your-app-name.ondigitalocean.app`
2. Test the backend health check:
   ```
   https://your-app-name.ondigitalocean.app/api/health
   ```

3. Test frontend:
   ```
   https://your-app-name.ondigitalocean.app/
   ```

## Important Notes

- **Free Tier Limits:**
  - 1 app with 2 static sites
  - 100 GB/month bandwidth
  - 1 Starter Basic database (if using DigitalOcean's database)

- **MongoDB:** Use MongoDB Atlas (included in the free tier) for your database

- **Auto-Deploy:** Every push to GitHub's `main` branch will automatically trigger a new deployment

- **Custom Domain:** [Link a domain to your app](https://docs.digitalocean.com/products/apps/how-to/manage-domains/)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `PORT` | Server port (auto-set by DigitalOcean) | `5000` |
| `TWILIO_ACCOUNT_SID` | Twilio account ID | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `a1b2c3...` |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | `+1234567890` |
| `FCM_API_KEY` | Firebase Cloud Messaging key | `key...` |

## Troubleshooting

### App fails to start
- Check logs: **Apps** → Your app → **Runtime logs**
- Ensure all environment variables are set
- Verify MongoDB connection string is correct

### Cannot connect to MongoDB
- Test connection string locally
- Ensure IP whitelist includes DigitalOcean's IP
- Use MongoDB Atlas network access settings

### Port already in use
- DigitalOcean sets `PORT` automatically
- Your app should use `process.env.PORT || 5000`
- ✅ This is already configured in your `src/index.js`

## Updating Your App

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```
3. DigitalOcean will automatically redeploy

## Free Alternatives

- **Render.com** - Similar to DigitalOcean, free tier available
- **Railway.app** - Free tier with generous limits
- **Vercel** - Free tier for full-stack apps
- **Fly.io** - Free tier with Docker support

## Additional Resources

- [DigitalOcean Apps Platform Docs](https://docs.digitalocean.com/products/apps/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Atlas Setup Guide](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster/)

---

**Questions?** Check the DigitalOcean documentation or join their community forums.
