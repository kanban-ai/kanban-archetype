# [What should be the migration commands in Backend package.json?]()

> Configuration of npm scripts to manage TypeORM migrations.

## [Necessary Scripts in package.json for Migrations]()

This section presents the essential npm scripts to manage TypeORM migrations. Each script is a shortcut that facilitates executing commands like generating, creating and running migrations in the project.

List of essential npm scripts to manage TypeORM migrations:

Add to `package.json`:

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show",
    "db:drop": "npm run typeorm -- schema:drop && npm run migration:run"
  }
}
```

## [Detailed Description of each Migration Command]()

This section details each migration command, explaining when to use it, what it does and practical usage examples in daily work.

Complete explanation of each npm script and its parameters:

### [typeorm (Base)]()

```bash
npm run typeorm -- <command>
```

Base script that executes TypeORM CLI with support for:
- TypeScript (ts-node)
- Path aliases (@/*) via tsconfig-paths

### [migration:generate]()

```bash
npm run migration:generate src/database/migrations/MigrationName
```

**What it does**: Generates automatic migration by comparing entities with database

**When to use**:
- After modifying entities
- Add/remove columns
- Modify relationships

**Example**:
```bash
npm run migration:generate src/database/migrations/AddActiveToProducts
```

### [migration:create]()

```bash
npm run migration:create src/database/migrations/MigrationName
```

**What it does**: Creates empty migration for manual implementation

**When to use**:
- Data seeds
- Complex alterations
- Custom indexes
- Specific SQL queries

**Example**:
```bash
npm run migration:create src/database/migrations/SeedSectors
```

### [migration:run]()

```bash
npm run migration:run
```

**What it does**: Executes all pending migrations in order

**When to use**:
- After creating/generating migrations
- New environment setup
- Production deployment

### [migration:revert]()

```bash
npm run migration:revert
```

**What it does**: Reverts the last executed migration

**When to use**:
- Fix migration with error
- Rollback a change

**Note**: Executes the migration's `down()` method

### [migration:show]()

```bash
npm run migration:show
```

**What it does**: Lists executed and pending migrations

**Output**:
```
[X] Migration1728000000000-genesis
[X] Migration1735466400000-add-quote-optimized-index
[ ] Migration1738500000000-create-alerts-table
```

### [db:drop]()

```bash
npm run db:drop
```

**What it does**: Drops entire schema and recreates by running migrations

**When to use**:
- Complete database reset
- Local development
- Testing

**WARNING**: Deletes all data!

## [Workflow to create and apply Migrations]()

Command sequence for complete migrations workflow:

### [1. Create new entity]()

```typescript
// src/modules/product/entities/product.entity.ts
@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;
}
```

### [2. Generate migration]()

```bash
npm run migration:generate src/database/migrations/CreateProductsTable
```

### [3. Review generated migration]()

```typescript
// src/database/migrations/1234567890000-CreateProductsTable.ts
export class CreateProductsTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(/* ... */);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}
```

### [4. Execute migration]()

```bash
npm run migration:run
```

### [5. If there's an error]()

```bash
# Revert
npm run migration:revert

# Fix file
# Execute again
npm run migration:run
```

## [DataSource Configuration for TypeORM CLI]()

database.config.ts file necessary for migration commands:

For commands to work, configure `database.config.ts`:

```typescript
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  synchronize: false,
  logging: true,
});
```

## [Necessary Dependencies to run Migrations]()

Required npm packages for TypeORM CLI to work:

```json
{
  "devDependencies": {
    "ts-node": "^10.x",
    "tsconfig-paths": "^4.x",
    "typescript": "^5.x"
  },
  "dependencies": {
    "typeorm": "^0.3.x",
    "pg": "^8.x"
  }
}
```

## [Additional Useful Scripts for development]()

Extra commands for seeding, backup and migration verification:

### [Data Seed]()

```json
{
  "scripts": {
    "seed": "ts-node -r tsconfig-paths/register src/database/seeds/run.ts"
  }
}
```

### [Check Connection]()

```json
{
  "scripts": {
    "db:check": "npm run typeorm -- query 'SELECT NOW()'"
  }
}
```

### [Backup/Restore (Production)]()

```json
{
  "scripts": {
    "db:backup": "pg_dump -h $DB_HOST -U $DB_USERNAME $DB_DATABASE > backup.sql",
    "db:restore": "psql -h $DB_HOST -U $DB_USERNAME $DB_DATABASE < backup.sql"
  }
}
```

## [CI/CD Integration for automatic Migrations]()

How to run migrations in GitHub Actions pipelines and Docker:

### [GitHub Actions]()

```yaml
# .github/workflows/deploy.yml
- name: Run Migrations
  run: npm run migration:run
  env:
    DB_HOST: ${{ secrets.DB_HOST }}
    DB_USERNAME: ${{ secrets.DB_USERNAME }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

### [Docker]()

```dockerfile
# Dockerfile
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]
```

## [Troubleshooting - Common Migration command errors]()

Solutions for frequent problems when running migrations:

### [Error: "Cannot find module"]()

**Solution**: Install `ts-node` and `tsconfig-paths`

```bash
npm install -D ts-node tsconfig-paths
```

### [Error: "No migrations found"]()

**Solution**: Check path in `database.config.ts`:

```typescript
migrations: [__dirname + '/migrations/*{.ts,.js}']
```

### [Migrations don't execute]()

**Solution**: Check environment variables:

```bash
echo $DB_HOST
echo $DB_USERNAME
```

## [Complete package.json Example with all scripts]()

Complete package.json with all migration commands configured:

```json
{
  "name": "backend",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",

    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show",
    "db:drop": "npm run typeorm -- schema:drop && npm run migration:run",

    "test": "jest",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
  }
}
```

## [References and TypeORM CLI documentation]()

Links to official TypeORM CLI documentation:

- [TypeORM Migrations CLI](https://typeorm.io/migrations#creating-a-new-migration)
- [NestJS TypeORM](https://docs.nestjs.com/recipes/sql-typeorm)
