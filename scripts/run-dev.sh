#!/bin/bash

# Script para iniciar backend e frontend em desenvolvimento
# Autor: Script gerado automaticamente
# Data: 2025-10-28

set -e  # Para o script em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretórios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACK_DIR="$ROOT_DIR/backend"
FRONT_DIR="$ROOT_DIR/frontend"
LOGS_DIR="$ROOT_DIR/logs"

echo -e "${GREEN}=== Verificando ambiente ===${NC}"

# 1. Verificar se docker-compose está rodando
echo -e "${YELLOW}Verificando Docker Compose...${NC}"
cd "$BACK_DIR"

if ! docker compose ps | grep -q "postgres-development"; then
    echo -e "${YELLOW}Docker Compose não está rodando. Iniciando...${NC}"
    docker compose -f "$ROOT_DIR/scripts/docker-compose.yml" up -d
    echo -e "${GREEN}Aguardando PostgreSQL iniciar...${NC}"
    sleep 5
else
    echo -e "${GREEN}Docker Compose já está rodando${NC}"
fi

# Verificar se PostgreSQL está respondendo na porta 5432
echo -e "${YELLOW}Verificando PostgreSQL na porta 5432...${NC}"
if ! nc -z localhost 5432 2>/dev/null; then
    if ! command -v nc &> /dev/null; then
        # Fallback se nc não estiver disponível
        if ! timeout 5 bash -c 'cat < /dev/null > /dev/tcp/localhost/5432' 2>/dev/null; then
            echo -e "${RED}Erro: PostgreSQL não está respondendo na porta 5432${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Erro: PostgreSQL não está respondendo na porta 5432${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}PostgreSQL OK na porta 5432${NC}"

# 2. Matar processos nas portas 3000 e 5173
echo -e "${YELLOW}Verificando processos nas portas 3000 e 5173...${NC}"

# Função para matar processos em uma porta
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)

    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Matando processos na porta $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}Processos na porta $port finalizados${NC}"
    else
        echo -e "${GREEN}Nenhum processo rodando na porta $port${NC}"
    fi
}

kill_port 3000
kill_port 5173

# 3. Criar diretório de logs se não existir
echo -e "${YELLOW}Preparando diretório de logs...${NC}"
mkdir -p "$LOGS_DIR"
echo -e "${GREEN}Diretório de logs pronto: $LOGS_DIR${NC}"

# 4. Iniciar backend em background
echo -e "${YELLOW}Iniciando backend...${NC}"
cd "$BACK_DIR"

# Limpar log anterior
> "$LOGS_DIR/back.log"

# Iniciar backend
nohup npm run start:dev > "$LOGS_DIR/back.log" 2>&1 &
BACK_PID=$!
echo $BACK_PID > "$LOGS_DIR/back.pid"
echo -e "${GREEN}Backend iniciado (PID: $BACK_PID)${NC}"
echo -e "${GREEN}Logs: $LOGS_DIR/back.log${NC}"

# 5. Iniciar frontend em background
echo -e "${YELLOW}Iniciando frontend...${NC}"
cd "$FRONT_DIR"

# Limpar log anterior
> "$LOGS_DIR/front.log"

# Iniciar frontend
nohup npm run dev > "$LOGS_DIR/front.log" 2>&1 &
FRONT_PID=$!
echo $FRONT_PID > "$LOGS_DIR/front.pid"
echo -e "${GREEN}Frontend iniciado (PID: $FRONT_PID)${NC}"
echo -e "${GREEN}Logs: $LOGS_DIR/front.log${NC}"

# 6. Resumo
echo ""
echo -e "${GREEN}=== Serviços iniciados com sucesso ===${NC}"
echo -e "${GREEN}Backend PID: $BACK_PID (porta 3000)${NC}"
echo -e "${GREEN}Frontend PID: $FRONT_PID (porta 5173)${NC}"
echo ""
echo -e "${YELLOW}Para ver os logs em tempo real:${NC}"
echo -e "  Backend:  ${GREEN}tail -f $LOGS_DIR/back.log${NC}"
echo -e "  Frontend: ${GREEN}tail -f $LOGS_DIR/front.log${NC}"
echo ""
echo -e "${YELLOW}Para parar os serviços:${NC}"
echo -e "  ${GREEN}kill \$(cat $LOGS_DIR/back.pid) \$(cat $LOGS_DIR/front.pid)${NC}"
echo ""
echo -e "${YELLOW}Aguardando inicialização dos serviços...${NC}"
sleep 3
echo -e "${GREEN}Pronto!${NC}"
