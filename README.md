![9Drive cover](https://i.ibb.co.com/35BySv1C/image.png)

# Drive9

Drive9 is a storage gateway web app for connecting multiple Google Drive accounts into one virtual storage dashboard. Users can register with email/password or Google, automatically connect their first Google Drive account during Google sign-in, track quota, upload files into a dedicated `9drive` Drive folder, organize files with virtual folders, preview files, sync MySQL from Google Drive, and let the backend route uploads to the Drive account with enough free space.

## Features

- Google Drive and S3-compatible storage gateway in one virtual storage dashboard.
- S3-compatible storage support with custom endpoints for providers like MinIO, Cloudflare R2, Wasabi, Backblaze B2, and AWS S3.
- Direct upload stream to Google Drive. Files are not stored on the server.
- Google Drive uploads are stored under a root `9drive` folder.
- Direct upload stream to S3-compatible storage through the backend without exposing storage credentials to the frontend.
- Upload routing policies with most-available, round-robin, and priority-order modes.
- Multi-Language Support (i18n): Toggle seamlessly between Bahasa Indonesia 🇮🇩 and English 🇺🇸 across the entire application and interactive guide.
- External upload API (`POST /api/v1/uploads`) with optional `sizeBytes` auto-calculated from stream buffer.
- Real-time hard deletion & 1:1 database synchronization with Google Drive & S3.
- Interactive multi-step user guide modal with step-by-step feature tours for all dashboard pages.
- API key management with one-time secret display, hashed key storage, last-used tracking, and revocation.
- Email/password auth plus Google sign-in/register with automatic first Drive connection.
- Multi-account storage quota summary.
- Quota tracker page.
- Manual sync from the Google Drive `9drive` folder back into MySQL.
- Virtual folders.
- File preview, download, rename, move, and delete actions.
- In-app API documentation with cURL and JavaScript upload examples.
- Bottom-right upload progress panel.
- Bearer token authentication.
- Global Google OAuth config stored encrypted in DB (can be set via seed command or directly in Settings UI).
- Automated system updates via `update.sh` directly from the Settings UI (PM2 setup).
- Optional reCAPTCHA on email/password registration.
- MySQL database with Prisma migrations.
- Express + TypeScript backend.
- React + Vite frontend.

## Preview

Live preview: https://9drive.zenhosta.com

![9Drive dashboard preview](https://i.ibb.co.com/HLjG3JRf/image.png)

![9Drive shared file preview](https://i.ibb.co.com/QLpYGmx/image.png)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=zenhosta/9drive&type=Date)](https://www.star-history.com/#zenhosta/9drive&Date)

## Project Structure

```txt
backend/   Express API, Prisma schema, Google Drive integration
frontend/  Vite React app
```

## Requirements

- Node.js 20+
- npm
- MySQL running locally
- Google Cloud project
- Google OAuth Client ID and Client Secret

Default database used by this project:

```txt
host: localhost
port: 3306
database: 9drive
user: root
password: empty
```

## 1. Quick Setup & Installation (Recommended)

The easiest way to prepare the project is using the automated setup script. It generates local environment files with secure keys, installs dependencies, and generates the Prisma client. MySQL 8+ must already be running for local development; Docker setup includes MySQL.

### Windows (PowerShell)
Make sure to open PowerShell and navigate to the project directory first. For example, if you cloned the project to `E:\AUTO KLIK\9Drive`:

```powershell
# 1. Switch to the drive where the project is located (if necessary)
E:

# 2. Navigate to the project folder
cd "E:\AUTO KLIK\9Drive"

# 3. Run the automated setup script
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

### Linux/macOS

```bash
bash ./setup.sh
```

Enter your MySQL connection URL when prompted. Google Client ID/Secret can be skipped and configured later.

Once setup is complete, apply migrations and start backend and frontend in separate terminals:

```bash
cd backend
npm run prisma:migrate
npm run dev
```

```bash
cd frontend
npm run dev
```

---

## 2. Manual Installation (Alternative)

If you prefer to configure the project manually:

### 2.1 Install Dependencies
Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 2.2 Create Database (For MySQL)
Create a database:
```sql
CREATE DATABASE 9drive;
```
If using MySQL CLI:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS 9drive;"
```

### 2.3 Environment Setup


Create `backend/.env`:

```env
DATABASE_URL="mysql://root@localhost:3306/9drive"
APP_PORT=4000
FRONTEND_URL="http://localhost:5173"
JWT_ACCESS_SECRET="change-this-jwt-secret-at-least-32-chars"
TOKEN_ENCRYPTION_KEY="change-this-encryption-key-32bytes!"
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_DAYS=30
MAX_UPLOAD_BYTES=5368709120
RECAPTCHA_SECRET_KEY=""

# Used only by `npm run seed:google-config`.
# These values are encrypted and stored in DB as global Google OAuth config.
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:4000/connected-accounts/google/callback"
```

Important:

- `JWT_ACCESS_SECRET` should be long and random.
- `TOKEN_ENCRYPTION_KEY` should be long and random.
- Do not commit `backend/.env`.
- Google OAuth credentials are used by the seed script, then stored encrypted in the database.

## 3. Frontend Environment

Create or confirm `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_RECAPTCHA_SITE_KEY=
```

Captcha is disabled when `VITE_RECAPTCHA_SITE_KEY` or backend `RECAPTCHA_SECRET_KEY` is empty. Set both values to enable captcha on registration.

## 4. Run Prisma Migrations

```bash
cd backend
npm run prisma:migrate
```

If Prisma client generation is blocked on Windows by a running Node process, stop running backend/frontend dev servers and run:

```bash
npx prisma generate
```

## 5. Google Cloud Setup

Google setup is done in Google Cloud Console, not Google Search Console. Google Search Console is for website indexing/search ownership. OAuth and Drive API are managed in Google Cloud Console.

Open Google Cloud Console:

```txt
https://console.cloud.google.com/
```

### 6.1 Create Or Select Project

1. Open Google Cloud Console.
2. Click project selector in top bar.
3. Create a new project or select an existing project.
4. Remember the project name because OAuth client and Drive API must be in the same project.

### 6.2 Enable Google Drive API

1. Go to:

```txt
APIs & Services -> Library
```

2. Search:

```txt
Google Drive API
```

3. Open `Google Drive API`.
4. Click `Enable`.
5. Wait a few minutes if Google says the API was enabled recently.

Direct URL pattern:

```txt
https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=YOUR_PROJECT_ID
```

If Google Drive API is disabled, you will see an error like:

```txt
Google Drive API has not been used in project ... before or it is disabled.
```

### 6.3 Configure OAuth Consent Screen

1. Go to:

```txt
APIs & Services -> OAuth consent screen
```

2. Choose app type:

```txt
External
```

3. Fill required fields:

```txt
App name
User support email
Developer contact email
```

4. Add scopes:

```txt
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

Full Drive access is required so Google sign-in can connect the first Drive account automatically and sync files manually added to the `9drive` folder.

5. If publishing status is `Testing`, add test users.

Add every Google account that will test the app:

```txt
OAuth consent screen -> Test users -> Add users
```

If you do not add test users, Google may show:

```txt
Access blocked: app has not completed the Google verification process
Error 403: access_denied
```

### 6.4 Create OAuth Client

1. Go to:

```txt
APIs & Services -> Credentials
```

2. Click:

```txt
Create Credentials -> OAuth client ID
```

3. Application type:

```txt
Web application
```

4. Add authorized JavaScript origin:

```txt
http://localhost:5173
```

5. Add authorized redirect URI:

```txt
http://localhost:4000/connected-accounts/google/callback
```

6. Click Create.
7. Copy:

```txt
Client ID
Client Secret
```

### 5.5 Seed Google OAuth Config

Put values into `backend/.env`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/connected-accounts/google/callback"
```

Then run:

```bash
cd backend
npm run seed:google-config
```

This stores the Google OAuth config as a global encrypted provider config in MySQL. Google sign-in uses the same config and automatically connects the first Drive account. Logged-in users can still click `Connect Drive` in Settings to add more Drive accounts.

## 6. Run Development Servers

Start backend:

```bash
cd backend
npm run dev
```

Backend runs at:

```txt
http://localhost:4000
```

Start frontend:

```bash
cd frontend
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

## Docker Deployment

This repository includes Docker files for running MySQL, backend, and frontend together.

Files:

```txt
docker-compose.yml
.env.docker.example
backend/Dockerfile
frontend/Dockerfile
frontend/nginx.conf
```

### 1. Prepare Docker Env

Copy the example env file:

```bash
cp .env.docker.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.docker.example .env
```

Edit `.env`:

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=9drive

FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:4000
VITE_RECAPTCHA_SITE_KEY=

JWT_ACCESS_SECRET=replace-with-long-random-secret
TOKEN_ENCRYPTION_KEY=replace-with-long-random-secret
RECAPTCHA_SECRET_KEY=

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/connected-accounts/google/callback
```

Captcha is disabled when either `VITE_RECAPTCHA_SITE_KEY` or `RECAPTCHA_SECRET_KEY` is empty.

### 2. Start Containers

```bash
docker compose up -d --build
```

Services:

```txt
frontend: http://localhost:5173
backend:  http://localhost:4000
mysql:    localhost:3306
```

The backend container runs Prisma migrations automatically on startup:

```txt
npm run db:migrate:deploy
```

This applies pending migrations such as S3 storage support before the API starts, so deployments from an older database can update safely without dropping data.

It also seeds the global Google OAuth config automatically when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set to real values in `.env`. If those values are blank or still placeholders, the backend still starts and logs a warning. Google connect/sign-in will be unavailable until you set real Google OAuth credentials and restart the stack:

```bash
docker compose up -d --build
```

### 3. Seed Google OAuth Config Manually

Automatic Docker startup seeding is usually enough. If you update Google OAuth values while containers are already running, seed the global Google OAuth config manually:

```bash
docker compose exec backend npm run seed:google-config
```

This stores `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` from Docker env into MySQL as encrypted global config.

### 4. View Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

### 5. Stop Containers

```bash
docker compose down
```

Remove database volume too:

```bash
docker compose down -v
```

### Docker Production Notes

- Replace localhost URLs with production domain.
- Update Google OAuth authorized JavaScript origin.
- Update Google OAuth redirect URI.
- Use strong `JWT_ACCESS_SECRET` and `TOKEN_ENCRYPTION_KEY`.
- Do not expose MySQL port publicly in production.
- Put frontend/backend behind HTTPS reverse proxy.
- Rebuild frontend when `VITE_API_URL` changes because Vite embeds env at build time.
- Rebuild frontend when `VITE_RECAPTCHA_SITE_KEY` changes because Vite embeds env at build time.

### VPS Deployment (Step-by-Step)

Follow these steps to deploy 9Drive to a VPS (such as Ubuntu/Debian) using Docker:

#### 1. Install Docker & Docker Compose on your VPS
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

#### 2. Clone the Repository
```bash
git clone https://github.com/your-github-username/9drive.git
cd 9drive
```

#### 3. Setup the Production Environment
Copy the example environment file to `.env`:
```bash
cp .env.docker.example .env
```
Edit the `.env` file (e.g., `nano .env`) and configure the values for your production VPS domain/IP:
* **`FRONTEND_URL`**: Set to your public domain or VPS IP (e.g., `http://103.xxx.xxx.xxx:5173` or `https://9drive.yourdomain.com`).
* **`VITE_API_URL`**: Set to your public backend URL (e.g., `http://103.xxx.xxx.xxx:4000` or `https://api.9drive.yourdomain.com`).
* **`GOOGLE_REDIRECT_URI`**: Set to your public redirect callback URL (e.g., `http://103.xxx.xxx.xxx:4000/connected-accounts/google/callback`).
* Set secure credentials for **`JWT_ACCESS_SECRET`** and **`TOKEN_ENCRYPTION_KEY`** (encryption key must be exactly 32 characters/bytes).
* Add your **`GOOGLE_CLIENT_ID`** and **`GOOGLE_CLIENT_SECRET`**.

#### 4. Deploy the Containers
Run Docker Compose to build and start the database, backend, and frontend containers in the background:
```bash
docker compose up -d --build
```

#### 5. Seed the Google Configuration
Initialize the encrypted Google configuration in the database:
```bash
docker compose exec backend npm run seed:google-config
```

#### 6. Add Authorized URIs in Google Cloud Console
1. Go to **APIs & Services** -> **Credentials** in the Google Cloud Console.
2. Edit your OAuth 2.0 Web Client.
3. In **Authorized JavaScript origins**, add your frontend URL (e.g., `http://your-vps-ip:5173` or `https://9drive.yourdomain.com`).
4. In **Authorized redirect URIs**, add your redirect URI (e.g., `http://your-vps-ip:4000/connected-accounts/google/callback` or `https://api.9drive.yourdomain.com/connected-accounts/google/callback`).
5. Save changes.

### Non-Docker Production Startup

Run production migrations before starting the backend:

```bash
cd backend
npm run db:migrate:deploy
npm run start
```

Or use the combined command:

```bash
cd backend
npm run start:deploy
```

`npm run db:migrate:deploy` uses Prisma production migrations and does not reset the database. If Prisma reports migration drift, stop the deploy and repair migration history first; do not run `prisma migrate reset` on production.

## 8. Manual Test Flow

1. Open frontend:

```txt
http://localhost:5173
```

2. Register a user with email/password and captcha, or click `Continue with Google and connect Drive`.
3. If using Google sign-in, approve Drive access once and confirm `/settings` already shows the connected account.
4. If using email/password, open `Settings`, click `Connect Drive`, approve access, and confirm the account appears.
5. Open `Quota Tracker`.
6. Confirm quota appears.
7. Open `All Files`.
8. Create nested virtual folders.
9. Upload a file and confirm it appears under Google Drive root folder `9drive`.
10. Add or remove a file manually inside Google Drive folder `9drive`, then click `Sync Drive` in All Files.
11. Watch bottom-right upload progress.
12. Right-click file row for actions:

```txt
View
Download
Rename
Move to Folder
Delete
```

## API Overview

Auth:

```txt
POST /auth/register
POST /auth/login
GET /auth/google/url
GET /auth/google/callback
POST /auth/google/exchange
POST /auth/refresh
POST /auth/logout
GET /auth/me
```

Google accounts:

```txt
GET /connected-accounts/google/connect-url
GET /connected-accounts/google/callback
GET /connected-accounts
POST /connected-accounts/:id/sync-quota
DELETE /connected-accounts/:id
```

Storage:

```txt
GET /storage/summary
```

Folders:

```txt
GET /folders
GET /folders/recent?limit=4
POST /folders
DELETE /folders/:id
```

Files:

```txt
GET /files
GET /files?folderId=<id>
GET /files?q=<search>
GET /files/shared-links
GET /files/:id
PATCH /files/:id
PATCH /files/batch
DELETE /files/batch
POST /files/sync-google
POST /files/:id/share
DELETE /files/:id/share
POST /files/:id/preview-token
GET /files/:id/view-url
GET /files/:id/download
DELETE /files/:id
GET /files/preview/:token
```

Uploads:

```txt
POST /uploads
POST /api/v1/uploads
```

### External Upload API (`POST /api/v1/uploads`)

Developers can upload files programmatically from external scripts, applications, or landing page forms using API Keys.

#### Authentication Headers
Pass your secret API key via either header:
```http
Authorization: Bearer 9d_live_your_secret_api_key_here
```
Or:
```http
X-API-Key: 9d_live_your_secret_api_key_here
```

#### Form-Data Fields
Request format is `multipart/form-data`.
- `file` (File, **Required**): The binary file to upload.
- `sizeBytes` (Text, **Optional**): File size in bytes. If omitted, 9Drive automatically calculates the exact byte size from the upload stream buffer.
- `fileName` (Text, **Optional**): Custom file name (defaults to original filename).
- `mimeType` (Text, **Optional**): File MIME type.
- `folderPath` or `folderName` (Text, **Optional**): Target folder name/path (e.g. `Namafolder` or `landingpage/Namafolder`). **If the folder does not exist yet, 9Drive automatically creates it in MySQL and Google Drive before placing the file inside it!**
- `folderId` (Text, **Optional**): Exact target virtual folder UUID in 9Drive.

#### Integration Examples

**1. cURL Command:**
```bash
curl -X POST https://<your-backend-url>/api/v1/uploads \
  -H "Authorization: Bearer 9d_live_your_secret_api_key_here" \
  -F "file=@/path/to/local/document.pdf"
```

**2. JavaScript / Node.js:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://<your-backend-url>/api/v1/uploads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 9d_live_your_secret_api_key_here'
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

**3. Python (`requests`):**
```python
import requests

url = "https://<your-backend-url>/api/v1/uploads"
headers = {
    "Authorization": "Bearer 9d_live_your_secret_api_key_here"
}

with open("sample.png", "rb") as f:
    files = {"file": ("sample.png", f, "image/png")}
    response = requests.post(url, headers=headers, files=files)

print(response.json())
```

## Security Notes

- Backend never stores uploaded files on disk.
- Uploads are streamed through the backend to Google Drive folder `9drive`.
- Google tokens are encrypted in MySQL.
- Refresh tokens for app sessions are hashed in MySQL.
- Google auth handoff tokens, public share tokens, and preview tokens are hashed before lookup/use.
- `backend/.env` is ignored by git.
- Do not expose `TOKEN_ENCRYPTION_KEY`, `JWT_ACCESS_SECRET`, `RECAPTCHA_SECRET_KEY`, OAuth client secrets, or raw share/preview/handoff tokens.

## Production Notes

- Replace localhost redirect URIs with production URLs.
- Add production domain to Google OAuth authorized origins.
- Set OAuth consent screen to production when ready.
- Google may require verification for public apps.
- Use strong secrets.
- Put the backend behind HTTPS.
- Consider secure cookies or stronger token storage for production.

## Google OAuth Configuration via UI

Instead of seeding Google credentials manually using `npm run seed:google-config`, you can set them up directly from the frontend dashboard:
1. Log in to the dashboard.
2. Go to **Settings** -> **Google Credentials**.
3. Input your **Google Client ID**, **Google Client Secret**, and **Redirect URI** (e.g. `https://103.65.237.136.nip.io:4000/connected-accounts/google/callback`).
4. Click **Save Configuration**.

The config is automatically encrypted and saved into the database, enabling Google sign-in and Google Drive connections instantly.

## Automated Updates & PM2 Management

For native VPS setups running with PM2, 9Drive includes a fully automated system update trigger and log monitor in the **Settings** UI.

### How it works
1. When you trigger an update from the frontend dashboard, the backend triggers the `update.sh` script in the background.
2. The script:
   - Resets any local Git conflicts (`git reset --hard`) and pulls the latest changes.
   - Installs dependencies and builds both backend and frontend.
   - Deploys Prisma database migrations.
   - Restarts the backend process using PM2 (`pm2 restart 9drive-backend`).
3. You can monitor the real-time rebuild progress using the log viewer inside the Settings UI.

### Manual update command
If you want to update manually via the terminal, run:
```bash
./update.sh
```
Or run the commands individually:
```bash
git reset --hard
git pull origin main
cd backend && npm install && npx prisma generate && npm run build && npx prisma migrate deploy
cd ../frontend && npm install && npm run build
pm2 restart 9drive-backend
```

## Google Drive Media CDN & Caching Optimization

To deliver fast video and image loading times, 9Drive supports multi-subdomain CDN round-robin routing integrated with Cloudflare. Instead of routing every stream request directly through your VPS, files are cached on Cloudflare's Edge network near your users.

### How it works
1. **Hash-Based Round-Robin**: When a user previews a video or image, the backend uses a stable SHA-256 hash of the `fileId` to map it to one of your configured CDN subdomains (e.g., `cdn1`, `cdn2`, etc.). This ensures the same file always routes to the same subdomain, maximizing cache consistency.
2. **Edge Cache Delivery**: Cloudflare intercepts the request. On the first load, it fetches the file from your backend (MISS) and caches it. On subsequent loads (from the same or other users), it serves the file instantly from the edge (HIT) with 0% bandwidth and CPU usage on your VPS.
3. **Optimized Headers**: The backend automatically streams files with `Vary: Accept-Encoding`, `Accept-Ranges: bytes` (for video seeking), and forwards `ETag`/`Last-Modified` headers to enable conditional `304 Not Modified` browser caching.

### Configuration

#### 1. Cloudflare DNS Setup
Add your CDN subdomains (e.g. `cdn1` to `cdn5`) in your Cloudflare DNS settings and ensure their proxy status is set to **Proxied (Orange Cloud ☁️)**.
- Type: `A` or `CNAME`
- Name: `cdn1-googledrivefrontend` (or similar)
- Target: Your VPS IP or main domain
- Proxy status: **Proxied**

#### 2. Cloudflare Page Rule (Crucial)
By default, Cloudflare does not cache URLs without file extensions (like 9Drive's `/files/preview/<token>` endpoint). You must force Cloudflare to cache these endpoints:
1. Go to **Rules** -> **Page Rules** in Cloudflare.
2. Click **Create Page Rule**.
3. Set the pattern to:
   ```txt
   *yourdomain.com/*preview*
   ```
4. Add the following settings:
   - **Cache Level**: `Cache Everything`
   - **Edge Cache TTL**: `a month` (or `1 month`)
   - **Browser Cache TTL**: `8 days` (or similar)
5. Save and deploy the rule.

#### 3. Environment Variables
Add your CDN subdomains to both backend and frontend `.env` configuration:

In `backend/.env`:
```env
CDN_SUBDOMAINS=https://cdn1.yourdomain.com,https://cdn2.yourdomain.com,https://cdn3.yourdomain.com
```

In `frontend/.env` (rebuild frontend after changing):
```env
VITE_CDN_SUBDOMAINS=https://cdn1.yourdomain.com,https://cdn2.yourdomain.com,https://cdn3.yourdomain.com
```

---

## 15. Password Reset & SMTP Configuration (Optional)

Drive9 provides a secure self-service password reset system (`/forgot-password` and `/reset-password`).

### 15.1 Gmail SMTP Setup (Free & Fast)

1. Open [Google Account Security](https://myaccount.google.com/security) and ensure **2-Step Verification** is enabled.
2. Go to **App Passwords**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Under *App name*, type `Drive9` and click **Create**.
4. Copy the generated **16-character code** (e.g. `abcd efgh ijkl mnop`).
5. Add these environment variables to your `.env` (or Coolify environment):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM="Drive9 Storage <your-email@gmail.com>"
```

> [!NOTE]
> For Gmail SMTP, make sure the email address in `SMTP_FROM` matches `SMTP_USER` to prevent Google from rejecting or modifying the sender address.

### 15.2 Fallback: Running Without SMTP
If SMTP variables are left empty, Drive9 will not crash or fail. Instead, when a user requests a password reset, the secure reset link is automatically logged to the backend container console:
```text
[MAIL] SMTP is not configured. Reset link for user@example.com: https://yourdomain.com/reset-password?token=...
```

### 15.3 Emergency Password Reset CLI Tool
Administrators can also reset any user password directly from the server terminal:

```bash
cd backend
npm run reset-password -- user@example.com MyNewSecurePassword123
```

---

## Build

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

