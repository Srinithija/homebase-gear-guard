# Troubleshooting Guide

## Render Deployment Issues

### Problem: "Tenant or user not found" Database Errors

**Symptoms:**
- Deployment fails on Render
- Health check shows database connection errors
- Logs show "Tenant or user not found"

**Root Cause:**
Your Supabase project is **paused** due to inactivity (common with free tier).

**Solution:**
1. **🔗 Visit Supabase Dashboard**: https://app.supabase.com/project/llwasxekjvvezufpyolq
2. **▶️ Resume Project**: Click the "Resume" button if project is paused
3. **💳 Consider Upgrade**: Upgrade to paid plan to avoid auto-pausing
4. **🔄 Redeploy**: Your Render deployment will work once Supabase is active

### Problem: IPv6 Connection Issues

**Symptoms:**
- "ENETUNREACH" errors
- IPv6 addresses in error logs
- Connection timeouts

**Solution:**
✅ **Already Fixed**: Your app uses pooler URLs only to avoid IPv6 issues.

### Health Check Strategy

**Current Setup:**
- **`/health`**: Quick health check (no database test) - Used by Render
- **`/health?detailed=true`**: Full health check with database test
- **`/health/database`**: Database-only health check for monitoring

**Usage:**
```bash
# Quick health (Render uses this)
curl https://your-app.onrender.com/health

# Detailed health with database test
curl https://your-app.onrender.com/health?detailed=true

# Database-only health check
curl https://your-app.onrender.com/health/database
```

## Supabase Project Management

### Checking Project Status
1. Go to: https://app.supabase.com/project/llwasxekjvvezufpyolq
2. Look for "Project is paused" message
3. Click "Resume" if paused

### Free Tier Limitations
- **Auto-pause**: Projects pause after 7 days of inactivity
- **Connection limits**: Limited concurrent connections
- **Storage**: 500MB limit

### Upgrading to Paid Plan
- **Pro Plan**: $25/month
- **Benefits**: No auto-pause, higher limits, better performance
- **Setup**: Project Settings > Billing > Upgrade

## Database Connection Fallback Strategy

Your app uses multiple connection strategies:

1. **Primary**: Environment DATABASE_URL
2. **Session Pooler**: Port 6543 with pgbouncer
3. **Transaction Pooler**: Port 5432 
4. **Hardcoded Fallbacks**: Built-in resilient URLs

## Environment Variables on Render

**Current Configuration:**
```yaml
DATABASE_URL: postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_URL_POOLER_SESSION: postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DATABASE_URL_FALLBACK: postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=10
```

**Note**: Even if Render overwrites DATABASE_URL, your app has hardcoded fallbacks for resilience.

## Common Issues & Solutions

### 1. Deployment Fails at Build Stage
- Check `package.json` scripts
- Verify build command in `render.yaml`
- Check for TypeScript errors

### 2. App Starts but API Routes Don't Work
- Check environment variables
- Verify database migrations are applied
- Check CORS configuration

### 3. Database Migrations Fail
```bash
# Run migrations manually
cd backend
npm run db:migrate
```

### 4. CORS Issues
- Check `CORS_ORIGIN` environment variable
- Verify frontend URL matches CORS settings

## Monitoring & Debugging

### Health Check Endpoints
```bash
# Basic health (always returns 200)
curl https://homebase-gear-guard.onrender.com/health

# Database health (may return 503 if DB down)
curl https://homebase-gear-guard.onrender.com/health/database

# Detailed health with database test
curl https://homebase-gear-guard.onrender.com/health?detailed=true
```

### Render Logs
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for database connection messages

### Local Testing
```bash
# Test health endpoints locally
npm run dev
curl http://localhost:3001/health
curl http://localhost:3001/health/database
```

## Quick Fix Checklist

When deployment fails:

1. ✅ **Check Supabase**: Is project paused?
2. ✅ **Resume Project**: Click resume in Supabase dashboard
3. ✅ **Wait 2-3 minutes**: For project to fully start
4. ✅ **Redeploy**: Trigger new deployment on Render
5. ✅ **Monitor Health**: Check `/health` endpoint

## Contact Information

- **Supabase Project**: llwasxekjvvezufpyolq
- **Region**: aws-0-ap-south-1
- **Render Service**: homebase-gear-guard

---

**💡 Pro Tip**: Set up monitoring alerts on the `/health/database` endpoint to get notified when Supabase pauses your project.