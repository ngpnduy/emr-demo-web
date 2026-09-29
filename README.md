# Electronic Medical Record (EMR) Management System

## 🛠 Technologies Used
- **Frontend:** React, Tailwind CSS, Lucide Icons, Sonner.
- **Backend:** Node.js, Express.
- **Database:** MySQL.
- **Reverse proxy:** Nginx (single entry point for tunnel demos).

## 🚦 Getting Started

Follow these steps to set up and run the project on your local machine.

### Prerequisites
- **Node.js** installed.
- **MySQL Server** installed and running.
- **MySQL Workbench** is recommended for database management and creating a **Local Instance**.

### 1. Backend Configuration
Navigate to the `backend` directory, create a file named `.env`, and fill in your local MySQL Instance information using the following template:

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=BTL2
DB_PORT=3306
```
### 2. Launch the Backend
Open a terminal and run the following commands:

```bash
cd backend

# Run this only once when you first launch the project
npm install

# Only for a disposable demo database: this DELETES and recreates BTL2.
# Skip this command if your database is already initialized.
npm run db:init

# Run the server in development mode
npm run dev
```

### 3. Launch the Frontend
Open a new terminal and run:

```bash
cd frontend

# Run this only once when you first launch the project
npm install

# Run the React application
npm run dev
```

Once completed, you can access the user interface at http://localhost:5173 (Vite's default address).
The frontend uses relative `/api` URLs; Vite proxies these requests to the backend
at `127.0.0.1:5001` during local development.

## Nginx and public tunnel demo

Both Cloudflare Tunnel and ngrok can expose the same local stack:

```text
Remote browser -> public HTTPS URL -> cloudflared or ngrok -> Nginx 127.0.0.1:8080
                                                          |-- /       -> React preview 127.0.0.1:4173
                                                          |-- /api/   -> Express 127.0.0.1:5001 -> MySQL
```

Only point the tunnel at Nginx. Frontend API calls use the same public origin,
so there is no need to put a tunnel hostname in the source code or allow all
CORS origins. Keep the backend on port `5001`, or update both
`nginx/nginx.conf` and the Vite proxy if you change it.

### 1. Install Nginx and the tunnel client

On macOS with Homebrew:

```bash
brew install nginx cloudflared
```

On other systems, install Nginx and cloudflared using their platform installers.
The commands below assume a Unix shell. Nginx runs in the foreground with this
project's configuration; starting the system Nginx service is not required.

### 2. Start MySQL and the backend

Use the backend setup above, then leave `npm run dev` running in its terminal.
Use synthetic data only: the current API does not implement authentication.
Do not include `.env` contents or credentials in demo screenshots.

### 3. Build and serve the frontend

In another terminal, from the repository root:

```bash
cd frontend
npm ci
npm run build
npm run preview
```

The preview server listens on `127.0.0.1:4173` and fails if that port is occupied.
This preview setup is for a temporary demo, not production hosting. Rebuild and
restart preview after changing the frontend.

### 4. Start Nginx

In another terminal, from the repository root:

```bash
mkdir -p nginx/logs
nginx -t -p "$PWD/nginx/" -c nginx.conf
nginx -p "$PWD/nginx/" -c nginx.conf -g 'daemon off;'
```

Open http://127.0.0.1:8080 and verify the real database-backed API:

```bash
curl -i http://127.0.0.1:8080/api/query/patients/C001/appointments
```

Expect HTTP 200 and JSON with `"success": true` when the database is initialized.
Nginx sends `/api/...` directly to Express, preserving the prefix. Other requests
go to the frontend preview, including React routes opened directly in the browser.
For that upstream, Nginx sets `Host: localhost` so Vite accepts requests without
disabling host checks or adding each tunnel hostname to an allowlist.

Logs are saved in `nginx/logs/access.log` and `nginx/logs/error.log` and are ignored
by Git. After changing the configuration, run the syntax check again, then:

```bash
nginx -p "$PWD/nginx/" -c nginx.conf -s reload
```

### 5. Expose Nginx through Cloudflare Tunnel

In another terminal:

```bash
cloudflared tunnel --url http://127.0.0.1:8080
```

Open the generated `https://....trycloudflare.com` URL. Quick Tunnels do not
require an account or your own domain and generate a new URL when restarted.
They are intended for testing, have no uptime guarantee, allow at most 200
in-flight requests, and do not support SSE. If an existing
`~/.cloudflared/config.yaml` prevents a Quick Tunnel from starting, preserve it
and temporarily rename it, then restore it after the demo.

For the ngrok comparison, a teammate with ngrok installed and authenticated can
expose the same Nginx entry point using `ngrok http 8080`.

### 6. Verify and record evidence

- Open the public URL on a phone using mobile data with Wi-Fi disabled.
- Open the appointments page and verify an API request to `/api/...` returns 200
  on the same public hostname in the browser Network tab.
- Open `/api/query/patients/C001/appointments` through the public URL and record
  the successful JSON response.
- Capture the running services, Nginx configuration, tunnel URL, external
  frontend access, and API response. Add a caption explaining each screenshot.
- Compare ngrok and Cloudflare using the same endpoint, device, and network.

The seed schedules contain fixed dates in May 2026, and the appointments date
selector has a fixed June 2026 upper bound. Refresh those dates before a live
booking demo; viewing existing appointments is sufficient to verify API routing.

### Troubleshooting and shutdown

- **502:** Check that backend `5001` and preview `4173` are running; inspect
  `nginx/logs/error.log`. The backend exits when MySQL is unavailable.
- **API 404:** Preserve `proxy_pass http://127.0.0.1:5001;` without a trailing `/`;
  Express routes already include `/api`.
- **Requests still target localhost in the browser:** Rebuild the frontend and
  reload the page; the demo must use the relative `/api` base URL.
- **Port 8080 already in use:** Stop the conflicting service or change Nginx's
  listen port and the tunnel target together.

Stop the tunnel with `Ctrl+C` after the demo. Stop Nginx with `Ctrl+C` in its
foreground terminal, or from the repository root:

```bash
nginx -p "$PWD/nginx/" -c nginx.conf -s quit
```

Stop the backend and preview terminals with `Ctrl+C` as well.

References: [Cloudflare Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/),
[Nginx proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass),
[Vite preview options](https://vite.dev/config/preview-options).
