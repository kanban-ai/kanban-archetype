# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar package.json e lock files dos projetos
COPY back/package*.json back/pnpm-lock.yaml ./back/
COPY front/package*.json front/package-lock.json ./front/

# Instalar dependências do backend (usa pnpm)
WORKDIR /app/back
RUN pnpm install --frozen-lockfile

# Instalar dependências do frontend (usa npm)
WORKDIR /app/front
RUN npm ci

# Copiar código fonte
WORKDIR /app
COPY back ./back
COPY front ./front
COPY build/entrypoint.sh ./entrypoint.sh
COPY build/migration.sh ./migration.sh

# Build do backend (NestJS)
WORKDIR /app/back
RUN npm run build

# Build do frontend (Vite + React)
WORKDIR /app/front
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Produção
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm e dependências necessárias para compilar módulos nativos (bcrypt, etc)
RUN npm install -g pnpm && \
    apk add --no-cache python3 make g++

# Copiar apenas os arquivos necessários do backend
COPY --from=builder /app/back/dist ./dist
COPY --from=builder /app/back/package*.json ./
COPY --from=builder /app/back/pnpm-lock.yaml ./
COPY --from=builder /app/migration.sh ./migration.sh
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Tornar scripts executáveis
RUN chmod +x ./entrypoint.sh ./migration.sh

# Instalar apenas as dependências de produção (recompila módulos nativos para Alpine)
RUN pnpm install --prod --frozen-lockfile && \
    pnpm store prune && \
    npm cache clean --force

# Copiar os arquivos buildados do frontend para pasta public
COPY --from=builder /app/front/dist ./public

# Remover dependências de build para reduzir tamanho da imagem
RUN apk del python3 make g++

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Configurar porta da aplicação
ENV PORT=5000

# Expor porta da API
EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"]