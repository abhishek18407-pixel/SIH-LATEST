# 📱 Citizen Mobile Web Application (Frontend)

The frontend application for the **Smart City Civic Grievance Redressal System**, built with **React 19**, **Vite**, and **React Router v7**.

---

## 🌟 Key Application Screens & Workflow

1. **Welcome (`/`)**: Landing page introducing citizens to the quick grievance filing process.
2. **Language Selection (`/language`)**: Select preferred regional language (Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, Gujarati, Punjabi, Malayalam, Urdu, English).
3. **Report Issue (`/report`)**: File grievance using real-time voice recording (Web Audio API) or text input, with live GPS location tagging.
4. **AI Review & Verification (`/review`)**: Displays AI-extracted summary, urgency rating (`Low`, `Medium`, `High`, `Critical`), auto-assigned department, and location. Allows citizen confirmation or edits.
5. **Complaint Registered (`/registered`)**: Displays the unique tracking code (`#GR-2026-XXXX`) and direct link to track status.
6. **Complaint Tracking (`/track`)**: Real-time progress timeline showing status transitions (`PENDING` ➔ `IN_PROGRESS` ➔ `RESOLVED`).
7. **Conversational Assistant (`/ask`)**: Voice/text AI assistant allowing citizens to inquire about grievance updates conversationally.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: React 19 + Vite 8
- **Routing**: React Router v7 (`react-router-dom`)
- **Linting**: Oxlint (`oxlint`)
- **Styling**: Modern CSS Design System (`index.css` & `App.css`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The app will start at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🔗 Related Components

- Monorepo API Backend: [`../SIH year 1/server`](../SIH%20year%201/server)
- Whisper Audio Transcriber: [`../frontendback`](../frontendback)
- Root Repository README: [`../README.md`](../README.md)
