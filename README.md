## APPS_START_ENV

**Inicialização e orquestração simples de serviços**

---

## Formato

* Serviços separados por `,`
* Campos separados por `;`

```text
name=<string>;install=<string>;cmd=<string>;check=<tipo>;target=<string>
```

---

## Campos

* `name` *(opcional)*
  Nome do serviço. Default: `service_N`

* `install` *(opcional)*
  Comando executado antes do start

* `cmd` *(obrigatório)*
  Comando principal do serviço

* `check` *(opcional)*
  Healthcheck: `http | tcp | cmd | none` (default: `none`)

* `target` *(condicional)*
  Obrigatório se `check != none`

---

## Healthcheck

* `http` → `host:port` ou `host:port/path`
* `tcp` → `host:port`
* `cmd` → comando bash
* `none` → não valida

---

## Gerenciamento de processos

* Cada serviço roda com marcador:
  `SVC:<name>`

Antes de iniciar:

1. `pkill -f "SVC:<name>"`
2. `SIGTERM` (aguarda até 5s)
3. `SIGKILL` se necessário

✔️ Permite reexecução segura

---

## Variáveis globais

* `WAIT_SECONDS` (default: `1`)
* `MAX_WAIT` (default: `60`)
* `STOP_ON_ERROR` (default: `true`)
* `LOG_LEVEL` (`debug | info | warn | error`, default: `info`)

---

## Exemplo backend + frontend

```bash
name=backend;
install=bash -c "test -d backend/node_modules || (cd backend && npm ci)";
cmd=bash -c "(cd backend && npm run migration:run && PORT=3000 npm run start:dev)";
check=http;
target=localhost:3000/api/docs,
name=frontend;
install=bash -c "test -d frontend/node_modules || (cd frontend && npm ci)";
cmd=bash -c "(cd frontend && npm run dev)";
check=http;
target=localhost:5173
```

---

## Registro de portas

* `3000` → backend
* `5173` → frontend

Essas portas ficam disponíveis para uso dinâmico.

---

## VITE_API_URL (Frontend)

O script deve injetar automaticamente:

```bash
VITE_API_URL=http://kanban.devmania.ai:{{port_backend}}/api
```

* `port_backend` = porta registrada do backend (ex: `3000`)
* Garante que o frontend encontre o backend sem hardcode
