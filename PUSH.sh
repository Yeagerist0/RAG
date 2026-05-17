#!/bin/bash
# 🚀 Push RAG Application to GitHub

# This script helps push the RAG-App code to GitHub

echo "================================"
echo "🚀 RAG-App GitHub Push Script"
echo "================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git not installed. Please install git first."
    exit 1
fi

# Navigate to project
cd "$(dirname "$0")" || exit

echo "📍 Project: $(pwd)"
echo "📊 Git Status:"
git status

echo ""
echo "================================"
echo "🔑 AUTHENTICATION OPTIONS"
echo "================================"
echo ""
echo "Choose one of the following:"
echo ""
echo "Option 1: Using GitHub CLI (Easiest)"
echo "  1. Install: https://cli.github.com/"
echo "  2. Run: gh auth login"
echo "  3. Then: git push origin main"
echo ""
echo "Option 2: Using Personal Access Token"
echo "  1. Create token: https://github.com/settings/tokens"
echo "  2. Run: git push https://<username>:<token>@github.com/Yeagerist0/RAG.git main"
echo ""
echo "Option 3: Using SSH"
echo "  1. Setup SSH: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
echo "  2. Then: git push origin main"
echo ""
echo "Option 4: Web Upload (Browser)"
echo "  1. Go to: https://github.com/Yeagerist0/RAG"
echo "  2. Upload files manually via web interface"
echo ""
echo "================================"
echo "📋 Repository Details"
echo "================================"
echo "URL: https://github.com/Yeagerist0/RAG"
echo "Files Ready: $(git ls-files | wc -l) files"
echo "Size: $(du -sh . | cut -f1)"
echo "Commits: $(git rev-list --count HEAD)"
echo ""
echo "================================"

# Check current remote
echo "Current Remote:"
git remote -v

echo ""
echo "✅ Everything is ready to push!"
echo "Choose your authentication method above and push the code."
