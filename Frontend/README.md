# School Attendance – Angular Frontend

Angular 20 (standalone components, signals, Reactive Forms, HttpClient, Router) admin UI for the existing
Spring Boot **School Attendance System**. The backend is not modified.

## Prerequisites
- Node.js **20.19+ or 22.12+** and npm 10+ (`node -v`)
- Backend running on **http://localhost:8282** (port from `application.properties`)

## Run locally
```bash
# 1. Backend (repo root, needs MySQL running and the DB credentials in application.properties)
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run

# 2. Frontend (this folder – put it at <repo>/Frontend)
cd Frontend
npm install
npm start                       # = ng serve  → http://localhost:4200
```
`ng serve` uses `proxy.conf.json`: browser calls to `/api/...` are forwarded to `http://localhost:8282/...`,
so **no CORS change is needed** on the backend during development.

Production build: `npm run build` → `dist/school-attendance-ui/browser`. Serve it behind a reverse proxy that maps
`/api` to the backend (or change `apiBaseUrl` in `src/environments/environment.ts` and add CORS on the backend –
that would need your approval/decision).

## Configuration (one place)
`src/environments/environment.ts`
- `apiBaseUrl` – backend base path (`/api` → proxied).
- `classListEndpoint` – leave `''` until a "list classes" endpoint exists (see docs/BACKEND_API_NOTES.md).

## Structure
```
src/app
  core/        api.config.ts, error.interceptor.ts (HTTP error normalisation), utils.ts (dates, validators)
  models/      school.models.ts  – interfaces matching the backend JSON
  services/    student / teacher / school-class / attendance services
  layouts/     main-layout (sidebar + top bar)
  shared/      modal, confirm dialog, toasts, field errors, icons, empty state, stats block
  pages/       dashboard, students, teachers, classes, attendance, reports
```
Details, limitations and the manual test checklist: [docs/BACKEND_API_NOTES.md](docs/BACKEND_API_NOTES.md).
