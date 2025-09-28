# 🚀 Deployment Guide: Render + Vercel

This guide will help you deploy your Online Learning Platform to production using Render (backend) and Vercel (frontend).

## 📋 Prerequisites

- GitHub repository (✅ Already done)
- MongoDB Atlas account (✅ Already configured)
- Cloudinary account (✅ Already configured)
- Render account (free tier available)
- Vercel account (free tier available)

## 🔧 Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### Step 2: Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `vibhor121/Online-Learning`
3. Configure the service:
   - **Name**: `online-learning-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://edulearn-user:Harish_Dogra_124@cluster0.bpuh2hi.mongodb.net/elearning?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=dx46biunp
CLOUDINARY_API_KEY=738495762247941
CLOUDINARY_API_SECRET=CPszMmE4x82l0XGv_IIp_fu-JcM
CLIENT_URL=https://your-frontend-url.vercel.app
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note the backend URL (e.g., `https://online-learning-backend.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Import your GitHub repository

### Step 2: Configure Frontend Project
1. **Framework Preset**: Next.js (or React)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Install Command**: `npm install`

### Step 3: Environment Variables
Add these environment variables in Vercel dashboard:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_CLOUDINARY_CLOUD_NAME=dx46biunp
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note the frontend URL (e.g., `https://online-learning.vercel.app`)

## 🔄 Update Environment Variables

After both deployments are complete:

### Update Backend (Render)
1. Go to Render dashboard → Your service → Environment
2. Update `CLIENT_URL` to your Vercel frontend URL
3. Redeploy the service

### Update Frontend (Vercel)
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Update `REACT_APP_API_URL` to your Render backend URL
3. Redeploy the project

## 🧪 Testing Deployment

### Test Backend
```bash
curl https://your-backend-url.onrender.com/api/health
```

### Test Frontend
1. Visit your Vercel URL
2. Try to register/login
3. Test course creation and viewing

## 📝 Important Notes

### Render (Backend)
- **Free tier limitations**: Service sleeps after 15 minutes of inactivity
- **Cold start**: First request after sleep may take 30+ seconds
- **Logs**: Available in Render dashboard
- **Custom domain**: Available on paid plans

### Vercel (Frontend)
- **Free tier**: Unlimited deployments
- **Global CDN**: Fast loading worldwide
- **Automatic HTTPS**: SSL certificates included
- **Custom domain**: Available on free tier

## 🔧 Troubleshooting

### Common Issues

1. **Backend not responding**
   - Check environment variables
   - Verify MongoDB connection
   - Check Render logs

2. **Frontend can't connect to backend**
   - Verify `REACT_APP_API_URL` is correct
   - Check CORS settings
   - Ensure backend is running

3. **Image uploads not working**
   - Verify Cloudinary credentials
   - Check file size limits
   - Verify upload endpoints

### Useful Commands

```bash
# Check backend health
curl https://your-backend-url.onrender.com/api/health

# Check frontend build
npm run build

# Test locally with production build
npm start
```

## 🎉 Success!

Once deployed, your Online Learning Platform will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

## 📞 Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test endpoints individually
4. Check MongoDB Atlas and Cloudinary connections

Happy learning! 🚀📚
