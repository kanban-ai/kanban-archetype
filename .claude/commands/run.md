---
description: Subir os serviços de backend e frontend
tags: [run, backend, frontend]
---

# Instruções

Execute o script automatizado que gerencia toda a infraestrutura de desenvolvimento:

```bash
./scripts/run-dev.sh
```

Este script irá:
1. Verificar e iniciar o Docker Compose (PostgreSQL na porta 5432)
2. Matar processos nas portas 3000 e 5173 (se existirem)
3. Iniciar backend (porta 3000) e frontend (porta 5173) em background
4. Redirecionar logs para `logs/back.log` e `logs/front.log`

Após executar, aguarde alguns segundos e verifique os logs para confirmar que os serviços subiram corretamente:

```bash
tail -f logs/back.log logs/front.log
```

Se houver erros nos logs, informe o usuário com detalhes específicos do problema encontrado.
