---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git diff --staged:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*)
description: Cria commit seguindo Conventional Commits em português
---

Não pergunte se o usuário deseja prosseguir com o commit.  
Apenas execute as etapas abaixo.

# Verificações iniciais

- Se o projeto tiver scripts de build, execute-os (ex: `npm run build`, `pnpm run build`, `yarn build`).  
- Corrija eventuais erros de build antes de continuar.  
- Sempre inclua todas as alterações relevantes no commit.

# Analisar o estado do repositório

Estado atual do repositório:
!`git status`

# Avaliar mudanças

!`git diff`

# Commit — gerar mensagem de commit no padrão Conventional Commits

!!! Importante: não adicione metadados automáticos como “Co-Authored-By” ou menções a ferramentas de IA.

## Processo automático

1. Analise todas as mudanças exibidas no diff.
2. Sempre adicione tudo no commit. Exemplo: `git add .`
3. Identifique **tipo** e **escopo** adequados (feat, fix, docs, refactor, chore, test, perf, etc.).
4. Gere a mensagem de commit conforme o padrão abaixo, em **português**:

```
<tipo>(<escopo>): <descrição>
```

* descrição em minúsculas
* sem ponto final
* até ~72 caracteres
* descreva **o que** e **por que**, não **como**
* breaking changes usam `` (ex: `feat(api)!: altera estrutura de resposta`)
* se houver várias alterações sem relação, sugira dividir em commits separados

5. Não mostre a mensagem sugerida ao usuário para validação. Apenas execute as etapas acima.
6. Após confirmação:

```bash
git add <arquivos necessários>
git commit -m "mensagem gerada"
```

7. Não pergunte se o usuário deseja prosseguir com o commit. Apenas execute as etapas acima.

# Push

```bash
git push
```

---

### Exemplos de commits

* `feat(auth): adiciona autenticação com token JWT`
* `fix(routes): corrige redirecionamento após login`
* `docs(readme): atualiza instruções de configuração`
* `refactor(core): simplifica lógica de inicialização`
* `perf(database): melhora desempenho de consulta`
* `chore(deps): atualiza dependências`
* `feat(api)!: altera formato de retorno de erro`


