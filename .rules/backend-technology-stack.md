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

## [Database Technologies]()

Database management system, ORM framework and PostgreSQL driver for data persistence, migrations and type-safe queries in the backend application. PostgreSQL provides robust ACID-compliant data storage with JSONB support, while TypeORM enables type-safe database operations and automated migrations for schema management.

### When to use?

Use PostgreSQL with TypeORM when building applications requiring complex relational data models, ACID transactions, advanced querying capabilities, type-safe database operations, and automated schema migrations. Perfect for applications with structured data, referential integrity requirements, and complex business logic involving multiple related entities.

### When NOT to use?

Avoid this stack for applications primarily dealing with unstructured data better suited for document databases, when requiring extreme horizontal scalability beyond PostgreSQL capabilities, or for simple key-value storage where Redis suffices. Not ideal for time-series data optimized for specialized databases like TimescaleDB or InfluxDB.

### Example

```typescript
// Entity definition with TypeORM
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Post, post => post.user)
  posts: Post[];
}

// Repository usage with type safety
const userRepository = getRepository(User);
const user = await userRepository.findOne({
  where: { email: 'user@example.com' },
  relations: ['posts'],
});
```

### Checklist

- [ ] PostgreSQL >= 14.x installed and running
- [ ] TypeORM configured in app.module.ts with database credentials
- [ ] Database migrations folder created (`src/migrations`)
- [ ] Entities decorated with proper TypeORM decorators
- [ ] Connection pooling configured for production
- [ ] Migration scripts added to package.json

### Troubleshooting

**Problem**: TypeORM cannot connect to PostgreSQL database
**Solution**: Verify database credentials in .env file, ensure PostgreSQL service is running, and check firewall/network connectivity to database port 5432

**Problem**: Migration fails with "relation already exists" error
**Solution**: Check migration history in `migrations` table, revert failed migrations, or manually clean database schema before re-running migrations

**Problem**: Query performance degradation with complex relations
**Solution**: Add database indexes on foreign keys and frequently queried columns, use query builder for optimization, or implement eager/lazy loading strategies appropriately

### Best Practices

- Always use migrations for schema changes, never modify database manually
- Define indexes on foreign keys and frequently queried columns
- Use transactions for operations involving multiple tables
- Implement soft deletes with `@DeleteDateColumn()` instead of hard deletes
- Use repository pattern or custom repositories for complex queries
- Enable query logging in development to monitor and optimize queries

## [Authentication and Security Technologies]()

Authentication strategies, JWT token management, password hashing and security middleware for protecting API endpoints and user data in the backend application. Passport provides flexible authentication with multiple strategies, JWT handles stateless token-based auth, and bcrypt ensures secure password storage with cryptographic hashing.

### When to use?

Use this authentication stack for applications requiring secure user authentication, stateless API authentication with JWT tokens, multiple authentication strategies (local, JWT, OAuth), and password-based login with cryptographic hashing. Ideal for REST APIs, single-page applications, mobile apps, and microservices requiring token-based authentication without server-side sessions.

### When NOT to use?

Avoid JWT for applications requiring instant token revocation (prefer session-based auth with Redis), extremely short-lived sessions needing frequent rotation, or when GDPR requires complete user data deletion including active sessions. Not suitable for public APIs without authentication or when OAuth/SAML is enterprise requirement.

### Example

```typescript
// JWT Strategy for token validation
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}

// Login endpoint returning JWT
@Post('login')
async login(@Body() loginDto: LoginDto) {
  const user = await this.authService.validateUser(loginDto);
  const token = this.jwtService.sign({ sub: user.id, email: user.email });
  return { access_token: token };
}

// Password hashing with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### Checklist

- [ ] Passport and authentication strategies installed and configured
- [ ] JWT secret stored securely in environment variables
- [ ] JWT expiration time configured appropriately
- [ ] Bcrypt salt rounds set to 10 or higher
- [ ] Guards applied to protected routes
- [ ] Password validation rules enforced
- [ ] HTTPS enforced in production for token transmission

### Troubleshooting

**Problem**: JWT authentication fails with "Unauthorized" error
**Solution**: Verify JWT secret matches in environment variables, check token expiration, ensure Authorization header format is "Bearer <token>", and validate token signature

**Problem**: Password comparison always returns false
**Solution**: Ensure password is hashed before storing, verify bcrypt version consistency, check salt rounds match during hash and compare operations

**Problem**: Authentication guard not protecting routes
**Solution**: Verify guard is applied with @UseGuards(JwtAuthGuard) decorator, ensure passport module is properly imported, and check guard execution order

### Best Practices

- Store JWT secret in environment variables, never in code
- Set appropriate JWT expiration (15min-1h for access, 7d for refresh)
- Use bcrypt with minimum 10 salt rounds for password hashing
- Implement refresh token mechanism for extended sessions
- Never expose password hashes in API responses
- Use HTTPS in production to protect tokens during transmission
- Implement rate limiting on login endpoints to prevent brute force

## [Data Validation Libraries]()

Validation and transformation libraries for DTOs ensuring data integrity, type safety and automatic validation of incoming requests using decorators in NestJS controllers. Class-validator provides declarative validation rules while class-transformer handles serialization, deserialization, and sensitive field exclusion for secure API responses.

### When to use?

Use class-validator and class-transformer for all API endpoints accepting user input requiring validation of request payloads, enforcing business rules at API boundary, transforming plain JSON to typed class instances, and excluding sensitive fields from responses. Essential for DTOs in POST, PUT, PATCH endpoints and all user-generated data.

### When NOT to use?

Not needed for internal service-to-service communication with trusted data sources, simple GET endpoints without input parameters, or when validation is handled by database constraints only. Avoid over-validating data already validated by upstream services in microservice architectures.

### Example

```typescript
// DTO with validation decorators
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain letters and numbers',
  })
  password: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number;
}

// Controller with automatic validation
@Post()
async create(@Body() createUserDto: CreateUserDto) {
  return this.userService.create(createUserDto);
}

// Entity with field exclusion
export class User {
  @Exclude()
  password: string;  // Never exposed in responses
}
```

### Checklist

- [ ] ValidationPipe enabled globally in main.ts
- [ ] All DTOs have validation decorators on required fields
- [ ] Sensitive fields marked with @Exclude() decorator
- [ ] Custom validation messages defined for user-facing errors
- [ ] Nested object validation implemented where needed
- [ ] Transform options configured (enableImplicitConversion)

### Troubleshooting

**Problem**: Validation not triggered on API endpoints
**Solution**: Ensure ValidationPipe is enabled globally in main.ts with `app.useGlobalPipes(new ValidationPipe())` or applied to specific controllers/routes

**Problem**: Sensitive fields exposed in API responses
**Solution**: Add @Exclude() decorator to sensitive entity fields and ensure ClassSerializerInterceptor is applied globally or to specific routes

**Problem**: Nested object validation not working
**Solution**: Use @ValidateNested() decorator and @Type(() => NestedClass) to enable validation of nested objects and arrays

### Best Practices

- Enable ValidationPipe globally with whitelist and forbidNonWhitelisted options
- Always validate user input at API boundary, never trust client data
- Use specific validation decorators (@IsEmail, @IsUUID) over generic @IsString
- Provide clear error messages for validation failures
- Exclude sensitive fields using @Exclude() in entity classes
- Use @Transform() for custom data transformations
- Validate nested objects with @ValidateNested() and @Type() decorators

## [API Documentation with Swagger]()

Automatic OpenAPI/Swagger documentation generation from code using decorators, providing interactive UI for testing and exploring all backend API endpoints with schema definitions. Swagger UI allows developers and API consumers to understand, test, and integrate with the API without reading source code or separate documentation.

### When to use?

Use Swagger for all REST APIs requiring documentation for external consumers, frontend developers, third-party integrators, or public API usage. Essential for microservices architectures, API-first development, maintaining API contracts, and providing self-service testing interfaces during development and integration phases.

### When NOT to use?

Skip Swagger for internal microservices with generated clients, GraphQL APIs using built-in introspection, purely internal tools without external consumers, or when OpenAPI specification conflicts with custom API patterns. Not necessary for simple CRUD APIs without complex request/response schemas.

### Example

```typescript
// API endpoint documentation
@ApiTags('users')
@Controller('users')
export class UserController {
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}

// DTO with Swagger annotations
export class CreateUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (min 8 chars)', minLength: 8 })
  @MinLength(8)
  password: string;
}
```

### Checklist

- [ ] Swagger module configured in main.ts with DocumentBuilder
- [ ] All controllers tagged with @ApiTags() decorator
- [ ] Endpoints documented with @ApiOperation() and @ApiResponse()
- [ ] DTOs annotated with @ApiProperty() for all fields
- [ ] Authentication/authorization schemes defined in Swagger config
- [ ] Swagger UI accessible at /api/docs endpoint

### Troubleshooting

**Problem**: Swagger UI not loading or showing empty documentation
**Solution**: Verify SwaggerModule.setup() is called in main.ts after app creation, check path conflicts with application routes, and ensure decorators are properly applied

**Problem**: DTO properties not appearing in Swagger schema
**Solution**: Add @ApiProperty() decorator to all DTO fields, ensure class-validator and class-transformer are installed, and check TypeScript emit decorator metadata is enabled

**Problem**: Authentication not working in Swagger UI
**Solution**: Configure authentication scheme with .addBearerAuth() in DocumentBuilder, add @ApiBearerAuth() to protected endpoints, and test token format

### Best Practices

- Tag all controllers with @ApiTags() for logical grouping
- Document all possible response status codes with @ApiResponse()
- Provide example values in @ApiProperty() for better clarity
- Use @ApiBearerAuth() or @ApiSecurity() for protected endpoints
- Keep Swagger documentation in sync with actual implementation
- Disable Swagger in production or protect with authentication
- Use @ApiExcludeEndpoint() to hide internal/deprecated endpoints

## [Configuration Management]()

Environment variable management and configuration loading with type safety validation, separating settings by development, staging and production environments using .env files. NestJS ConfigModule provides centralized configuration with validation, while dotenv handles loading environment-specific variables from .env files into process.env.

### When to use?

Use ConfigModule for managing all application settings requiring different values per environment (dev, staging, production), storing sensitive credentials outside code, centralizing configuration access across the application, and validating configuration at startup. Essential for database URLs, API keys, feature flags, and external service endpoints.

### When NOT to use?

Not needed for static configuration values that never change across environments, hardcoded constants better defined as TypeScript constants, or simple applications with no environment-specific settings. Avoid for values that should be in code (like enum definitions or business constants).

### Example

```typescript
// .env file
DATABASE_URL=postgresql://localhost:5432/mydb
JWT_SECRET=supersecret
PORT=3000

// Configuration module with validation
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
})
export class AppModule {}

// Type-safe configuration usage
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }
}
```

### Checklist

- [ ] ConfigModule imported globally in AppModule
- [ ] .env file created with all required variables
- [ ] .env file added to .gitignore
- [ ] .env.example file provided with dummy values
- [ ] Configuration validation schema defined
- [ ] ConfigService injected where configuration needed
- [ ] Separate .env files for different environments

### Troubleshooting

**Problem**: Environment variables not loading from .env file
**Solution**: Ensure .env file is in project root, ConfigModule.forRoot() is called before other modules, and dotenv package is installed

**Problem**: ConfigService returning undefined for existing variables
**Solution**: Check environment variable names match exactly (case-sensitive), verify .env file format has no spaces around = sign, and restart application after .env changes

**Problem**: Application fails to start with validation errors
**Solution**: Review validation schema requirements, ensure all required variables are defined in .env, check variable types match schema definitions

### Best Practices

- Never commit .env files to version control
- Provide .env.example with all required variables and dummy values
- Use ConfigModule.forRoot({ isGlobal: true }) to avoid repeated imports
- Validate configuration at application startup with validation schema
- Use type-safe access with generics: configService.get<string>('KEY')
- Separate configuration by environment (.env.dev, .env.prod)
- Document all configuration variables in README or .env.example

## [Utility Libraries]()

Essential utility libraries for HTTP requests to external APIs, date manipulation with immutability, reactive programming with observables and metadata reflection required by TypeScript decorators. These libraries provide core functionality for external integrations, asynchronous operations, and TypeScript decorator-based programming patterns.

### When to use?

Use axios for HTTP requests to external REST APIs and third-party services, dayjs for all date/time parsing, formatting, and manipulation, RxJS for complex asynchronous workflows and reactive programming patterns, and reflect-metadata as required dependency for TypeScript decorators in NestJS. Essential for API integrations, scheduled jobs, and event-driven architectures.

### When NOT to use?

Avoid axios for internal microservice communication (use NestJS HttpService or gRPC), dayjs for simple timestamp comparisons (use native Date), RxJS for simple promises (use async/await), or reflect-metadata configuration (it's auto-required by NestJS). Don't use these libraries when simpler native JavaScript alternatives suffice.

### Example

```typescript
// Axios for external API calls
@Injectable()
export class ExternalApiService {
  async fetchUserData(userId: string): Promise<UserData> {
    const response = await axios.get(`https://api.example.com/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      timeout: 5000,
    });
    return response.data;
  }
}

// Dayjs for date manipulation
import dayjs from 'dayjs';

const now = dayjs();
const tomorrow = now.add(1, 'day');
const formatted = now.format('YYYY-MM-DD HH:mm:ss');
const isAfter = dayjs('2024-01-01').isAfter('2023-01-01');

// RxJS for reactive operations
import { map, filter } from 'rxjs/operators';

this.dataStream$.pipe(
  filter(data => data.isValid),
  map(data => data.value)
).subscribe(result => console.log(result));
```

### Checklist

- [ ] Axios configured with base URL and default headers
- [ ] Axios interceptors set up for error handling and retries
- [ ] Dayjs imported with required plugins (timezone, utc, etc)
- [ ] RxJS operators imported individually for tree-shaking
- [ ] Reflect-metadata imported at top of main.ts
- [ ] HTTP timeout configured for all external requests

### Troubleshooting

**Problem**: Axios requests timeout or hang indefinitely
**Solution**: Configure timeout option in axios config, implement retry logic with exponential backoff, check network connectivity, and verify external API is responding

**Problem**: Dayjs formatting returns unexpected results
**Solution**: Ensure correct format string syntax, check timezone plugin is loaded if using timezone-aware dates, verify input date string is valid

**Problem**: RxJS memory leaks in subscriptions
**Solution**: Always unsubscribe from observables in ngOnDestroy or use takeUntil operator, avoid nested subscriptions, prefer async pipe in templates

### Best Practices

- Configure axios defaults for base URL, headers, and timeout
- Use axios interceptors for authentication token injection and error handling
- Implement retry logic with exponential backoff for failed requests
- Use dayjs with UTC plugin for consistent date handling across timezones
- Keep dayjs objects immutable, never mutate dates
- Import RxJS operators individually to reduce bundle size
- Use async/await for simple asynchronous operations instead of RxJS
- Unsubscribe from RxJS observables to prevent memory leaks

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
