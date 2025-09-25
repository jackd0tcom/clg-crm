# Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare all required environment variables

## Deployment Steps

### 1. Connect Railway to GitHub

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `clg-crm` repository
5. Railway will automatically detect it's a Node.js project

### 2. Set Up Database

**Option A: Railway PostgreSQL (Recommended)**
1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically provide `DATABASE_URL` environment variable

**Option B: External Database**
- Use your existing PostgreSQL database
- Set `DATABASE_URL` manually

### 3. Configure Environment Variables

In Railway dashboard, go to your service → Variables tab and add:

#### Required Variables
```bash
# Database (Auto-provided if using Railway PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Session Security (CRITICAL - Generate a strong secret)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=your-api-identifier

# Admin Configuration
ADMIN_EMAIL=admin@yourcompany.com

# Production Settings
NODE_ENV=production
FRONTEND_URL=https://your-railway-app.railway.app
```

#### Optional Variables
```bash
# Google Calendar API (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Logging
LOG_LEVEL=info
```

### 4. Deploy

1. Railway will automatically deploy when you push to your main branch
2. Monitor the deployment in the Railway dashboard
3. Check logs for any issues

### 5. Set Up Database Schema

After first deployment, you need to initialize your database:

1. Go to Railway dashboard → Your service → Deployments
2. Click on the latest deployment
3. Go to "Logs" tab
4. You'll see database connection logs

**Initialize Database Schema:**
1. In Railway dashboard → Your service → Variables
2. Copy the `DATABASE_URL`
3. Run locally (temporarily):
   ```bash
   # Set the Railway DATABASE_URL locally
   export DATABASE_URL="your-railway-database-url"
   
   # Initialize database
   npm run seed
   
   # Seed admin user
   npm run seedAdmin
   ```

### 6. Configure Auth0 for Production

Update your Auth0 application settings:

1. **Allowed Callback URLs**:
   ```
   https://your-railway-app.railway.app/api/auth/callback
   ```

2. **Allowed Logout URLs**:
   ```
   https://your-railway-app.railway.app
   ```

3. **Allowed Web Origins**:
   ```
   https://your-railway-app.railway.app
   ```

4. **Allowed Origins (CORS)**:
   ```
   https://your-railway-app.railway.app
   ```

### 7. Custom Domain (Optional)

1. In Railway dashboard → Your service → Settings
2. Go to "Domains" section
3. Add your custom domain
4. Update Auth0 settings with your custom domain
5. Update `FRONTEND_URL` environment variable

## Post-Deployment Setup

### 1. Verify Deployment

1. Visit your Railway app URL
2. Test login functionality
3. Test basic CRUD operations
4. Check admin functionality

### 2. Set Up Monitoring

1. **Railway Metrics**: Built-in monitoring in dashboard
2. **Logs**: View real-time logs in Railway dashboard
3. **Health Checks**: Automatic health checks configured

### 3. Security Checklist

- ✅ Environment variables set
- ✅ Strong `SESSION_SECRET` configured
- ✅ Auth0 configured for production domain
- ✅ CORS configured for production
- ✅ Database properly initialized
- ✅ Admin user created

## Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check DATABASE_URL format
postgresql://username:password@host:port/database
```

**Auth0 Errors:**
- Verify callback URLs in Auth0 dashboard
- Check environment variables are set correctly

**CORS Errors:**
- Verify `FRONTEND_URL` matches your Railway domain
- Check Auth0 allowed origins

**Session Issues:**
- Verify `SESSION_SECRET` is set and strong
- Check `NODE_ENV=production` is set

### Viewing Logs

1. Railway Dashboard → Your service → Deployments
2. Click on deployment → "Logs" tab
3. Look for error messages and stack traces

### Database Access

**Connect to Railway PostgreSQL:**
```bash
# Get connection string from Railway dashboard
# Use psql or any PostgreSQL client
psql "your-database-url"
```

## Scaling

### Automatic Scaling
- Railway automatically scales based on traffic
- No manual configuration needed

### Database Scaling
- Railway PostgreSQL automatically scales
- Consider connection pooling for high traffic

### Monitoring
- Use Railway's built-in metrics
- Set up external monitoring if needed

## Backup Strategy

### Database Backups
- Railway PostgreSQL has automatic backups
- Consider additional backup solutions for critical data

### Code Backups
- Code is backed up in GitHub
- Railway provides deployment history

## Security Considerations

### Production Security
- All security features are enabled in production
- Rate limiting active
- Input validation enforced
- Security headers applied

### Environment Variables
- Never commit `.env` files
- Use Railway's secure environment variable storage
- Rotate secrets regularly

## Support

### Railway Support
- Documentation: [docs.railway.app](https://docs.railway.app)
- Community: [Railway Discord](https://discord.gg/railway)

### Application Support
- Check logs for specific error messages
- Verify all environment variables are set
- Test locally with production environment variables
