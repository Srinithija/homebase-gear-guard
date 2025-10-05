# 🔧 API Connection Fix for Deployment

## 🚨 **Issue Summary**

**Problem**: Frontend trying to connect to `http://localhost:3001` in production
**Error**: `Refused to connect because it violates the document's Content Security Policy`
**Cause**: Hardcoded localhost URL instead of production backend URL

## ✅ **Solution Applied**

### 1. **Smart API URL Detection**
- **Development**: Automatically uses `http://localhost:3001/api`
- **Production**: Automatically uses `https://homebase-gear-guard.onrender.com/api`
- **Override**: Can be set via `VITE_API_URL` environment variable

### 2. **Environment Configuration**
- **`.env.development`**: Local development settings
- **`.env.production`**: Production deployment settings
- **`render.yaml`**: Build-time environment variables

### 3. **Enhanced Error Handling**
- Better error messages for network issues
- CSP/CORS error detection
- Detailed logging for debugging

## 📁 **Files Modified**

### `src/utils/api.ts`
```typescript
// Before (BROKEN)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// After (FIXED)
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api';
  } else {
    return 'https://homebase-gear-guard.onrender.com/api';
  }
};
```

### `render.yaml`
```yaml
buildCommand: |
  npm ci
  cd backend && npm ci && npm run build && cd ..
  export VITE_API_URL=https://homebase-gear-guard.onrender.com/api
  npm run build

envVars:
  - key: VITE_API_URL
    value: https://homebase-gear-guard.onrender.com/api
```

## 🚀 **Deployment Steps**

### 1. **Commit & Push Changes**
```bash
git add .
git commit -m "Fix API URL for production deployment

- Add smart API URL detection (localhost vs production)
- Configure environment variables for different environments
- Enhanced error handling for network issues
- Fix CSP violations in production"
git push origin main
```

### 2. **Trigger Redeploy**
- Render will automatically redeploy when you push
- Or manually trigger redeploy in Render dashboard

### 3. **Verify Fix**
```bash
# Check the deployed app
curl https://homebase-gear-guard.onrender.com/health

# Check API connectivity
curl https://homebase-gear-guard.onrender.com/api/appliances
```

## 🔍 **How to Verify the Fix**

### 1. **Check Browser Console**
- Should see: `🔗 API Base URL: https://homebase-gear-guard.onrender.com/api`
- Should see: `🔄 Making API request to: https://...`
- Should NOT see: `localhost:3001` anywhere

### 2. **Test API Calls**
- Visit: https://homebase-gear-guard.onrender.com
- Open DevTools → Network tab
- Try adding an appliance
- All requests should go to `https://homebase-gear-guard.onrender.com/api/*`

### 3. **Error Messages**
- If still failing, you'll see clear error messages:
  - Network connectivity issues
  - CORS problems
  - Backend server status

## 🛠️ **Environment Variables**

### Development (`.env.development`)
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Homebase Gear Guard (Dev)
```

### Production (`.env.production`)
```env
VITE_API_URL=https://homebase-gear-guard.onrender.com/api
VITE_APP_NAME=Homebase Gear Guard
```

### Render Build Environment
```yaml
envVars:
  - key: VITE_API_URL
    value: https://homebase-gear-guard.onrender.com/api
```

## 🔧 **Troubleshooting**

### If Still Getting CSP Errors:
1. **Check console** for the actual API URL being used
2. **Verify backend is running**: https://homebase-gear-guard.onrender.com/health
3. **Check CORS settings** in backend/src/server.ts

### If API Calls Fail:
1. **Database issues**: Check if Supabase project is paused
2. **Backend errors**: Check Render logs for backend service
3. **Network issues**: Try the health endpoint first

### If Environment Variables Not Working:
```bash
# Check if variables are loaded
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All env vars:', import.meta.env);
```

## 📊 **Expected Results**

### ✅ **Before Fix (Development)**
```
API URL: http://localhost:3001/api ✅
Network: Works ✅
```

### ❌ **Before Fix (Production)**
```
API URL: http://localhost:3001/api ❌
Network: CSP Error ❌
Error: "Refused to connect because it violates Content Security Policy"
```

### ✅ **After Fix (Production)**
```
API URL: https://homebase-gear-guard.onrender.com/api ✅
Network: Works ✅
Error: None ✅
```

## 🎯 **Key Benefits**

1. **🔄 Automatic Environment Detection**: No manual configuration needed
2. **🛡️ CSP Compliance**: No more security policy violations
3. **🔍 Better Debugging**: Clear error messages and logging
4. **⚙️ Environment Flexibility**: Easy to override with env vars
5. **🚀 Production Ready**: Proper separation of dev/prod configs

---

**🎉 Your app should now work correctly in production!** The frontend will automatically connect to your deployed backend API instead of trying to reach localhost.