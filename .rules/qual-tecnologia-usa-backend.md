# Qual tecnologia usa o Backend?

> Este documento descreve todas as tecnologias, frameworks e bibliotecas utilizadas no backend do projeto.

## Stack Principal

### Framework e Runtime

- **NestJS**: Framework principal do backend
  - Framework progressivo para construir aplicações server-side eficientes e escaláveis
  - Baseado em TypeScript
  - Arquitetura modular com injeção de dependência
  - Suporte nativo para TypeScript, WebSockets, Microservices

- **Node.js**: Runtime JavaScript
  - Plataforma assíncrona baseada no V8 do Chrome
  - Event-driven e non-blocking I/O

- **TypeScript**: Linguagem de programação
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

- **TypeORM**: ORM (Object-Relational Mapping)
  - Mapeamento objeto-relacional para TypeScript/JavaScript
  - Suporte a migrations versionadas
  - Active Record e Data Mapper patterns
  - Query builder type-safe

- **pg**: Driver PostgreSQL para Node.js
  - Cliente PostgreSQL nativo
  - Pool de conexões

## Autenticação e Segurança

- **Passport**: Middleware de autenticação
  - Estratégia modular de autenticação
  - Suporte a múltiplas estratégias (JWT, Local, OAuth, etc)

- **passport-jwt**: Estratégia JWT
  - Autenticação via JSON Web Tokens
  - Extração de tokens do header Authorization

- **passport-local**: Estratégia Local
  - Autenticação com email/senha
  - Hash de senhas

- **@nestjs/jwt**: Módulo JWT para NestJS
  - Geração e validação de tokens JWT
  - Integração com @nestjs/passport

- **bcrypt**: Hash de senhas
  - Algoritmo de hashing seguro
  - Salt rounds configuráveis (padrão: 10)

## Validação de Dados

- **class-validator**: Validação de DTOs
  - Validação declarativa usando decorators
  - Suporte a validação customizada
  - Validação de objetos aninhados

- **class-transformer**: Transformação de objetos
  - Conversão entre objetos plain e classes
  - Serialização e deserialização
  - Exclusão de campos sensíveis (@Exclude)

## Documentação de API

- **@nestjs/swagger**: Documentação automática
  - Geração de documentação OpenAPI/Swagger
  - UI interativa para testar endpoints
  - Decorators para documentar DTOs e endpoints

## Configuração

- **@nestjs/config**: Gerenciamento de configurações
  - Carregamento de variáveis de ambiente
  - Validação de configurações
  - Acesso type-safe via ConfigService

- **dotenv**: Variáveis de ambiente
  - Carregamento de arquivos .env
  - Separação de configs por ambiente

## Utilitários

- **axios**: Cliente HTTP
  - Requisições HTTP para APIs externas
  - Interceptors para requisições/respostas
  - Usado nos providers (Kinvo, Yahoo Finance, B3)

- **dayjs**: Manipulação de datas
  - Biblioteca leve para parsing, validação e formatação
  - Alternativa ao Moment.js
  - API imutável

- **rxjs**: Programação reativa
  - Biblioteca de programação reativa
  - Observables para operações assíncronas
  - Requerido pelo NestJS

- **reflect-metadata**: Metadata reflection
  - Polyfill para Metadata Reflection API
  - Requerido para decorators TypeScript

## Ferramentas de Desenvolvimento

### Compilação e Build

- **@nestjs/cli**: CLI do NestJS
  - Geração de código (modules, controllers, services)
  - Scripts de build e desenvolvimento
  - Configuração do projeto

- **ts-node**: Execução TypeScript
  - Executa TypeScript diretamente sem compilação prévia
  - Usado em desenvolvimento

- **ts-loader**: Webpack loader
  - Carrega arquivos TypeScript
  - Integração com Webpack

- **tsconfig-paths**: Path mapping
  - Resolve aliases de paths (ex: @/*)
  - Compatível com tsconfig.json

### Qualidade de Código

- **ESLint**: Linter JavaScript/TypeScript
  - Análise estática de código
  - Detecção de problemas e anti-patterns
  - Regras customizáveis

- **typescript-eslint**: ESLint para TypeScript
  - Parser e plugin TypeScript
  - Regras específicas para TypeScript

- **Prettier**: Formatador de código
  - Formatação consistente
  - Integração com ESLint
  - Configuração via .prettierrc

- **eslint-plugin-prettier**: Plugin Prettier
  - Executa Prettier como regra ESLint
  - Integração perfeita

- **eslint-config-prettier**: Config Prettier
  - Desabilita regras conflitantes do ESLint
  - Evita conflitos entre ESLint e Prettier


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

## Tecnologias Principais

- NestJS
- TypeScript
- TypeORM
- PostgreSQL Driver (pg)
- Passport
- JWT
- bcrypt
- class-validator
- class-transformer
- Swagger
- Axios
- dayjs
- Jest
- ESLint
- Prettier

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
