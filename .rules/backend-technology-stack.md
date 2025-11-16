# [What technologies does the Backend use?]()

> This document describes all technologies, frameworks and libraries used in the backend of the project.

## [Main Stack]()

Core technologies used in the backend including framework, runtime, language and HTTP server. NestJS provides the main framework structure with TypeScript for type safety, Node.js as runtime environment, and Express.js as the underlying HTTP server for handling requests and responses efficiently.

### When to use?

Use this stack when building scalable server-side applications requiring strong typing, modular architecture, dependency injection, and built-in support for REST APIs, WebSockets, or microservices. Ideal for enterprise applications and complex backend systems requiring maintainability and testability.

### When NOT to use?

Avoid this stack for simple static sites, serverless functions with cold start constraints, or when team has no TypeScript/Node.js experience. Not recommended for CPU-intensive tasks better suited for languages like Go or Rust, or when framework overhead is excessive for minimal requirements.

### Example

```typescript
// main.ts - NestJS application entry point
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

// app.module.ts - Root module with dependency injection
@Module({
  imports: [UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Checklist

- [ ] Node.js version >= 18.x installed
- [ ] TypeScript configured with strict mode enabled
- [ ] NestJS CLI installed globally (`npm i -g @nestjs/cli`)
- [ ] Express.js integrated via `@nestjs/platform-express`
- [ ] Environment variables configured in .env file
- [ ] tsconfig.json targeting ES2023 with strict compilation

### Troubleshooting

**Problem**: NestJS application fails to start with dependency injection errors
**Solution**: Ensure all providers are properly registered in module imports/providers arrays and circular dependencies are avoided

**Problem**: TypeScript compilation errors despite valid JavaScript
**Solution**: Check tsconfig.json strict mode settings and ensure all types are properly declared without using `any`

**Problem**: Express middleware not executing
**Solution**: Verify middleware registration order in main.ts or module configuration, as order matters for request processing

### Best Practices

- Enable TypeScript strict mode for maximum type safety
- Organize code in feature modules following domain-driven design
- Use dependency injection instead of direct instantiation
- Implement proper error handling with exception filters
- Configure environment variables via ConfigModule
- Keep controllers thin, business logic in services/use-cases

## [Database]()

Database management system, ORM framework and PostgreSQL driver for data persistence, migrations and type-safe queries in the backend application.

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

Authentication strategies, JWT token management, password hashing and security middleware for protecting API endpoints and user data in the backend application.

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

Validation and transformation libraries for DTOs ensuring data integrity, type safety and automatic validation of incoming requests using decorators in NestJS controllers.

- **class-validator**: DTO validation
  - Declarative validation using decorators
  - Support for custom validation
  - Nested object validation

- **class-transformer**: Object transformation
  - Conversion between plain objects and classes
  - Serialization and deserialization
  - Sensitive field exclusion (@Exclude)

## [API Documentation]()

Automatic OpenAPI/Swagger documentation generation from code using decorators, providing interactive UI for testing and exploring all backend API endpoints with schema definitions.

- **@nestjs/swagger**: Automatic documentation
  - OpenAPI/Swagger documentation generation
  - Interactive UI for testing endpoints
  - Decorators for documenting DTOs and endpoints

## [Configuration]()

Environment variable management and configuration loading with type safety validation, separating settings by development, staging and production environments using .env files.

- **@nestjs/config**: Configuration management
  - Environment variable loading
  - Configuration validation
  - Type-safe access via ConfigService

- **dotenv**: Environment variables
  - .env file loading
  - Configuration separation by environment

## [Utilities]()

Essential utility libraries for HTTP requests to external APIs, date manipulation with immutability, reactive programming with observables and metadata reflection required by TypeScript decorators.

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

## [Main Technologies Summary]()

Quick reference list of all core technologies used in the backend stack for rapid lookup and onboarding new developers to the project's technology ecosystem.

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

The project supports multiple package managers for dependency installation and management, with pnpm recommended for better performance and disk space efficiency.

The project supports both:
- **npm**: package.json + package-lock.json
- **pnpm**: pnpm-lock.yaml (recommended for performance)

## [System Requirements]()

Minimum versions required for runtime, database and package managers to run the backend application successfully in development and production environments.

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm >= 9.x or pnpm >= 8.x

## [References]()

Official documentation links for all major technologies used in the backend stack providing detailed guides, API references and best practices for deeper learning.

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Passport.js Documentation](https://www.passportjs.org)
- [TypeScript Documentation](https://www.typescriptlang.org)
