---
allowed-tools: Bash(cat:*), Bash(ls:*)
description: Crie feature do sistema seguindo as especificações técnicas
tags: [documentation, api-docs]
---

# Arquivo de TODO List

- Sempre que tiver demanda, adicione no arquivo ./todo/TODO.md uma nova tarefa para ser feita. Cada tarefa deve estar em uma única linha e bem descritiva e deve ter um arquivo markdown com a demanda da tarefa bem detalhada.

## Importante
!!! Muito importante: Crie um arquivo markdown com a demanda da tarefa bem detalhada. Nunca invente nada, considere as especificações técnicas e as regras. Pergunte para o usuário apenas dúvidas de negócio.

## Formato do arquivo ./todo/TODO.md

- [ ] Tarefa 1 - `./todo/tarefa-1.md`
- [x] Tarefa já concluida - `./todo/tarefa-1.md`
- [ ] Tarefa 3 - `./todo/tarefa-3.md`

Abaixo estão as tarefas pendentes do TODO List.

!`cat ./todo/TODO.md | grep -v "\[x\]"`

Abaixo estão as tarefas concluídas do TODO List.

!`cat ./todo/TODO.md | grep "\[x\]"`


# Agente

Nunca implemente nenhum codigo, ou faça qualquer alteração no codigo. Deve apenas manter o TODO List atualizado.

# Regras

- Deve sempre seguir as especificações técnicas, antes de criar uma feature no TODO List, consulte o arquivo de especificações técnicas.

# Especificações técnicas

!`ls ./.rules/*.md`
!`cat ./.rules/SUMARIO.md`