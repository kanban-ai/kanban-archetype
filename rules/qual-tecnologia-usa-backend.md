# Qual tecnologia usa o Backend?

> Este documento descreve todas as tecnologias, frameworks e bibliotecas utilizadas no backend do projeto.

## Stack Principal

### Framework e Runtime

- **NestJS v11.0.1**: Framework principal do backend
  - Framework progressivo para construir aplicações server-side eficientes e escaláveis
  - Baseado em TypeScript
  - Arquitetura modular com injeção de dependência
  - Suporte nativo para TypeScript, WebSockets, Microservices

- **Node.js**: Runtime JavaScript
  - Plataforma assíncrona baseada no V8 do Chrome
  - Event-driven e non-blocking I/O

- **TypeScript v5.7.3**: Linguagem de programação
  - Superset do JavaScript com tipagem estática
  - Target: ES2023
  - Strict mode habilitado

- **Express.js**: Servidor HTTP
  - Integrado via `@nestjs/platform-express`
  - Framework web minimalista e rápido

## Banco de Dados

- **PostgreSQL**: Banco de dados relacional
  - Sistema robusto de banco de dados SQL
  - Suporte a JSONB para dados semi-estruturados
  - Transações ACID

- **TypeORM v0.3.27**: ORM (Object-Relational Mapping)
  - Mapeamento objeto-relacional para TypeScript/JavaScript
  - Suporte a migrations versionadas
  - Active Record e Data Mapper patterns
  - Query builder type-safe

- **pg v8.16.3**: Driver PostgreSQL para Node.js
  - Cliente PostgreSQL nativo
  - Pool de conexões

## Autenticação e Segurança

- **Passport v0.7.0**: Middleware de autenticação
  - Estratégia modular de autenticação
  - Suporte a múltiplas estratégias (JWT, Local, OAuth, etc)

- **passport-jwt v4.0.1**: Estratégia JWT
  - Autenticação via JSON Web Tokens
  - Extração de tokens do header Authorization

- **passport-local v1.0.0**: Estratégia Local
  - Autenticação com email/senha
  - Hash de senhas

- **@nestjs/jwt v11.0.1**: Módulo JWT para NestJS
  - Geração e validação de tokens JWT
  - Integração com @nestjs/passport

- **bcrypt v6.0.0**: Hash de senhas
  - Algoritmo de hashing seguro
  - Salt rounds configuráveis (padrão: 10)

## Validação de Dados

- **class-validator v0.14.2**: Validação de DTOs
  - Validação declarativa usando decorators
  - Suporte a validação customizada
  - Validação de objetos aninhados

- **class-transformer v0.5.1**: Transformação de objetos
  - Conversão entre objetos plain e classes
  - Serialização e deserialização
  - Exclusão de campos sensíveis (@Exclude)

## Documentação de API

- **@nestjs/swagger v11.2.0**: Documentação automática
  - Geração de documentação OpenAPI/Swagger
  - UI interativa para testar endpoints
  - Decorators para documentar DTOs e endpoints

## Configuração

- **@nestjs/config v4.0.2**: Gerenciamento de configurações
  - Carregamento de variáveis de ambiente
  - Validação de configurações
  - Acesso type-safe via ConfigService

- **dotenv v17.2.3**: Variáveis de ambiente
  - Carregamento de arquivos .env
  - Separação de configs por ambiente

## Utilitários

- **axios v1.7.9**: Cliente HTTP
  - Requisições HTTP para APIs externas
  - Interceptors para requisições/respostas
  - Usado nos providers (Kinvo, Yahoo Finance, B3)

- **dayjs v1.11.13**: Manipulação de datas
  - Biblioteca leve para parsing, validação e formatação
  - Alternativa ao Moment.js
  - API imutável

- **rxjs v7.8.1**: Programação reativa
  - Biblioteca de programação reativa
  - Observables para operações assíncronas
  - Requerido pelo NestJS

- **reflect-metadata v0.2.2**: Metadata reflection
  - Polyfill para Metadata Reflection API
  - Requerido para decorators TypeScript

## Ferramentas de Desenvolvimento

### Compilação e Build

- **@nestjs/cli v11.0.0**: CLI do NestJS
  - Geração de código (modules, controllers, services)
  - Scripts de build e desenvolvimento
  - Configuração do projeto

- **ts-node v10.9.2**: Execução TypeScript
  - Executa TypeScript diretamente sem compilação prévia
  - Usado em desenvolvimento

- **ts-loader v9.5.2**: Webpack loader
  - Carrega arquivos TypeScript
  - Integração com Webpack

- **tsconfig-paths v4.2.0**: Path mapping
  - Resolve aliases de paths (ex: @/*)
  - Compatível com tsconfig.json

### Qualidade de Código

- **ESLint v9.18.0**: Linter JavaScript/TypeScript
  - Análise estática de código
  - Detecção de problemas e anti-patterns
  - Regras customizáveis

- **typescript-eslint v8.20.0**: ESLint para TypeScript
  - Parser e plugin TypeScript
  - Regras específicas para TypeScript

- **Prettier v3.4.2**: Formatador de código
  - Formatação consistente
  - Integração com ESLint
  - Configuração via .prettierrc

- **eslint-plugin-prettier v5.2.2**: Plugin Prettier
  - Executa Prettier como regra ESLint
  - Integração perfeita

- **eslint-config-prettier v10.0.1**: Config Prettier
  - Desabilita regras conflitantes do ESLint
  - Evita conflitos entre ESLint e Prettier

### Testes

- **Jest v30.0.0**: Framework de testes
  - Testes unitários e de integração
  - Mocking e spies
  - Code coverage

- **ts-jest v29.2.5**: Preset Jest para TypeScript
  - Transpilação TypeScript para Jest
  - Source maps

- **@nestjs/testing v11.0.1**: Utilities de teste
  - Test.createTestingModule()
  - Mocking de providers
  - Utilities específicas do NestJS

- **supertest v7.0.0**: Testes HTTP
  - Testes de integração de APIs
  - Simulação de requisições HTTP
  - Usado em testes E2E

### Types (@types/*)

```json
{
  "@types/express": "^5.0.0",
  "@types/node": "^22.10.7",
  "@types/jest": "^30.0.0",
  "@types/bcrypt": "^6.0.0",
  "@types/passport-jwt": "^4.0.1"
}
```

## Arquitetura e Padrões

### Padrões de Design Implementados

1. **Dependency Injection**: Container IoC nativo do NestJS
2. **Repository Pattern**: Abstração de acesso a dados via TypeORM
3. **DTO Pattern**: Data Transfer Objects para validação
4. **Strategy Pattern**: Múltiplas estratégias de autenticação (JWT, Local, API Key)
5. **Guard Pattern**: Proteção de rotas com guards customizados
6. **Decorator Pattern**: Extensão de funcionalidades via decorators
7. **Module Pattern**: Organização em módulos independentes

### Princípios SOLID Aplicados

- **S** (Single Responsibility): Cada service tem uma responsabilidade única
- **O** (Open/Closed): Extensível via decorators e guards
- **L** (Liskov Substitution): Entidades estendem SuperEntity
- **I** (Interface Segregation): Interfaces específicas por contexto
- **D** (Dependency Inversion): Dependências injetadas, não instanciadas

## Módulos Personalizados do Projeto

### Módulos de Domínio

1. **AuthModule**: Autenticação e gerenciamento de usuários
2. **AssetModule**: Gerenciamento de ativos (ações)
3. **AssetGroupModule**: Agrupamento de ativos
4. **WalletModule**: Carteiras do usuário
5. **WalletCompositionModule**: Composição de carteiras (posições)
6. **QuoteModule**: Cotações históricas
7. **CurrencyModule**: Moedas e conversões
8. **SectorModule**: Setores econômicos
9. **ProvidersModule**: Integração com provedores de dados
10. **DashboardModule**: Dashboards e métricas
11. **IntegrationModule**: Integração com B3
12. **AlertModule**: Sistema de alertas
13. **CommentModule**: Comentários em ativos
14. **ConfigModule**: Configurações do usuário
15. **RebalanceModule**: Rebalanceamento de carteira

## Versões Resumidas

| Tecnologia | Versão |
|------------|--------|
| NestJS | 11.0.1 |
| TypeScript | 5.7.3 |
| TypeORM | 0.3.27 |
| PostgreSQL Driver (pg) | 8.16.3 |
| Passport | 0.7.0 |
| JWT | 11.0.1 |
| bcrypt | 6.0.0 |
| class-validator | 0.14.2 |
| class-transformer | 0.5.1 |
| Swagger | 11.2.0 |
| Axios | 1.7.9 |
| dayjs | 1.11.13 |
| Jest | 30.0.0 |
| ESLint | 9.18.0 |
| Prettier | 3.4.2 |

## Gerenciadores de Pacotes

O projeto suporta ambos:
- **npm**: package.json + package-lock.json
- **pnpm**: pnpm-lock.yaml (recomendado para performance)

## Requisitos de Sistema

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm >= 9.x ou pnpm >= 8.x

## Referências

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Passport.js Documentation](https://www.passportjs.org)
- [TypeScript Documentation](https://www.typescriptlang.org)
