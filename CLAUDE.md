# EngLion

A skills marketplace for AI agent skills (Claude Code, Codex, etc.). Built with Next.js 16 + Tailwind CSS v4.

## Project Structure

- `src/app/` — Next.js App Router pages
  - `page.js` — Home page (skills catalog with search/filter)
  - `skills/[slug]/page.js` — Skill detail page (markdown rendered)
- `src/data/skills.json` — Skill metadata and content
- `data/` — Build scripts for data extraction

## Commands

- `npm run dev` — Start dev server (http://localhost:3000)
- `npm run build` — Production build
- `npm start` — Start production server

## Domain

- Production: englion.xyz
- Deployed on Vercel
