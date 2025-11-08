# [Como iniciar/fazer setup do backend (0-setup)]()

> Guia para configurar o projeto backend NestJS + TypeORM do zero

## [Visão Geral]()

Este guia mostra como criar e configurar um projeto backend NestJS com TypeORM a partir do zero, incluindo todas as configurações necessárias para iniciar o desenvolvimento.

## [Pré-requisitos]()

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- npm ou yarn

## [Passo a Passo]()

### [1. Criar projeto NestJS]()

```bash
# Instalar Nest CLI globalmente (se ainda não tiver)
npm install -g @nestjs/cli

# Criar projeto na subpasta backend
nest new backend

# Entrar na pasta do backend
cd backend
```

**Opções na criação:**
- Gerenciador de pacotes: `npm` ou `yarn`

### [2. Instalar dependências necessárias]()

```bash
# TypeORM e PostgreSQL
npm install @nestjs/typeorm typeorm pg

# Autenticação
npm install @nestjs/passport passport @nestjs/jwt passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt

# Validação
npm install class-validator class-transformer

# Configuração
npm install @nestjs/config

# Swagger (documentação)
npm install @nestjs/swagger

# Utilitários
npm install axios dayjs
```

### [3. Configurar tsconfig.json]()

Editar `backend/tsconfig.json` para adicionar path aliases:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Benefício dos paths:**
- Importações mais limpas: `import { User } from '@/modules/user/entities/user.entity'`
- Em vez de: `import { User } from '../../../modules/user/entities/user.entity'`

### [4. Criar estrutura de pastas]()

```bash
# Dentro de backend/src
mkdir -p modules/user
mkdir -p modules/auth
mkdir -p config
mkdir -p common/decorators
mkdir -p common/guards
mkdir -p common/filters
mkdir -p database/migrations
mkdir -p database/entities
```

**Estrutura resultante:**
```
backend/
├── src/
│   ├── modules/          # Módulos de negócio
│   │   ├── user/
│   │   └── auth/
│   ├── config/           # Configurações
│   ├── common/           # Código compartilhado
│   │   ├── decorators/
│   │   ├── guards/
│   │   └── filters/
│   ├── database/
│   │   ├── migrations/   # Migrations do TypeORM
│   │   └── entities/     # SuperEntity (centralizada)
│   ├── app.module.ts
│   └── main.ts
├── tsconfig.json
└── package.json
```

### [Organização de Entities]()

- **SuperEntity**: `src/database/entities/super.entity.ts` (centralizada)
- **Outras entities**: dentro de cada módulo em `src/modules/[nome]/entities/`

### [5. Criar arquivo .env]()

Criar `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=sdd_dev

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# API Key (opcional)
X_API_KEY=your-api-key-for-integrations
```

**⚠️ Importante:**
- Nunca commitar o `.env` no git
- Criar `.env.example` com valores de exemplo

### [6. Configurar database.config.ts]()

Criar `backend/src/config/database.config.ts`:

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: +configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // NUNCA true em produção
  logging: configService.get('NODE_ENV') === 'development',
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: false,
});

// DataSource para migrations CLI
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sdd_dev',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
};

export const dataSource = new DataSource(dataSourceOptions);
```

### [7. Adicionar scripts no package.json]()

Editar `backend/package.json` para adicionar scripts de migration:

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli -d src/config/database.config.ts",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show"
  }
}
```

**Dependências adicionais para migrations:**
```bash
npm install -D ts-node tsconfig-paths
```

### [8. Configurar app.module.ts]()

Editar `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@/config/database.config';

@Module({
  imports: [
    // Configuração global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Seus módulos aqui
    // UserModule,
    // AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```


## [Próximos Passos]()

1. ✅ Setup básico concluído
2. ➡️ [Configurar main.ts e finalizar setup](./como-criar-api-backend.md)
3. ➡️ [Criar módulo User](./como-criar-api-backend.md)
4. ➡️ [Criar sistema de autenticação](./como-deve-funcionar-autenticacao.md)

## [Referências]()

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Como criar API Backend](./como-criar-api-backend.md)
- [Como funciona autenticação](./como-deve-funcionar-autenticacao.md)

---

**Arquivo**: `.rules/como-iniciar-fazer-0-setup-do-backend.md`
