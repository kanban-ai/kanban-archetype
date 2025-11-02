#!/bin/bash

# Script de Backup e Restore de PostgreSQL
# Lê configurações do arquivo postgres-backup-restore.json

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/postgres-backup-restore.json"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para exibir mensagens
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verifica se o arquivo de configuração existe
if [ ! -f "$CONFIG_FILE" ]; then
    log_error "Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

# Verifica se jq está instalado
if ! command -v jq &> /dev/null; then
    log_error "jq não está instalado. Instale com: sudo apt-get install jq"
    exit 1
fi

# Lê as configurações do JSON
SOURCE_HOST=$(jq -r '.source.host' "$CONFIG_FILE")
SOURCE_PORT=$(jq -r '.source.port' "$CONFIG_FILE")
SOURCE_DB=$(jq -r '.source.database' "$CONFIG_FILE")
SOURCE_USER=$(jq -r '.source.username' "$CONFIG_FILE")
SOURCE_PASS=$(jq -r '.source.password' "$CONFIG_FILE")

DEST_HOST=$(jq -r '.destination.host' "$CONFIG_FILE")
DEST_PORT=$(jq -r '.destination.port' "$CONFIG_FILE")
DEST_DB=$(jq -r '.destination.database' "$CONFIG_FILE")
DEST_USER=$(jq -r '.destination.username' "$CONFIG_FILE")
DEST_PASS=$(jq -r '.destination.password' "$CONFIG_FILE")

BACKUP_DIR=$(jq -r '.backup.directory' "$CONFIG_FILE")
BACKUP_PREFIX=$(jq -r '.backup.filename_prefix' "$CONFIG_FILE")

# Cria diretório de backup se não existir
mkdir -p "$SCRIPT_DIR/$BACKUP_DIR"

# Nome do arquivo de backup com timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$SCRIPT_DIR/$BACKUP_DIR/${BACKUP_PREFIX}_${TIMESTAMP}.sql"

# Função para fazer backup
backup_database() {
    log_info "Iniciando backup do banco de dados..."
    log_info "Origem: $SOURCE_USER@$SOURCE_HOST:$SOURCE_PORT/$SOURCE_DB"

    # Verifica versões do PostgreSQL
    export PGPASSWORD="$SOURCE_PASS"

    log_info "Verificando versões do PostgreSQL..."
    LOCAL_VERSION=$(pg_dump --version | grep -oP '\d+\.\d+' | head -1)
    SERVER_VERSION=$(psql -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" -t -c "SHOW server_version;" 2>/dev/null | grep -oP '^\s*\d+\.\d+' | xargs)

    if [ -n "$SERVER_VERSION" ]; then
        log_info "Versão local do pg_dump: $LOCAL_VERSION"
        log_info "Versão do servidor: $SERVER_VERSION"

        if [ "$LOCAL_VERSION" != "$SERVER_VERSION" ]; then
            log_warning "Versões diferentes detectadas. Usando modo compatível..."
        fi
    fi

    # Usa --no-sync para melhor performance e ignora diferenças de versão menores
    if pg_dump -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" \
        --no-sync \
        --no-owner \
        --no-privileges \
        -F p \
        -f "$BACKUP_FILE" 2>&1; then

        if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
            log_info "Backup criado com sucesso: $BACKUP_FILE"
            SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            log_info "Tamanho do backup: $SIZE"
            unset PGPASSWORD
            return 0
        else
            log_error "Arquivo de backup vazio ou não foi criado"
            unset PGPASSWORD
            return 1
        fi
    else
        log_error "Falha ao criar backup"
        unset PGPASSWORD
        return 1
    fi
}

# Função para restaurar banco de dados
restore_database() {
    local backup_file=$1

    if [ -z "$backup_file" ]; then
        backup_file="$BACKUP_FILE"
    fi

    if [ ! -f "$backup_file" ]; then
        log_error "Arquivo de backup não encontrado: $backup_file"
        return 1
    fi

    log_info "Iniciando restore do banco de dados..."
    log_info "Destino: $DEST_USER@$DEST_HOST:$DEST_PORT/$DEST_DB"
    log_warning "ATENÇÃO: O banco de destino será recriado!"

    export PGPASSWORD="$DEST_PASS"

    # Verifica se o banco de destino existe
    log_info "Verificando banco de destino..."
    if psql -h "$DEST_HOST" -p "$DEST_PORT" -U "$DEST_USER" -lqt | cut -d \| -f 1 | grep -qw "$DEST_DB"; then
        log_warning "Banco $DEST_DB existe. Apagando..."
        psql -h "$DEST_HOST" -p "$DEST_PORT" -U "$DEST_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DEST_DB\";"
    fi

    # Cria o banco de destino
    log_info "Criando banco de destino..."
    if psql -h "$DEST_HOST" -p "$DEST_PORT" -U "$DEST_USER" -d postgres -c "CREATE DATABASE \"$DEST_DB\";"; then
        log_info "Banco criado com sucesso"
    else
        log_error "Falha ao criar banco de destino"
        unset PGPASSWORD
        return 1
    fi

    # Restaura o backup
    log_info "Restaurando backup..."
    log_info "Arquivo: $backup_file"

    # Redireciona stderr para capturar warnings mas continua em caso de avisos
    if psql -h "$DEST_HOST" -p "$DEST_PORT" -U "$DEST_USER" -d "$DEST_DB" \
        -v ON_ERROR_STOP=0 \
        -f "$backup_file" 2>&1 | tee /tmp/restore_output.log; then
        log_info "Restore concluído com sucesso!"

        # Verifica se houve warnings
        if grep -q "WARNING" /tmp/restore_output.log 2>/dev/null; then
            log_warning "Restore concluído com alguns avisos. Verifique /tmp/restore_output.log"
        fi

        rm -f /tmp/restore_output.log
        unset PGPASSWORD
        return 0
    else
        log_error "Falha ao restaurar backup"
        log_error "Verifique o log em /tmp/restore_output.log para mais detalhes"
        unset PGPASSWORD
        return 1
    fi
}

# Função para listar backups
list_backups() {
    log_info "Backups disponíveis em $BACKUP_DIR:"
    echo ""
    ls -lh "$SCRIPT_DIR/$BACKUP_DIR"/*.sql 2>/dev/null || log_warning "Nenhum backup encontrado"
}

# Função de ajuda
show_help() {
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  backup              Faz backup do banco de origem"
    echo "  restore [arquivo]   Restaura backup no banco de destino (usa o último backup se arquivo não especificado)"
    echo "  full                Faz backup e restaura em seguida"
    echo "  list                Lista backups disponíveis"
    echo "  help                Exibe esta mensagem"
    echo ""
    echo "Exemplos:"
    echo "  $0 backup"
    echo "  $0 restore"
    echo "  $0 restore backups/postgres_backup_20250129_120000.sql"
    echo "  $0 full"
    echo ""
}

# Processa argumentos
case "${1:-help}" in
    backup)
        backup_database
        ;;
    restore)
        if [ -n "$2" ]; then
            restore_database "$2"
        else
            # Usa o backup mais recente
            LATEST_BACKUP=$(ls -t "$SCRIPT_DIR/$BACKUP_DIR"/*.sql 2>/dev/null | head -1)
            if [ -z "$LATEST_BACKUP" ]; then
                log_error "Nenhum backup encontrado. Execute primeiro: $0 backup"
                exit 1
            fi
            log_info "Usando backup mais recente: $LATEST_BACKUP"
            restore_database "$LATEST_BACKUP"
        fi
        ;;
    full)
        if backup_database; then
            log_info "Aguardando 2 segundos antes do restore..."
            sleep 2
            restore_database "$BACKUP_FILE"
        else
            log_error "Não foi possível completar a operação"
            exit 1
        fi
        ;;
    list)
        list_backups
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Opção inválida: $1"
        show_help
        exit 1
        ;;
esac
