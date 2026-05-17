REM 🚀 RAG-App GitHub Push Script for Windows
REM This script helps push the RAG-App code to GitHub

@echo off
setlocal enabledelayedexpansion

echo.
echo ================================
echo 🚀 RAG-App GitHub Push Script
echo ================================
echo.

REM Check git status
cd /d "%~dp0"
echo 📍 Project: %cd%
echo.
echo 📊 Git Status:
git status
echo.

echo ================================
echo 🔑 AUTHENTICATION - CHOOSE ONE
echo ================================
echo.
echo [1] GitHub CLI (Recommended - Easiest)
echo     - Install: https://cli.github.com/
echo     - Run: gh auth login
echo     - Then: git push origin main
echo.
echo [2] Personal Access Token
echo     - Create: https://github.com/settings/tokens
echo     - Scopes: repo, workflow
echo     - Command:
echo       git push https://YOUR_USERNAME:YOUR_TOKEN@github.com/Yeagerist0/RAG.git main
echo.
echo [3] SSH (If configured)
echo     - Setup: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
echo     - Then: git push origin main
echo.
echo [4] Windows Credential Manager
echo     - Run: git credential-manager
echo     - Authenticate through GUI
echo     - Then: git push origin main
echo.
echo ================================
echo 📋 Repository Details
echo ================================
echo URL: https://github.com/Yeagerist0/RAG
echo.
git remote -v
echo.
echo Total Files: (check with: git ls-files ^| measure)
echo.

echo ================================
echo ✅ READY TO PUSH
echo ================================
echo.
echo After choosing authentication:
echo   git push -u origin main
echo.
echo Questions? See QUICKSTART.md or DEPLOYMENT.md
echo.
pause
