# ─── FRONTEND DOCKERFILE ──────────────────────────────────
# Multi-stage: builder (standalone output) → runner.

FROM node:20-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.2.1 --activate

# Dependency manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --fetch-timeout 600000 --fetch-retries 7

COPY . .
RUN pnpm build

# ─── RUNNER ──────────────────────────────────────────────

FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --gid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode < 400 ? 0 : 1)})" || exit 1

CMD ["node", "server.js"]
