# Recruweb Hostinger FINAL Deployment

This package is a single Node.js backend deployment that also contains the production
React frontend under `frontend/dist`.

Hostinger:
- Framework: Express
- Node.js: 24.x
- Startup file: start.cjs
- Application port: 5000 (set by PORT)
- Root URL serves the React frontend.
- `/api/*` serves the backend API.
- `/uploads/*` serves uploaded files.

Frontend API base (standalone static build):
https://api.recruweb.com/api

The embedded frontend in this backend bundle uses same-origin `/api` so it can
run directly from the Node.js application domain without cross-origin requests.

This bundle is intentionally self-contained so that a domain accidentally mapped
directly to the Node.js application can still render the frontend at `/`.
\n\nCORS / API FIX INCLUDED\n- The backend accepts CORS_ORIGINS, FRONTEND_URLS, and FRONTEND_URL.\n- OPTIONS preflight is handled before API rate limiting.\n- The embedded frontend now builds its API base from window.location.origin, so when this Node app is served on recruweb.com it calls https://recruweb.com/api directly and does not depend on a separate api.recruweb.com CORS hop.\n- If api.recruweb.com is also mapped to this same Node application, it remains supported.\n