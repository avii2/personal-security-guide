# Personal Security Guide

Modern, mobile-friendly security checklist app built with React, TypeScript, Vite, and Tailwind. Progress is stored locally (no accounts), data comes from a single YAML file, and you can export, print, or deploy statically (e.g., Surge).

## Key Features
- 📋 **Checklist browsing**: Sections with filterable items (Essential, Optional, Advanced).
- ✅ **Local progress tracking**: Stored in `localStorage` only—no backend, no analytics.
- 🎨 **Dark/Light themes**: Default dark theme with a clean, responsive layout.
- 📈 **Progress visuals**: Overall completion, per-priority bars, and per-section progress.
- 📤 **Export & Print**: Export progress to JSON or print/save as PDF.
- 🧩 **YAML content**: Source of truth is `personal-security-checklist.yml`.

## Project Structure
- `psg-app/` — React + Vite frontend (primary app).
  - `public/personal-security-checklist.yml` — checklist data.
  - `src/App.tsx` — main UI and logic.
  - `src/index.css` — Tailwind setup and base styles.
- `personal-security-checklist.yml` — root YAML data (mirrored into `psg-app/public`).

## Getting Started
```bash
cd psg-app
npm install
npm run dev   # http://localhost:5173
```

## Build & Preview
```bash
npm run build
npm run preview
```

## Deploy (Surge)
```bash
npm run deploy
```
By default deploys to `personal-security-guide.surge.sh` (configured in `package.json`). Change the domain if you prefer another Surge subdomain.

## Customizing Content
Edit `personal-security-checklist.yml` (root or `psg-app/public`) to change sections/items. The app will load updated YAML on the next build/dev run.

## Tech Stack
- React 19, TypeScript, Vite
- Tailwind CSS + Typography plugin
- js-yaml, marked

## Author
Created by **Anil Kumar**  
Repo: https://github.com/avii2/personal-security-guide  
Portfolio: https://mr_anil.surge.sh/  
Live Link : http://personal-security-guide.surge.sh/
License: MIT © Anil Kumar 2025
