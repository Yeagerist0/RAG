# 🚀 Quick Start Guide - NotebookLM RAG

## Prerequisites

Make sure you have installed:
- **Node.js 18+** - Download from https://nodejs.org/
- **npm** - Comes with Node.js
- **Git** - Download from https://git-scm.com/
- **Docker** (optional, for local Qdrant) - Download from https://www.docker.com/
- **OpenAI API Key** - Get from https://platform.openai.com/api-keys

## 📥 Installation

### 1. Clone the Repository

```bash
# Using HTTPS (no authentication needed for public repo)
git clone https://github.com/Yeagerist0/RAG.git
cd RAG-App
```

### 2. Install All Dependencies

```bash
npm run install:all
# This installs root, backend, and frontend dependencies
```

### 3. Set Up Environment Variables

#### Backend Setup
```bash
# Copy example to .env
cp backend/.env.example backend/.env

# Edit backend/.env with your OpenAI API key
# Windows: notepad backend\.env
# Mac/Linux: nano backend/.env
```

**backend/.env:**
```
OPENAI_API_KEY=sk-your-key-here
QDRANT_URL=http://localhost:6333
PORT=5000
LOG_LEVEL=info
```

#### Frontend Setup
```bash
# Copy example to .env
cp frontend/.env.example frontend/.env
```

**frontend/.env:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start Qdrant Vector Database

**Option A: Using Docker (Recommended)**
```bash
# Start Qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest

# Or use docker-compose for everything
docker-compose up -d
# This starts Qdrant, backend, and frontend all together!
```

**Option B: Using Qdrant Cloud (Production)**
1. Sign up at https://cloud.qdrant.io/
2. Create a new cluster
3. Copy the cluster URL and API key
4. Update `QDRANT_URL` in backend/.env

## 🏃 Running Locally

### Option 1: Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend running at http://localhost:5000
# Auto-reloads on file changes
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend running at http://localhost:3000
# Auto-reloads on file changes
```

### Option 2: Using All-in-One Command

```bash
npm run dev
# Runs both backend and frontend with auto-reload
```

### Option 3: Docker (Complete Stack)

```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Qdrant: http://localhost:6333
```

## ✅ Verify Installation

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   # Response: {"status":"ok","message":"RAG API is running"}
   ```

2. **Frontend:**
   - Open http://localhost:3000 in browser
   - You should see the NotebookLM RAG interface

3. **Qdrant Dashboard:**
   - Open http://localhost:6333/dashboard
   - You should see the Qdrant admin panel

## 📄 Usage

### 1. Upload a Document

1. Go to http://localhost:3000
2. Click "Upload Document" or drag-drop a PDF/TXT file
3. Wait for processing (shows progress)
4. Confirmation message appears

### 2. Ask Questions

1. In the chat box, type your question
2. Select "Corrective RAG Mode" if you want advanced retrieval
3. Press Send
4. Get answer with sources and confidence score

### 3. View Sources

- Each response shows retrieved document chunks
- See confidence levels
- View hallucination warnings if any

## 🔧 Configuration

### Chunking Strategy

Edit `backend/src/index.ts`:
```typescript
const chunkingConfig = {
  strategy: "semantic",    // or "sliding-window"
  chunkSize: 600,         // characters
  overlap: 120,           // characters
};
```

### Retrieval Settings

Edit `backend/src/services/retrieval/correctiveRAG.ts`:
```typescript
private relevanceThreshold: number = 0.5;  // Min score
private rewriteThreshold: number = 2;      // Min relevant docs
```

### LLM Model

Edit `backend/src/services/generation/generationService.ts`:
```typescript
model: "gpt-4-mini"  // Change to "gpt-4" for better quality
```

## 📊 API Examples

### Upload Document
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@sample.pdf"
```

### Chat
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic?",
    "useCorrectiveRAG": true
  }'
```

## 🐛 Troubleshooting

### "Cannot connect to Qdrant"
```bash
# Check if Docker is running
docker ps

# Start Qdrant if stopped
docker-compose up -d qdrant
```

### "OpenAI API key not found"
```bash
# Verify backend/.env has correct key
cat backend/.env | grep OPENAI_API_KEY

# Key should start with 'sk-'
```

### Port already in use
```bash
# Backend on 5000
lsof -i :5000
kill -9 <PID>

# Frontend on 3000
lsof -i :3000
kill -9 <PID>
```

### Build errors
```bash
# Clear node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Reinstall
npm run install:all

# Rebuild
npm run build
```

## 🚀 Deployment

### Frontend - Vercel

```bash
# 1. Connect GitHub repo to Vercel
#    https://vercel.com/new

# 2. Set environment variable
REACT_APP_API_URL=https://your-backend.railway.app/api

# 3. Deploy! (Auto-deploys on git push)
```

### Backend - Railway

```bash
# 1. Connect GitHub repo to Railway
#    https://railway.app

# 2. Set environment variables
OPENAI_API_KEY=sk-xxx...
QDRANT_URL=https://your-qdrant-cluster.com
PORT=5000

# 3. Deploy! (Auto-deploys on git push)
```

### Vector Database - Qdrant Cloud

1. Sign up at https://cloud.qdrant.io/
2. Create a cluster
3. Copy cluster URL
4. Set in Railway environment: `QDRANT_URL=<cluster-url>`

## 📚 Project Structure

```
RAG-App/
├── backend/              # Express API
│   ├── src/
│   │   ├── services/     # RAG pipeline services
│   │   ├── controllers/  # Request handlers
│   │   └── utils/        # Helpers
│   ├── package.json
│   └── Dockerfile
│
├── frontend/             # React UI
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── utils/        # API client
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml    # Local setup
├── README.md             # Full documentation
└── IMPLEMENTATION.md     # Architecture details
```

## 📖 Full Documentation

- **README.md** - Complete overview and architecture
- **IMPLEMENTATION.md** - Detailed implementation guide
- **backend/src/services/** - Service documentation
- **frontend/src/components/** - Component docs

## 🤝 Contributing

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature"

# Push and create PR
git push origin feature/your-feature
```

## ❓ FAQ

**Q: Can I use GPT-4 instead of GPT-4-mini?**
A: Yes, edit `backend/src/services/generation/generationService.ts` line 12

**Q: Can I upload images?**
A: Currently supports PDF and TXT. Add support in `backend/src/utils/fileParser.ts`

**Q: Is there a rate limit?**
A: No built-in limit, but add `express-rate-limit` for production

**Q: Can I self-host Qdrant?**
A: Yes, use Docker or Kubernetes. Set `QDRANT_URL` accordingly

**Q: How do I clear uploaded documents?**
A: Delete the Qdrant collection and restart

## 🎉 You're Ready!

Everything is set up! Start building amazing RAG applications! 

For help: Create issue on GitHub or check documentation

Happy coding! 🚀
