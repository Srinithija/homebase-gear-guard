# Render Deployment Guide

## 🚀 Deploy to Render

This project is configured for one-click deployment to Render using the `render.yaml` configuration file.

### Option 1: Auto-Deploy with render.yaml

1. **Push to GitHub**: Make sure your code is pushed to your GitHub repository
2. **Go to Render**: Visit [render.com](https://render.com) and sign in with GitHub
3. **Create New Blueprint**: 
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
4. **Deploy**: Click "Apply" and wait for deployment to complete

### Option 2: Manual Setup

1. **Create Web Service**:
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Build Settings**:
   - **Name**: `homebase-gear-guard`
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     npm install && cd backend && npm install && npm run build && cd .. && npm run build
     ```
   - **Start Command**: 
     ```bash
     cd backend && npm start
     ```

3. **Set Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `DATABASE_URL` = `postgresql://postgres:Srinithija02@db.llwasxekjvvezufpyolq.supabase.co:5432/postgres`
   - `CORS_ORIGIN` = `https://your-app-name.onrender.com` (update after getting URL)

### Post-Deployment Steps

1. **Get Your URL**: After deployment, you'll get a URL like `https://homebase-gear-guard.onrender.com`
2. **Update CORS**: Go back to environment variables and update `CORS_ORIGIN` with your actual URL
3. **Test**: Visit your app and test the API endpoints

### Deployment Features

- ✅ **Full-Stack**: Both frontend and backend deployed together
- ✅ **Static Files**: Backend serves React build files
- ✅ **API Routes**: All `/api/*` routes work correctly
- ✅ **Health Check**: `/health` endpoint for monitoring
- ✅ **Database**: Connected to your Supabase database

### URLs After Deployment

- **Frontend**: `https://your-app.onrender.com`
- **API**: `https://your-app.onrender.com/api`
- **Health**: `https://your-app.onrender.com/health`

### Free Tier Limitations

- Apps sleep after 15 minutes of inactivity
- Cold start takes 30-60 seconds
- 512MB RAM limit
- Perfect for development and demonstration

### Troubleshooting

- **Build Fails**: Check build logs in Render dashboard
- **CORS Errors**: Ensure CORS_ORIGIN matches your Render URL
- **API Not Working**: Verify environment variables are set correctly
- **Static Files**: Check that frontend build files are in `dist/` folder