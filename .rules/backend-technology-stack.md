# [What technologies does the Backend use?]()

> This document describes all technologies, frameworks and libraries used in the backend of the project.

## [Main Stack]()

Core technologies used in the backend including framework, runtime, language and HTTP server.

### [Framework and Runtime]()

- **NestJS**: Main backend framework
  - Progressive framework for building efficient and scalable server-side applications
  - Based on TypeScript
  - Modular architecture with dependency injection
  - Native support for TypeScript, WebSockets, Microservices

- **Node.js**: JavaScript runtime
  - Asynchronous platform based on Chrome's V8
  - Event-driven and non-blocking I/O

- **TypeScript**: Programming language
  - JavaScript superset with static typing
  - Target: ES2023
  - Strict mode enabled

- **Express.js**: HTTP server
  - Integrated via `@nestjs/platform-express`
  - Minimalist and fast web framework

## [Database]()

- **PostgreSQL**: Relational database
  - Robust SQL database system
  - JSONB support for semi-structured data
  - ACID transactions

- **TypeORM**: ORM (Object-Relational Mapping)
  - Object-relational mapping for TypeScript/JavaScript
  - Support for versioned migrations
  - Active Record and Data Mapper patterns
  - Type-safe query builder

- **pg**: PostgreSQL driver for Node.js
  - Native PostgreSQL client
  - Connection pooling

## [Authentication and Security]()

- **Passport**: Authentication middleware
  - Modular authentication strategy
  - Support for multiple strategies (JWT, Local, OAuth, etc)

- **passport-jwt**: JWT strategy
  - Authentication via JSON Web Tokens
  - Token extraction from Authorization header

- **passport-local**: Local strategy
  - Authentication with email/password
  - Password hashing

- **@nestjs/jwt**: JWT module for NestJS
  - JWT token generation and validation
  - Integration with @nestjs/passport

- **bcrypt**: Password hashing
  - Secure hashing algorithm
  - Configurable salt rounds (default: 10)

## [Data Validation]()

- **class-validator**: DTO validation
  - Declarative validation using decorators
  - Support for custom validation
  - Nested object validation

- **class-transformer**: Object transformation
  - Conversion between plain objects and classes
  - Serialization and deserialization
  - Sensitive field exclusion (@Exclude)

## [API Documentation]()

- **@nestjs/swagger**: Automatic documentation
  - OpenAPI/Swagger documentation generation
  - Interactive UI for testing endpoints
  - Decorators for documenting DTOs and endpoints

## [Configuration]()

- **@nestjs/config**: Configuration management
  - Environment variable loading
  - Configuration validation
  - Type-safe access via ConfigService

- **dotenv**: Environment variables
  - .env file loading
  - Configuration separation by environment

## [Utilities]()

- **axios**: HTTP client
  - HTTP requests to external APIs
  - Interceptors for requests/responses
  - Used in providers (Kinvo, Yahoo Finance, B3)

- **dayjs**: Date manipulation
  - Lightweight library for parsing, validation and formatting
  - Alternative to Moment.js
  - Immutable API

- **rxjs**: Reactive programming
  - Reactive programming library
  - Observables for asynchronous operations
  - Required by NestJS

- **reflect-metadata**: Metadata reflection
  - Polyfill for Metadata Reflection API
  - Required for TypeScript decorators

## [Development Tools]()

Tools for compilation, build, code quality and general development.

### [Compilation and Build]()

- **@nestjs/cli**: NestJS CLI
  - Code generation (modules, controllers, services)
  - Build and development scripts
  - Project configuration

- **ts-node**: TypeScript execution
  - Executes TypeScript directly without prior compilation
  - Used in development

- **ts-loader**: Webpack loader
  - Loads TypeScript files
  - Integration with Webpack

- **tsconfig-paths**: Path mapping
  - Resolves path aliases (e.g. @/*)
  - Compatible with tsconfig.json

### [Code Quality]()

- **ESLint**: JavaScript/TypeScript linter
  - Static code analysis
  - Problem and anti-pattern detection
  - Customizable rules

- **typescript-eslint**: ESLint for TypeScript
  - TypeScript parser and plugin
  - TypeScript-specific rules

- **Prettier**: Code formatter
  - Consistent formatting
  - Integration with ESLint
  - Configuration via .prettierrc

- **eslint-plugin-prettier**: Prettier plugin
  - Runs Prettier as an ESLint rule
  - Seamless integration

- **eslint-config-prettier**: Prettier config
  - Disables conflicting ESLint rules
  - Prevents conflicts between ESLint and Prettier


### [Types (@types/*)]()

```json
{
  "@types/express": "^5.0.0",
  "@types/node": "^22.10.7",
  "@types/jest": "^30.0.0",
  "@types/bcrypt": "^6.0.0",
  "@types/passport-jwt": "^4.0.1"
}
```

## [Architecture and Patterns]()

Design patterns and architectural principles implemented in the backend project.

### [Implemented Design Patterns]()

1. **Dependency Injection**: NestJS native IoC container
2. **Repository Pattern**: Data access abstraction via TypeORM
3. **DTO Pattern**: Data Transfer Objects for validation
4. **Strategy Pattern**: Multiple authentication strategies (JWT, Local, API Key)
5. **Guard Pattern**: Route protection with custom guards
6. **Decorator Pattern**: Functionality extension via decorators
7. **Module Pattern**: Organization into independent modules

### [SOLID Principles Applied]()

- **S** (Single Responsibility): Each service has a single responsibility
- **O** (Open/Closed): Extensible via decorators and guards
- **L** (Liskov Substitution): Entities extend SuperEntity
- **I** (Interface Segregation): Specific interfaces per context
- **D** (Dependency Inversion): Dependencies injected, not instantiated

## [Project Custom Modules]()

Domain-specific modules developed for the project, organized by business functionality.

### [Domain Modules]()

1. **AuthModule**: Authentication and user management
2. **AssetModule**: Asset management (stocks)
3. **AssetGroupModule**: Asset grouping
4. **WalletModule**: User wallets
5. **WalletCompositionModule**: Wallet composition (positions)
6. **QuoteModule**: Historical quotes
7. **CurrencyModule**: Currencies and conversions
8. **SectorModule**: Economic sectors
9. **ProvidersModule**: Data provider integration
10. **DashboardModule**: Dashboards and metrics
11. **IntegrationModule**: B3 integration
12. **AlertModule**: Alert system
13. **CommentModule**: Asset comments
14. **ConfigModule**: User settings
15. **RebalanceModule**: Portfolio rebalancing

## [Main Technologies]()

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

## [Package Managers]()

The project supports both:
- **npm**: package.json + package-lock.json
- **pnpm**: pnpm-lock.yaml (recommended for performance)

## [System Requirements]()

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm >= 9.x or pnpm >= 8.x

## [References]()

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Passport.js Documentation](https://www.passportjs.org)
- [TypeScript Documentation](https://www.typescriptlang.org)
