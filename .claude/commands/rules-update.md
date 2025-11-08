---
description: Manutenção dos arquivos de regras na pasta ./.rules
tags: [documentation, rules]
---

# Regras

- Deve manter os arquivos de regras na pasta ./.rules
- Deve sempre manter o SUMARIO.md atualizado
- Os nomes de arquivos devem sempre ser as perguntas.
- Importante escrever em UTF-8.


Se for feito uma pergunta, deve responder objetivamente com o nome do arquivo e linha no arquivo.


# Busca Semântica na Documentação

Antes de adicionar ou modificar regras, use o comando de busca semântica para verificar se já existem informações similares:

```bash
./scripts/docs query "sua questão técnica aqui"
```

**Quando usar:**
- Verificar se a informação já está documentada (ex: "padrões de nomenclatura de arquivos")
- Buscar arquivos relacionados ao tópico (ex: "regras de validação")
- Entender o contexto antes de adicionar novas regras (ex: "estrutura de APIs")
- Identificar onde adicionar novas informações (ex: "documentação de services")

**Exemplos:**
```bash
./scripts/docs query "regras de criação de controllers"
./scripts/docs query "padrões de estrutura de pastas"
./scripts/docs query "convenções de nomenclatura"
./scripts/docs query "boas práticas de validação"
```

A busca semântica ajuda a manter a documentação consistente e evita duplicação de informações.

# Muito Importante

Não adicione conteúdo que já está sendo abordado em outro arquivo da pasta ./.rules. Sempre verifique para não duplicar informações.

