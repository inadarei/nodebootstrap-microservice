FROM node:24-alpine AS base
RUN apk add --no-cache tini
WORKDIR /opt/app
ENV HOME_DIR=/opt/app \
    NODE_ENV=production \
    PORT=5501
EXPOSE 5501
ENTRYPOINT ["/sbin/tini", "--"]

# -----------------------------------------------------------------------------
FROM base AS build
USER root
COPY --chown=node:node package.json package-lock.json* ./
RUN npm install --include=dev \
 && chown -R node /opt/app
USER node
COPY --chown=node:node . .

# -----------------------------------------------------------------------------
FROM base AS release
USER root
COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci --omit=dev \
 && chown -R node /opt/app
USER node
COPY --chown=node:node . .

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:5501/livez || exit 1

CMD ["sh", "-c", "node src/migrate.js up && node src/server.js"]
