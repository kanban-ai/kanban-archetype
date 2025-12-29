# APPS_START_ENV  
**Script de inicialização e orquestração de serviços**

---

## Visão geral

`APPS_START_ENV` permite definir **múltiplos serviços** em uma única variável de ambiente, com:

- Instalação condicional
- Execução controlada
- Health-check configurável
- Reexecução segura (sem duplicar processos)

Usado pelo script `default-prepare.sh`.

---

## Formato da variável

- Serviços separados por `,`
- Campos separados por `;`

```text
name=<string>;
install=<string>;
cmd=<string>;
check=<tipo>;
target=<string>
````

---

## Campos suportados

| Campo     | Obrigatório | Descrição                                            |
| --------- | ----------- | ---------------------------------------------------- |
| `name`    | não         | Nome do serviço (default: `service_N`)               |
| `install` | não         | Comando executado antes do start                     |
| `cmd`     | sim         | Comando de execução do serviço                       |
| `check`   | não         | Tipo de healthcheck (`http`, `tcp`, `cmd`, `none`)   |
| `target`  | condicional | Alvo do healthcheck (obrigatório se `check != none`) |

---

## Tipos de healthcheck

### `http`

* Faz `GET` no endpoint informado
* `target`: `host:port` ou `host:port/path`

### `tcp`

* Testa conexão TCP
* `target`: `host:port`

### `cmd`

* Executa comando bash
* `target`: comando a ser executado

### `none` (default)

* Não valida saúde
* Inicia e continua execução

---

## Gerenciamento de processos

Cada serviço é iniciado com um **marcador único**:

```text
SVC:<name>
```

Antes de iniciar um serviço, o script:

1. Executa `pkill -f "SVC:<name>"`
2. Envia `SIGTERM` e aguarda até **5s**
3. Se necessário, envia `SIGKILL`

➡️ Permite reexecução segura do script.

---

## Variáveis de controle

| Variável        | Default | Descrição                           |      |      |        |
| --------------- | ------- | ----------------------------------- | ---- | ---- | ------ |
| `WAIT_SECONDS`  | `1`     | Intervalo entre checks              |      |      |        |
| `MAX_WAIT`      | `60`    | Tempo máximo aguardando healthcheck |      |      |        |
| `STOP_ON_ERROR` | `true`  | Interrompe ao primeiro erro         |      |      |        |
| `LOG_LEVEL`     | `info`  | `debug                              | info | warn | error` |

---

## Exemplo simples

```bash
export APPS_START_ENV="\
name=redis;cmd=redis-server;check=tcp;target=127.0.0.1:6379,\
name=api;install=npm ci;cmd=node server.js;check=http;target=localhost:3000/health"
```

```bash
./prepare.sh
```

---

## Exemplo completo (Backend + Frontend)

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

## Boas práticas

* Use `npm ci` para builds determinísticos
* Sempre defina `check` para serviços críticos
* Prefira endpoints reais (`/health`, `/docs`)
* Evite lógica complexa fora de `bash -c`
* Use portas explícitas no `cmd`

---

## Casos de uso

* Ambiente de desenvolvimento local
* DevContainers
* Monorepos (frontend + backend)
* Scripts de bootstrap
* Orquestração simples sem Docker/K8s

---

```