# syntax=docker/dockerfile:1
# Construir desde la raíz del monorepo:
#   docker build -f apps/api/Dockerfile -t negocios-rios-api .

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

# ---- Dependencias + build ----
FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter api...
COPY apps/api/ apps/api/
RUN pnpm --filter api build
# Copia aislada del paquete con solo dependencias de producción
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter api deploy --prod /prod/api

# ---- Runtime ----
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=3005
WORKDIR /app
COPY --from=build --chown=node:node /prod/api/node_modules ./node_modules
COPY --from=build --chown=node:node /prod/api/package.json ./package.json
COPY --from=build --chown=node:node /repo/apps/api/dist ./dist
USER node
EXPOSE 3005
CMD ["node", "dist/main.js"]
