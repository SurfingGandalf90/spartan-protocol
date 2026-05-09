# Spartan Protocol — Setup Guide

## What this is
A full Next.js web app with:
- Google / email authentication via Supabase
- Profile switching (you + wife, separate programs + logs)
- All logs stored in Supabase Postgres — never reset
- Deploys to Vercel — permanent URL, add to home screen

---

## Step 1 — Run the database schema

1. Go to https://supabase.com → your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `schema.sql` from this folder and paste the entire contents
5. Click **Run**
6. You should see "Success. No rows returned"

---

## Step 2 — Enable Google Auth in Supabase

1. In Supabase → **Authentication** → **Providers**
2. Enable **Google**
3. Go to https://console.cloud.google.com
4. Create a new project → APIs & Services → Credentials
5. Create OAuth 2.0 Client ID (Web application)
6. Add authorized redirect URI: `https://iczsbmhitspbixtnjwau.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret back to Supabase

Or skip Google and just use **Email** — Supabase enables this by default.

---

## Step 3 — Push to GitHub

1. Create a new repo at github.com (call it `spartan-protocol`)
2. In terminal:
```bash
cd spartan-app
git init
git add .
git commit -m "Initial Spartan Protocol"
git remote add origin https://github.com/YOUR_USERNAME/spartan-protocol.git
git push -u origin main
```

---

## Step 4 — Deploy to Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repo
3. Vercel auto-detects Next.js
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://iczsbmhitspbixtnjwau.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full key)
5. Click **Deploy**
6. Vercel gives you a URL like `spartan-protocol.vercel.app`

---

## Step 5 — Add to home screen

**iPhone Safari:**
1. Open your Vercel URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Done — it opens like a native app

---

## Updating the program (new weeks etc.)

When Claude updates your program:
1. Claude gives you updated files
2. Replace them in the repo
3. `git push` — Vercel auto-deploys in ~60 seconds
4. Your logs are in Supabase — completely untouched

---

## Your wife's profile

Her profile appears in the selector screen.
When her program is ready, Claude will add it to `lib/program-wife.ts`
and wire it into the profile selector.

---

## Supabase credentials (keep these safe)
URL: https://iczsbmhitspbixtnjwau.supabase.co
Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
