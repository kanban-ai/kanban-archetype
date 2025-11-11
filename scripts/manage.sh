#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório raiz do projeto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/scripts/docker-compose.yml"
LOGS_DIR="$PROJECT_ROOT/logs"

# Função para exibir o menu
show_menu() {
    clear
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Sistema de Gerenciamento SDD${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "${GREEN}1)${NC} Reset All (parar, remover e reiniciar docker-compose)"
    echo -e "${GREEN}2)${NC} Logs Backend (tail -f)"
    echo -e "${GREEN}3)${NC} Logs Frontend (tail -f)"
    echo -e "${GREEN}4)${NC} Indexar Documentos"
    echo -e "${GREEN}5)${NC} Executar Aplicação (run-dev.sh)"
    echo -e "${GREEN}6)${NC} Executar Testes do Backend"
    echo -e "${GREEN}7)${NC} Aplicar Migrations"
    echo -e "${GREEN}8)${NC} Matar Processos (Backend e Frontend)"
    echo -e "${GREEN}0)${NC} Sair"
    echo ""
    echo -ne "${YELLOW}Escolha uma opção:${NC} "
}

# Função para reset completo do docker-compose
reset_all() {
    echo -e "\n${YELLOW}Parando containers...${NC}"
    cd "$PROJECT_ROOT/scripts"
    docker compose down

    echo -e "\n${YELLOW}Removendo containers...${NC}"
    docker compose rm -f

    echo -e "\n${YELLOW}Iniciando containers...${NC}"
    docker compose up -d

    echo -e "\n${GREEN}Reset completo!${NC}"
    echo -e "\n${BLUE}Status dos containers:${NC}"
    docker compose ps

    echo -e "\nPressione qualquer tecla para continuar..."
    read -n 1
}

# Função para exibir logs do backend
logs_backend() {
    local LOG_FILE="$LOGS_DIR/back.log"

    # Verificar se o arquivo de log existe
    if [ ! -f "$LOG_FILE" ]; then
        echo -e "\n${RED}Erro: Arquivo de log não encontrado em $LOG_FILE${NC}"
        echo -e "${YELLOW}Criando arquivo de log...${NC}"
        touch "$LOG_FILE"
    fi

    echo -e "\n${GREEN}Exibindo logs do backend...${NC}"
    echo -e "${YELLOW}Pressione 'q' para sair${NC}\n"

    # tail com opção de sair com 'q'
    tail -f "$LOG_FILE" &
    TAIL_PID=$!

    # Loop para detectar 'q' com timeout
    while true; do
        read -t 0.1 -n 1 -s key 2>/dev/null
        if [ "$key" = "q" ]; then
            kill $TAIL_PID 2>/dev/null
            wait $TAIL_PID 2>/dev/null
            break
        fi
    done

    echo -e "\n${GREEN}Logs do backend fechados.${NC}"
    sleep 1
}

# Função para exibir logs do frontend
logs_frontend() {
    local LOG_FILE="$LOGS_DIR/front.log"

    # Verificar se o arquivo de log existe
    if [ ! -f "$LOG_FILE" ]; then
        echo -e "\n${RED}Erro: Arquivo de log não encontrado em $LOG_FILE${NC}"
        echo -e "${YELLOW}Criando arquivo de log...${NC}"
        touch "$LOG_FILE"
    fi

    echo -e "\n${GREEN}Exibindo logs do frontend...${NC}"
    echo -e "${YELLOW}Pressione 'q' para sair${NC}\n"

    # tail com opção de sair com 'q'
    tail -f "$LOG_FILE" &
    TAIL_PID=$!

    # Loop para detectar 'q' com timeout
    while true; do
        read -t 0.1 -n 1 -s key 2>/dev/null
        if [ "$key" = "q" ]; then
            kill $TAIL_PID 2>/dev/null
            wait $TAIL_PID 2>/dev/null
            break
        fi
    done

    echo -e "\n${GREEN}Logs do frontend fechados.${NC}"
    sleep 1
}

# Função para indexar documentos
index_docs() {
    local DOCS_SCRIPT="$PROJECT_ROOT/scripts/docs"

    echo -e "\n${YELLOW}Verificando script de documentação...${NC}"

    if [ ! -f "$DOCS_SCRIPT" ]; then
        echo -e "\n${RED}Erro: Script não encontrado em $DOCS_SCRIPT${NC}"
        echo -e "\nPressione qualquer tecla para continuar..."
        read -n 1
        return 1
    fi

    if [ ! -x "$DOCS_SCRIPT" ]; then
        echo -e "${YELLOW}Tornando o script executável...${NC}"
        chmod +x "$DOCS_SCRIPT"
    fi

    echo -e "\n${GREEN}Indexando documentos...${NC}\n"
    "$DOCS_SCRIPT" index

    local EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "\n${GREEN}Documentos indexados com sucesso!${NC}"
    else
        echo -e "\n${RED}Erro ao indexar documentos (código: $EXIT_CODE)${NC}"
    fi

    echo -e "\nPressione qualquer tecla para continuar..."
    read -n 1
}

# Função para executar a aplicação
run_app() {
    local BACK_DIR="$PROJECT_ROOT/backend"
    local FRONT_DIR="$PROJECT_ROOT/frontend"

    echo -e "\n${GREEN}=== Verificando ambiente ===${NC}"

    # 1. Verificar se docker-compose está rodando
    echo -e "${YELLOW}Verificando Docker Compose...${NC}"
    cd "$PROJECT_ROOT/scripts"

    if ! docker compose ps | grep -q "postgres-development"; then
        echo -e "${YELLOW}Docker Compose não está rodando. Iniciando...${NC}"
        docker compose up -d
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
                echo -e "\nPressione qualquer tecla para continuar..."
                read -n 1
                return 1
            fi
        else
            echo -e "${RED}Erro: PostgreSQL não está respondendo na porta 5432${NC}"
            echo -e "\nPressione qualquer tecla para continuar..."
            read -n 1
            return 1
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

    # Iniciar backend (NO_COLOR=1 remove cores dos logs)
    NO_COLOR=1 nohup npm run start:dev > "$LOGS_DIR/back.log" 2>&1 &
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
    echo -e "  Backend:  Use a opção 2 do menu"
    echo -e "  Frontend: Use a opção 3 do menu"
    echo ""
    echo -e "${YELLOW}Aguardando inicialização dos serviços...${NC}"
    sleep 3
    echo -e "${GREEN}Pronto!${NC}"

    cd "$PROJECT_ROOT"

    echo -e "\nPressione qualquer tecla para continuar..."
    read -n 1
}

# Função para executar testes do backend
run_backend_tests() {
    local BACKEND_DIR="$PROJECT_ROOT/backend"

    echo -e "\n${YELLOW}Verificando diretório do backend...${NC}"

    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "\n${RED}Erro: Diretório backend não encontrado em $BACKEND_DIR${NC}"
        echo -e "\nPressione qualquer tecla para continuar..."
        read -n 1
        return 1
    fi

    echo -e "\n${GREEN}Executando testes do backend...${NC}\n"

    cd "$BACKEND_DIR"
    npm run test

    local EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "\n${GREEN}Testes executados com sucesso!${NC}"
    else
        echo -e "\n${RED}Erro ao executar testes (código: $EXIT_CODE)${NC}"
    fi

    cd "$PROJECT_ROOT"

    echo -e "\nPressione qualquer tecla para continuar..."
    read -n 1
}

# Função para aplicar migrations
run_migration() {
    local BACKEND_DIR="$PROJECT_ROOT/backend"

    echo -e "\n${YELLOW}Verificando diretório do backend...${NC}"

    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "\n${RED}Erro: Diretório backend não encontrado em $BACKEND_DIR${NC}"
        echo -e "\nPressione qualquer tecla para continuar..."
        read -n 1
        return 1
    fi

    echo -e "\n${GREEN}Aplicando migrations...${NC}\n"

    cd "$BACKEND_DIR"
    npm run migration:run

    local EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "\n${GREEN}Migrations aplicadas com sucesso!${NC}"
    else
        echo -e "\n${RED}Erro ao aplicar migrations (código: $EXIT_CODE)${NC}"
    fi

    cd "$PROJECT_ROOT"

    echo -e "\nPressione qualquer tecla para continuar..."
    read -n 1
}

# Função para matar processos backend e frontend
kill_processes() {
    echo -e "\n${YELLOW}Matando processos do Backend e Frontend...${NC}"

    local BACK_PID_FILE="$LOGS_DIR/back.pid"
    local FRONT_PID_FILE="$LOGS_DIR/front.pid"
    local KILLED=false

    # Matar processos usando PIDs salvos
    if [ -f "$BACK_PID_FILE" ] || [ -f "$FRONT_PID_FILE" ]; then
        kill -9 $(cat "$BACK_PID_FILE" "$FRONT_PID_FILE" 2>/dev/null) 2>/dev/null

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Processos finalizados com sucesso${NC}"
            KILLED=true
        fi

        # Remover arquivos PID
        rm -f "$BACK_PID_FILE" "$FRONT_PID_FILE" 2>/dev/null
    fi

    if [ "$KILLED" = false ]; then
        echo -e "${YELLOW}Nenhum processo encontrado nos arquivos PID${NC}"
    fi

    echo -e "\nPressione qualquer tecla para continuar..."
    read -n 1
}

# Loop principal do menu
main() {
    # Verificar se está no diretório correto
    if [ ! -d "$PROJECT_ROOT/scripts" ]; then
        echo -e "${RED}Erro: Diretório do projeto não encontrado!${NC}"
        exit 1
    fi

    # Criar diretório de logs se não existir
    mkdir -p "$LOGS_DIR"

    while true; do
        show_menu
        read -n 1 option

        case $option in
            1)
                reset_all
                ;;
            2)
                logs_backend
                ;;
            3)
                logs_frontend
                ;;
            4)
                index_docs
                ;;
            5)
                run_app
                ;;
            6)
                run_backend_tests
                ;;
            7)
                run_migration
                ;;
            8)
                kill_processes
                ;;
            0)
                echo -e "\n\n${GREEN}Saindo...${NC}"
                exit 0
                ;;
            *)
                echo -e "\n\n${RED}Opção inválida!${NC}"
                sleep 1
                ;;
        esac
    done
}

# Executar o menu principal
main
