# Supplier Channel Portal / 供应商渠道管理门户

A lightweight single-page web portal for suppliers to manage their granted channels.

一个轻量的单页 Web 门户，用于供应商管理已授予的渠道。

---

## What this portal does / 功能概览

### For suppliers / 面向供应商
- Log in with a supplier token (Bearer token)
- View granted channels
- Search and filter channels (by name / enabled status)
- Enable/disable a channel
- Refresh a channel's used quota (read-only)
- Submit an upstream API key for a channel (write-only)

### Important notes / 重要说明
- The portal never displays stored upstream API keys. After submission, the key cannot be retrieved from this UI.
- The supplier token is stored in `localStorage` for convenience and can be cleared via Logout.

---

## Usage (Supplier) / 使用说明（供应商）

1. Open the portal in your browser.
2. Paste your supplier token and click Continue.
3. Select a channel from the left.
4. Use the actions on the right:
   - Enable / Disable
   - Refresh quota
   - Submit key (write-only)

Tips:
- If you have many channels, use the Search box and Status filter.
- If your selected channel is filtered out, the portal will auto-select the first visible channel (or clear selection if none match).

---

## Local Development / 本地开发

### Requirements / 环境要求
- Node.js + npm

### Install / 安装依赖

```bash
npm install
```

### Run dev server / 启动开发环境

```bash
npm run dev
```

### Build / 构建

```bash
npm run build
```

### Preview production build / 预览构建产物

```bash
npm run preview
```

---

## Docker Deployment / Docker 部署

This repo can be deployed as a single container that serves both the portal API (`/api/*`) and the built SPA.

本仓库支持单容器部署：同一个进程同时提供 `/api/*` 接口和前端页面（SPA）。

### Quick start with docker compose / 使用 docker compose 快速启动

```bash
docker compose up --build
```

Then open / 然后打开：
- http://localhost:3001

Data persistence / 数据持久化：
- The portal uses SQLite. The compose file bind-mounts `./data` to persist the DB at `/data/portal.sqlite`.
- 门户使用 SQLite；compose 会把当前目录下的 `./data` 挂载到容器 `/data`，数据库文件为 `/data/portal.sqlite`。

### Build & run with docker / 使用 docker build + docker run

Build / 构建：

```bash
docker build -t portal:local .
```

Run / 运行（使用 named volume 持久化数据库）：

```bash
docker run --rm \
  -p 3001:3001 \
  -e PORTAL_PORT=3001 \
  -e PORTAL_DB_FILE=/data/portal.sqlite \
  -v "$(pwd)/data:/data" \
  portal:local
```

### Notes / 说明

- Frontend API base URL:
  - Default Docker deployment uses same-origin `/api/...` (recommended).
  - If you set `VITE_API_BASE_URL` at image build time, be aware this portal uses cookie-based sessions (`credentials: include`), so cross-origin setups require correct CORS and cookie settings.
- Frontend API Base URL：
  - 默认建议同源访问 `/api/...`。
  - 如需在构建镜像时设置 `VITE_API_BASE_URL`，由于本项目使用 Cookie Session（`credentials: include`），跨域部署需要正确配置 CORS 和 Cookie。

---

## Configuration / 配置

### Environment variables / 环境变量

- `VITE_API_BASE_URL`
  - If set, requests are sent to `${VITE_API_BASE_URL}/api/...`
  - If not set, requests are sent to `/api/...` (useful with the Vite dev proxy)

- `VITE_DEV_API_PROXY_TARGET` (dev only)
  - Vite dev proxy target for `/api`
  - Default: `http://localhost:3000`

Example / 示例：

```bash
VITE_DEV_API_PROXY_TARGET=http://localhost:3000 npm run dev
```

---

## Backend API expectations / 后端接口约定

This frontend expects a backend that supports these endpoints and conventions:
- Authentication header: `Authorization: Bearer <supplierToken>`
- JSON responses:
  - Non-2xx should include a helpful `message`
  - Successful responses return data under `data`

Endpoints used:
- `GET /api/supplier/channels` (returns `{ items: [...] }`)
- `POST /api/supplier/channels/:id/status` body `{ enabled: boolean }`
- `POST /api/supplier/channels/:id/key` body `{ key: string }`
- `GET /api/supplier/channels/:id/quota`

---

## Security / 安全提示

- Do not paste real supplier tokens or API keys into logs, screenshots, or issue trackers.
- Tokens are persisted in `localStorage`; use Logout to clear them on shared machines.
- The upstream API key is treated as write-only by this UI (it is never displayed after submission).
