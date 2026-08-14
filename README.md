# 🏛️ Smart City Civic Grievance Redressal System (SIH-LATEST)

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-blue)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Language-Python%203.10+-3776AB)](https://www.python.org/)
[![AI Engine](https://img.shields.io/badge/AI-Groq%20%7C%20Gemini%20%7C%20Whisper-orange)](https://groq.com/)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E)](https://supabase.com/)

An AI-powered municipal grievance redressal system designed for Smart City civic management. The platform enables citizens to submit multi-lingual voice or text grievances, automatically transcribes and translates regional languages into English, classifies issue severity and urgency using LLMs, routes complaints to municipal departments, and provides real-time tracking for citizens alongside an OpenStreetMap GIS command dashboard for officers.

---

## 🚀 Key Features

- **🌐 Multi-Lingual Speech & Text Filing**: Supports 11+ Indian regional languages (Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, Gujarati, Punjabi, Malayalam, Urdu, English) using **OpenAI Whisper** and **Google Gemini API**.
- **🤖 Automated AI Classification & Auto-Routing**: Uses **Groq (Llama-3.1-8b-instant)** / **Gemini Flash** to parse raw text into structured JSON summaries, extracted landmarks, urgency levels (`Low`, `Medium`, `High`, `Critical`), and auto-assigned departments.
- **🗺️ Officer Command Dashboard**: Interactive OpenStreetMap Leaflet GIS heatmaps, grievance table, filtering by department/urgency/status, and status updates.
- **📱 Citizen Mobile Web Portal**: React 19 + Vite mobile-first web app with real-time tracking (`#GR-2026-XXXX`), status timeline, and a conversational AI status assistant.
- **⚡ Reliable Database & Audit Trail**: Supabase PostgreSQL connection with fallback in-memory store and complete status change audit logging.

---

## 📐 System Architecture

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                         CITIZEN MOBILE PORTAL                          │
 │                (React 19 + Vite / Port 5173 or 3000)                   │
 │  - Multi-Lingual Speech/Text Recording (Hindi, Tamil, Kannada, etc.)  │
 │  - Browser MediaRecorder & Geolocation API                             │
 │  - Unique Tracking Code Display (#GR-2026-XXXX) & Live Timeline       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ POST /api/complaints | POST /transcribe
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                  FASTAPI BACKEND GATEWAYS & ENGINES                    │
 │         (http://127.0.0.1:8000 & Standalone Whisper Service)          │
 └──────┬────────────────────────────┬─────────────────────────────┬──────┘
        │                            │                             │
        ▼                            ▼                             ▼
┌──────────────┐           ┌──────────────────┐           ┌──────────────────┐
│  AI ENGINE   │           │  SUPABASE DB     │           │ MUNICIPAL OFFICER│
│ (Gemini /    │           │  POSTGRESQL      │           │ DASHBOARD        │
│  Whisper /   │           │(users, complaints│           │ - Leaflet GIS    │
│  Llama-3.1)  │           │ departments,     │           │ - Map Heatmaps   │
└──────────────┘           │ status_logs)     │           │ - Dispatch Logs  │
                           └──────────────────┘           └──────────────────┘
```

---

## 📁 Repository Structure

```
SIH-LATEST/
├── README.md                      # Primary project repository documentation
├── frontend/                      # React 19 + Vite Citizen Mobile Web Application
│   ├── src/
│   │   ├── components/            # UI components (ReportIssue, AIReview, ComplaintTracking, etc.)
│   │   ├── context/               # React Context providers
│   │   ├── data/                  # Static & mock data references
│   │   ├── App.jsx                # App routes (/language, /report, /review, /track, /ask)
│   │   └── index.css              # Global styles & theme design system
│   ├── package.json               # Node.js dependencies & scripts
│   └── vite.config.js             # Vite configuration
├── frontendback/                  # Standalone FastAPI Whisper Transcriber Service
│   └── main.py                    # Fast API server with local Whisper medium model
└── SIH year 1/                    # Primary Full-Stack Monorepo
    ├── server/                    # FastAPI Server Gateway
    │   ├── main.py                # Main FastAPI entry point
    │   ├── db.py                  # Supabase database connection & in-memory fallback
    │   └── schemas.py             # Pydantic data schemas
    ├── services/                  # Core Business Services
    │   └── ai_engine.py           # Gemini API & Groq LLM transcription & classification
    ├── apps/                      # Monorepo Web Applications
    │   ├── citizen-portal/        # Lightweight Citizen Portal build
    │   └── officer-dashboard/     # Officer Command Dashboard with Leaflet GIS Map
    ├── packages/
    │   └── database/schema.sql    # Supabase PostgreSQL DDL schema & triggers
    └── tests/                     # Integration and End-to-End tests
        └── test_e2e_flow.py       # E2E system flow test suite
```

---

## ⚙️ Prerequisites & Setup

### Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: v3.10+ and `pip`
- **API Keys**: Groq API Key and/or Google Gemini API Key, Supabase Credentials

---

## 🛠️ Installation & Running Locally

### 1. Environment Configuration
Create a `.env` file inside `SIH year 1/`:
```bash
cp "SIH year 1/.env.example" "SIH year 1/.env"
```

Configure your environment variables in `.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

---

### 2. Running the Monorepo Backend API Gateway (Port 8000)

```bash
# Navigate to the monorepo directory
cd "SIH year 1"

# Install Python dependencies
pip install groq python-dotenv fastapi uvicorn python-multipart supabase httpx pydantic

# Start the FastAPI server
python -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 3. Running the React Frontend (Port 5173)

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

The React Citizen Mobile Application will be available at `http://localhost:5173`.

---

### 4. Running the Standalone Multilingual Whisper Backend (Port 8000)

If using the local Whisper model backend for audio transcription:

```bash
cd frontendback

# Install dependencies (requires openai-whisper and ffmpeg)
pip install fastapi uvicorn openai-whisper python-multipart

# Start local audio transcription server
python main.py
```

---

### 5. Launching Officer Dashboard & Citizen Portal Static Server

```bash
# Officer Command Dashboard (Port 3001)
python -m http.server 3001 --directory "SIH year 1/apps/officer-dashboard"

# Citizen Portal (Port 3000)
python -m http.server 3000 --directory "SIH year 1/apps/citizen-portal"
```

---

## 📡 Key API Endpoints

### 1. File / Submit Grievance
- **Endpoint**: `POST /api/complaints`
- **Content-Type**: `multipart/form-data`
- **Payload**:
  - `text` *(string, optional)*: Grievance description text.
  - `audio` *(file, optional)*: Audio recording file (`.webm`, `.wav`, `.mp3`).
  - `citizen_phone` *(string)*: Citizen contact number.
  - `lat` / `long` *(float, optional)*: Geolocation coordinates.

### 2. Local Audio Transcription & Translation
- **Endpoint**: `POST /transcribe`
- **Content-Type**: `multipart/form-data`
- **Payload**:
  - `file`: Audio recording file (`.webm`, `.mp3`).
  - `language` *(optional)*: Target 2-letter language code (`hi`, `kn`, `ta`, `te`, `mr`, `bn`, `gu`, `pa`, `ml`, `ur`, `en`).

### 3. List Complaints (Officer Dashboard Stream)
- **Endpoint**: `GET /api/complaints`
- **Query Params**: `department`, `urgency`, `status`

### 4. Track Complaint & View Timeline
- **Endpoint**: `GET /api/complaints/track/{tracking_id}`

### 5. Update Status
- **Endpoint**: `PATCH /api/complaints/{id}/status`
- **Body**: `{"status": "IN_PROGRESS", "notes": "Dispatched crew to site."}`

---

## 🧪 Testing

Run system end-to-end unit and integration tests:
```bash
cd "SIH year 1"
python -m unittest tests/test_e2e_flow.py
```

---

## 📄 License

This project is created for the Smart India Hackathon (SIH) Civic Redressal Track.
