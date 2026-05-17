# 🌍 Production Deployment Guide

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│          Client Browser                 │
│  https://notebooklm-rag.vercel.app     │
└────────────────┬────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
   CDN                  API Requests
  Edge          http://backend-prod.railway.app/api
      │                     │
      └──────────┬──────────┘
                 │
        ┌────────▼─────────┐
        │  Railway Backend │
        │  Express API     │
        └────────┬─────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
  Qdrant Cloud      External Services
  Vector DB         OpenAI API
```

## 🚀 Step 1: Deploy Backend to Railway

### 1.1 Prerequisites
- GitHub account with repository
- Railway account (https://railway.app)

### 1.2 Connect Repository

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select repository: `Yeagerist0/RAG`
4. Click "Deploy Now"

### 1.3 Configure Environment

In Railway Dashboard:

**Add Variables:**
```
OPENAI_API_KEY=sk-your-key-here
QDRANT_URL=https://your-cluster.qdrant.io:6333
PORT=5000
LOG_LEVEL=info
NODE_ENV=production
```

### 1.4 Configure Build Settings

**Root Directory:** `backend`
**Build Command:** `npm run build`
**Start Command:** `npm start`

### 1.5 Deploy

Railway auto-detects `package.json` in backend folder. Click "Deploy" and wait ~2-3 minutes.

**Your backend URL:** `https://backend-prod-railway.app` (get from Railway dashboard)

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Prerequisites
- Same GitHub repository
- Vercel account (https://vercel.com)

### 2.2 Connect Repository

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select repository: `Yeagerist0/RAG`

### 2.3 Configure Project

**Framework Preset:** Select "Other"

**Build and Output:**
```
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

### 2.4 Environment Variables

Add in Vercel Dashboard:
```
REACT_APP_API_URL=https://backend-prod-railway.app/api
```

### 2.5 Deploy

Click "Deploy" and wait ~1-2 minutes.

**Your frontend URL:** `https://notebooklm-rag.vercel.app` (from Vercel dashboard)

## 🗄️ Step 3: Setup Qdrant Vector Database

### Option A: Qdrant Cloud (Recommended for Production)

1. **Sign Up:**
   - Go to https://cloud.qdrant.io/
   - Create account with GitHub/Google/Email

2. **Create Cluster:**
   - Click "New Cluster"
   - Choose region closest to users
   - Select "Free" or "Pro" plan
   - Name: `notebooklm-rag`

3. **Get Connection Details:**
   - After cluster is ready, click "API Keys"
   - Copy Cluster URL: `https://xxxxx.qdrant.io:6333`
   - Copy API Key (optional, for security)

4. **Update Railway Backend:**
   - Go to Railway Project Settings
   - Add `QDRANT_URL=https://xxxxx.qdrant.io:6333`
   - Redeploy backend

### Option B: Self-hosted Qdrant

**Using DigitalOcean:**

1. Create Droplet (Ubuntu 22.04, 4GB RAM)
2. SSH into droplet:
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Run Qdrant
   docker run -d \
     --name qdrant \
     -p 6333:6333 \
     -p 6334:6334 \
     -v qdrant_storage:/qdrant/storage \
     qdrant/qdrant:latest
   ```

3. Get IP address and update `QDRANT_URL=http://<IP>:6333` in Railway

## 🔐 Step 4: Security & Monitoring

### 4.1 Secrets Management

**Don't commit secrets!** Use environment variables:

- ✅ Store in Railway/Vercel dashboard
- ✅ Use `.env` locally (in `.gitignore`)
- ❌ Never commit `.env` file
- ❌ Never commit API keys in code

### 4.2 Monitoring

**Railway:**
- Dashboard → Logs (see real-time logs)
- Metrics (CPU, Memory, Network)
- Alerts (set up email notifications)

**Vercel:**
- Analytics (page load times)
- Monitoring (error tracking)
- Performance (Core Web Vitals)

### 4.3 Error Tracking

Add Sentry (optional):

**Backend:**
```bash
npm install @sentry/node
```

**Frontend:**
```bash
npm install @sentry/react
```

## 📊 Step 5: Custom Domain (Optional)

### Connect Custom Domain to Vercel

1. **In Vercel Dashboard:**
   - Settings → Domains
   - Add Domain: `notebooklm-rag.com`

2. **In Domain Provider:**
   - Update DNS to point to Vercel nameservers
   - Or add CNAME: `xxx.vercel.app`

3. **Verify:** Wait 24-48 hours for DNS propagation

## 🔄 Step 6: CI/CD Pipeline

The repository already has GitHub Actions configured (`.github/workflows/deploy.yml`)

### Auto-Deployment Triggers

- Push to `main` branch → Auto-deploy both Frontend & Backend
- Pull Requests → Run tests and build checks

### Manual Deployment

If auto-deployment fails:

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 📈 Performance Optimization

### Frontend (Vercel)

- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Edge caching
- ✅ Gzip compression

### Backend (Railway)

- ✅ Connection pooling to Qdrant
- ✅ Request batching
- ✅ Response caching

### Vector Database (Qdrant Cloud)

- ✅ Automatic scaling
- ✅ Read replicas
- ✅ Backup & restore

## 🧪 Testing Production

### Health Checks

```bash
# Frontend
curl https://notebooklm-rag.vercel.app/

# Backend
curl https://backend-prod-railway.app/api/health

# Qdrant
curl https://xxxxx.qdrant.io:6333/health
```

### End-to-End Test

1. Open frontend URL
2. Upload a test PDF
3. Ask a question
4. Verify answer is grounded
5. Check for source citations

## 🚨 Troubleshooting

### Backend Not Connecting to Qdrant

```bash
# Check Railway logs
railway logs

# Verify QDRANT_URL
echo $QDRANT_URL

# Test connection
curl -v $QDRANT_URL/health
```

### Frontend API Calls Failing

```bash
# Check browser console (F12)
# Look for CORS errors

# Verify API URL
echo $REACT_APP_API_URL

# Test API directly
curl $REACT_APP_API_URL/health
```

### High Latency

1. **Check backend:**
   - Railway CPU usage (Scale if needed)
   - Qdrant latency (Add read replicas)

2. **Check frontend:**
   - Vercel Analytics (Core Web Vitals)
   - Optimize React components

3. **Check network:**
   - Database region (choose closer to users)
   - CDN configuration

## 💰 Cost Estimation (Monthly)

| Service | Free Tier | Pro Tier |
|---------|-----------|----------|
| **Vercel Frontend** | ✅ Included | $20/mo |
| **Railway Backend** | $5-10 | $50+/mo |
| **Qdrant Cloud** | ✅ Free (1GB) | $50+/mo |
| **OpenAI API** | Usage-based | ~$20/mo (typical) |
| **Total** | ~$20-30/mo | ~$150+/mo |

### Cost Optimization

- Use free tiers for low traffic
- Scale up only when needed
- Use cheaper LLM: `gpt-3.5-turbo` instead of `gpt-4`
- Optimize embedding frequency

## 📋 Deployment Checklist

- [ ] GitHub repository is public
- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Qdrant cluster created (Cloud or self-hosted)
- [ ] Environment variables configured
- [ ] Health checks passing
- [ ] End-to-end test completed
- [ ] Monitoring setup (optional)
- [ ] Custom domain (optional)
- [ ] CI/CD pipeline working

## 🎉 Deployment Complete!

Your RAG application is now live in production! 

**Share URLs:**
- Frontend: https://notebooklm-rag.vercel.app
- Backend API: https://backend-prod-railway.app/api
- GitHub: https://github.com/Yeagerist0/RAG

## 📞 Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Qdrant Docs: https://qdrant.tech/documentation/
- OpenAI API: https://platform.openai.com/docs/

---

**Congratulations! 🎊 Your RAG application is production-ready!**
