# SumÃ¡rio - DocumentaÃ§Ã£o FAQ

> Ãndice completo com todos os guias, seÃ§Ãµes e tÃ³picos do projeto.

## ð Stack e Tecnologias

### Backend - `./qual-tecnologia-usa-backend.md`

- **Stack Principal** - Framework NestJS, TypeScript, Node.js, Express
- **Banco de Dados** - PostgreSQL, TypeORM, driver pg
- **AutenticaÃ§Ã£o e SeguranÃ§a** - Passport, JWT, bcrypt
- **ValidaÃ§Ã£o de Dados** - class-validator, class-transformer
- **DocumentaÃ§Ã£o de API** - Swagger/OpenAPI
- **ConfiguraÃ§Ã£o** - @nestjs/config, dotenv
- **UtilitÃ¡rios** - Axios, dayjs, rxjs
- **Ferramentas de Desenvolvimento** - ESLint, Prettier, Jest
- **Arquitetura e PadrÃµes** - Dependency Injection, Repository Pattern
- **MÃ³dulos Personalizados** - 15 mÃ³dulos de domÃ­nio implementados

### Frontend - `./qual-tecnologia-usa-frontend.md`

- **Stack Principal** - React, TypeScript, Vite, SWC
- **EstilizaÃ§Ã£o** - Tailwind CSS, PostCSS
- **Roteamento** - React Router DOM
- **RequisiÃ§Ãµes HTTP** - Axios
- **VisualizaÃ§Ã£o de Dados** - Chart.js, react-chartjs-2, Tippy.js
- **Gerenciamento de Estado** - Context API nativa
- **Ferramentas de Desenvolvimento** - ESLint, typescript-eslint
- **Estrutura de Componentes** - Componentes comuns reutilizÃ¡veis
- **Bibliotecas de FormulÃ¡rios** - ValidaÃ§Ã£o nativa HTML5

## ð§ Backend - Desenvolvimento

### API e Endpoints - `./como-criar-api-backend.md`

- **Passo 1: Gerar Resource** - Comando nest g resource
- **Passo 2: Criar Entity** - Modelo de dados TypeORM
- **Passo 3: Criar DTOs** - Create e Update com validaÃ§Ã£o
- **Passo 4: Implementar Service** - LÃ³gica de negÃ³cio e CRUD
- **Passo 5: Implementar Controller** - Rotas REST
- **Passo 6: Configurar Module** - Registro de dependÃªncias
- **Passo 7: Registrar no AppModule** - ImportaÃ§Ã£o global
- **Passo 8: Criar Migration** - Versionamento do schema
- **Passo 9: Testar API** - Via Swagger ou curl
- **Recursos AvanÃ§ados** - PaginaÃ§Ã£o, filtros, relacionamentos
- **Checklist de ImplementaÃ§Ã£o** - Lista completa de verificaÃ§Ã£o

### Swagger - `./como-documentar-swagger-backend.md`

- **ConfiguraÃ§Ã£o Inicial** - Setup do Swagger no main.ts
- **Documentar Controllers** - Decorators principais
- **Documentar DTOs** - @ApiProperty e exemplos
- **Documentar Respostas** - Tipos e mÃºltiplos status codes
- **Decorators Ãteis** - @ApiTags, @ApiBearerAuth, @ApiOperation
- **Ocultar Propriedades** - @ApiHideProperty e @Exclude
- **Testar no Swagger UI** - Como autenticar e testar endpoints
- **Documentar PaginaÃ§Ã£o** - DTO de resposta paginada
- **Checklist de DocumentaÃ§Ã£o** - VerificaÃ§Ã£o completa
- **Dicas** - Boas prÃ¡ticas de documentaÃ§Ã£o

### ValidaÃ§Ã£o de Dados - `./como-usar-validacao-de-dados-api.md`

- **ConfiguraÃ§Ã£o Global** - ValidationPipe no main.ts
- **Validadores de String** - IsString, IsEmail, MaxLength, Matches
- **Validadores NumÃ©ricos** - IsNumber, Min, Max, IsPositive
- **Validadores Booleanos** - IsBoolean
- **Validadores de Data** - IsDate, MinDate, MaxDate
- **Validadores de Array** - IsArray, ArrayMinSize, cada item
- **Validadores de Enum** - IsEnum
- **Campos Opcionais** - @IsOptional
- **Exemplo Completo: Create DTO** - ValidaÃ§Ã£o completa
- **ValidaÃ§Ã£o em Objetos Aninhados** - @ValidateNested
- **ValidaÃ§Ã£o Customizada** - Criar validators prÃ³prios
- **Mensagens de Erro** - CustomizaÃ§Ã£o de mensagens
- **ValidaÃ§Ã£o Condicional** - @ValidateIf
- **TransformaÃ§Ã£o de Tipos** - @Type e @Transform
- **Tratamento de Erros** - Estrutura e captura
- **Boas PrÃ¡ticas** - Checklist de validaÃ§Ã£o

## ð¾ Banco de Dados

### Entity TypeORM - `./como-criar-uma-entity-typeorm.md`

- **Estrutura BÃ¡sica** - Entity simples e SuperEntity
- **Tipos de Colunas** - Texto, nÃºmeros, booleano, data, JSON
- **Relacionamentos** - Many-to-One, One-to-Many, Many-to-Many
- **Recursos AvanÃ§ados** - Ãndices, unique, valores padrÃ£o
- **Colunas Opcionais** - nullable
- **Enums** - DefiniÃ§Ã£o e uso
- **ExclusÃ£o de Campos** - @Exclude para dados sensÃ­veis
- **Soft Delete** - deleted_at e queries
- **ConvenÃ§Ãµes** - NomeaÃ§Ã£o de classes, tabelas, colunas
- **Exemplo Completo** - Entity com todos recursos
- **Registrar no Module** - TypeOrmModule.forFeature
- **Usar no Service** - @InjectRepository
- **Dicas Importantes** - Boas prÃ¡ticas

### Migrations - `./como-criar-migration-backend.md`

- **O que sÃ£o Migrations** - Versionamento de banco
- **Comandos DisponÃ­veis** - create, generate, run, revert, show
- **Criar Migration Manual** - Passo a passo
- **Tipos de Migrations** - Criar tabela, adicionar coluna, Ã­ndices, FK
- **Exemplo: Adicionar Campo** - Migration completa
- **Exemplo: Relacionamento** - Adicionar FK
- **Migrations AutomÃ¡ticas** - migration:generate
- **Boas PrÃ¡ticas** - Down, testes, nomeaÃ§Ã£o, responsabilidade Ãºnica
- **Troubleshooting** - Problemas comuns e soluÃ§Ãµes
- **Scripts package.json** - Comandos disponÃ­veis

### Comandos Migration - `./como-deve-ser-os-comandos-migration-packagejson-backend.md`

- **Scripts NecessÃ¡rios** - typeorm, generate, create, run, revert, show
- **typeorm (Base)** - Script base com ts-node
- **migration:generate** - Gerar automÃ¡tica
- **migration:create** - Criar vazia
- **migration:run** - Executar pendentes
- **migration:revert** - Reverter Ãºltima
- **migration:show** - Listar status
- **db:drop** - Resetar banco
- **Fluxo de Trabalho** - Criar entity â gerar â executar
- **ConfiguraÃ§Ã£o DataSource** - database.config.ts
- **DependÃªncias NecessÃ¡rias** - ts-node, tsconfig-paths
- **Scripts Adicionais** - seed, check, backup
- **CI/CD Integration** - GitHub Actions, Docker
- **Troubleshooting** - Erros comuns

## ð AutenticaÃ§Ã£o e SeguranÃ§a

### AutenticaÃ§Ã£o JWT - `./como-deve-funcionar-autenticacao.md`

- **VisÃ£o Geral** - Sistema JWT completo
- **Fluxo de AutenticaÃ§Ã£o** - Signup â Login â RequisiÃ§Ãµes
- **User Entity** - Modelo de usuÃ¡rio
- **JWT Strategy** - ValidaÃ§Ã£o de token
- **Local Strategy** - Login com credenciais
- **Auth Service** - LÃ³gica de autenticaÃ§Ã£o
- **Auth Controller** - Endpoints pÃºblicos
- **Guards** - JWT Guard global e Local Guard
- **Public Decorator** - Marcar rotas pÃºblicas
- **Como Usar no Controller** - Acessar req.user
- **Isolamento de Dados** - Filtrar por userId
- **Fluxo Completo** - Signup, Login, RequisiÃ§Ã£o autenticada
- **Frontend: Implementar** - localStorage, Axios interceptor
- **VariÃ¡veis de Ambiente** - JWT_SECRET, JWT_EXPIRATION
- **SeguranÃ§a** - Boas prÃ¡ticas implementadas
- **Troubleshooting** - Problemas comuns

### API Key - `./como-deve-funcionar-api-key-autenticacao.md`

- **O que Ã© API Key** - AutenticaÃ§Ã£o alternativa
- **Quando Usar** - IntegraÃ§Ãµes, webhooks, cron jobs
- **Configurar VariÃ¡vel** - X_API_KEY no .env
- **Criar Guard** - ApiKeyAuthGuard
- **Criar Decorator** - @ApiKeyAuth()
- **Registrar Global** - main.ts
- **Como Usar** - Endpoint com API Key
- **Como Chamar** - curl, Axios, fetch
- **ImplementaÃ§Ã£o AvanÃ§ada** - MÃºltiplas API Keys por cliente
- **Rate Limiting** - Limitar requisiÃ§Ãµes
- **Documentar Swagger** - addApiKey
- **SeguranÃ§a** - Boas prÃ¡ticas
- **DiferenÃ§as JWT vs API Key** - Tabela comparativa
- **Troubleshooting** - Erros comuns

## ðï¸ Estrutura e PadrÃµes Backend

### Arquivo Main - `./como-deve-funcionar-arquivo-main-backend.md`

- **O que Ã© main.ts** - Ponto de entrada
- **Estrutura BÃ¡sica** - Bootstrap mÃ­nimo
- **ConfiguraÃ§Ã£o Completa** - Setup do projeto
- **1. NestFactory.create** - Criar aplicaÃ§Ã£o
- **2. Global Prefix** - /api em todas rotas
- **3. CORS** - Habilitar cross-origin
- **4. ValidationPipe Global** - ValidaÃ§Ã£o automÃ¡tica
- **5. Guards Globais** - JWT Auth
- **6. Swagger** - DocumentaÃ§Ã£o interativa
- **7. Servir Frontend** - Arquivos estÃ¡ticos em produÃ§Ã£o
- **8. Listen** - Iniciar servidor
- **ConfiguraÃ§Ãµes Opcionais** - Helmet, compressÃ£o, rate limiting
- **VariÃ¡veis de Ambiente** - .env necessÃ¡rias
- **Checklist** - VerificaÃ§Ã£o de setup

### Estrutura de Pastas - `./como-deve-ser-a-estrutura-de-pastas-do-modulo-backend.md`

- **Estrutura PadrÃ£o** - OrganizaÃ§Ã£o de arquivos
- **Module** - ConfiguraÃ§Ã£o do mÃ³dulo
- **Controller** - Endpoints REST
- **Service** - LÃ³gica de negÃ³cio
- **Entity** - Modelo de dados
- **DTOs** - ValidaÃ§Ã£o de entrada
- **Quando Criar Sub-services** - LÃ³gica complexa
- **Quando Usar Interfaces** - Contratos
- **Quando Usar Enums** - Valores fixos
- **Exemplo Real** - MÃ³dulo simples e complexo
- **ConvenÃ§Ãµes de Nomenclatura** - Tabela de padrÃµes
- **OrganizaÃ§Ã£o por Tamanho** - Pequeno, mÃ©dio, grande
- **LocalizaÃ§Ã£o dos MÃ³dulos** - src/modules
- **Dicas** - Boas prÃ¡ticas

### PadrÃ£o EscalÃ¡vel - `./como-deve-ser-criado-um-padrao-escalavel-de-implementacao-no-modulo-backend.md`

- **PrincÃ­pios Fundamentais** - Single Responsibility, DI, InversÃ£o
- **1. Single Responsibility** - Uma classe, uma responsabilidade
- **2. Dependency Injection** - Injetar dependÃªncias
- **3. InversÃ£o de DependÃªncia** - Depender de abstraÃ§Ãµes
- **Repository Pattern** - TypeORM repository
- **DTO Pattern** - ValidaÃ§Ã£o e transferÃªncia
- **Strategy Pattern** - MÃºltiplas implementaÃ§Ãµes
- **Factory Pattern** - CriaÃ§Ã£o complexa
- **SeparaÃ§Ã£o por Camadas** - Controller â Service â Repository
- **Error Handling** - ExceÃ§Ãµes do NestJS
- **ValidaÃ§Ã£o de Ownership** - Filtrar por userId
- **TransaÃ§Ãµes** - OperaÃ§Ãµes atÃ´micas
- **Logging** - Logger do NestJS
- **Testes** - Estrutura testÃ¡vel
- **Checklist** - VerificaÃ§Ã£o de escalabilidade
- **Dicas Finais** - Boas prÃ¡ticas

## ð¨ Frontend - Desenvolvimento

### Consumir API - `./como-consumir-api-frontend.md`

- **ConfiguraÃ§Ã£o Axios** - InstÃ¢ncia configurada
- **VariÃ¡vel de Ambiente** - VITE_API_URL
- **Criar Services** - Estrutura de service
- **useState e useEffect** - Listar dados
- **Criar Item** - Form submit
- **Atualizar Item** - Edit form
- **Deletar Item** - ConfirmaÃ§Ã£o
- **Tratamento de Erros** - getErrorMessage helper
- **Custom Hook** - useApi hook
- **PaginaÃ§Ã£o** - Query params
- **Upload de Arquivos** - FormData
- **Query Params** - Filtros e busca
- **Cancelar RequisiÃ§Ãµes** - CancelToken
- **Checklist** - VerificaÃ§Ã£o completa

### Componentes Comuns - `./como-criar-componentes-comum-frontend.md`

- **PrincÃ­pios** - ReutilizÃ¡veis, configurÃ¡veis, tipados
- **LocalizaÃ§Ã£o** - src/components/common
- **1. Button** - Variantes e tamanhos
- **2. Modal** - Overlay e footer
- **3. Card** - TÃ­tulo e footer
- **4. Input** - Label e error
- **5. Select** - Dropdown com options
- **6. Spinner** - Loading indicator
- **7. Alert** - Success, error, warning
- **8. Badge** - Tags coloridas
- **Compound Components** - Card.Header, Card.Body
- **Boas PrÃ¡ticas** - Props padrÃ£o, spread, forwardRef, tipagem
- **OrganizaÃ§Ã£o** - index.ts para re-export
- **Checklist** - VerificaÃ§Ã£o de componente

### Rotas Frontend - `./como-funciona-as-rotas-no-frontend.md`

- **VisÃ£o Geral** - React Router DOM
- **Estrutura de Arquivos** - App, config, components, pages
- **ConfiguraÃ§Ã£o Centralizada** - routes.config.tsx
- **App.tsx** - Rotas pÃºblicas e privadas
- **PrivateRoute** - Guard de autenticaÃ§Ã£o
- **Layout** - Estrutura com Outlet
- **useNavigate** - NavegaÃ§Ã£o programÃ¡tica
- **Link Component** - Links declarativos
- **NavLink** - Link com estado ativo
- **useParams** - ParÃ¢metros de rota
- **useSearchParams** - Query parameters
- **Rotas Aninhadas** - Children e Outlet
- **Redirecionamentos** - Navigate component
- **useLocation** - InformaÃ§Ãµes da rota
- **Passar Estado** - navigate com state
- **Menu DinÃ¢mico** - Baseado em config
- **Lazy Loading** - Code splitting
- **404 PÃ¡gina** - Rota catch-all
- **Breadcrumbs** - NavegaÃ§Ã£o hierÃ¡rquica
- **Boas PrÃ¡ticas** - Checklist

## ð Guias RÃ¡pidos

### Criar novo mÃ³dulo backend completo

1. [Como criar uma API](./como-criar-api-backend.md#passo-a-passo)
2. [Como criar Entity](./como-criar-uma-entity-typeorm.md#estrutura-bÃ¡sica)
3. [Como criar Migration](./como-criar-migration-backend.md#passo-a-passo-criar-migration-manual)
4. [Como documentar Swagger](./como-documentar-swagger-backend.md#documentar-controllers)
5. [Como validar dados](./como-usar-validacao-de-dados-api.md#exemplo-completo-create-dto)

### Setup de autenticaÃ§Ã£o

1. [AutenticaÃ§Ã£o JWT](./como-deve-funcionar-autenticacao.md#componentes-do-sistema)
2. [API Key](./como-deve-funcionar-api-key-autenticacao.md#implementaÃ§Ã£o)

### Criar nova pÃ¡gina frontend

1. [Consumir API](./como-consumir-api-frontend.md#criar-services)
2. [Criar componentes](./como-criar-componentes-comum-frontend.md#exemplos-prÃ¡ticos)
3. [Configurar rotas](./como-funciona-as-rotas-no-frontend.md#configuraÃ§Ã£o-centralizada)

## ð Busca por Palavra-Chave

| Palavra-Chave | Documento Principal |
|---------------|---------------------|
| TypeORM | [Entity](./como-criar-uma-entity-typeorm.md), [Migration](./como-criar-migration-backend.md) |
| JWT | [AutenticaÃ§Ã£o](./como-deve-funcionar-autenticacao.md) |
| Swagger | [DocumentaÃ§Ã£o API](./como-documentar-swagger-backend.md) |
| ValidaÃ§Ã£o | [Dados API](./como-usar-validacao-de-dados-api.md) |
| React Router | [Rotas Frontend](./como-funciona-as-rotas-no-frontend.md) |
| Axios | [Consumir API](./como-consumir-api-frontend.md) |
| Tailwind | [Componentes](./como-criar-componentes-comum-frontend.md) |
| NestJS | [Criar API](./como-criar-api-backend.md), [Main](./como-deve-funcionar-arquivo-main-backend.md) |
| Guards | [AutenticaÃ§Ã£o](./como-deve-funcionar-autenticacao.md#guards-proteÃ§Ã£o-de-rotas) |
| DTOs | [ValidaÃ§Ã£o](./como-usar-validacao-de-dados-api.md), [Criar API](./como-criar-api-backend.md#passo-3-criar-dtos-validaÃ§Ã£o) |
| CRUD | [Criar API](./como-criar-api-backend.md#passo-4-implementar-o-service) |
| Hooks | [Consumir API](./como-consumir-api-frontend.md#custom-hook-para-api) |

## ð NavegaÃ§Ã£o por NÃ­vel

### ð± Iniciante

1. [Stack Backend](./qual-tecnologia-usa-backend.md#stack-principal)
2. [Stack Frontend](./qual-tecnologia-usa-frontend.md#stack-principal)
3. [AutenticaÃ§Ã£o JWT](./como-deve-funcionar-autenticacao.md#visÃ£o-geral)
4. [Consumir API](./como-consumir-api-frontend.md#configuraÃ§Ã£o-do-axios)

### ð¿ IntermediÃ¡rio

1. [Criar API Backend](./como-criar-api-backend.md#visÃ£o-geral)
2. [Criar Entity](./como-criar-uma-entity-typeorm.md#estrutura-bÃ¡sica)
3. [Criar Migration](./como-criar-migration-backend.md#passo-a-passo-criar-migration-manual)
4. [Documentar Swagger](./como-documentar-swagger-backend.md#documentar-controllers)
5. [Criar Componentes](./como-criar-componentes-comum-frontend.md#exemplos-prÃ¡ticos)
6. [Rotas Frontend](./como-funciona-as-rotas-no-frontend.md#configuraÃ§Ã£o-centralizada)

### ð³ AvanÃ§ado

1. [PadrÃ£o EscalÃ¡vel](./como-deve-ser-criado-um-padrao-escalavel-de-implementacao-no-modulo-backend.md#princÃ­pios-fundamentais)
2. [Estrutura de Pastas](./como-deve-ser-a-estrutura-de-pastas-do-modulo-backend.md#estrutura-padrÃ£o)
3. [Arquivo Main](./como-deve-funcionar-arquivo-main-backend.md#configuraÃ§Ã£o-completa-do-projeto)
4. [API Key](./como-deve-funcionar-api-key-autenticacao.md#implementaÃ§Ã£o-avanÃ§ada)
5. [ValidaÃ§Ã£o Customizada](./como-usar-validacao-de-dados-api.md#validaÃ§Ã£o-customizada)

## ð Estrutura de Arquivos

```
faq/
âââ SUMARIO.md                                              (este arquivo)
â
âââ Stack e Tecnologias
â   âââ qual-tecnologia-usa-backend.md                      (11 seÃ§Ãµes)
â   âââ qual-tecnologia-usa-frontend.md                     (10 seÃ§Ãµes)
â
âââ Backend - API
â   âââ como-criar-api-backend.md                           (11 passos + extras)
â   âââ como-documentar-swagger-backend.md                  (10 seÃ§Ãµes)
â   âââ como-usar-validacao-de-dados-api.md                 (15 tÃ³picos)
â
âââ Backend - Banco de Dados
â   âââ como-criar-uma-entity-typeorm.md                    (12 tÃ³picos)
â   âââ como-criar-migration-backend.md                     (9 tipos + exemplos)
â   âââ como-deve-ser-os-comandos-migration-packagejson-backend.md  (7 comandos)
â
âââ Backend - AutenticaÃ§Ã£o
â   âââ como-deve-funcionar-autenticacao.md                 (15 seÃ§Ãµes)
â   âââ como-deve-funcionar-api-key-autenticacao.md         (10 tÃ³picos)
â
âââ Backend - Estrutura
â   âââ como-deve-funcionar-arquivo-main-backend.md         (8 configuraÃ§Ãµes)
â   âââ como-deve-ser-a-estrutura-de-pastas-do-modulo-backend.md  (6 seÃ§Ãµes)
â   âââ como-deve-ser-criado-um-padrao-escalavel-de-implementacao-no-modulo-backend.md  (10 padrÃµes)
â
âââ Frontend
    âââ como-consumir-api-frontend.md                       (12 tÃ³picos)
    âââ como-criar-componentes-comum-frontend.md            (8 exemplos + prÃ¡ticas)
    âââ como-funciona-as-rotas-no-frontend.md               (14 conceitos)
```

## ð EstatÃ­sticas

- **Total de documentos**: 17
- **Backend**: 11 documentos (124 seÃ§Ãµes)
- **Frontend**: 3 documentos (34 seÃ§Ãµes)
- **Stack**: 2 documentos (21 seÃ§Ãµes)
- **Total de seÃ§Ãµes**: 179 seÃ§Ãµes documentadas

---

**Ãltima atualizaÃ§Ã£o**: 2 de novembro de 2025
**DocumentaÃ§Ã£o gerada por**: Claude Code
