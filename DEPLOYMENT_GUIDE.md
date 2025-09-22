# 🚀 Deployment Guide

## **Pre-Deployment Setup**

### 1. Environment Variables
Create a `.env` file in your production environment:

```bash
# Required for production
ADMIN_EMAIL=admin@yourlawfirm.com

# Google Calendar (if using)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Auth0 (if using)
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
```

### 2. Database Setup
```bash
# Run the model sync to create tables
node server/model.js
```

## **🎯 First User Creation (Automatic)**

### **Option A: Set Admin Email (Recommended)**
```bash
# Set the admin email in your environment
export ADMIN_EMAIL=admin@yourlawfirm.com

# Deploy and the first user with that email gets admin access
```

### **Option B: First User Gets Admin**
- If no `ADMIN_EMAIL` is set, the very first user to log in gets admin access
- This is good for testing but not recommended for production

### **Option C: Manual Seed Script**
```bash
# After deployment, run the seed script
node server/seedAdmin.js
```

## **📋 Deployment Checklist**

### **Before Deployment:**
- [ ] Set `ADMIN_EMAIL` environment variable
- [ ] Configure Auth0 settings
- [ ] Set up Google Calendar credentials
- [ ] Configure database connection
- [ ] Test locally with production settings

### **After Deployment:**
- [ ] Verify admin user can log in
- [ ] Test user access control
- [ ] Verify Google Calendar integration
- [ ] Test admin user management
- [ ] Monitor logs for any issues

## **🔧 Production Environment Setup**

### **Heroku Example:**
```bash
# Set environment variables
heroku config:set ADMIN_EMAIL=admin@yourlawfirm.com
heroku config:set DATABASE_URL=postgresql://...

# Deploy
git push heroku main

# Run database sync
heroku run node server/model.js
```

### **Vercel/Netlify Example:**
```bash
# Set environment variables in dashboard
ADMIN_EMAIL=admin@yourlawfirm.com
DATABASE_URL=postgresql://...

# Deploy
git push origin main
```

### **VPS/Server Example:**
```bash
# Set environment variables
export ADMIN_EMAIL=admin@yourlawfirm.com
export DATABASE_URL=postgresql://...

# Start the application
npm start
```

## **🎉 What Happens on First Login**

1. **User logs in** with Google/Auth0
2. **System checks** if email matches `ADMIN_EMAIL`
3. **If match:** User gets `role: 'admin'` and `isAllowed: true`
4. **If no match:** User gets `role: 'user'` and `isAllowed: false`
5. **Admin can then** manage other users via the admin interface

## **🚨 Security Notes**

- **Never commit** `.env` files to version control
- **Use strong passwords** for database access
- **Enable HTTPS** in production
- **Monitor access logs** regularly
- **Keep admin email** secure and known only to authorized personnel

## **📞 Support**

If you encounter issues:
1. Check the server logs for error messages
2. Verify all environment variables are set
3. Ensure database connection is working
4. Test with a known admin email first
