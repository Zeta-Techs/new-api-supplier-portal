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
