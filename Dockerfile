# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build

WORKDIR /app

# better-sqlite3 is a native module; ensure build toolchain is available.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Optional: allow setting Vite API base URL at build time.
# Default is empty so the frontend uses same-origin `/api/...`.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Keep only production deps for runtime.
RUN npm prune --omit=dev


FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Shanghai
ENV PORTAL_PORT=3001
ENV PORTAL_DB_FILE=/data/portal.sqlite

# Ensure system timezone data exists and is configured.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get install -y --no-install-recommends tzdata \
  && ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime \
  && echo "$TZ" > /etc/timezone \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /data

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["node", "server/index.js"]
