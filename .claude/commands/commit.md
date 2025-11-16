---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git diff --staged:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*)
description: Create commit following Conventional Commits in Portuguese
---

Do not ask if the user wants to proceed with the commit.
Just execute the steps below.

# Initial Checks

- If the project has build scripts, execute them (e.g., `npm run build`, `pnpm run build`, `yarn build`).
- Fix any build errors before continuing.
- Always include all relevant changes in the commit.

# Analyze Repository State

Current repository state:
!`git status`

# Evaluate Changes

!`git diff`

# Commit — Generate Commit Message Following Conventional Commits

!!! Important: do not add automatic metadata such as "Co-Authored-By" or mentions of AI tools.

## Automatic Process

1. Analyze all changes displayed in the diff.
2. Always add everything to the commit. Example: `git add .`
3. Identify appropriate **type** and **scope** (feat, fix, docs, refactor, chore, test, perf, etc.).
4. Generate the commit message according to the pattern below, in **Portuguese**:

```
<type>(<scope>): <description>
```

* description in lowercase
* no period at the end
* up to ~72 characters
* describe **what** and **why**, not **how**
* breaking changes use ! (e.g., `feat(api)!: altera estrutura de resposta`)
* if there are several unrelated changes, suggest splitting into separate commits

5. Do not show the suggested message to the user for validation. Just execute the steps above.
6. After confirmation:

```bash
git add <necessary files>
git commit -m "generated message"
```

7. Do not ask if the user wants to proceed with the commit. Just execute the steps above.

# Push

```bash
git push
```

---

### Commit Examples

* `feat(auth): adiciona autenticação com token JWT`
* `fix(routes): corrige redirecionamento após login`
* `docs(readme): atualiza instruções de configuração`
* `refactor(core): simplifica lógica de inicialização`
* `perf(database): melhora desempenho de consulta`
* `chore(deps): atualiza dependências`
* `feat(api)!: altera formato de retorno de erro`


