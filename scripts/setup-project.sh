#!/bin/bash

# Script para copiar configurações do SDD para outros projetos
# Uso: ./setup-project.sh [diretório-destino]

set -e

# Diretório onde este script está localizado (SDD)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDD_ROOT="$(dirname "$SCRIPT_DIR")"

# Diretório de destino (padrão: diretório atual)
DEST_DIR="${1:-.}"
DEST_DIR="$(cd "$DEST_DIR" && pwd)"

echo "=== Setup de Projeto SDD ==="
echo "Origem: $SDD_ROOT"
echo "Destino: $DEST_DIR"
echo ""

# Verificar se não estamos no próprio diretório SDD
if [ "$DEST_DIR" = "$SDD_ROOT" ]; then
    echo "Erro: Não é possível copiar para o próprio diretório SDD"
    exit 1
fi

# Pastas a serem copiadas
FOLDERS=(".claude" "rules")

# Copiar cada pasta
for folder in "${FOLDERS[@]}"; do
    if [ -d "$SDD_ROOT/$folder" ]; then
        # Remover pasta de destino se existir
        [ -d "$DEST_DIR/$folder" ] && rm -rf "$DEST_DIR/$folder"

        # Copiar
        echo "Copiando: $folder"
        cp -r "$SDD_ROOT/$folder" "$DEST_DIR/"
    else
        echo "Aviso: Pasta $folder não encontrada em $SDD_ROOT"
    fi
done

echo ""
echo "✓ Setup concluído!"
