# syntax=docker/dockerfile:1
# Construir desde la raíz del monorepo:
#   docker build -f apps/spa/Dockerfile --build-arg VITE_API_URL=https://api.ejemplo.com -t negocios-rios-spa .

ARG NODE_VERSION=22

# ---- Dependencias + build ----
FROM node:${NODE_VERSION}-bookworm-slim AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/spa/package.json apps/spa/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter spa...
COPY apps/spa/ apps/spa/
# Vite incrusta las variables VITE_* en tiempo de build
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN test -n "$VITE_API_URL" || (echo "Falta --build-arg VITE_API_URL" && exit 1)
RUN pnpm --filter spa build

# ---- Runtime (nginx) ----
FROM nginx:1.27-alpine AS runtime
COPY apps/spa/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/spa/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
