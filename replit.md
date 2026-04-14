# Workspace

## Overview

pnpm workspace monorepo using TypeScript. The primary artifact is **ShadowTrace OSINT Platform** — a full-stack cybersecurity intelligence investigation tool.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4
- **Routing**: Wouter
- **Charts**: Recharts

## Artifacts

### ShadowTrace OSINT Platform (`artifacts/shadowtrace`)
- **Type**: react-vite (frontend)
- **Preview path**: `/`
- **Theme**: Dark cyberpunk — neon green (#00ff88) and electric blue (#00d4ff) on near-black

#### Pages
- `/` — Dashboard with summary cards, weekly activity chart, module distribution bar chart, recent operations
- `/username` — Username OSINT: search across 12+ platforms
- `/email` — Email intelligence: breach detection, MX records, reputation score
- `/domain` — Domain intelligence: WHOIS, DNS records, subdomains, SSL info
- `/ip` — IP Tracker: geolocation, proxy/VPN/Tor detection, open ports
- `/phone` — Phone number lookup: carrier, country, line type, spam score
- `/metadata` — Metadata extractor: EXIF data, GPS coordinates from files
- `/reports` — Report generator: create and list investigation reports
- `/history` — Full search history with filter and clear
- `/ai` — AI OSINT assistant chat interface

### API Server (`artifacts/api-server`)
- **Type**: Express API
- **Preview path**: `/api`

#### Routes
- `GET /api/healthz` — Health check
- `GET /api/dashboard/summary` — Dashboard stats
- `GET /api/history` — Search history (filterable by module)
- `DELETE /api/history` — Clear history
- `POST /api/username/search` — Username OSINT
- `POST /api/email/intelligence` — Email intelligence
- `POST /api/domain/lookup` — Domain lookup
- `POST /api/ip/track` — IP geolocation
- `POST /api/phone/lookup` — Phone lookup
- `POST /api/metadata/extract` — Metadata extraction
- `POST /api/reports/generate` — Generate report
- `GET /api/reports` — List reports
- `POST /api/ai/chat` — AI assistant

## Database Tables

- `search_history` — Tracks all OSINT queries with module, query, risk score, status, timestamp
- `reports` — Saved investigation reports with title, target, risk score, modules, summary

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
