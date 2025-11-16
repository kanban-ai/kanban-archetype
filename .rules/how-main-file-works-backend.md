# How the main Backend file works?

> Comprehensive guide about the main.ts file, NestJS application entry point, covering configuration, middlewares, guards, Swagger, and production setup.

## [What is main.ts?]()

The `main.ts` is the application entry point. It:
- Initializes the NestJS application
- Configures global middlewares
- Configures global validation
- Configures Swagger
- Defines port and CORS
- Serves static frontend files
- Starts the HTTP server

## [Basic Structure]()

Minimum example of a functional main.ts file to start a NestJS application.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);
}
bootstrap();
```

## [Complete Project Configuration]()

Complete production-ready configuration including CORS, global validation, guards, Swagger and serving frontend static files.

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  // 1. Create application (with NestExpressApplication typing)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Global Prefix (all routes start with /api)
  app.setGlobalPrefix('api');

  // 3. API Versioning (IMPORTANT: always use from the start)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 4. CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // 5. Serve static frontend files
  // Production: /app/dist/src -> /app/public (2 levels up)
  // Development: /app/back/dist/src -> /app/back/public (2 levels up)
  const publicPath = join(__dirname, '..', '..', 'public');
  app.useStaticAssets(publicPath, {
    index: 'index.html',
    prefix: '/',
  });

  // 6. Fallback for SPA (React Router)
  app.use((req: any, res: any, next: any) => {
    // If NOT an API route, serve index.html
    if (!req.path.startsWith('/api')) {
      return res.sendFile(join(publicPath, 'index.html'));
    }
    next();
  });

  // 7. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                    // Remove undefined props
      forbidNonWhitelisted: true,         // Error if extra props
      transform: true,                    // Transform types
      transformOptions: {
        enableImplicitConversion: false,  // Avoid incorrect conversion
      },
    }),
  );

  // 8. Global Guards (JWT Auth)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // 9. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Complete API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'API Key for external integrations',
      },
      'X-API-KEY',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // 10. Start server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application running at: http://localhost:${port}`);
  console.log(`📚 Swagger docs at: http://localhost:${port}/api/docs`);
}

bootstrap();
```

> **IMPORTANT**: See [How to version API](./how-to-version-api-backend.md) to understand how versioning works.

## [Explanation of Each Section]()

Detailed breakdown of each main.ts configuration with practical examples and additional options.

### [1. NestFactory.create()]()

Creates the application instance:

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

**IMPORTANT**: Use `NestExpressApplication` typing to have access to Express methods like `useStaticAssets`.

**Options**:
```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log'], // Log levels
  cors: true,                        // Simple CORS
});
```

### [2. Global Prefix]()

Adds prefix to all routes:

```typescript
app.setGlobalPrefix('api');
```

**Result** (with versioning):
- `/products` → `/api/v1/products`
- `/users` → `/api/v1/users`

**Exclude routes**:
```typescript
app.setGlobalPrefix('api', {
  exclude: ['health'], // /health won't have prefix
});
```

### [3. API Versioning]()

Enables URL (URI) versioning:

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

**Result**:
- Controllers with `@Controller({ path: 'users', version: '1' })` → `/api/v1/users`
- Controllers with `@Controller({ path: 'users', version: '2' })` → `/api/v2/users`

**Why always use from the start?**
- Avoids breaking integrations when you need to make breaking changes
- Allows API evolution without impacting existing clients
- It's professional and demonstrates maturity

See more at: [How to version API](./how-to-version-api-backend.md)

### [4. CORS]()

Enables cross-origin requests:

**Simple**:
```typescript
app.enableCors();
```

**Configured**:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### [5. Serve Static Files]()

Serves built React/frontend files:

```typescript
const publicPath = join(__dirname, '..', '..', 'public');
app.useStaticAssets(publicPath, {
  index: 'index.html',
  prefix: '/',
});
```

**Expected folder structure**:
```
project/
├── back/
│   ├── dist/
│   │   └── src/
│   │       └── main.js  (here is __dirname)
│   └── src/
│       └── main.ts
└── public/              (2 levels up)
    ├── index.html
    ├── assets/
    └── ...
```

**Levels explanation**:
- `__dirname` points to `/project/back/dist/src`
- `'..'` goes up to `/project/back/dist`
- `'..'` goes up to `/project/back`
- `'..'` goes up to `/project`
- Final: `/project/public`

### [6. Fallback for SPA]()

Ensures React Router works correctly:

```typescript
app.use((req: any, res: any, next: any) => {
  if (!req.path.startsWith('/api')) {
    return res.sendFile(join(publicPath, 'index.html'));
  }
  next();
});
```

**How it works**:
- Route `/api/*` → Process in backend
- Route `/products` → Serve `index.html` (React Router takes over)
- Route `/users/123` → Serve `index.html` (React Router takes over)

### [7. Validation Pipe]()

Automatically validates all DTOs:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,                    // Remove undefined properties
    forbidNonWhitelisted: true,         // Error if extra props
    transform: true,                    // Transform types automatically
    transformOptions: {
      enableImplicitConversion: false,  // Avoid incorrect conversion
    },
  }),
);
```

**Options**:
- `whitelist: true` - Removes fields not defined in DTO
- `forbidNonWhitelisted: true` - Returns 400 error if extra field
- `transform: true` - Converts types (string → number)
- `enableImplicitConversion: false` - Disables automatic conversion to avoid bugs

### [8. Global Guards]()

Protects all routes with JWT (except those marked with `@Public()`):

```typescript
const reflector = app.get(Reflector);
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

### [9. Swagger]()

Documents the API automatically:

```typescript
const config = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('Complete API documentation')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addApiKey(
    {
      type: 'apiKey',
      name: 'X-API-KEY',
      in: 'header',
      description: 'API Key for external integrations',
    },
    'X-API-KEY',
  )
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,  // Keeps token after refresh
    tagsSorter: 'alpha',         // Sort tags alphabetically
    operationsSorter: 'alpha',   // Sort operations alphabetically
  },
});
```

**Access**: `http://localhost:3000/api/docs`

### [10. Listen]()

Starts the HTTP server:

```typescript
const port = process.env.PORT ?? 3000;
await app.listen(port);

console.log(`Application running on port ${port}`);
```

## [Optional Configurations]()

Additional middlewares and features to increase security, performance and application monitoring.

### [Helmet (Security)]()

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet());
```

### [Compression]()

```bash
npm install compression
```

```typescript
import compression from 'compression';

app.use(compression());
```

### [Rate Limiting]()

```bash
npm install @nestjs/throttler
```

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

// In AppModule
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
})
```

### [Custom Logger]()

```typescript
import { Logger } from '@nestjs/common';

const app = await NestFactory.create(AppModule, {
  logger: new Logger(),
});
```

## [Environment Variables]()

Create a `.env` file in the backend root:

```env
# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=postgres # use postgres database

# JWT
JWT_SECRET=your_super_secure_secret
JWT_EXPIRATION=7d

# API Key
X_API_KEY=your_secret_api_key
```

## [Checklist]()

- [ ] NestFactory.create with `NestExpressApplication`
- [ ] Global prefix `/api`
- [ ] **Versioning enabled (`VersioningType.URI`) with `defaultVersion: '1'`**
- [ ] CORS enabled
- [ ] Serve static files (`useStaticAssets`)
- [ ] SPA fallback for React Router
- [ ] Global ValidationPipe
- [ ] Global guards (JWT)
- [ ] Swagger configured with Bearer and API Key
- [ ] Port via environment variable
- [ ] Console.log with useful URLs

## [Tips]()

1. **Always use `NestExpressApplication`**: To have access to Express methods
2. **Configure CORS correctly**: Avoid `origin: '*'` in production
3. **Use environment variables**: Never hardcode passwords or secrets
4. **Document Swagger well**: Makes API usage easier
5. **Test SPA fallback**: Ensure React Router works
6. **Use helmet in production**: Increases security
7. **Configure rate limiting**: Prevents API abuse

## [References]()

- [NestJS Application](https://docs.nestjs.com/first-steps)
- [NestJS CORS](https://docs.nestjs.com/security/cors)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
