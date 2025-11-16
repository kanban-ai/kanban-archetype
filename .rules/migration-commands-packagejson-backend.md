# What should be the migration commands in Backend package.json?

> Complete guide for configuring npm scripts to manage TypeORM migrations including generate, create, run, revert, and troubleshooting database schema changes.

## [Necessary Scripts in package.json for Migrations]()

This section presents the essential npm scripts to manage TypeORM migrations including base typeorm script with ts-node and tsconfig-paths support, migration:generate for automatic generation, migration:create for manual creation, migration:run for execution, migration:revert for rollback, migration:show for status, and db:drop for complete database reset. Each script is a shortcut that facilitates executing TypeORM CLI commands in development and production environments.

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

### When to use?

Use these migration scripts when working with TypeORM in NestJS projects that require database schema management. These scripts are essential for any project that needs to track and version database changes through migrations instead of using auto-synchronization.

### When NOT to use?

Don't use TypeORM migration scripts for projects using Prisma, Sequelize, or other ORMs. Also avoid for quick prototypes where schema:sync is acceptable, or when using schema-less databases like MongoDB where migrations aren't typically needed.

### Example

```bash
# Generate migration after creating/modifying entity
npm run migration:generate src/database/migrations/AddEmailToUsers

# Create empty migration for data seeding
npm run migration:create src/database/migrations/SeedInitialRoles

# Run pending migrations
npm run migration:run

# Revert last migration if error occurs
npm run migration:revert
```

### Checklist

- [ ] All migration scripts added to package.json
- [ ] ts-node and tsconfig-paths installed as devDependencies
- [ ] DataSource configuration file created at src/database/database.config.ts
- [ ] Environment variables configured for database connection
- [ ] Migration folder structure created

### Troubleshooting

**Issue**: "Cannot find module" error when running migration commands
**Solution**: Install required dependencies: `npm install -D ts-node tsconfig-paths typescript`

**Issue**: "No migrations found" error
**Solution**: Verify migrations path in database.config.ts matches actual migration folder location. Ensure glob pattern includes both .ts and .js extensions.

### Best Practices

- Always review generated migrations before running them to ensure they match expected schema changes
- Use migration:generate for entity changes and migration:create for data seeds or complex operations
- Never modify executed migrations; create new ones for additional changes to maintain migration history integrity

## [Detailed Description of each Migration Command]()

This section provides detailed documentation for each migration command including migration:generate for automatic schema synchronization based on entity changes, migration:create for manual data seeds and complex alterations, migration:run for executing pending migrations, migration:revert for rollback, migration:show for status listing, and db:drop for complete database reset. Each command includes practical usage examples, when to use guidelines, and expected behavior in development workflow.

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

Step-by-step command sequence for complete migrations workflow covering entity creation, migration generation, migration file review, execution, and error handling. This workflow ensures safe database schema changes by reviewing generated migrations before execution, allowing rollback if errors occur, and maintaining version control of database schema evolution aligned with entity definitions in TypeScript code.

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

### When to use?

Follow this workflow whenever you need to modify database schema by creating or updating entities. This systematic approach ensures safe schema evolution with proper version control, allowing you to track all database changes and rollback if issues occur.

### When NOT to use?

Don't use this workflow for one-off data updates that don't change schema structure, quick prototypes where manual SQL is faster, or when working with NoSQL databases. Also skip for emergency hotfixes where direct SQL execution is necessary.

### Example

```bash
# Complete workflow example: Adding age column to users
# 1. Modify entity
# Add: @Column() age: number; to User entity

# 2. Generate migration
npm run migration:generate src/database/migrations/AddAgeToUsers

# 3. Review generated file to ensure it's correct

# 4. Apply migration
npm run migration:run

# 5. Verify in database
npm run typeorm -- query "SELECT column_name FROM information_schema.columns WHERE table_name='users'"
```

### Checklist

- [ ] Entity changes completed and tested
- [ ] Migration generated with descriptive name
- [ ] Generated migration file reviewed for correctness
- [ ] Down method properly implements rollback
- [ ] Migration executed successfully
- [ ] Database schema verified after execution

### Troubleshooting

**Issue**: Generated migration is empty or incomplete
**Solution**: Ensure entities are properly decorated with TypeORM decorators and DataSource configuration includes correct entity paths. Check if synchronize is set to false.

**Issue**: Migration fails during execution
**Solution**: Review migration SQL for syntax errors, check database permissions, verify foreign key constraints are satisfied, and ensure referenced tables exist.

### Best Practices

- Always create descriptive migration names that clearly indicate what changed (AddEmailToUsers, not Migration1234)
- Review generated migrations before executing them to catch issues early
- Test migrations in development environment before applying to staging or production
- Keep migrations small and focused on single logical changes for easier troubleshooting and rollback

## [DataSource Configuration for TypeORM CLI]()

Essential database.config.ts configuration file that TypeORM CLI requires to connect to database and locate entities and migrations. This DataSource configuration uses ConfigService for environment variables, defines paths to entities and migrations using glob patterns, disables synchronize for safety, and enables logging for visibility. Without this configuration file, migration commands will fail to execute.

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

Required npm packages for TypeORM CLI to execute migrations including ts-node for TypeScript execution, tsconfig-paths for path alias resolution, typescript compiler, typeorm library, and pg PostgreSQL driver. These devDependencies and dependencies must be installed for migration commands to work correctly in development and production environments supporting TypeScript entity files and database connections.

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

Extra npm scripts for advanced database operations including seed script for populating initial data, db:check for testing database connectivity, and db:backup/db:restore for production database backup and restore using pg_dump and psql utilities. These commands facilitate development workflow, testing with realistic data, and disaster recovery procedures for production environments.

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

Integration examples for running migrations automatically in deployment pipelines including GitHub Actions workflow with environment variables from secrets, and Docker container startup script that executes migrations before starting the application. These patterns ensure database schema is always synchronized with application code in staging and production environments, enabling continuous deployment with zero-downtime database updates.

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

Solutions for frequent problems when running migrations including module resolution errors requiring ts-node and tsconfig-paths installation, missing migrations due to incorrect path configuration in database.config.ts, and connection failures caused by invalid or missing environment variables. Each error includes diagnostic steps and specific solutions to quickly resolve migration execution problems in development and production environments.

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

Complete working package.json example including all migration commands properly configured alongside standard NestJS scripts for build, start, and test. This reference configuration demonstrates correct script organization, typeorm base command with ts-node and tsconfig-paths, and all migration operations ready to use in development workflow for generating, creating, running, reverting, and inspecting database migrations.

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

Links to official TypeORM CLI documentation for migrations and NestJS TypeORM integration guide. These resources provide comprehensive information about advanced migration features, configuration options, and best practices for managing database schema evolution in TypeScript applications using TypeORM with NestJS framework.

- [TypeORM Migrations CLI](https://typeorm.io/migrations#creating-a-new-migration)
- [NestJS TypeORM](https://docs.nestjs.com/recipes/sql-typeorm)
