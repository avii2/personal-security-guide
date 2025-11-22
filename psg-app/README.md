# Personal Security Guide (React + Vite)

Fresh static app powered by Vite, React, TypeScript, Tailwind, and the existing `personal-security-checklist.yml` data. Progress is stored locally (no auth, no analytics) and can be exported or printed to PDF.

## Setup
```bash
cd psg-app
npm install
npm run dev
```
Open http://localhost:5173.

## Build
```bash
npm run build
npm run preview
```

## Deploy to Surge
```bash
npm run deploy
```
By default deploys to `personal-security-guide.surge.sh`. Change the domain in `package.json` if you want another Surge subdomain.

## Data
- Checklist source: `public/personal-security-checklist.yml`
- Progress saved in `localStorage` under `psg_progress_v1`

## Features
- Checklist browsing with search and priority filters
- Local-only progress tracking
- Dark/Light theme toggle
- Print/Save-as-PDF friendly view
- Export progress to JSON
