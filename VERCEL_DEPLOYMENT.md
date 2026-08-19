# 🚀 Vercel Deployment Guide

This project is fully configured and ready for 1-click deployment on **Vercel** with full SPA client-side routing and built-in Serverless AI grievance classification.

---

## ⚡ Quick Deployment Methods

### Method 1: Deploy via Vercel Dashboard (GitHub / GitLab / Bitbucket)

1. **Push your repository to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment and serverless AI functions"
   git push origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository: `SIH-LATEST` (or your repository name).
4. In the **Project Settings / Configure Project** screen:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: `./` (or leave default root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `frontend/dist` (auto-configured in `vercel.json`)
5. Under **Environment Variables**, add the following:

| Variable Name | Value / Description | Required? |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://<your-project>.supabase.co` | **Yes** |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase publishable `anon` key | **Yes** |
| `GROQ_API_KEY` | `gsk_...` (for serverless AI categorization) | *Optional* (has built-in keyword fallback) |
| `GEMINI_API_KEY` | Your Google Gemini API Key | *Optional* |

6. Click **Deploy**! 🚀

---

### Method 2: Deploy using Vercel CLI

1. Install the Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project root:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

---

## ⚙️ Architecture on Vercel

```
                                  ┌───────────────────────────────┐
                                  │       VERCEL PLATFORM         │
                                  ├───────────────────────────────┤
  Citizen / Officer ─────────────►│  ⚡ High-Speed CDN Edge       │
  (React 19 + Vite SPA)           │  - /login, /report, /track    │
                                  │  - /dept-dashboard            │
                                  ├───────────────────────────────┤
                                  │  ⚡ Serverless Functions      │
                                  │  - /api/analyze (Groq AI)     │
                                  │  - /api/health                │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │     SUPABASE DATABASE         │
                                  │  - Auth, Profiles             │
                                  │  - Complaints & Timeline      │
                                  │  - Photo Storage              │
                                  └───────────────────────────────┘
```

---

## 🔑 Supabase Configuration for Production

After your Vercel deployment finishes and you have your live URL (e.g. `https://smart-city-grievance.vercel.app`):

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** ➔ **URL Configuration**.
3. Set **Site URL** to: `https://your-app-name.vercel.app`
4. In **Redirect URLs**, add:
   - `https://your-app-name.vercel.app/**`
   - `http://localhost:5173/**` (for local development)
5. Save changes.

---

## 🧪 Verifying Your Deployment

Once deployed, test the following:
- [x] **Page Reloads**: Visit `/report` or `/login` and refresh the browser (SPA rewrites ensure no 404).
- [x] **AI Analysis**: Type or speak a grievance description on `/report` and check automated classification.
- [x] **Health Check**: Open `https://your-app-name.vercel.app/api/health` to confirm serverless backend status.
- [x] **Citizen Registration & Login**: Test user authentication and grievance submission.
- [x] **Officer Dashboard**: Log in with officer credentials to view Leaflet GIS map and incoming tickets.
