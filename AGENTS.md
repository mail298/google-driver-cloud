# AGENTS.md

## Project Overview

Drive9 is a Google Drive and S3-compatible storage gateway. It lets users register/login with email/password or Google, automatically connect the first Drive account during Google sign-in, connect additional Google Drive/S3 accounts, track combined quota, upload files through the backend into a dedicated `9drive` folder, organize files in virtual folders, preview/download/share files, sync MySQL file records from Google Drive and S3, invite other users to files/folders, and route uploads to the connected account with enough free space via configurable routing policy.

## Repository Structure

```txt
backend/   Express API, TypeScript, Prisma schema/migrations, MySQL access, auth, Google OAuth/Drive, S3 integration.
frontend/  Vite React app, protected dashboard UI, file/folder management, sharing, uploads, quota/settings pages.
docker-compose.yml   MySQL, backend, and nginx-served frontend services.
.env.docker.example  Docker environment template.
README.md            Local setup, Google Cloud setup, Docker notes, deployment notes.
setup.sh / setup.ps1 Automated setup scripts (generate secure keys, install deps, run Prisma).
update.sh            Automated system update script (git pull, build, migrate, pm2 restart).
```

## Requirements

- Node.js 20+
- npm
- MySQL 8+
- Google Cloud project with Google Drive API enabled
- Google OAuth client ID and secret

## Backend

Stack:
- Express 5
- TypeScript
- Prisma 6
- MySQL
- Zod
- JWT bearer auth
- Argon2 password hashing
- Busboy streaming uploads
- Google APIs client
- AWS SDK v3 (S3-compatible: MinIO, R2, Wasabi, Backblaze, AWS S3)
- Undici for Google file streaming
- Nodemailer for password reset emails
- express-rate-limit for auth/public API rate limiting

Important files:
- `backend/src/server.ts`: server entrypoint — runs migrations BEFORE app.listen, then starts Telegram bot listener.
- `backend/src/app.ts`: Express app, route mounting, CORS, rate limiting, robots.txt and sitemap.xml generation.
- `backend/src/config/env.ts`: environment validation via Zod (single source of truth, no duplicate fallback).
- `backend/src/config/prisma.ts`: Prisma client singleton.
- `backend/src/config/proxy.ts`: global HTTP proxy setup via undici/https-proxy-agent.
- `backend/prisma/schema.prisma`: database schema — 16 migrations.
- `backend/src/middleware/auth.middleware.ts`: bearer auth (AuthRequest / AuthenticatedRequest types).
- `backend/src/middleware/error.middleware.ts`: JSON error responses + Telegram error notification.
- `backend/src/middleware/rate-limit.middleware.ts`: authRateLimit, publicApiRateLimit, generalRateLimit.
- `backend/src/middleware/api-key.middleware.ts`: API key authentication for external uploads.
- `backend/src/middleware/ip-whitelist.middleware.ts`: IP whitelist enforcement for dashboard routes.
- `backend/src/modules/auth/auth.routes.ts`: all auth endpoints (email/pass + Google OAuth flow).
- `backend/src/modules/files/file.routes.ts`: file CRUD, share, preview-token, batch ops, sync.
- `backend/src/modules/files/stream-google-file.ts`: Google file preview/download streaming via undici.
- `backend/src/modules/files/stream-file.ts`: provider-agnostic stream dispatcher (Google or S3).
- `backend/src/modules/folders/folder.routes.ts`: virtual folder CRUD, nested hierarchy.
- `backend/src/modules/uploads/upload.routes.ts`: multipart upload (internal) + resumable chunked upload.
- `backend/src/modules/connected-accounts/connected-account.routes.ts`: Google Drive account connect/disconnect/sync.
- `backend/src/modules/provider-configs/provider-config.routes.ts`: global Google OAuth config management.
- `backend/src/modules/storage/storage.routes.ts`: storage summary and breakdown.
- `backend/src/modules/invites/invite.routes.ts`: file/folder share invites.
- `backend/src/modules/api-keys/api-key.routes.ts`: API key management (create, list, revoke).
- `backend/src/modules/public/public.routes.ts`: public shared file routes — tokenHash-only lookup, no auth.
- `backend/src/modules/public-api/public-api.routes.ts`: external upload API (rate-limited, API-key auth).
- `backend/src/modules/audit-logs/audit-log.routes.ts`: audit log query.
- `backend/src/modules/system/system.routes.ts`: analytics, error logs, IP whitelist mgmt, update trigger, DB backup/restore, Telegram test.
- `backend/src/modules/google/google.service.ts`: Google OAuth, Drive API, quota sync, file sync.
- `backend/src/modules/s3/s3.service.ts`: S3-compatible storage client, upload, quota sync.
- `backend/src/scripts/seed-google-config.ts`: stores encrypted global Google OAuth config.
- `backend/src/scripts/seed-google-config-if-present.ts`: Docker auto-seed (only when real credentials are set).
- `backend/src/scripts/reset-user-password.ts`: CLI user password reset tool.
- `backend/src/scripts/test-s3-connection.ts`: S3 connectivity smoke test.
- `backend/src/scripts/test-api-upload.ts`: external API upload smoke test.
- `backend/src/utils/crypto.ts`: AES-256-GCM encrypt/decrypt, SHA-256 hash, random token generation.
- `backend/src/utils/logger.ts`: JSON error log with async write queue to `backend/logs/`.
- `backend/src/utils/cdn.ts`: SHA-256 hash-based CDN subdomain round-robin selector.
- `backend/src/utils/ip-whitelist.store.ts`: IP whitelist persistence (file-based + DB-backed via AllowedIp model).
- `backend/src/utils/ip.ts`: real client IP extraction (x-forwarded-for aware).
- `backend/src/utils/jwt.ts`: JWT sign/verify helpers.
- `backend/src/utils/password.ts`: Argon2 hash/verify wrappers.
- `backend/src/utils/audit.ts`: audit log creation helper.
- `backend/src/services/mail.service.ts`: SMTP email service for password reset (clean plain-text inbox style + HTML fallback).
- `backend/src/services/telegram.service.ts`: Telegram HTTP notifications for errors.
- `backend/src/services/telegram-bot.service.ts`: Telegram bot command handler (/addip, /delip, /whitelist).

Commands:
- `cd backend && npm run dev`: start development server (tsx watch).
- `cd backend && npm run build`: typecheck/build backend (tsc).
- `cd backend && npm run start`: run compiled backend from `dist/server.js`.
- `cd backend && npm run start:deploy`: run `db:migrate:deploy` then `node dist/server.js` (production combined).
- `cd backend && npm run db:migrate:deploy`: run Prisma production migrations (no reset).
- `cd backend && npm run prisma:migrate`: run Prisma dev migration (creates new migration).
- `cd backend && npm run prisma:generate`: regenerate Prisma client.
- `cd backend && npm run seed:google-config`: store encrypted Google OAuth config in DB.
- `cd backend && npm run seed:google-config:docker`: auto-seed only when real credentials are set (used by Docker startup).
- `cd backend && npm run reset-password -- <email> <newPassword>`: reset user password directly from CLI.
- `cd backend && npm run test:s3`: test S3 connection.
- `cd backend && npm run test:api-upload`: test external API upload.

Environment:
- `DATABASE_URL`
- `APP_PORT`
- `FRONTEND_URL`
- `JWT_ACCESS_SECRET` — must be ≥32 chars; security warning printed if using default
- `TOKEN_ENCRYPTION_KEY` — must be ≥32 chars; security warning printed if using default
- `RECAPTCHA_SECRET_KEY` (optional; enables captcha when paired with frontend site key)
- `ACCESS_TOKEN_TTL_SECONDS`
- `REFRESH_TOKEN_TTL_DAYS`
- `MAX_UPLOAD_BYTES`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `ADMIN_ALLOWED_IPS` (optional; comma-separated IPs for IP whitelist, empty = allow all)
- `IP_WHITELIST_SECRET_KEY` (optional; secret for whitelist management API)
- `TELEGRAM_BOT_TOKEN` (optional; enables Telegram bot notifications)
- `TELEGRAM_CHAT_ID` (optional; Telegram chat target for notifications)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` (optional; SMTP config for password reset)
- `CDN_SUBDOMAINS` (optional; comma-separated CDN subdomain URLs for media streaming)
- `HTTP_PROXY` / `HTTPS_PROXY` / `GLOBAL_PROXY_URL` (optional; proxy settings)

Backend conventions:
- Put route logic under `backend/src/modules/<feature>/<feature>.routes.ts`.
- Mount new routers in `backend/src/app.ts`.
- Use `requireAuth` for authenticated routes.
- Use `AuthRequest` when accessing `req.user` optionally; `AuthenticatedRequest` when guaranteed.
- Validate request bodies/query params with Zod.
- Use Prisma from `backend/src/config/prisma.ts`.
- Return JSON errors with stable `code` and human-readable `message`.
- Pass unexpected errors to `next(error)`.
- Convert `bigint` values to strings before sending JSON responses.
- Keep Google-specific OAuth/Drive behavior in `modules/google/google.service.ts`.
- Keep S3-specific behavior in `modules/s3/s3.service.ts`.
- Keep public-token routes outside `requireAuth`; verify tokenHash, status, and expiry before streaming.
- Google sign-in/register uses one-time auth handoff tokens; never send app tokens through URL params.
- Email/password registration verifies reCAPTCHA only when `RECAPTCHA_SECRET_KEY` is configured.
- Apply `authRateLimit` to all `/auth` routes; `publicApiRateLimit` to `/api` routes.

Security rules:
- Never commit `.env` files or secrets.
- Never log access tokens, refresh tokens, OAuth client secrets, JWT secrets, encryption keys, or raw tokens.
- Google tokens are encrypted before database storage.
- App refresh tokens are hashed before database storage.
- Auth handoff, share, and preview tokens are stored as hashes — **never do raw-token DB lookups**.
- The `FileShare.token` column (raw) exists in schema for backward compatibility; all lookups use `tokenHash` only.
- Uploaded files must stream through backend to Google Drive/S3; do not store files on disk.
- Keep CORS restricted by `FRONTEND_URL`.
- Default `JWT_ACCESS_SECRET` and `TOKEN_ENCRYPTION_KEY` are hardcoded for local dev convenience — a startup warning is printed. Override in production.

Database rules:
- Change DB schema through Prisma schema and migrations.
- Do not hand-edit generated Prisma client files.
- After schema changes, run Prisma migration/generation and backend build.
- Add indexes for new common filters before relying on them in hot paths.

## Frontend

Stack:
- React 19
- Vite 8
- TypeScript
- React Router 7
- Tailwind CSS 4
- lucide-react
- framer-motion
- class-variance-authority
- clsx / tailwind-merge

Important files:
- `frontend/src/main.tsx`: React entrypoint.
- `frontend/src/App.tsx`: route registration, code splitting (safeLazy), ErrorBoundary, LanguageProvider.
- `frontend/src/layouts/DriveLayout.tsx`: protected app shell, sidebar, header search, storage sidebar stats.
- `frontend/src/pages/LandingPage.tsx`: public marketing landing page.
- `frontend/src/pages/LoginPage.tsx`: email/password login form.
- `frontend/src/pages/RegisterPage.tsx`: email/password registration form with optional reCAPTCHA.
- `frontend/src/pages/ForgotPasswordPage.tsx`: password reset request form.
- `frontend/src/pages/ResetPasswordPage.tsx`: token verification and new password submission form.
- `frontend/src/pages/GoogleAuthPage.tsx`: Google OAuth handoff token exchange page.
- `frontend/src/pages/GoogleConnectedPage.tsx`: confirmation page after Google Drive account connected.
- `frontend/src/pages/AllFilesPage.tsx`: core file/folder UI, uploads, context menus, preview, share/invite modals.
- `frontend/src/pages/QuotaTrackerPage.tsx`: connected-account quota UI.
- `frontend/src/pages/SharedPage.tsx`: shared links and invites UI.
- `frontend/src/pages/TrashPage.tsx`: soft-deleted files with restore/permanent-delete.
- `frontend/src/pages/ActivityLogPage.tsx`: audit log viewer.
- `frontend/src/pages/SettingsPage.tsx`: Google/S3 account management, routing policy, API credentials, system update, DB backup/restore.
- `frontend/src/pages/ApiManagementPage.tsx`: API key management and in-app developer documentation.
- `frontend/src/pages/PublicFilePage.tsx`: public shared file viewer/embed page (no auth required).
- `frontend/src/pages/PrivacyPage.tsx`: privacy policy page.
- `frontend/src/pages/TermsPage.tsx`: terms of service page.
- `frontend/src/pages/ForbiddenPage.tsx`: IP-blocked / 403 forbidden page.
- `frontend/src/pages/RecentPage.tsx`: recent files placeholder (sidebar nav).
- `frontend/src/pages/StarredPage.tsx`: starred files placeholder (sidebar nav).
- `frontend/src/pages/ArchivedPage.tsx`: archived files placeholder (sidebar nav).
- `frontend/src/pages/SitemapPage.tsx`: frontend sitemap.xml proxy route.
- `frontend/src/pages/RobotsPage.tsx`: frontend robots.txt proxy route.
- `frontend/src/components/auth/GoogleLogo.tsx`: Google button SVG logo.
- `frontend/src/components/auth/ProtectedRoute.tsx`: access token check + IP-blocked event handler.
- `frontend/src/components/common/Seo.tsx`: per-page SEO meta tags.
- `frontend/src/components/drive/OnboardingModal.tsx`: multi-step interactive user guide modal.
- `frontend/src/components/drive/LanguageSwitcher.tsx`: ID/EN language toggle.
- `frontend/src/components/drive/BrandLogo.tsx`: Drive9 brand logo component.
- `frontend/src/components/drive/AvatarStack.tsx`: stacked user avatar display.
- `frontend/src/components/drive/FileTable.tsx`: list-view file table with sortable columns.
- `frontend/src/components/drive/FileGrid.tsx`: grid-view file card layout.
- `frontend/src/components/drive/FileIcon.tsx`: file type icon resolver.
- `frontend/src/components/drive/FileContextMenu.tsx`: right-click context menu for files.
- `frontend/src/components/drive/FolderContextMenu.tsx`: right-click context menu for folders.
- `frontend/src/components/drive/EmptyAreaContextMenu.tsx`: right-click context menu for empty canvas area.
- `frontend/src/components/drive/FolderGrid.tsx`: grid-view folder card layout.
- `frontend/src/components/drive/FolderVisual.tsx`: animated folder visual component.
- `frontend/src/components/drive/FileDetailsDrawer.tsx`: slide-in file details side drawer.
- `frontend/src/components/drive/DummyModal.tsx`: placeholder modal for unimplemented features.
- `frontend/src/components/drive/MetricCard.tsx`: stat/metric card for quota and analytics.
- `frontend/src/components/drive/PageHeader.tsx`: consistent page title/header component.
- `frontend/src/components/ui/button.tsx`: Button UI primitive (CVA variants).
- `frontend/src/components/ui/card.tsx`: Card UI primitive.
- `frontend/src/components/ui/input.tsx`: Input UI primitive.
- `frontend/src/lib/api.ts`: apiFetch helper, token refresh retry, formatBytes, formatDate, formatCdnUrl.
- `frontend/src/lib/auth.ts`: localStorage-based auth session management.
- `frontend/src/lib/file-utils.ts`: file type detection, icon mapping, MIME type utilities.
- `frontend/src/lib/gravatar.ts`: Gravatar URL generator.
- `frontend/src/lib/plyr.ts`: video preview player (Plyr) dynamic loader.
- `frontend/src/lib/preview.ts`: preview URL helpers.
- `frontend/src/lib/utils.ts`: `cn()` utility (clsx + tailwind-merge).
- `frontend/src/context/LanguageContext.tsx`: i18n context — flat key-value translation dictionary (id/en).
- `frontend/src/context/UploadContext.tsx`: resumable chunked upload state and logic (5MB chunks).
- `frontend/src/data/drive-data.ts`: **MOCK DATA ONLY** — for landing page previews, not real API data.
- `frontend/src/style.css`: Tailwind v4 import and global styles.
- `frontend/public/`: static assets — favicon.svg, logo.png, PWA icons, robots.txt, sitemap.xml.
- `frontend/vite.config.ts`: Vite config — React plugin, VitePWA, path alias `@/`, manual chunk splitting.

Commands:
- `cd frontend && npm run dev`: start Vite dev server.
- `cd frontend && npm run build`: typecheck/build frontend.
- `cd frontend && npm run preview`: preview production build.

Environment:
- `VITE_API_URL`: backend base URL. Vite embeds this at build time.
- `VITE_RECAPTCHA_SITE_KEY`: optional reCAPTCHA site key. Blank = captcha disabled.
- `VITE_CDN_SUBDOMAINS`: optional comma-separated CDN URLs for media streaming.

Frontend conventions:
- Use `@/*` imports for files under `frontend/src`.
- Keep route registration in `frontend/src/App.tsx`.
- Use `apiFetch` for normal JSON API calls.
- Use raw `fetch` or `XMLHttpRequest` only when response streaming/blob/progress requires it.
- Keep access/refresh token handling centralized in `frontend/src/lib/api.ts` and `frontend/src/lib/auth.ts`.
- Use existing `Button`, `Card`, and `Input` primitives before adding new UI primitives.
- Use `cn` from `frontend/src/lib/utils.ts` for conditional class names.
- Preserve current Tailwind visual style unless task explicitly asks redesign.
- Keep protected dashboard pages inside `ProtectedRoute` and `DriveLayout`.
- Keep file/folder URL state in query params when it affects navigation, e.g. `folderId` and `q`.
- The `Drive9:onboarding-completed` localStorage key controls whether the onboarding modal is shown.
- The `app_chunk_retry` sessionStorage key prevents infinite reload loops on chunk load failure.

## API Notes

General:
- `GET /health`
- Authenticated routes expect `Authorization: Bearer <accessToken>` unless listed as public.

Auth (rate-limited: 10 req/15min per IP):
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/change-password`
- `POST /auth/forgot-password`
- `POST /auth/verify-reset-token`
- `POST /auth/reset-password`
- `GET /auth/google/url`
- `GET /auth/google/callback`
- `POST /auth/google/exchange`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Provider configs:
- `POST /provider-configs/google`
- `GET /provider-configs`
- `DELETE /provider-configs/:id`

Google connected accounts:
- `GET /connected-accounts/google/connect-url`
- `GET /connected-accounts/google/connect`
- `GET /connected-accounts/google/callback`
- `GET /connected-accounts`
- `POST /connected-accounts/:id/sync-quota`
- `DELETE /connected-accounts/:id`

Storage:
- `GET /storage/summary`
- `GET /storage/breakdown`

Folders:
- `GET /folders?parentId=<id>`
- `GET /folders?all=1`
- `GET /folders/recent?limit=4`
- `POST /folders`
- `PATCH /folders/:id`
- `DELETE /folders/:id`

Files:
- `GET /files`
- `GET /files?folderId=<id>`
- `GET /files?q=<search>`
- `GET /files?kind=<image|video|pdf|doc|archive>`
- `GET /files?accountId=<id>&minSize=<bytes>&maxSize=<bytes>&startDate=<iso>&endDate=<iso>`
- `GET /files/shared-links`
- `GET /files/:id`
- `PATCH /files/:id`
- `PATCH /files/batch`
- `DELETE /files/batch`
- `POST /files/sync-google`
- `POST /files/batch-download` (returns ZIP)
- `POST /files/:id/share`
- `DELETE /files/:id/share`
- `POST /files/:id/preview-token`
- `POST /files/:id/public-permission`
- `GET /files/:id/view-url`
- `GET /files/:id/download`
- `DELETE /files/:id`
- `GET /files/preview/:token`

Invites:
- `GET /invites`
- `POST /invites`
- `DELETE /invites/:id`

Public shared files (no auth required):
- `GET /share/files/:token`
- `GET /share/files/:token/download`
- `GET /share/files/:token/preview`

Uploads:
- `POST /uploads` (internal dashboard upload, multipart)
- `POST /uploads/resumable/init`
- `POST /uploads/resumable/chunk`
- `GET /uploads/resumable/status/:sessionId`

External API (rate-limited: 60 req/min per IP, API key required):
- `POST /api/v1/uploads`

API Keys:
- `GET /api-keys`
- `POST /api-keys`
- `DELETE /api-keys/:id`

Audit Logs:
- `GET /audit-logs`

System:
- `GET /system/analytics`
- `POST /system/telegram-test`
- `GET /system/error-logs`
- `GET /system/error-logs/download`
- `DELETE /system/error-logs`
- `POST /system/update`
- `GET /system/update-log`
- `GET /system/ip-whitelist`
- `POST /system/ip-whitelist`
- `DELETE /system/ip-whitelist/:ip`
- `POST /system/db-backup`
- `POST /system/db-restore`

## Docker

Commands:
- `docker compose up -d --build`: build and start MySQL, backend, frontend.
- `docker compose exec backend npm run seed:google-config`: seed Google config inside backend container.
- `docker compose logs -f backend`: backend logs.
- `docker compose logs -f frontend`: frontend logs.
- `docker compose logs -f mysql`: MySQL logs.
- `docker compose down`: stop services.
- `docker compose down -v`: stop services and remove DB volume.

Docker notes:
- MySQL image is `mysql:8.4`.
- Backend listens on port `80` inside container (mapped via reverse proxy).
- Frontend build is served by nginx on host port `5173`.
- Frontend build arg `VITE_API_URL` is embedded at build time — rebuild when changed.
- Backend runs Prisma migrations and Google config seed automatically on startup.
- Default secrets in `docker-compose.yml` exist for zero-config dev; override in `.env` for production.

## Features (Current)

- Google Drive multi-account storage gateway
- S3-compatible storage (MinIO, Cloudflare R2, Wasabi, Backblaze B2, AWS S3)
- Upload routing policies: most-available, round-robin, priority-order
- Resumable chunked uploads (5MB chunks)
- Direct stream upload — files never stored on server disk
- Virtual folder organization (MySQL-only, no physical Google Drive folders)
- File preview, download, rename, move, soft-delete, permanent delete
- Recycle bin / trash with restore
- Public share links (tokenHash-based, expiry-optional)
- File invites with Viewer/Editor roles
- Multi-account quota tracking and sync
- Google Drive `9drive` folder sync (MySQL ↔ Google Drive)
- S3 sync
- Batch download as ZIP
- External upload API with API key auth (Bearer / X-API-Key header)
- API key management (one-time secret display, hash storage, last-used, revocation, scopes)
- In-app API documentation with cURL/JS/Python examples
- Multi-language UI (Bahasa Indonesia 🇮🇩 / English 🇺🇸) via LanguageContext
- Interactive onboarding modal (multi-step user guide)
- Bottom-right upload progress panel with retry support
- Audit log viewer
- IP whitelist (env + DB + Telegram bot commands)
- Telegram bot integration (/addip, /delip, /whitelist)
- Telegram error notifications
- CDN multi-subdomain round-robin for media streaming (Cloudflare compatible)
- Google OAuth config via Settings UI (no seed script required)
- Automated system update via Settings UI (update.sh + PM2)
- Real-time update log viewer in Settings
- DB backup and restore via Settings UI
- PWA support (vite-plugin-pwa, manifest, service worker)
- reCAPTCHA on email/password registration (optional)
- Self-service password reset with email delivery (15-min single-use tokens, hash storage, plain-text MIME alternative, anti-spam headers)
- Admin CLI user password reset tool (`npm run reset-password`)
- Dark mode / Light mode toggle
- Gravatar avatar integration

## Verification

Before finishing backend changes:
- `cd backend && npm run build`

Before finishing frontend changes:
- `cd frontend && npm run build`

Before finishing schema changes:
- `cd backend && npm run prisma:migrate`
- `cd backend && npm run build`

Manual smoke test:
- Register/login.
- Test Forgot Password flow (`/forgot-password`) and reset token verification (`/reset-password`).
- Open Settings → Connect Google Drive.
- Verify connected account appears.
- Open Quota Tracker and sync quota.
- Create nested folders in All Files.
- Use header search for an uploaded file name.
- Upload one or more files and verify progress panel.
- Switch file list/grid view.
- Right-click file and test preview/download/rename/move/share/invite/delete.
- Open Shared page and verify shared links/invites.
- Open public file link and test preview/download.
- Open API Keys page and create a key.
- Test external upload via `npm run test:api-upload`.
- Check Activity Log.

## Agent Rules

- Prefer small, targeted changes.
- Preserve existing architecture and naming.
- Do not introduce new dependencies unless necessary.
- Do not commit secrets.
- Do not edit `node_modules`, build output, or generated Prisma client.
- Do not change auth/token storage behavior without explicit reason.
- Do not change Google OAuth scopes or redirect behavior without checking README and env requirements.
- Do not change upload behavior to write files to disk.
- Public file share lookups must use `tokenHash` only — never raw `token` field comparison.
- Rate limiting is applied: `authRateLimit` → `/auth`, `publicApiRateLimit` → `/api`, `generalRateLimit` → all.
- Brand name is **Drive9** (lowercase d, 9 at end). Use consistently in all UI text, comments, and docs.
