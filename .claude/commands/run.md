---
description: Subir os serviços de backend e frontend
tags: [run, backend, frontend]
---

# Instruções

Execute o script automatizado que gerencia toda a infraestrutura de desenvolvimento:

!`bash ./scripts/run-dev.sh`

O script foi executado

Verifique os logs para confirmar que os serviços subiram corretamente:

```bash
tail -f logs/back.log logs/front.log
```

Se houver erros nos logs, informe o usuário com detalhes específicos do problema encontrado.

Use o comando /fix para resolver problemas tecnicos do projeto.
