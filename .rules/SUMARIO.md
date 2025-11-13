# [Sumário - Documentação FAQ]()

> Índice completo com todos os guias, seções e tópicos do projeto.

## [📚 Stack e Tecnologias]()

Documentação sobre todas as tecnologias, frameworks e bibliotecas utilizadas no backend e frontend.

### [Padrões TypeScript - `./quais-padroes-typescript-devem-ser-seguidos.md`]()

- **Regra #1: NUNCA use `any`** - Proibição total do tipo any
- **Regra #2: strict: true** - Modo strict obrigatório
- **Regra #3: Tipagem explícita** - Interfaces e types com tipos claros
- **Regra #4: use `unknown`** - Alternativa segura para tipos desconhecidos
- **Type Guards** - Validação de tipos em runtime
- **Generics** - Código reutilizável com tipos seguros
- **Readonly** - Imutabilidade e prevenção de mutações
- **Nomenclatura** - Convenções PascalCase para tipos
- **ESLint Rules** - Regras obrigatórias do typescript-eslint
- **Checklist** - Verificação de qualidade TypeScript

### [Backend - `./qual-tecnologia-usa-backend.md`]()

- **Stack Principal** - Framework NestJS, TypeScript, Node.js, Express
- **Banco de Dados** - PostgreSQL, TypeORM, driver pg
- **Autenticação e Segurança** - Passport, JWT, bcrypt
- **Validação de Dados** - class-validator, class-transformer
- **Documentação de API** - Swagger/OpenAPI
- **Configuração** - @nestjs/config, dotenv
- **Utilitários** - Axios, dayjs, rxjs
- **Ferramentas de Desenvolvimento** - ESLint, Prettier, Jest
- **Arquitetura e Padrões** - Dependency Injection, Repository Pattern
- **Módulos Personalizados** - 15 módulos de domínio implementados

### [Frontend - `./qual-tecnologia-usa-frontend.md`]()

- **Stack Principal** - React, TypeScript, Vite, SWC
- **Estilização** - Tailwind CSS v4, @tailwindcss/vite
- **Roteamento** - React Router DOM
- **Requisições HTTP** - Axios
- **Visualização de Dados** - Chart.js, react-chartjs-2, Tippy.js
- **Gerenciamento de Estado** - Context API nativa
- **Ferramentas de Desenvolvimento** - ESLint, typescript-eslint
- **Estrutura de Componentes** - Componentes comuns reutilizáveis
- **Bibliotecas de Formulários** - Validação nativa HTML5

## [🔧 Backend - Desenvolvimento]()

Guias completos para desenvolvimento de APIs, integração de serviços e implementação de features no backend.

### [Redis - `./como-usar-redis-backend.md`]()

- **Quando Usar** - Cache, sessões, contadores, rate limiting, dados temporários
- **Instalação** - Pacotes necessários
- **Configuração Global** - RedisModule comum e reutilizável
- **Uso Básico** - Cache simples com get/set/del
- **Operações** - SET, GET, DEL, FLUSH
- **Contador Compartilhado** - Incremento atômico para escala horizontal
- **Rate Limiting** - Controlar requisições por usuário/IP
- **Cache de API Externa** - Reduzir latência e custos
- **Sessões Compartilhadas** - Múltiplas instâncias
- **Nomenclatura de Chaves** - Padrões hierárquicos
- **Invalidação em Massa** - Helper com patterns
- **Docker Compose** - Setup local
- **Boas Práticas** - TTL, prefixos, invalidação, segurança
- **Checklist** - Verificação de implementação
- **Troubleshooting** - Problemas comuns

### [RabbitMQ - `./como-usar-rabbitmq-backend.md`]()

- **Quando Usar** - Processamento assíncrono, tarefas demoradas, retry automático, background jobs
- **Instalação** - Pacotes @nestjs/microservices
- **Arquitetura Topic Exchange** - UMA única exchange `app_exchange` com roteamento por tópicos
- **Padrão de Nomenclatura** - `<module>.<resource>.<action>` (ex: order.order.created)
- **Configuração Global** - RabbitMQModule comum e reutilizável
- **Producer** - Publicar mensagens com tópico
- **Consumer** - Subscrever a tópicos específicos com @EventPattern
- **Wildcards** - Usar `*` (uma palavra) e `#` (zero ou mais palavras)
- **Exemplos por Módulo** - Order, Payment, Notification, Product, User, Report
- **Dead Letter Queue** - Retentativas e mensagens que falharam
- **Processamento em Lote** - Agrupar múltiplas mensagens por tópico
- **Múltiplos Consumers** - Escala horizontal com round-robin
- **Controle de Retries** - Limitar tentativas e backoff exponencial
- **Docker Compose** - Setup local com Management UI
- **Boas Práticas** - Padrão de nomenclatura, exchange única, ACK/NACK, logging com routing key
- **Diferenças Redis vs RabbitMQ** - Quando usar cada um
- **Checklist** - Verificação de implementação
- **Troubleshooting** - Problemas comuns

### [Scheduler Bull - `./como-usar-scheduler-bull-redis-backend.md`]()

- **Quando Usar** - Tarefas agendadas distribuídas, escalabilidade horizontal, retry automático
- **Diferença node-cron vs Bull** - Comparação de recursos e quando usar cada um
- **Instalação** - Pacotes Bull
- **Estrutura de Pastas** - Organização jobs/, processors/, services/
- **Configuração Global** - BullConfigModule comum e reutilizável
- **Decorator @Cron** - Criar decorator customizado com metadados
- **Como Funciona** - Fluxo: Decorator → Metadados → Jobs Registry → Bull
- **Criar Jobs** - Classes com métodos marcados por @Cron
- **Criar Processor** - @Processor e @Process para executar jobs
- **Registry Service** - OnModuleInit para ler metadados e registrar jobs
- **Expressões Cron** - Referência rápida de agendamentos comuns
- **Bull Board Dashboard** - UI web para monitoramento de filas
- **Testes** - Testar jobs e processors isoladamente
- **Disparar Manual** - Endpoint para trigger de jobs sob demanda
- **Boas Práticas** - Retry, logging, jobId único, timezone explícito
- **Troubleshooting** - Job duplicado, não executa, erros de DI
- **Checklist** - Verificação completa de implementação
- **Exemplo Completo** - Módulo Notifications com scheduler

### [Tratamento de Datas - `./como-tratar-datas-backend-frontend.md`]()

- **Regra de Ouro** - Banco UTC, Backend UTC, Frontend converte na exibição
- **Banco de Dados** - TIMESTAMP WITH TIME ZONE, sempre UTC
- **Backend** - dayjs.utc() para todas manipulações
- **DTO Backend** - Validação com @IsISO8601()
- **Service Backend** - Conversão string ISO para Date UTC
- **Frontend** - dayjs com plugins utc, timezone, relativeTime
- **Helper Frontend** - Conversão UTC ↔ Local timezone
- **Componente DateDisplay** - Exibição formatada com timezone
- **Formulários Frontend** - datetime-local e conversão para UTC
- **Operações Comuns** - Exemplos práticos backend e frontend
- **Checklist** - Verificação de implementação
- **Erros Comuns** - O que não fazer vs o que fazer

### [Setup Inicial - `./como-iniciar-fazer-0-setup-do-backend.md`]()

- **Visão Geral** - Configurar projeto NestJS + TypeORM do zero
- **Pré-requisitos** - Node.js 18+, PostgreSQL, npm/yarn
- **Passo 1: Criar Projeto** - nest new backend
- **Passo 2: Instalar Dependências** - TypeORM, Passport, Validação, Swagger
- **Passo 3: Configurar tsconfig** - Path aliases @/*
- **Passo 4: Estrutura de Pastas** - modules, config, common, database
- **Passo 5: Arquivo .env** - Variáveis de ambiente
- **Passo 6: database.config.ts** - Configuração TypeORM
- **Passo 7: Scripts package.json** - Comandos de migration
- **Passo 8: app.module.ts** - ConfigModule e TypeOrmModule
- **Próximos Passos** - Referências para continuar o setup

### [API e Endpoints - `./como-criar-api-backend.md`]()

- **Passo 1: Gerar Resource** - Comando nest g resource
- **Passo 2: Criar Entity** - Modelo de dados TypeORM
- **Passo 3: Criar DTOs** - Create e Update com validação
- **Passo 4: Implementar Service** - Lógica de negócio e CRUD
- **Passo 5: Implementar Controller** - Rotas REST **com versionamento v1**
- **Passo 6: Configurar Module** - Registro de dependências
- **Passo 7: Registrar no AppModule** - Importação global
- **Passo 8: Criar Migration** - Versionamento do schema
- **Passo 9: Testar API** - Via Swagger ou curl
- **Recursos Avançados** - Paginação, filtros, relacionamentos
- **Checklist de Implementação** - Lista completa de verificação

### [Versionamento de API - `./como-versionar-api-backend.md`]()

- **Por que versionar** - Evitar quebrar integrações, permitir evolução
- **Quando versionar** - Breaking changes, mudanças de contrato
- **Estratégias** - URL (recomendado), Header, Query Parameter
- **Implementação NestJS** - VersioningType.URI
- **Estrutura de pastas** - Organização por versão (v1/, v2/)
- **Exemplo completo** - Evolução de V1 para V2
- **Compartilhar código** - Adapter Pattern, Services base
- **Swagger por versão** - Documentação separada
- **Deprecação** - Headers de aviso, período de transição
- **Boas práticas** - Sempre começar com v1, documentar mudanças
- **Frontend** - Consumir APIs versionadas
- **Testes** - Testar múltiplas versões

### [Integração com API Externa - `./como-integrar-com-api-externa-backend.md`]()

- **Configuração do Cliente HTTP** - HttpService base com Axios
- **Estrutura de Service** - Padrão para integração externa
- **Autenticação** - API Key, Bearer Token, Basic Auth, OAuth 2.0
- **Timeout e Retry** - Configuração e implementação
- **Circuit Breaker** - Proteção contra APIs instáveis
- **Cache de Respostas** - Em memória e Redis
- **Rate Limiting** - Detectar 429 e throttle local
- **Webhooks** - Receber eventos de APIs externas
- **Mocks para Testes** - Mock do HttpService e nock
- **Variáveis de Ambiente** - Configuração segura
- **Exemplo Completo** - Módulo Providers (Yahoo, Kinvo, B3)
- **Boas Práticas** - Checklist de implementação

### [Swagger - `./como-documentar-swagger-backend.md`]()

- **Configuração Inicial** - Setup do Swagger no main.ts
- **Documentar Controllers** - Decorators principais
- **Documentar DTOs** - @ApiProperty e exemplos
- **Documentar Respostas** - Tipos e múltiplos status codes
- **Decorators Íteis** - @ApiTags, @ApiBearerAuth, @ApiOperation
- **Ocultar Propriedades** - @ApiHideProperty e @Exclude
- **Testar no Swagger UI** - Como autenticar e testar endpoints
- **Documentar Paginação** - DTO de resposta paginada
- **Checklist de Documentação** - Verificação completa
- **Dicas** - Boas práticas de documentação

### [Validação de Dados - `./como-usar-validacao-de-dados-api-backend.md`]()

- **Configuração Global** - ValidationPipe no main.ts
- **Validadores de String** - IsString, IsEmail, MaxLength, Matches
- **Validadores Numéricos** - IsNumber, Min, Max, IsPositive
- **Validadores Booleanos** - IsBoolean
- **Validadores de Data** - IsDate, MinDate, MaxDate
- **Validadores de Array** - IsArray, ArrayMinSize, cada item
- **Validadores de Enum** - IsEnum
- **Campos Opcionais** - @IsOptional
- **Exemplo Completo: Create DTO** - Validação completa
- **Validação em Objetos Aninhados** - @ValidateNested
- **Validação Customizada** - Criar validators próprios
- **Mensagens de Erro** - Customização de mensagens
- **Validação Condicional** - @ValidateIf
- **Transformação de Tipos** - @Type e @Transform
- **Tratamento de Erros** - Estrutura e captura
- **Boas Práticas** - Checklist de validação

## [💾 Banco de Dados]()

Documentação sobre TypeORM, entities, migrations e gerenciamento de schema do banco de dados.

### [Entity TypeORM - `./como-criar-uma-entity-typeorm-backend.md`]()

- **Estrutura Básica** - Entity simples, SuperEntity e SoftDeletableEntity
- **SuperEntity** - Classe base com id, created_at, updated_at
- **SoftDeletableEntity** - Classe base para soft delete (extends SuperEntity)
- **Tipos de Colunas** - Texto, números, booleano, data, JSON
- **Relacionamentos** - Many-to-One, One-to-Many, Many-to-Many
- **Recursos Avançados** - Índices, unique, valores padrão
- **Colunas Opcionais** - nullable
- **Enums** - Definição e uso
- **Exclusão de Campos** - @Exclude para dados sensíveis
- **Soft Delete** - SoftDeletableEntity, softDelete(), restore(), withDeleted
- **Convenções** - Nomeação de classes, tabelas, colunas
- **Exemplo Completo** - Entity com todos recursos
- **Registrar no Module** - TypeOrmModule.forFeature
- **Usar no Service** - @InjectRepository
- **Dicas Importantes** - Boas práticas

### [Migrations - `./como-criar-migration-backend.md`]()

- **O que são Migrations** - Versionamento de banco
- **Comandos Disponíveis** - create, generate, run, revert, show
- **Criar Migration Manual** - Passo a passo
- **Tipos de Migrations** - Criar tabela, adicionar coluna, índices, FK
- **Exemplo: Adicionar Campo** - Migration completa
- **Exemplo: Relacionamento** - Adicionar FK
- **Migrations Automáticas** - migration:generate
- **Boas Práticas** - Down, testes, nomeação, responsabilidade única, **NUNCA triggers/funções**
- **Regra Importante** - Toda lógica de negócio na aplicação, não no banco
- **Troubleshooting** - Problemas comuns e soluções
- **Scripts package.json** - Comandos disponíveis

### [Comandos Migration - `./como-deve-ser-os-comandos-migration-packagejson-backend.md`]()

- **Scripts Necessários** - typeorm, generate, create, run, revert, show
- **typeorm (Base)** - Script base com ts-node
- **migration:generate** - Gerar automática
- **migration:create** - Criar vazia
- **migration:run** - Executar pendentes
- **migration:revert** - Reverter última
- **migration:show** - Listar status
- **db:drop** - Resetar banco
- **Fluxo de Trabalho** - Criar entity - gerar - executar
- **Configuração DataSource** - database.config.ts
- **Dependências Necessárias** - ts-node, tsconfig-paths
- **Scripts Adicionais** - seed, check, backup
- **CI/CD Integration** - GitHub Actions, Docker
- **Troubleshooting** - Erros comuns

## [🔐 Autenticação e Segurança]()

Guias de implementação de autenticação JWT, API Key e estratégias de segurança.

### [Autenticação JWT - `./como-deve-funcionar-autenticacao.md`]()

- **Visão Geral** - Sistema JWT completo
- **Fluxo de Autenticação** - Signup - Login - Requisições
- **User Entity** - Modelo de usuário
- **JWT Strategy** - Validação de token
- **Local Strategy** - Login com credenciais
- **Auth Service** - Lógica de autenticação
- **Auth Controller** - Endpoints públicos
- **Guards** - JWT Guard global e Local Guard
- **Public Decorator** - Marcar rotas públicas
- **Como Usar no Controller** - Acessar req.user
- **Isolamento de Dados** - Filtrar por userId
- **Fluxo Completo** - Signup, Login, Requisição autenticada
- **Frontend: Implementar** - localStorage, Axios interceptor
- **Variáveis de Ambiente** - JWT_SECRET, JWT_EXPIRATION
- **Segurança** - Boas práticas implementadas
- **Troubleshooting** - Problemas comuns

### [API Key - `./como-deve-funcionar-api-key-autenticacao.md`]()

- **O que é API Key** - Autenticação alternativa
- **Quando Usar** - Integrações, webhooks, cron jobs
- **Configurar Variável** - X_API_KEY no .env
- **Criar Guard** - ApiKeyAuthGuard
- **Criar Decorator** - @ApiKeyAuth()
- **Registrar Global** - main.ts
- **Como Usar** - Endpoint com API Key
- **Como Chamar** - curl, Axios, fetch
- **Implementação Avançada** - Múltiplas API Keys por cliente
- **Rate Limiting** - Limitar requisições
- **Documentar Swagger** - addApiKey
- **Segurança** - Boas práticas
- **Diferenças JWT vs API Key** - Tabela comparativa
- **Troubleshooting** - Erros comuns

## [🏗️ Estrutura e Padrões Backend]()

Arquitetura, organização de código e padrões de design para módulos escaláveis no backend.

### [Arquivo Main - `./como-deve-funcionar-arquivo-main-backend.md`]()

- **O que é main.ts** - Ponto de entrada
- **Estrutura Básica** - Bootstrap mínimo
- **Configuração Completa** - Setup do projeto com NestExpressApplication
- **1. NestFactory.create** - Criar aplicação com tipagem Express
- **2. Global Prefix** - /api em todas rotas
- **3. CORS** - Habilitar cross-origin
- **4. Servir Arquivos Estáticos** - useStaticAssets para pasta public
- **5. Fallback SPA** - React Router com index.html
- **6. ValidationPipe Global** - Validação automática
- **7. Guards Globais** - JWT Auth
- **8. Swagger** - Documentação com Bearer e API Key
- **9. Listen** - Iniciar servidor
- **Explicação Detalhada** - Cada seção com exemplos
- **Configurações Opcionais** - Helmet, compressão, rate limiting
- **Variáveis de Ambiente** - .env necessárias
- **Checklist** - Verificação de setup

### [Estrutura de Pastas - `./como-deve-ser-a-estrutura-de-pastas-do-modulo-backend.md`]()

- **Estrutura Padrão** - Organização de arquivos
- **Module** - Configuração do módulo
- **Controller** - Endpoints REST
- **Service** - Lógica de negócio
- **Entity** - Modelo de dados
- **DTOs** - Validação de entrada
- **Quando Criar Sub-services** - Lógica complexa
- **Quando Usar Interfaces** - Contratos
- **Quando Usar Enums** - Valores fixos
- **Exemplo Real** - Módulo simples e complexo
- **Convenções de Nomenclatura** - Tabela de padrões
- **Organização por Tamanho** - Pequeno, médio, grande
- **Localização dos Módulos** - src/modules
- **Dicas** - Boas práticas

### [Padrão Escalável - `./como-deve-ser-criado-um-padrao-escalavel-de-implementacao-no-modulo-backend.md`]()

- **Princípios Fundamentais** - Single Responsibility, DI, Inversão
- **1. Single Responsibility** - Uma classe, uma responsabilidade
- **2. Dependency Injection** - Injetar dependências
- **Padrões de Implementação** - Use-Case (PRINCIPAL), Repository, DTO, Strategy, Factory
- **1. Use-Case Pattern** - ⭐ Padrão PRINCIPAL para regras de negócio complexas (consulte ./como-criar-use-case-backend.md)
- **3. Inversão de Dependência** - Depender de abstrações
- **Repository Pattern** - TypeORM repository
- **DTO Pattern** - Validação e transferência
- **Strategy Pattern** - Múltiplas implementações
- **Factory Pattern** - Criação complexa
- **Separação por Camadas** - Controller - Service - Repository
- **Error Handling** - Exceções do NestJS
- **Validação de Ownership** - Filtrar por userId
- **Transações** - Operações atômicas
- **Logging** - Logger do NestJS
- **Testes** - Estrutura testável
- **Checklist** - Verificação de escalabilidade
- **Dicas Finais** - Boas práticas

### [Use-Cases - `./como-criar-use-case-backend.md`]()

- **O que é Use-Case** - Classe com interfaces segregadas por responsabilidade
- **Quando Usar** - Regras complexas, múltiplas transações, múltiplas responsabilidades
- **Quando NÃO Usar** - CRUD simples, operações diretas, endpoints triviais
- **Estrutura de Arquivos** - Pasta use-cases/, interfaces.ts, *.usecase.ts
- **Convenção de Nomenclatura** - Padrões para interfaces e use-cases
- **Passo 1: Definir Interfaces** - Uma responsabilidade = um método por interface
- **Passo 2: Criar Use-Case** - Implementar múltiplas interfaces relacionadas
- **Passo 3: Registrar no Module** - Adicionar em providers e exports
- **Passo 4: Injetar** - Via DI no Service ou Controller
- **Princípios SOLID** - S (Single Responsibility), O (Open/Closed), L (Liskov), I (Interface Segregation), D (Dependency Inversion)
- **Testando Use-Cases** - Referência para guia completo de testes
- **Diferenças Service vs Use-Case** - Comparação detalhada e quando usar cada um
- **Boas Práticas** - Uma interface = um método, nomenclatura descritiva, type aliases
- **Checklist** - Verificação completa de implementação
- **Troubleshooting** - Cannot resolve dependency, circular dependency, use-case muito grande
- **Exemplo Completo** - Módulo de pedidos com interfaces e use-cases

### [Testes de Use-Cases - `./como-testar-use-cases-com-jest-backend.md`]()

- **Princípios de Testes** - Testar apenas Use-Cases, mockar dependências, execução isolada
- **Configuração Jest** - jest.config.js, scripts package.json, dependências
- **Estrutura de Arquivos** - Localização e nomenclatura de .spec.ts
- **Template Básico** - Estrutura padrão de teste de Use-Case
- **Exemplo Completo** - RegrasFinanceirasUseCase com mocks
- **Mock de Múltiplas Dependências** - Repository + HttpService + ConfigService
- **Mock de ConfigService** - Simular variáveis de ambiente
- **Testar Exceções** - BadRequestException, NotFoundException
- **Jest.spyOn** - Mockar métodos do próprio Use-Case
- **Testes com Datas** - useFakeTimers e setSystemTime
- **Padrão Arrange-Act-Assert** - Organização de testes
- **Cobertura de Código** - Meta de 100% para Use-Cases
- **Comandos Jest** - test, watch, coverage, debug
- **Checklist** - Verificação completa de testes
- **Erros Comuns** - Soluções para problemas frequentes

## [🎨 Frontend - Desenvolvimento]()

Guias completos para desenvolvimento React, consumo de APIs e criação de componentes reutilizáveis.

### [Setup Inicial - `./como-iniciar-fazer-0-setup-do-frontend.md`]()

- **Visão Geral** - Configurar projeto React + TypeScript + Vite + Tailwind do zero
- **Pré-requisitos** - Node.js 18+, npm/yarn/pnpm
- **Passo 1: Criar Projeto** - Vite com template React + TypeScript
- **Passo 2: Instalar Tailwind** - Setup Tailwind CSS v4 com @tailwindcss/vite
- **Passo 3: React Router** - Instalação
- **Passo 4: Axios** - Instalação
- **Passo 5: TypeScript** - Path aliases @/*
- **Mudanças v3 → v4** - Guia de migração e diferenças
- **Passo 6: Estrutura de Pastas** - components, pages, services, config
- **Passo 7: Variáveis de Ambiente** - .env com VITE_API_URL
- **Passo 8: Scripts** - dev, build, preview, lint
- **Passo 9: Configurar Axios** - Instância com interceptors
- **Passo 10: Configurar Rotas** - routes.config.tsx
- **Passo 11: Página Inicial** - HomePage exemplo
- **Passo 12: Testar Projeto** - Comandos de execução
- **Configurações Opcionais** - ESLint, Prettier, VS Code
- **Checklist de Setup** - Verificação completa
- **Próximos Passos** - Referências para continuar
- **Troubleshooting** - Cannot find module, Tailwind não funciona, Erro PostCSS Tailwind v4, CORS

### [Consumir API - `./como-consumir-api-frontend.md`]()

- **Configuração Axios** - Instância configurada (interceptor 401 sem redirecionamento direto)
- **Variável de Ambiente** - VITE_API_URL
- **Criar Services** - Estrutura de service (exemplos sem lógica de negócio)
- **useState e useEffect** - Listar dados
- **Criar Item** - Form submit
- **Atualizar Item** - Edit form
- **Deletar Item** - Confirmação
- **Tratamento de Erros** - getErrorMessage helper
- **Custom Hook** - useApi hook
- **Paginação** - Query params
- **Upload de Arquivos** - FormData
- **Query Params** - Filtros e busca
- **React Suspense** - Data fetching com Suspense e ErrorBoundary
- **Cancelar Requisições** - CancelToken
- **Checklist** - Verificação completa

### [Componentes Comuns - `./como-criar-componentes-comum-frontend.md`]()

- **Princípios** - Reutilizáveis, configuráveis, tipados
- **Localização** - src/components/common
- **1. Button** - Variantes e tamanhos
- **2. Modal** - Overlay e footer
- **3. Card** - Título e footer
- **4. Input** - Label e error
- **5. Select** - Dropdown com options
- **6. Spinner** - Loading indicator
- **7. Alert** - Success, error, warning
- **8. Badge** - Tags coloridas
- **Compound Components** - Card.Header, Card.Body
- **Boas Práticas** - Props padrão, spread, forwardRef, tipagem
- **Organização** - index.ts para re-export
- **Checklist** - Verificação de componente

### [Rotas Frontend - `./como-funciona-as-rotas-no-frontend.md`]()

- **Visão Geral** - React Router DOM
- **Estrutura de Arquivos** - App, config, components, pages
- **Configuração Centralizada** - routes.config.tsx
- **App.tsx** - Rotas públicas e privadas
- **PrivateRoute** - Guard de autenticação
- **Layout** - Estrutura com Outlet
- **useNavigate** - Navegação programática
- **Link Component** - Links declarativos
- **NavLink** - Link com estado ativo
- **useParams** - Parâmetros de rota
- **useSearchParams** - Query parameters
- **Rotas Aninhadas** - Children e Outlet
- **Redirecionamentos** - Navigate component
- **useLocation** - Informações da rota
- **Passar Estado** - navigate com state
- **Menu Dinâmico** - Baseado em config
- **Lazy Loading** - Code splitting
- **404 Página** - Rota catch-all
- **Breadcrumbs** - Navegação hierárquica
- **Boas Práticas** - Checklist

## [📖 Guias Rápidos]()

Atalhos para tarefas comuns com links diretos para as seções específicas dos guias.

### [Criar novo módulo backend completo]()

1. [Como criar uma API](./como-criar-api-backend.md#passo-a-passo)
2. [Como criar Entity](./como-criar-uma-entity-typeorm-backend.md#estrutura-básica)
3. [Como criar Migration](./como-criar-migration-backend.md#passo-a-passo-criar-migration-manual)
4. [Como documentar Swagger](./como-documentar-swagger-backend.md#documentar-controllers)
5. [Como validar dados](./como-usar-validacao-de-dados-api-backend.md#exemplo-completo-create-dto)

### [Setup de autenticação]()

1. [Autenticação JWT](./como-deve-funcionar-autenticacao.md#componentes-do-sistema)
2. [API Key](./como-deve-funcionar-api-key-autenticacao.md#implementação)

### [Setup inicial frontend]()

1. [Setup Frontend](./como-iniciar-fazer-0-setup-do-frontend.md#passo-a-passo)

### [Criar nova página frontend]()

1. [Consumir API](./como-consumir-api-frontend.md#criar-services)
2. [Criar componentes](./como-criar-componentes-comum-frontend.md#exemplos-práticos)
3. [Configurar rotas](./como-funciona-as-rotas-no-frontend.md#configuração-centralizada)

## [🔍 Busca por Palavra-Chave]()

Índice alfabético de termos técnicos com links diretos para os guias correspondentes.

| Palavra-Chave | Documento Principal |
|---------------|---------------------|
| TypeScript | [Padrões TypeScript](./quais-padroes-typescript-devem-ser-seguidos.md) |
| any | [Padrões TypeScript - Regra #1](./quais-padroes-typescript-devem-ser-seguidos.md#regra-1-nunca-use-o-tipo-any) |
| unknown | [Padrões TypeScript - Regra #4](./quais-padroes-typescript-devem-ser-seguidos.md#regra-4-use-unknown-ao-invés-de-any-para-tipos-desconhecidos) |
| Generics | [Padrões TypeScript - Regra #7](./quais-padroes-typescript-devem-ser-seguidos.md#regra-7-generics-para-código-reutilizável) |
| Type Guards | [Padrões TypeScript](./quais-padroes-typescript-devem-ser-seguidos.md#type-guards-comuns) |
| strict mode | [Padrões TypeScript - Regra #2](./quais-padroes-typescript-devem-ser-seguidos.md#regra-2-sempre-use-strict-true-no-tsconfigjson) |
| Tipagem | [Padrões TypeScript](./quais-padroes-typescript-devem-ser-seguidos.md) |
| Setup Backend | [Setup Inicial](./como-iniciar-fazer-0-setup-do-backend.md) |
| Setup Frontend | [Setup Inicial](./como-iniciar-fazer-0-setup-do-frontend.md) |
| NestJS Setup | [Setup Inicial](./como-iniciar-fazer-0-setup-do-backend.md) |
| Vite Setup | [Setup Frontend](./como-iniciar-fazer-0-setup-do-frontend.md) |
| TypeORM | [Entity](./como-criar-uma-entity-typeorm-backend.md), [Migration](./como-criar-migration-backend.md) |
| JWT | [Autenticação](./como-deve-funcionar-autenticacao.md) |
| Swagger | [Documentação API](./como-documentar-swagger-backend.md) |
| Validação | [Dados API](./como-usar-validacao-de-dados-api-backend.md) |
| Versionamento | [Versionamento de API](./como-versionar-api-backend.md) |
| API Versioning | [Versionamento de API](./como-versionar-api-backend.md) |
| v1 v2 | [Versionamento de API](./como-versionar-api-backend.md) |
| Breaking Changes | [Versionamento de API](./como-versionar-api-backend.md) |
| React Router | [Rotas Frontend](./como-funciona-as-rotas-no-frontend.md) |
| Axios | [Consumir API](./como-consumir-api-frontend.md), [API Externa Backend](./como-integrar-com-api-externa-backend.md) |
| Tailwind | [Setup Frontend](./como-iniciar-fazer-0-setup-do-frontend.md), [Componentes](./como-criar-componentes-comum-frontend.md) |
| NestJS | [Criar API](./como-criar-api-backend.md), [Main](./como-deve-funcionar-arquivo-main-backend.md) |
| Guards | [Autenticação](./como-deve-funcionar-autenticacao.md#guards-proteção-de-rotas) |
| DTOs | [Validação](./como-usar-validacao-de-dados-api-backend.md), [Criar API](./como-criar-api-backend.md#passo-3-criar-dtos-validação) |
| CRUD | [Criar API](./como-criar-api-backend.md#passo-4-implementar-o-service) |
| Hooks | [Consumir API](./como-consumir-api-frontend.md#custom-hook-para-api) |
| Datas | [Tratamento de Datas](./como-tratar-datas-backend-frontend.md) |
| dayjs | [Tratamento de Datas](./como-tratar-datas-backend-frontend.md) |
| UTC | [Tratamento de Datas](./como-tratar-datas-backend-frontend.md) |
| Timezone | [Tratamento de Datas](./como-tratar-datas-backend-frontend.md) |
| Triggers | [Migrations](./como-criar-migration-backend.md#8-nunca-crie-triggers-ou-funções-no-banco-de-dados) |
| Funções PostgreSQL | [Migrations](./como-criar-migration-backend.md#8-nunca-crie-triggers-ou-funções-no-banco-de-dados) |
| Stored Procedures | [Migrations](./como-criar-migration-backend.md#8-nunca-crie-triggers-ou-funções-no-banco-de-dados) |
| API Externa | [Integração API Externa](./como-integrar-com-api-externa-backend.md) |
| HTTP Client | [Integração API Externa](./como-integrar-com-api-externa-backend.md) |
| Webhooks | [Integração API Externa](./como-integrar-com-api-externa-backend.md#webhooks), [API Key](./como-deve-funcionar-api-key-autenticacao.md) |
| Circuit Breaker | [Integração API Externa](./como-integrar-com-api-externa-backend.md#circuit-breaker-pattern) |
| Cache | [Redis](./como-usar-redis-backend.md), [Integração API Externa](./como-integrar-com-api-externa-backend.md#cache-de-respostas) |
| Redis | [Como usar Redis](./como-usar-redis-backend.md) |
| RabbitMQ | [Como usar RabbitMQ](./como-usar-rabbitmq-backend.md) |
| Topic Exchange | [RabbitMQ - Topic Exchange](./como-usar-rabbitmq-backend.md#arquitetura-topic-exchange) |
| Filas | [RabbitMQ](./como-usar-rabbitmq-backend.md) |
| Background Jobs | [RabbitMQ](./como-usar-rabbitmq-backend.md#quando-usar-rabbitmq) |
| Eventos | [RabbitMQ - Tópicos](./como-usar-rabbitmq-backend.md#padrão-de-nomenclatura-de-tópicos) |
| Retry | [RabbitMQ - Retentativas](./como-usar-rabbitmq-backend.md#2-controle-de-retries-com-contador), [API Externa](./como-integrar-com-api-externa-backend.md#timeout-e-retry) |
| Dead Letter Queue | [RabbitMQ - DLQ](./como-usar-rabbitmq-backend.md#1-dead-letter-queue-dlq-com-topic-exchange) |
| Processamento Assíncrono | [RabbitMQ](./como-usar-rabbitmq-backend.md#quando-usar-rabbitmq) |
| Wildcards | [RabbitMQ - Pattern Matching](./como-usar-rabbitmq-backend.md#2-consumer-com-pattern-matching-wildcards) |
| Rate Limit | [Redis - Rate Limiting](./como-usar-redis-backend.md#2-rate-limiting), [API Externa](./como-integrar-com-api-externa-backend.md#tratamento-de-rate-limiting) |
| Escala Horizontal | [Redis](./como-usar-redis-backend.md#quando-usar-redis), [RabbitMQ](./como-usar-rabbitmq-backend.md) |
| Sessões | [Redis - Sessões Compartilhadas](./como-usar-redis-backend.md#4-sessões-compartilhadas) |
| Contador | [Redis - Contador Atômico](./como-usar-redis-backend.md#1-contador-compartilhado-incremento-atômico) |
| Scheduler | [Bull Scheduler](./como-usar-scheduler-bull-redis-backend.md) |
| Cron | [Bull Scheduler - Expressões Cron](./como-usar-scheduler-bull-redis-backend.md#exemplo-expressões-cron-comuns) |
| Bull | [Bull Scheduler](./como-usar-scheduler-bull-redis-backend.md) |
| Tarefas Agendadas | [Bull Scheduler](./como-usar-scheduler-bull-redis-backend.md#quando-usar-scheduler-com-bull) |
| Background Jobs Agendados | [Bull Scheduler](./como-usar-scheduler-bull-redis-backend.md) |
| Bull Board | [Bull Scheduler - Dashboard](./como-usar-scheduler-bull-redis-backend.md#como-adicionar-bull-board-dashboard) |
| Decorator Cron | [Bull Scheduler - @Cron](./como-usar-scheduler-bull-redis-backend.md#criar-decorator-cron-customizado) |
| Testes Unitários | [Testes de Use-Cases](./como-testar-use-cases-com-jest-backend.md) |
| Jest | [Testes de Use-Cases](./como-testar-use-cases-com-jest-backend.md) |
| Mocks | [Testes de Use-Cases](./como-testar-use-cases-com-jest-backend.md#mockando-múltiplas-dependências) |
| Test Coverage | [Testes de Use-Cases](./como-testar-use-cases-com-jest-backend.md#cobertura-de-código) |
| Use-Case | [Criar Use-Case](./como-criar-use-case-backend.md), [Testes](./como-testar-use-cases-com-jest-backend.md) |

## [🗺️ Navegação por Nível]()

Guias organizados por nível de complexidade: iniciante, intermediário e avançado.

### [🌱 Iniciante]()

1. [Stack Backend](./qual-tecnologia-usa-backend.md#stack-principal)
2. [Stack Frontend](./qual-tecnologia-usa-frontend.md#stack-principal)
3. [Setup Backend](./como-iniciar-fazer-0-setup-do-backend.md#visão-geral)
4. [Setup Frontend](./como-iniciar-fazer-0-setup-do-frontend.md#visão-geral)
5. [Autenticação JWT](./como-deve-funcionar-autenticacao.md#visão-geral)
6. [Consumir API](./como-consumir-api-frontend.md#configuração-do-axios)

### [🌿 Intermediário]()

1. [Criar API Backend](./como-criar-api-backend.md#visão-geral)
2. [Versionamento de API](./como-versionar-api-backend.md#por-que-versionar-apis)
3. [Criar Entity](./como-criar-uma-entity-typeorm-backend.md#estrutura-básica)
4. [Criar Migration](./como-criar-migration-backend.md#passo-a-passo-criar-migration-manual)
5. [Documentar Swagger](./como-documentar-swagger-backend.md#documentar-controllers)
6. [Redis - Cache e Escala Horizontal](./como-usar-redis-backend.md#configuração-global-common-module)
7. [RabbitMQ - Filas e Background Jobs](./como-usar-rabbitmq-backend.md#configuração-global-common-module)
8. [Bull Scheduler - Tarefas Agendadas](./como-usar-scheduler-bull-redis-backend.md#quando-usar-scheduler-com-bull)
9. [Integrar API Externa](./como-integrar-com-api-externa-backend.md#configuração-do-cliente-http)
10. [Tratamento de Datas](./como-tratar-datas-backend-frontend.md#princípios-fundamentais)
11. [Criar Componentes](./como-criar-componentes-comum-frontend.md#exemplos-práticos)
12. [Rotas Frontend](./como-funciona-as-rotas-no-frontend.md#configuração-centralizada)

### [🌳 Avançado]()

1. [Padrão Escalável](./como-deve-ser-criado-um-padrao-escalavel-de-implementacao-no-modulo-backend.md#princípios-fundamentais)
2. [Estrutura de Pastas](./como-deve-ser-a-estrutura-de-pastas-do-modulo-backend.md#estrutura-padrão)
3. [Arquivo Main](./como-deve-funcionar-arquivo-main-backend.md#configuração-completa-do-projeto)
4. [API Key](./como-deve-funcionar-api-key-autenticacao.md#implementação-avançada)
5. [Validação Customizada](./como-usar-validacao-de-dados-api-backend.md#validação-customizada)

## [📁 Estrutura de Arquivos]()

Árvore completa de diretórios mostrando a organização de todos os arquivos de documentação.

```
.rules/
├── SUMARIO.md                                              (este arquivo)
│
├── Stack e Tecnologias
│   ├── quais-padroes-typescript-devem-ser-seguidos.md      (10 regras + exemplos)
│   ├── qual-tecnologia-usa-backend.md                      (11 seções)
│   └── qual-tecnologia-usa-frontend.md                     (10 seções)
│
├── Backend - API
│   ├── como-criar-api-backend.md                           (11 passos + extras)
│   ├── como-versionar-api-backend.md                       (12 seções + exemplos)
│   ├── como-integrar-com-api-externa-backend.md            (12 seções)
│   ├── como-documentar-swagger-backend.md                  (10 seções)
│   ├── como-usar-validacao-de-dados-api-backend.md         (15 tópicos)
│   ├── como-tratar-datas-backend-frontend.md               (12 seções + exemplos)
│   ├── como-usar-redis-backend.md                          (15 seções + exemplos)
│   ├── como-usar-rabbitmq-backend.md                       (17 seções + exemplos)
│   └── como-usar-scheduler-bull-redis-backend.md           (17 seções + exemplos)
│
├── Backend - Banco de Dados
│   ├── como-criar-uma-entity-typeorm-backend.md            (14 tópicos)
│   ├── como-criar-migration-backend.md                     (9 tipos + exemplos)
│   └── como-deve-ser-os-comandos-migration-packagejson-backend.md  (7 comandos)
│
├── Backend - Autenticação
│   ├── como-deve-funcionar-autenticacao.md                 (15 seções)
│   └── como-deve-funcionar-api-key-autenticacao.md         (10 tópicos)
│
├── Backend - Estrutura
│   ├── como-iniciar-fazer-0-setup-do-backend.md            (9 passos)
│   ├── como-deve-funcionar-arquivo-main-backend.md         (8 configurações)
│   ├── como-deve-ser-a-estrutura-de-pastas-do-modulo-backend.md  (6 seções)
│   ├── como-deve-ser-criado-um-padrao-escalavel-de-implementacao-no-modulo-backend.md  (10 padrões)
│   ├── como-criar-use-case-backend.md                      (15 seções)
│   └── como-testar-use-cases-com-jest-backend.md           (14 seções)
│
└── Frontend
    ├── como-iniciar-fazer-0-setup-do-frontend.md           (17 passos)
    ├── como-consumir-api-frontend.md                       (14 tópicos)
    ├── como-criar-componentes-comum-frontend.md            (8 exemplos + práticas)
    └── como-funciona-as-rotas-no-frontend.md               (14 conceitos)
```

## [📊 Estatísticas]()

- **Total de documentos**: 26
- **Backend**: 18 documentos (247 seções)
- **Frontend**: 4 documentos (53 seções)
- **Stack**: 3 documentos (31 seções)
- **Total de seções**: 331 seções documentadas


---

**Última atualização**: 13 de novembro de 2025
**Documentação gerada por**: Claude Code
