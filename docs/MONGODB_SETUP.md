# 🗄️ MongoDB Setup Guide - 3 Options

## **Option 1: MongoDB Atlas (Cloud) ⭐ FASTEST**

Best for: Quick testing, no local installation needed

### Steps:

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Click "Try Free"
   - Sign up with email

2. **Create Cluster**
   - Click "Create a Deployment"
   - Select "M0 Free" tier
   - Choose region (keep default)
   - Click "Create Deployment"
   - Wait 2-3 minutes for provisioning

3. **Set Database User**
   - In left menu: "Database Access"
   - Click "Add New Database User"
   - Username: `admin`
   - Password: `yourpassword123` (remember this!)
   - Click "Add User"

4. **Get Connection String**
   - In left menu: "Clusters"
   - Click "Connect"
   - Select "Drivers"
   - Language: Node.js
   - Copy the connection string:
   ```
   mongodb+srv://admin:yourpassword123@cluster0.xxxxx.mongodb.net/empower_safe?retryWrites=true&w=majority
   ```

5. **Update .env File**
   ```
   # Replace:
   MONGODB_URI=mongodb://admin:password@localhost:27017/empower_safe?authSource=admin
   
   # With:
   MONGODB_URI=mongodb+srv://admin:yourpassword123@cluster0.xxxxx.mongodb.net/empower_safe?retryWrites=true&w=majority
   ```

6. **Restart Server**
   ```powershell
   npm start
   ```

✅ Done! MongoDB now connected to cloud.

---

## **Option 2: Docker (Requires Docker Installed)**

If docker-compose works on your system:

```powershell
cd "c:\Users\ss222\OneDrive\Desktop\empower backend\empower-backend"
docker compose up -d
```

This will:
- Start MongoDB container
- Start backend container
- Expose MongoDB on localhost:27017

**Verify:**
```powershell
docker compose ps
```

---

## **Option 3: Local MongoDB Installation**

If you want local MongoDB:

### Windows:

1. Download from: https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Check "Install MongoDB Compass" (optional GUI)
5. Default: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`

### Start MongoDB:

```powershell
# Method 1: Service (if installed as service)
net start MongoDB

# Method 2: Manual (from bin folder)
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**Verify running:**
```powershell
netstat -ano | grep 27017
# Should show LISTENING on port 27017
```

---

## ✅ Verify Connection

Once MongoDB is running:

```powershell
npm start
```

Watch for message:
```
🚀 Server running on port 5000
MongoDB connected  ← This line means success!
```

If you see it, MongoDB is working! ✅

---

## 🚀 Recommended for You

**Start with Option 1 (MongoDB Atlas)**
- No local installation
- Free tier sufficient for testing
- Works from anywhere
- Cloud backup included
- Takes 5 minutes total

Then test endpoints with Postman collection.

---

## Troubleshooting

**Error: "Invalid connection string"**
- Copy from Atlas exactly (don't modify)
- Replace `<password>` with your password
- Replace `<cluster-name>` with your cluster name

**Error: "Authentication failed"**
- Check username/password in connection string
- Verify IP whitelist (Atlas → Security → Network Access)
- Add your IP to whitelist

**Error: "MongooseError: Cannot connect"**
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Restart npm start after changing .env
