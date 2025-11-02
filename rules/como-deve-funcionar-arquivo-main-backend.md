# Como deve funcionar o arquivo main do Backend?

> Guia sobre o arquivo main.ts, ponto de entrada da aplicaÃ§Ã£o NestJS.

## O que Ã© o main.ts?

O `main.ts` Ã© o ponto de entrada da aplicaÃ§Ã£o. Ele:
- Inicializa a aplicaÃ§Ã£o NestJS
- Configura middlewares globais
- Configura validaÃ§Ã£o global
- Configura Swagger
- Define porta e CORS
- Inicia o servidor HTTP

## Estrutura BÃ¡sica

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);
}
bootstrap();
```

## ConfiguraÃ§Ã£o Completa do Projeto

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  // 1. Criar aplicaÃ§Ã£o
  const app = await NestFactory.create(AppModule);

  // 2. Global Prefix (todas rotas comeÃ§am com /api)
  app.setGlobalPrefix('api');

  // 3. CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // 4. Validation Pipe Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                    // Remove props nÃ£o definidas
      forbidNonWhitelisted: true,         // Erro se props extras
      transform: true,                    // Transforma tipos
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // 5. Guards Globais (JWT Auth)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // 6. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('DocumentaÃ§Ã£o completa da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 7. Servir arquivos estÃ¡ticos do frontend (produÃ§Ã£o)
  if (process.env.NODE_ENV === 'production') {
    const { join } = require('path');
    const { existsSync } = require('fs');
    const publicPath = join(__dirname, '..', 'public');

    if (existsSync(publicPath)) {
      const serveStatic = require('serve-static');
      app.use(serveStatic(publicPath));

      // SPA fallback (React Router)
      app.use((req, res, next) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(join(publicPath, 'index.html'));
        } else {
          next();
        }
      });
    }
  }

  // 8. Iniciar servidor
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`ð AplicaÃ§Ã£o rodando em: http://localhost:${port}`);
  console.log(`ð Swagger docs em: http://localhost:${port}/api/docs`);
}

bootstrap();
```

## ExplicaÃ§Ã£o de Cada SeÃ§Ã£o

### 1. NestFactory.create()

Cria a instÃ¢ncia da aplicaÃ§Ã£o:

```typescript
const app = await NestFactory.create(AppModule);
```

**OpÃ§Ãµes**:
```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log'], // NÃ­veis de log
  cors: true,                        // CORS simples
});
```

### 2. Global Prefix

Adiciona prefixo a todas as rotas:

```typescript
app.setGlobalPrefix('api');
```

**Resultado**:
- `/products` â `/api/products`
- `/users` â `/api/users`

**Excluir rotas**:
```typescript
app.setGlobalPrefix('api', {
  exclude: ['health'], // /health nÃ£o terÃ¡ prefixo
});
```

### 3. CORS

Habilita requisiÃ§Ãµes cross-origin:

```typescript
// Simples
app.enableCors();

// Configurado
app.enableCors({
  origin: 'http://localhost:5173',     // Frontend URL
  credentials: true,                    // Cookies/Auth headers
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Accept, Authorization',
});
```

### 4. ValidationPipe Global

Valida automaticamente todos os DTOs:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,                    // Remove campos nÃ£o definidos
    forbidNonWhitelisted: true,         // Erro se enviar campos extras
    transform: true,                    // Transforma tipos (string â number)
    transformOptions: {
      enableImplicitConversion: false,  // NÃ£o converte implicitamente
    },
  }),
);
```

### 5. Guards Globais

Protege todas as rotas por padrÃ£o:

```typescript
const reflector = app.get(Reflector);
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

Rotas pÃºblicas usam `@Public()` decorator.

### 6. Swagger

Gera documentaÃ§Ã£o interativa:

```typescript
const config = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('DescriÃ§Ã£o da API')
  .setVersion('1.0')
  .addBearerAuth() // Suporte a JWT
  .addApiKey(
    { type: 'apiKey', name: 'X-API-KEY', in: 'header' },
    'api-key', // Nome do esquema
  )
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Acesso**: `http://localhost:3000/api/docs`

### 7. Servir Frontend (ProduÃ§Ã£o)

Serve os arquivos buildados do React:

```typescript
if (process.env.NODE_ENV === 'production') {
  const serveStatic = require('serve-static');
  const publicPath = join(__dirname, '..', 'public');

  // Servir arquivos estÃ¡ticos
  app.use(serveStatic(publicPath));

  // SPA fallback (React Router)
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(publicPath, 'index.html'));
    } else {
      next();
    }
  });
}
```

### 8. Listen

Inicia o servidor HTTP:

```typescript
const port = process.env.PORT || 3000;
await app.listen(port);

console.log(`AplicaÃ§Ã£o rodando na porta ${port}`);
```

## ConfiguraÃ§Ãµes Opcionais

### Helmet (SeguranÃ§a)

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet());
```

### CompressÃ£o

```bash
npm install compression
```

```typescript
import compression from 'compression';

app.use(compression());
```

### Rate Limiting

```bash
npm install @nestjs/throttler
```

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

// No AppModule
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
})
```

### Logger Customizado

```typescript
import { Logger } from '@nestjs/common';

const app = await NestFactory.create(AppModule, {
  logger: new Logger(),
});
```

### Graceful Shutdown

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... configuraÃ§Ãµes ...

  await app.listen(3000);

  // Shutdown signals
  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });
}
```

## VariÃ¡veis de Ambiente

**.env**:
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=sua-chave-secreta
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=myapp
```

**Acesso**:
```typescript
process.env.PORT
process.env.FRONTEND_URL
```

## Estrutura Final

```
src/
âââ main.ts              # Entry point (este arquivo)
âââ app.module.ts        # MÃ³dulo raiz
âââ app.controller.ts    # Controller raiz (opcional)
âââ modules/             # MÃ³dulos da aplicaÃ§Ã£o
```

## Checklist

- [ ] Global prefix configurado
- [ ] CORS habilitado
- [ ] ValidationPipe global
- [ ] Guards globais (JWT)
- [ ] Swagger configurado
- [ ] Porta via env
- [ ] Logs de inicializaÃ§Ã£o
- [ ] Graceful shutdown (produÃ§Ã£o)

## ReferÃªncias

- [NestJS Bootstrap](https://docs.nestjs.com/first-steps)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
