# [Como deve funcionar o arquivo main do Backend?]()

> Guia sobre o arquivo main.ts, ponto de entrada da aplicação NestJS.

## [O que é o main.ts?]()

O `main.ts` é o ponto de entrada da aplicação. Ele:
- Inicializa a aplicação NestJS
- Configura middlewares globais
- Configura validação global
- Configura Swagger
- Define porta e CORS
- Serve arquivos estáticos do frontend
- Inicia o servidor HTTP

## [Estrutura Básica]()

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);
}
bootstrap();
```

## [Configuração Completa do Projeto]()

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  // 1. Criar aplicação (com tipagem NestExpressApplication)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Global Prefix (todas rotas começam com /api)
  app.setGlobalPrefix('api');

  // 3. Versionamento de API (IMPORTANTE: sempre use desde o início)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 4. CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // 5. Servir arquivos estáticos do frontend
  // Em produção: /app/dist/src -> /app/public (2 níveis acima)
  // Em desenvolvimento: /app/back/dist/src -> /app/back/public (2 níveis acima)
  const publicPath = join(__dirname, '..', '..', 'public');
  app.useStaticAssets(publicPath, {
    index: 'index.html',
    prefix: '/',
  });

  // 6. Fallback para SPA (React Router)
  app.use((req: any, res: any, next: any) => {
    // Se NÃO for rota de API, servir o index.html
    if (!req.path.startsWith('/api')) {
      return res.sendFile(join(publicPath, 'index.html'));
    }
    next();
  });

  // 7. Validation Pipe Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                    // Remove props não definidas
      forbidNonWhitelisted: true,         // Erro se props extras
      transform: true,                    // Transforma tipos
      transformOptions: {
        enableImplicitConversion: false,  // Evita conversão incorreta
      },
    }),
  );

  // 8. Guards Globais (JWT Auth)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // 9. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentação completa da API')
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

  // 10. Iniciar servidor
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 Swagger docs em: http://localhost:${port}/api/docs`);
}

bootstrap();
```

> **IMPORTANTE**: Veja [Como versionar API](./como-versionar-api-backend.md) para entender como funciona o versionamento.

## [Explicação de Cada Seção]()

### [1. NestFactory.create()]()

Cria a instância da aplicação:

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

**IMPORTANTE**: Use a tipagem `NestExpressApplication` para ter acesso aos métodos do Express como `useStaticAssets`.

**Opções**:
```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log'], // Níveis de log
  cors: true,                        // CORS simples
});
```

### [2. Global Prefix]()

Adiciona prefixo a todas as rotas:

```typescript
app.setGlobalPrefix('api');
```

**Resultado** (com versionamento):
- `/products` → `/api/v1/products`
- `/users` → `/api/v1/users`

**Excluir rotas**:
```typescript
app.setGlobalPrefix('api', {
  exclude: ['health'], // /health não terá prefixo
});
```

### [3. Versionamento de API]()

Habilita versionamento por URL (URI):

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

**Resultado**:
- Controllers com `@Controller({ path: 'users', version: '1' })` → `/api/v1/users`
- Controllers com `@Controller({ path: 'users', version: '2' })` → `/api/v2/users`

**Por que sempre usar desde o início?**
- Evita quebrar integrações quando precisar fazer breaking changes
- Permite evoluir a API sem impactar clientes existentes
- É profissional e demonstra maturidade

Veja mais em: [Como versionar API](./como-versionar-api-backend.md)

### [4. CORS]()

Habilita requisições cross-origin:

**Simples**:
```typescript
app.enableCors();
```

**Configurado**:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### [5. Servir Arquivos Estáticos]()

Serve os arquivos buildados do React/frontend:

```typescript
const publicPath = join(__dirname, '..', '..', 'public');
app.useStaticAssets(publicPath, {
  index: 'index.html',
  prefix: '/',
});
```

**Estrutura de pastas esperada**:
```
projeto/
├── back/
│   ├── dist/
│   │   └── src/
│   │       └── main.js  (aqui está __dirname)
│   └── src/
│       └── main.ts
└── public/              (2 níveis acima)
    ├── index.html
    ├── assets/
    └── ...
```

**Explicação dos níveis**:
- `__dirname` aponta para `/projeto/back/dist/src`
- `'..'` sobe para `/projeto/back/dist`
- `'..'` sobe para `/projeto/back`
- `'..'` sobe para `/projeto`
- Final: `/projeto/public`

### [6. Fallback para SPA]()

Garante que React Router funcione corretamente:

```typescript
app.use((req: any, res: any, next: any) => {
  if (!req.path.startsWith('/api')) {
    return res.sendFile(join(publicPath, 'index.html'));
  }
  next();
});
```

**Como funciona**:
- Rota `/api/*` → Processa no backend
- Rota `/products` → Serve `index.html` (React Router assume)
- Rota `/users/123` → Serve `index.html` (React Router assume)

### [7. Validation Pipe]()

Valida automaticamente todos os DTOs:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,                    // Remove propriedades não definidas
    forbidNonWhitelisted: true,         // Erro se houver props extras
    transform: true,                    // Transforma tipos automaticamente
    transformOptions: {
      enableImplicitConversion: false,  // Evita conversão incorreta
    },
  }),
);
```

**Opções**:
- `whitelist: true` - Remove campos não definidos no DTO
- `forbidNonWhitelisted: true` - Retorna erro 400 se houver campo extra
- `transform: true` - Converte tipos (string → number)
- `enableImplicitConversion: false` - Desabilita conversão automática para evitar bugs

### [8. Guards Globais]()

Protege todas as rotas com JWT (exceto as marcadas com `@Public()`):

```typescript
const reflector = app.get(Reflector);
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

### [9. Swagger]()

Documenta a API automaticamente:

```typescript
const config = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('Documentação completa da API')
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
    persistAuthorization: true,  // Mantém token após refresh
    tagsSorter: 'alpha',         // Ordena tags alfabeticamente
    operationsSorter: 'alpha',   // Ordena operações alfabeticamente
  },
});
```

**Acesso**: `http://localhost:3000/api/docs`

### [10. Listen]()

Inicia o servidor HTTP:

```typescript
const port = process.env.PORT ?? 3000;
await app.listen(port);

console.log(`Aplicação rodando na porta ${port}`);
```

## [Configurações Opcionais]()

### [Helmet (Segurança)]()

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet());
```

### [Compressão]()

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

### [Logger Customizado]()

```typescript
import { Logger } from '@nestjs/common';

const app = await NestFactory.create(AppModule, {
  logger: new Logger(),
});
```

## [Variáveis de Ambiente]()

Crie um arquivo `.env` na raiz do backend:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Banco de Dados
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=postgres # usar o banco de dados postgres

# JWT
JWT_SECRET=seu_secret_super_seguro
JWT_EXPIRATION=7d

# API Key
X_API_KEY=sua_api_key_secreta
```

## [Checklist]()

- [ ] NestFactory.create com `NestExpressApplication`
- [ ] Global prefix `/api`
- [ ] **Versionamento habilitado (`VersioningType.URI`) com `defaultVersion: '1'`**
- [ ] CORS habilitado
- [ ] Servir arquivos estáticos (`useStaticAssets`)
- [ ] Fallback SPA para React Router
- [ ] ValidationPipe global
- [ ] Guards globais (JWT)
- [ ] Swagger configurado com Bearer e API Key
- [ ] Porta via variável de ambiente
- [ ] Console.log com URLs úteis

## [Dicas]()

1. **Sempre use `NestExpressApplication`**: Para ter acesso aos métodos do Express
2. **Configure CORS corretamente**: Evite `origin: '*'` em produção
3. **Use variáveis de ambiente**: Nunca hardcode senhas ou secrets
4. **Documente bem o Swagger**: Facilita uso da API
5. **Teste o fallback SPA**: Garanta que React Router funcione
6. **Use helmet em produção**: Aumenta segurança
7. **Configure rate limiting**: Previne abuso da API

## [Referências]()

- [NestJS Application](https://docs.nestjs.com/first-steps)
- [NestJS CORS](https://docs.nestjs.com/security/cors)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
