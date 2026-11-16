# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080 IFF_DATABASE_CA_FILE=/app/rds-ca.pem
ADD --chmod=0644 https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /app/rds-ca.pem
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
