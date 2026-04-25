FROM oven/bun:1-alpine AS base
RUN apk add --no-cache tini wget
WORKDIR /opt/app
ENV HOME_DIR=/opt/app \
    NODE_ENV=production \
    PORT=5501
EXPOSE 5501
ENTRYPOINT ["/sbin/tini", "--"]

# -----------------------------------------------------------------------------
FROM base AS build
USER root
COPY --chown=bun:bun package.json bun.lock* ./
RUN bun install \
 && chown -R bun /opt/app
USER bun
COPY --chown=bun:bun . .

# -----------------------------------------------------------------------------
FROM base AS release
USER root
COPY --chown=bun:bun package.json bun.lock* ./
RUN bun install --frozen-lockfile --production \
 && chown -R bun /opt/app
USER bun
COPY --chown=bun:bun . .

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:5501/livez || exit 1

CMD ["sh", "-c", "bun src/migrate.js up && bun src/server.js"]
