# [How to setup the backend (from scratch)]()

> Guide to configure a NestJS + TypeORM backend project from scratch

## [Overview]()

This guide shows how to create and configure a NestJS backend project with TypeORM from scratch, including all necessary configurations to start development.

## [Prerequisites]()

- Node.js 18+ installed
- PostgreSQL installed and running
- npm or yarn

## [Step by Step]()

Detailed sequence of commands and configurations to create a complete NestJS backend project from scratch.

### [1. Create NestJS project]()

```bash
# Install Nest CLI globally (if you don't have it yet)
npm install -g @nestjs/cli

# Create project in backend subfolder
nest new backend

# Enter backend folder
cd backend
```

**Options during creation:**
- Package manager: `npm` or `yarn`

### [2. Install necessary dependencies]()

```bash
# TypeORM and PostgreSQL
npm install @nestjs/typeorm typeorm pg

# Authentication
npm install @nestjs/passport passport @nestjs/jwt passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt

# Validation
npm install class-validator class-transformer

# Configuration
npm install @nestjs/config

# Swagger (documentation)
npm install @nestjs/swagger

# Utilities
npm install axios dayjs
```

### [3. Configure tsconfig.json]()

Edit `backend/tsconfig.json` to add path aliases:

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

**Path benefits:**
- Cleaner imports: `import { User } from '@/modules/user/entities/user.entity'`
- Instead of: `import { User } from '../../../modules/user/entities/user.entity'`

### [4. Create folder structure]()

```bash
# Inside backend/src
mkdir -p modules/user
mkdir -p modules/auth
mkdir -p config
mkdir -p common/decorators
mkdir -p common/guards
mkdir -p common/filters
mkdir -p database/migrations
mkdir -p database/entities
```

**Resulting structure:**
```
backend/
├── src/
│   ├── modules/          # Business modules
│   │   ├── user/
│   │   └── auth/
│   ├── config/           # Configurations
│   ├── common/           # Shared code
│   │   ├── decorators/
│   │   ├── guards/
│   │   └── filters/
│   ├── database/
│   │   ├── migrations/   # TypeORM migrations
│   │   └── entities/     # SuperEntity (centralized)
│   ├── app.module.ts
│   └── main.ts
├── tsconfig.json
└── package.json
```

### [Entity Organization]()

- **SuperEntity**: `src/database/entities/super.entity.ts` (centralized)
- **Other entities**: inside each module at `src/modules/[name]/entities/`

### [5. Create .env file]()

Create `backend/.env`:

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

# API Key (optional)
X_API_KEY=your-api-key-for-integrations
```

**⚠️ Important:**
- Never commit `.env` to git
- Create `.env.example` with sample values

### [6. Configure database.config.ts]()

Create `backend/src/config/database.config.ts`:

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
  synchronize: false, // NEVER true in production
  logging: configService.get('NODE_ENV') === 'development',
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: false,
});

// DataSource for migrations CLI
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

### [7. Add scripts to package.json]()

Edit `backend/package.json` to add migration scripts:

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

**Additional dependencies for migrations:**
```bash
npm install -D ts-node tsconfig-paths
```

### [8. Configure app.module.ts]()

Edit `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@/config/database.config';

@Module({
  imports: [
    // Global configuration
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

    // Your modules here
    // UserModule,
    // AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```


## [Next Steps]()

1. ✅ Basic setup completed
2. ➡️ [Configure main.ts and finish setup](./how-to-create-api-backend.md)
3. ➡️ [Create User module](./how-to-create-api-backend.md)
4. ➡️ [Create authentication system](./how-authentication-works.md)

## [References]()

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [How to create Backend API](./how-to-create-api-backend.md)
- [How authentication works](./how-authentication-works.md)

---

**File**: `.rules/how-to-setup-backend.md`
