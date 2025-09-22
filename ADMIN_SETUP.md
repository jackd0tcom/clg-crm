# Admin User Setup Guide

## 🚀 Setting Up Your First Admin User

### Step 1: Create Your User Account
1. **Log in once** with your Google account to create your user record
2. This will create a user with `isAllowed: false` and `role: 'user'`

### Step 2: Run the Admin Seed Script
```bash
# Option 1: Use default email (your-email@example.com)
node server/seedAdmin.js

# Option 2: Specify your email directly
FIRST_ADMIN_EMAIL=your-email@example.com node server/seedAdmin.js

# Option 3: Add to your .env file (recommended for production)
echo "FIRST_ADMIN_EMAIL=your-email@example.com" >> .env
node server/seedAdmin.js
```

### Step 3: Verify Admin Access
1. **Log out** and **log back in**
2. You should now have admin access
3. Navigate to `/admin` to manage other users

## 🔧 For Production Deployment

### Update Environment Variables
```bash
# In your production environment
export FIRST_ADMIN_EMAIL=admin@yourlawfirm.com
```

### Or add to your .env file:
```
FIRST_ADMIN_EMAIL=admin@yourlawfirm.com
```

## 📋 What the Script Does

- ✅ **Finds your user** by email address
- ✅ **Updates your role** to `admin`
- ✅ **Grants access** (`isAllowed: true`)
- ✅ **Provides feedback** on success/failure

## 🚨 Troubleshooting

### "User not found" Error
- Make sure you've logged in at least once
- Check that the email matches exactly (case-sensitive)
- Verify the user was created in the database

### "Permission denied" Error
- Make sure you're running the script from the server directory
- Check that your database connection is working

## 🎯 Next Steps

Once you're an admin, you can:
- ✅ **Manage user access** via the admin interface
- ✅ **Add new users** by email
- ✅ **Grant/revoke access** for existing users
- ✅ **Monitor user activity** and access requests
