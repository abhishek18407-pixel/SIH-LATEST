# 🏛️ Civic Voice — Smart City AI Civic Grievance Redressal System

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-blue?logo=react)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel%20Serverless-black?logo=vercel)](https://vercel.com/)
[![Supabase](https://img.shields.io/badge/Database%20%26%20Auth-Supabase%20PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![AI Engine](https://img.shields.io/badge/AI-Groq%20%7C%20Whisper%20%7C%20Llama%203.1-orange)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

An intelligent, multilingual, AI-powered municipal grievance redressal system built for Smart City governance. The platform empowers citizens to report public infrastructure issues effortlessly via **voice in 13+ regional languages**, photo upload, and geolocation tagging. Spoken audio and descriptions are translated and parsed by **Groq / Whisper LLMs** to extract key entities, assign priority severity, and automatically route complaints to the appropriate municipal department. 

Municipal officials manage complaints through an interactive **Leaflet GIS Command Dashboard** with live status dispatch and audit tracking.

---

## 🌟 Key Features

### 🧑 Citizen Portal
- **🎙️ Voice-First & Multilingual**: Speak or type complaints in 13+ Indian languages (*Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati, Punjabi, Malayalam, Odia, Assamese, Urdu, English*).
- **🤖 Real-Time Speech-to-Text & AI Whisper Fallback**: Native Web Speech API integration with serverless Whisper AI fallback for transcription without word repetition.
- **📷 Photo & Geolocation Capture**: Attach on-site camera photos and auto-detect GPS coordinates with a single tap.
- **🔍 AI Categorization & Auto-Routing**: Automatic classification of grievances into municipal departments (*Roads & Infrastructure, Water Supply, Electricity, Sanitation & Waste, Public Health*) and priority assessment (*Low, Medium, High, Critical*).
- **📍 Real-Time Tracking**: Instant complaint registration with tracking ID (`#GR-2026-XXXX`), live status timeline, and conversational AI assistant.

### 🏛️ Department Official Portal
- **🔐 Strict Role-Based Access (RBAC)**: Enforced segregation between Citizen and Department accounts backed by Supabase Auth and dual PostgreSQL profile tables.
- **🗺️ Interactive Leaflet GIS Command Center**: Visual mapping of all city grievances with status and urgency color coding.
- **⚡ Status Dispatch & Audit Logging**: Real-time status updates (*Open, In Progress, Resolved, Rejected*) with required resolution notes and timestamped timeline logging.
- **📊 Filter & Search Toolbar**: Live filtering by department, resolution status, urgency, and grievance keyword search.

---

## 📐 System Architecture

```
                                  ┌───────────────────────────────┐
                                  │       VERCEL PLATFORM         │
                                  ├───────────────────────────────┤
  Citizen / Official ────────────►│  ⚡ High-Speed CDN Edge       │
  (React 19 + Vite SPA)           │  - /login (Default Landing)   │
                                  │  - /home, /report, /track     │
                                  │  - /dept-dashboard            │
                                  ├───────────────────────────────┤
                                  │  ⚡ Serverless AI Functions   │
                                  │  - /api/analyze (Groq LLM)    │
                                  │  - /api/transcribe (Whisper)  │
                                  │  - /api/health                │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │     SUPABASE DATABASE         │
                                  │  - Auth & Role Verification   │
                                  │  - user & department profiles │
                                  │  - complaints & timeline logs │
                                  │  - Photo Storage Buckets      │
                                  └───────────────────────────────┘
```

---

## 📁 Repository Structure

```
SIH-LATEST/
├── README.md                      # Primary project documentation
├── vercel.json                    # Root Vercel build & SPA rewrite configuration
├── VERCEL_DEPLOYMENT.md           # Step-by-step Vercel production deployment guide
├── package.json                   # Root workspace scripts
│
├── api/                           # Vercel Serverless Edge Functions
│   ├── analyze.js                 # Groq AI categorization & severity evaluation
│   ├── transcribe.js              # Serverless Whisper audio transcription
│   └── health.js                  # Gateway health status endpoint
│
├── frontend/                      # React 19 + Vite Production Application
│   ├── api/                       # Local API copy for frontend builds
│   ├── src/
│   │   ├── components/            # UI components (ReportIssue, AIReview, ComplaintTracking, etc.)
│   │   │   └── auth/              # Authentication & Portal components:
│   │   │       ├── Login.jsx          # Dual-tab Sign In (Citizen & Department)
│   │   │       ├── SignUp.jsx         # Sign Up with role-specific profile creation
│   │   │       ├── ForgotPassword.jsx # Recovery-code password reset
│   │   │       ├── DeptDashboard.jsx  # Official Leaflet GIS Command Dashboard
│   │   │       └── ProtectedRoute.jsx # Role-based route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Supabase session, profile, and role state
│   │   │   └── AppContext.jsx     # Voice, complaint draft, and language context
│   │   ├── data/                  # Multilingual dictionaries & fallback models
│   │   ├── lib/                   # Supabase JS client configuration
│   │   ├── App.jsx                # Application routing configuration
│   │   └── index.css              # Custom styling & glassmorphism theme
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite build & proxy settings
│
├── frontendback/                  # Optional Standalone Python Whisper Service
│   └── main.py                    # Local FastAPI Whisper audio transcription server
│
└── SIH year 1/                    # Monorepo Backend & Database Schema
    ├── server/                    # FastAPI Server Gateway
    ├── services/                  # AI business logic & Groq integration
    └── packages/database/         # PostgreSQL schema DDL & triggers
```

---

## ⚙️ Environment Variables

Create a `.env` file in `frontend/` (for local development) and configure environment variables in your Vercel Dashboard:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Engine Configuration (Optional - has keyword fallback)
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Backend URL (Optional - leave empty to use serverless /api endpoints)
VITE_BACKEND_URL=
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/abhishek18407-pixel/SIH-LATEST.git
cd SIH-LATEST

# Install frontend dependencies
cd frontend
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🚢 Vercel Deployment

This repository is pre-configured with `vercel.json` for **1-click deployment on Vercel**:

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Update project deployment"
   git push origin main
   ```
2. Import the repository in [vercel.com/new](https://vercel.com/new).
3. Set the Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GROQ_API_KEY`).
4. Click **Deploy**!

> For full deployment steps, refer to [VERCEL_DEPLOYMENT.md](file:///c:/VS%20CODE/SIH%20year%201/VERCEL_DEPLOYMENT.md).

---

## 🧪 Route Map & Navigation

| Route | Access | Component | Purpose |
|---|---|---|---|
| `/` | Public | `Login` | **Default Landing**: Sign in as Citizen or Official |
| `/login` | Public | `Login` | Dual-tab Authentication |
| `/signup` | Public | `SignUp` | Registration with 6-char recovery code |
| `/forgot-password` | Public | `ForgotPassword` | Recovery-code based instant password reset |
| `/home` | Citizen | `Welcome` | Citizen overview, quick report & tracking buttons |
| `/language` | Citizen | `LanguageSelect` | Select preferred Indian regional language |
| `/report` | Citizen | `ReportIssue` | Voice recording, photo attachment & location capture |
| `/review` | Citizen | `AIReview` | Review AI-classified summary & submit grievance |
| `/registered` | Citizen | `ComplaintRegistered`| Success receipt with Tracking ID |
| `/track` | Citizen | `ComplaintTracking` | Live grievance status timeline |
| `/dept-dashboard` | Official | `DeptDashboard` | Municipal command center with Leaflet GIS map |

---

## 📄 License

Distributed under the MIT License. Developed for the Smart India Hackathon (SIH).
