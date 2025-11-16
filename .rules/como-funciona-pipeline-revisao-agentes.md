# Como Funciona o Pipeline de Revisão com Agentes

## Visão Geral

O sistema SDD utiliza um **pipeline de revisão em duas etapas** para garantir que toda implementação esteja completa e em conformidade com os padrões técnicos do projeto.

### Fluxo Completo

```
┌─────────────────────┐
│ developer-fullstack │ ← Implementa a funcionalidade
│  (implementação)    │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────┐
    │feature-review│ ← ETAPA 1: Valida COMPLETUDE (requisitos da tarefa)
    └──────┬───────┘
           │
    ┌──────┴──────┐
    │             │
    ↓             ↓
INCOMPLETO    COMPLETO
    │             │
    │             ↓
    │      ┌────────────┐
    │      │code-review │ ← ETAPA 2: Valida QUALIDADE (padrões técnicos)
    │      └─────┬──────┘
    │            │
    │      ┌─────┴─────┐
    │      │           │
    ↓      ↓           ↓
┌─────────────┐   APROVADO
│ VOLTA PARA  │       │
│  developer  │       ↓
│  CORRIGIR   │   ✅ DONE
└─────────────┘
```

---

## Agentes Envolvidos

### 1. developer-fullstack

**Responsabilidade:** Implementar funcionalidades completas (backend + frontend).

**Localização:** `.claude/agents/developer-fullstack.md`

**Ferramentas:**
- Read, Grep, Glob, Bash, Write, Edit
- MCP Postgres (validar banco de dados)
- MCP Redis (validar cache)
- MCP Docs Search (buscar padrões técnicos)

**Workflow:**
1. Analisa a demanda da tarefa
2. Consulta regras técnicas do projeto (`.rules`)
3. Implementa código (backend + frontend)
4. Roda build e testes
5. Valida com curl e queries no banco/cache

**Quando usar:**
- Criar novas funcionalidades
- Corrigir bugs
- Completar implementações incompletas
- Corrigir violações de code review

---

### 2. feature-review

**Responsabilidade:** Validar se a implementação está **completa** e atende aos **requisitos da tarefa**.

**Localização:** `.claude/agents/feature-review.md`

**Ferramentas:**
- Read, Grep, Glob, Write
- MCP Postgres (validar dados)
- MCP Redis (validar cache)
- MCP Docs Search (buscar requisitos)

**Workflow:**
1. Identifica o escopo da revisão (lê arquivo da tarefa)
2. Identifica arquivos implementados
3. Lê todos os arquivos implementados
4. Consulta regras técnicas referenciadas na tarefa (`.rules`)
5. Compara requisitos vs implementação
6. Valida tecnicamente (banco/cache se aplicável)
7. Escreve relatório `./todo/feature-review-<contexto>.md`

**Critérios de Veredito:**

| Veredito | Critérios |
|----------|-----------|
| ✅ **COMPLETO** | 0 críticas, 0-1 alta, ≥ 95% completude |
| ⚠️ **INCOMPLETO - REVISÃO NECESSÁRIA** | 0 críticas, 2-3 altas, 80-94% completude |
| ❌ **INCOMPLETO - FALTA IMPLEMENTAÇÃO CRÍTICA** | ≥ 1 crítica OU > 3 altas OU < 80% completude |

**O que valida:**
- ✅ Todos endpoints mencionados foram implementados?
- ✅ Todas validações especificadas estão presentes?
- ✅ Todos campos obrigatórios foram implementados?
- ✅ Integrações com banco/cache funcionando?
- ✅ Componentes frontend implementados?

**Diferença do code-review:**
- **feature-review:** Compara código vs requisitos da tarefa
- **code-review:** Compara código vs padrões técnicos do projeto

---

### 3. code-reviewer

**Responsabilidade:** Validar se o código segue as **regras técnicas, padrões de arquitetura, estilo de código e boas práticas** definidas em `.rules`.

**Localização:** `.claude/agents/code-reviewer.md`

**Ferramentas:**
- Read, Grep, Glob, Write
- MCP Postgres (validar estrutura de dados)
- MCP Redis (validar uso de cache)
- MCP Docs Search (buscar regras técnicas)

**Workflow:**
1. Identifica arquivos a serem revisados
2. Lê todos os arquivos
3. Consulta regras técnicas, padrões de arquitetura e boas práticas em `.rules`
4. Compara código vs regras
5. Valida tecnicamente (banco/cache se aplicável)
6. Escreve relatório `./todo/code-review-<contexto>.md`

**Critérios de Veredito:**

| Veredito | Critérios |
|----------|-----------|
| ✅ **APROVADO** | 0 críticas, ≤ 2 altas |
| ⚠️ **APROVADO COM RESSALVAS** | 0 críticas, 3-5 altas |
| ❌ **REPROVADO** | ≥ 1 crítica OU > 5 altas |

**Severidades:**

**🔴 CRÍTICA:**
- API sem versionamento `/v1/`
- API sem validação de `userId`
- SQL injection
- Secrets hardcoded
- Datas sem UTC
- Falta de autenticação em rotas protegidas

**🟡 ALTA:**
- Falta de validações em DTOs
- Swagger incompleto
- Error handling inadequado
- Queries N+1

**🟠 MÉDIA:**
- Nomenclatura inconsistente
- Arquivos > 300 linhas
- Uso de `any`
- Código duplicado

**🔵 BAIXA:**
- Formatação inconsistente
- Comentários desnecessários
- Nomes pouco descritivos

---

## Pipeline de Revisão: Fluxo Detalhado

### Etapa 1: Feature Review (Completude)

**Quando:** Após developer-fullstack concluir implementação.

**Processo:**

1. **Scrum Master delega** para `feature-review`
   - Informa contexto (ex: "products-api")
   - Informa arquivo da tarefa (ex: `./todo/task-products.md`)
   - Lista arquivos criados/modificados

2. **Feature-review executa** workflow completo
   - Lê tarefa original
   - Lê arquivos implementados
   - Compara requisitos vs código
   - Valida no banco/cache (se aplicável)
   - Escreve relatório

3. **Scrum Master lê** `./todo/feature-review-<contexto>.md`

4. **Decisão baseada no veredito:**

   **Se ❌ INCOMPLETO ou ⚠️ REVISÃO NECESSÁRIA:**
   - Adiciona ao TODO: `- [ ] Completar implementação - ./todo/feature-review-<contexto>.md`
   - Delega IMEDIATAMENTE de volta ao `developer-fullstack`
   - Developer corrige incompatibilidades
   - **RETORNA ao início da Etapa 1** (valida completude novamente)

   **Se ✅ COMPLETO:**
   - Informa usuário que implementação está completa
   - **AVANÇA para Etapa 2** (Code Review)

---

### Etapa 2: Code Review (Qualidade Técnica)

**Quando:** Após feature-review aprovar (✅ COMPLETO).

**Processo:**

1. **Scrum Master delega** para `code-reviewer`
   - Informa contexto (ex: "products-api")
   - Lista arquivos criados/modificados

2. **Code-reviewer executa** workflow completo
   - Lê arquivos implementados
   - Busca regras técnicas em `.rules`
   - Compara código vs regras
   - Valida no banco/cache (se aplicável)
   - Escreve relatório

3. **Scrum Master lê** `./todo/code-review-<contexto>.md`

4. **Decisão baseada no veredito:**

   **Se ❌ REPROVADO ou ⚠️ APROVADO COM RESSALVAS:**
   - Adiciona ao TODO: `- [ ] Corrigir code review - ./todo/code-review-<contexto>.md`
   - Delega IMEDIATAMENTE de volta ao `developer-fullstack`
   - Developer corrige violações
   - **RETORNA à Etapa 1** (precisa validar completude após correções)

   **Se ✅ APROVADO:**
   - Marca tarefa original como concluída no TODO List
   - Informa usuário que código foi aprovado
   - Prossegue com próximas tarefas

---

## Exemplo Completo de Execução

### Cenário: Implementar CRUD de Produtos

**Tarefa:** `./todo/task-products.md`

**Requisitos:**
- Criar API REST completa: GET, POST, PUT, DELETE
- Campos: name, description, price, category, stock
- Validações: name obrigatório, price > 0, stock ≥ 0
- Salvar no PostgreSQL
- Cache de listagem no Redis (5 min TTL)

---

### Rodada 1: Primeira Implementação

**1. Developer-fullstack implementa:**
- ✅ GET /v1/products
- ✅ POST /v1/products
- ❌ PUT /v1/products/:id (FALTOU)
- ❌ DELETE /v1/products/:id (FALTOU)
- ✅ Entity com campos: name, price
- ❌ Campos description, category, stock (FALTARAM)
- ✅ Validação: name obrigatório
- ❌ Validações de price e stock (FALTARAM)

**2. Feature-review valida:**

Relatório: `./todo/feature-review-products-api.md`

```
Veredito: ❌ INCOMPLETO - FALTA IMPLEMENTAÇÃO CRÍTICA
Taxa de completude: 60%

Incompatibilidades Críticas:
- Endpoint PUT não implementado
- Endpoint DELETE não implementado
- Campos obrigatórios ausentes: description, category, stock
- Validações de price e stock ausentes
```

**3. Scrum Master:**
- Adiciona: `- [ ] Completar implementação - ./todo/feature-review-products-api.md`
- Delega para developer-fullstack corrigir

---

### Rodada 2: Implementação Completa

**4. Developer-fullstack completa:**
- ✅ PUT /v1/products/:id (ADICIONADO)
- ✅ DELETE /v1/products/:id (ADICIONADO)
- ✅ Campos: description, category, stock (ADICIONADOS)
- ✅ Validações de price > 0 e stock ≥ 0 (ADICIONADAS)

**5. Feature-review valida novamente:**

Relatório: `./todo/feature-review-products-api.md` (atualizado)

```
Veredito: ✅ COMPLETO
Taxa de completude: 100%

Todos requisitos implementados!
```

**6. Scrum Master:**
- Informa usuário: "Implementação completa!"
- **Avança para Code Review**

---

### Rodada 3: Code Review (Primeira Revisão)

**7. Code-reviewer valida:**

Relatório: `./todo/code-review-products-api.md`

```
Veredito: ⚠️ APROVADO COM RESSALVAS
Violações críticas: 0
Violações altas: 3

Violações Altas:
- API sem validação de userId em endpoints protegidos
- Falta documentação Swagger
- Cache sem invalidação ao criar/atualizar/deletar
```

**8. Scrum Master:**
- Adiciona: `- [ ] Corrigir code review - ./todo/code-review-products-api.md`
- Delega para developer-fullstack corrigir
- **RETORNA à Etapa 1** (feature-review)

---

### Rodada 4: Correções de Qualidade

**9. Developer-fullstack corrige:**
- ✅ Adiciona validação de userId em todos endpoints
- ✅ Adiciona documentação Swagger completa
- ✅ Implementa invalidação de cache

**10. Feature-review valida:**
- Veredito: ✅ COMPLETO (nada mudou nos requisitos)

**11. Code-review valida novamente:**

Relatório: `./todo/code-review-products-api.md` (atualizado)

```
Veredito: ✅ APROVADO
Violações: 0 críticas, 0 altas

Código em conformidade com padrões técnicos!
```

**12. Scrum Master:**
- Marca tarefa como concluída: `- [x] Implementar CRUD de produtos - ./todo/task-products.md`
- Informa usuário: "Tarefa concluída! Feature Review: ✅ | Code Review: ✅"
- Prossegue para próxima tarefa

---

## Boas Práticas

### Para o Scrum Master (comando /execute)

1. **Sempre siga o pipeline completo:**
   - developer → feature-review → code-review

2. **Nunca pule etapas:**
   - Mesmo que seja "só uma correção pequena", valide completude e qualidade

3. **Loop de correção:**
   - Se feature-review reprovar: volta para developer → feature-review novamente
   - Se code-review reprovar: volta para developer → feature-review → code-review

4. **Mantenha o TODO atualizado:**
   - Adicione tarefas de correção
   - Marque como concluído APENAS após ambas revisões aprovarem

---

### Para Desenvolvedores

1. **Leia a tarefa COMPLETA antes de implementar**
2. **Consulte `.rules` para regras técnicas, padrões de arquitetura e boas práticas**
3. **Valide no banco/cache com MCP antes de concluir**
4. **Rode build e testes antes de marcar como pronto**

---

### Para Revisores

**Feature Review:**
- Compare código vs tarefa (não vs regras técnicas)
- Seja específico: "Falta endpoint DELETE" não "Falta implementação"
- Documente exatamente o que está faltando

**Code Review:**
- Compare código vs regras técnicas em `.rules` (não vs tarefa)
- Cite sempre a regra violada com caminho e linha (ex: `.rules/como-criar-api-backend.md:145`)
- Forneça exemplos de código correto seguindo as regras

---

## Arquivos de Saída

Todos os relatórios são salvos em `./todo/`:

- `./todo/feature-review-<contexto>.md` - Revisão de completude
- `./todo/code-review-<contexto>.md` - Revisão de qualidade

**Formato do contexto:** Use kebab-case, descreva a funcionalidade.

**Exemplos:**
- `products-api`
- `user-authentication`
- `dashboard-analytics`
- `payment-integration`

---

## Resumo

| Etapa | Agente | Valida | Resultado | Próximo Passo |
|-------|--------|--------|-----------|---------------|
| Implementação | developer-fullstack | - | Código criado | → Feature Review |
| Etapa 1 | feature-review | Completude vs tarefa | ✅ Completo | → Code Review |
| Etapa 1 | feature-review | Completude vs tarefa | ❌ Incompleto | → Developer corrige → Etapa 1 |
| Etapa 2 | code-review | Qualidade vs regras (.rules) | ✅ Aprovado | → Tarefa concluída |
| Etapa 2 | code-review | Qualidade vs regras (.rules) | ❌ Reprovado | → Developer corrige → Etapa 1 |

**Objetivo Final:** Garantir que TODO código entregue esteja:
1. **Completo** (atende 100% dos requisitos da tarefa)
2. **Conforme** (segue 100% das regras técnicas, padrões de arquitetura e boas práticas)
