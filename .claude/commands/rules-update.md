---
description: Manutenção dos arquivos de regras na pasta ./.rules
tags: [documentation, rules]
---

# Regras

- Deve manter os arquivos de regras na pasta ./.rules
- Deve sempre manter o SUMARIO.md atualizado
- Os nomes de arquivos devem sempre ser as perguntas.
- Importante escrever em UTF-8.
- **OBRIGATÓRIO**: Todos os subtítulos `##` devem seguir o padrão `## [Título Específico]()` com colchetes e parênteses vazios.
- **IMPORTANTE**: Os blocos de subtítulo "##" no markdown devem ter títulos menores e específicos, representando um contexto único e bem delimitado. Isso é essencial para embeddings semânticos, pois cada chunk (seção ##) será indexado separadamente. Prefira títulos curtos e descritivos que capturem exatamente o conteúdo da seção.

## Padrão Correto para Subtítulos

**SEMPRE use este formato:**
```markdown
## [Título Específico e Descritivo]()
```

**Exemplos corretos:**
- ✅ `## [Estrutura de Use-Case Magro]()` (específico e contextualizado)
- ✅ `## [Vantagens de Múltiplos Arquivos Pequenos]()` (claro e direto)
- ✅ `## [Exemplo: Calcular Saldo com Use-Case]()` (contexto completo)
- ✅ `## [Passo 1: Definir Interfaces do Use-Case]()` (passo específico)

**Evite títulos genéricos:**
- ❌ `## Estrutura de Arquivos` (muito genérico, SEM colchetes)
- ❌ `## Exemplo` (sem contexto, SEM colchetes)
- ❌ `## Boas Práticas` (vago demais, SEM colchetes)
- ❌ `## [Boas Práticas]()` (título genérico, mas formato correto)

**NUNCA use:**
- ❌ `## Título sem colchetes` → ERRADO
- ❌ `## Título sem parênteses []` → ERRADO
- ❌ `## [Título]` → ERRADO (falta `()`)

**Por que o padrão `## [texto]()`?**
- O script de indexação `./scripts/docs` usa regex para detectar blocos `##`
- Apenas subtítulos no formato `## [texto]()` são reconhecidos e indexados
- Subtítulos sem este padrão causam erro de "bloco muito grande"
- Este padrão permite embeddings semânticos corretos

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

