# DEPLOYMENT.md

## Overview
This document describes the deployment setup, what is already configured, and step-by-step instructions for deploying both the frontend and backend of the Cerulík AI Task Manager.

---

## What is Set Up

### Frontend
- Framework: Vite + React
- Deployment: Netlify (configured for auto-deploy)
- Configuration: netlify.toml present
- Current live URL: https://cerulik-ai-tasks.windsurf.build (see Netlify dashboard for custom domain/claiming)

### Backend
- Framework: FastAPI (Python) + SQLModel (PostgreSQL-ready)
- Deployment: Render.com (cloud PaaS, free tier available)
- Configuration: render.yaml (service definition), .env.example (environment variables)
- Database: PostgreSQL (provisioned by Render or compatible cloud provider)

---

## What Needs to Be Set Up

### 1. Backend Deployment (Render.com)
- Create a Render.com account (https://render.com/)
- Connect your GitHub repo: https://github.com/werf22/first-save-after-import-csv-fixing
- Create a new Web Service:
  - Root directory: /backend (if code is in /backend, else project root)
  - Build command: pip install -r requirements.txt
  - Start command: uvicorn main:app --host 0.0.0.0 --port 10000
- Provision a PostgreSQL database (Render can do this automatically)
- Set environment variables (see .env.example):
  - DATABASE_URL (provided by Render)
  - OPENAI_API_KEY (optional, for AI features)
  - AUTH_USERNAME, AUTH_PASSWORD (for API auth)
- Deploy and wait for build to complete

### 2. Frontend API URL Update
- Once backend is live, update frontend .env or config to point to the new backend API URL (e.g., VITE_API_URL=https://your-backend.onrender.com)
- Redeploy frontend if needed (Netlify auto-deploys on push)

### 3. Full-Stack Verification
- Open the frontend URL in your browser
- Test all major features (task CRUD, AI chat, CSV import/export)
- Check for errors in browser console and Netlify/Render logs

---

## Troubleshooting
- If deployment fails, check build logs on Netlify (frontend) or Render (backend)
- Ensure all environment variables are set and correct
- For database errors, verify the PostgreSQL connection string and database status
- For CORS/API errors, make sure backend allows requests from frontend domain

---

## References
- [Netlify Docs](https://docs.netlify.com/)
- [Render Docs](https://render.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Vite Docs](https://vitejs.dev/)

---

## Contacts / Support
- Project owner: Jakub Cerulík
- GitHub: https://github.com/werf22/first-save-after-import-csv-fixing
