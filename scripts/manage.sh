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
    local RUN_DEV_SCRIPT="$PROJECT_ROOT/scripts/run-dev.sh"

    echo -e "\n${YELLOW}Verificando script run-dev.sh...${NC}"

    if [ ! -f "$RUN_DEV_SCRIPT" ]; then
        echo -e "\n${RED}Erro: Script não encontrado em $RUN_DEV_SCRIPT${NC}"
        echo -e "\nPressione qualquer tecla para continuar..."
        read -n 1
        return 1
    fi

    if [ ! -x "$RUN_DEV_SCRIPT" ]; then
        echo -e "${YELLOW}Tornando o script executável...${NC}"
        chmod +x "$RUN_DEV_SCRIPT"
    fi

    echo -e "\n${GREEN}Executando aplicação...${NC}\n"

    # Executar e capturar apenas as mensagens importantes
    "$RUN_DEV_SCRIPT" 2>&1 | grep -E "(Verificando|Matando|Iniciando|PID|Pronto|Erro)" || true

    local EXIT_CODE=${PIPESTATUS[0]}
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "\n${GREEN}Aplicação executada com sucesso!${NC}"
        echo -e "${YELLOW}Backend e Frontend rodando em background${NC}"
        echo -e "${YELLOW}Use as opções 2 ou 3 do menu para ver os logs${NC}"
    else
        echo -e "\n${RED}Erro ao executar aplicação (código: $EXIT_CODE)${NC}"
    fi

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
