---
allowed-tools: Bash(cat:*), Bash(ls:*)
description: Crie feature do sistema seguindo as especificações técnicas
tags: [documentation, api-docs]
---

# Arquivo de TODO List

- Sempre que tiver demanda, adicione no arquivo ./TODO.md uma nova tarefa para ser feita. Cada tarefa deve estar em uma unica linha e bem descritiva.

## Formato do arquivo ./TODO.md

- [ ] Tarefa 1
- [x] Tarefa já concluida
- [ ] Tarefa 3


Abaixo estão as tarefas pendentes do TODO List.

!`cat ./TODO.md | grep -v "\[x\]"`

Abaixo estão as tarefas concluidas do TODO List.

!`cat ./TODO.md | grep "\[x\]"`


# Agente

- Deve sempre seguir as especificações técnicas, antes de criar uma feature no TODO List, consulte o arquivo de especificações técnicas.
- Após adicionar uma nova tarefa, delegue a tarefa de criação da feature para o agente apropriado.
- Informe ao agente as tarefas que deve ser concluídas.

## Especificações técnicas

!`ls ./.rules/*.md`
!`cat ./.rules/SUMARIO.md`