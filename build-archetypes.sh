#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$ROOT_DIR/arquetypes"
OUT_DIR="$ROOT_DIR/dist"

if [ ! -d "$SRC_DIR" ]; then
  echo "Pasta '$SRC_DIR' não encontrada." >&2
  exit 1
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

shopt -s nullglob
found=0
for dir in "$SRC_DIR"/*/; do
  found=1
  name="$(basename "$dir")"
  zip_path="$OUT_DIR/$name.zip"
  echo "→ Zipando $name → dist/$name.zip"
  (
    cd "$dir"
    zip -rq "$zip_path" . \
      -x "node_modules/*" \
      -x "dist/*" \
      -x "build/*" \
      -x ".next/*" \
      -x ".turbo/*" \
      -x ".cache/*" \
      -x "coverage/*" \
      -x ".git/*" \
      -x ".DS_Store"
  )
done

if [ "$found" -eq 0 ]; then
  echo "Nenhuma subpasta encontrada em '$SRC_DIR'." >&2
  exit 1
fi

echo "Concluído. Arquivos em: $OUT_DIR"
