# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package.json e lock files dos projetos
COPY backend/package*.json ./backend/
COPY frontend/package*.json frontend/package-lock.json ./frontend/

# Instalar dependências do backend (npm)
WORKDIR /app/backend
RUN npm ci

# Instalar dependências do frontend (npm)
WORKDIR /app/frontend
RUN npm ci

# Copiar código fonte
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend
COPY build/entrypoint.sh ./entrypoint.sh
COPY build/migration.sh ./migration.sh

# Build do backend (NestJS)
WORKDIR /app/backend
RUN npm run build

# Build do frontend (Vite + React)
WORKDIR /app/frontend
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Produção
FROM node:22-alpine

WORKDIR /app

# Instalar dependências necessárias para módulos nativos (bcrypt, etc)
RUN apk add --no-cache python3 make g++

# Copiar apenas os arquivos necessários do backend
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/migration.sh ./migration.sh
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Tornar scripts executáveis
RUN chmod +x ./entrypoint.sh ./migration.sh

# Instalar apenas dependências de produção
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copiar os arquivos buildados do frontend para pasta public
COPY --from=builder /app/frontend/dist ./public

# Remover dependências de build para reduzir tamanho
RUN apk del python3 make g++

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

ENV PORT=5000
EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"]
