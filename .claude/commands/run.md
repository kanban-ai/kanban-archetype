---
description: Subir os serviços de backend e frontend
tags: [run, backend, frontend]
---

# Instruções

## Opção 1: Via MCP (Recomendado)

Use o MCP para gerenciar a aplicação de forma integrada:

```javascript
// 1. Primeiro, iniciar os serviços Docker (PostgreSQL, Redis, etc)
mcp__mcp-app__manage_application({ action: "services" })

// 2. Depois, iniciar a aplicação (backend + frontend)
// Aguarda automaticamente o backend subir na porta 3000
mcp__mcp-app__manage_application({ action: "start" })

// 3. Verificar status
ReadMcpResourceTool({ server: "mcp-app", uri: "app://status" })

// 4. Ver logs em tempo real
ReadMcpResourceTool({ server: "mcp-app", uri: "app://logs/backend" })
ReadMcpResourceTool({ server: "mcp-app", uri: "app://logs/frontend" })
```

## Opção 2: Via Script Shell

Execute o script automatizado que gerencia toda a infraestrutura de desenvolvimento:

!`bash ./scripts/run-dev.sh`

O script foi executado

Verifique os logs para confirmar que os serviços subiram corretamente:

```bash
tail -f logs/back.log logs/front.log
```

## Em caso de erros

Se houver erros nos logs, informe o usuário com detalhes específicos do problema encontrado.

Use o comando /fix para resolver problemas técnicos do projeto.
