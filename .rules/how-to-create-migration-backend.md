# How to Create Migrations in the Backend

> Complete guide to creating and managing database migrations with TypeORM using pure SQL, ensuring version control, schema evolution, and data integrity.

**IMPORTANT**: All migrations must be written using pure SQL through queryRunner.query, not TypeORM objects like new Table or new TableColumn.

## [What are TypeORM Migrations and why use them]()

Migrations are version-controlled database schema change scripts enabling structured evolution of database structure across environments. They provide rollback capabilities, change history tracking, team synchronization, and automated deployment support for consistent schema management.

## [Available TypeORM CLI Commands for Migrations]()

Comprehensive CLI command reference for migration lifecycle management including creation, automatic generation, execution, rollback, and status checking. These commands form the foundation of database schema version control workflow.

### [Create Empty Migration]()

Generates blank migration file with empty up and down methods for manual SQL implementation. Use this when you need full control over migration logic or when implementing complex schema changes.

```bash
npm run typeorm -- migration:create src/database/migrations/MigrationName
```

### [Generate Automatic Migration]()

```bash
npm run typeorm -- migration:generate src/database/migrations/MigrationName
```

Automatically generates based on differences between entities and database.

### [Run Migrations]()

```bash
npm run typeorm -- migration:run
```

Executes all pending migrations in chronological order.

### [Revert Last Migration]()

```bash
npm run typeorm -- migration:revert
```

Reverts the last executed migration (calls the `down` method).

### [List Migrations]()

```bash
npm run typeorm -- migration:show
```

Shows which migrations have been executed and which are pending.

## [Step by Step to Create Manual Migration]()

Complete workflow for creating manual migrations including file generation with timestamped naming, implementing up method for schema changes, down method for rollback, and executing migrations. This approach provides precise control over database modifications.

### [1. Create the file]()

Generate timestamped migration file ensuring chronological execution order. The timestamp prefix guarantees migrations run sequentially regardless of file system ordering or creation date.

```bash
npm run typeorm -- migration:create src/database/migrations/CreateProductsTable
```

### [2. Implement `up` method]()

The `up` method defines what will be executed when running the migration:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        user_id INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_products_user_id ON products(user_id);
    `);

    await queryRunner.query(`
      ALTER TABLE products
        ADD CONSTRAINT fk_products_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE products;`);
  }
}
```

### [3. Execute the migration]()

```bash
npm run typeorm -- migration:run
```

## [Types of SQL Operations in Migrations]()

Comprehensive catalog of DDL and DML operations for migrations including table creation, column modifications, index management, foreign key constraints, and data seeding. These patterns cover all common schema evolution scenarios.

### [1. Create Table]()

Creates new database table with specified columns, data types, primary keys, and default values. Use SERIAL for auto-incrementing IDs and TIMESTAMPTZ for timezone-aware timestamps.

```typescript
await queryRunner.query(`
  CREATE TABLE table_name (
    id SERIAL PRIMARY KEY,
    field VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
`);
```

### [2. Add Column]()

```typescript
await queryRunner.query(`
  ALTER TABLE table_name
    ADD COLUMN new_column VARCHAR(255);
`);
```

### [3. Remove Column]()

```typescript
await queryRunner.query(`
  ALTER TABLE table_name
    DROP COLUMN column_name;
`);
```

### [4. Modify Column]()

```typescript
await queryRunner.query(`
  ALTER TABLE table_name
    ALTER COLUMN column_name TYPE VARCHAR(500);
`);

// Rename column
await queryRunner.query(`
  ALTER TABLE table_name
    RENAME COLUMN old_name TO new_name;
`);
```

### [5. Create Index]()

```typescript
await queryRunner.query(`
  CREATE INDEX idx_name_field ON table_name(field);
`);
```

### [6. Create Composite Index]()

```typescript
await queryRunner.query(`
  CREATE INDEX idx_field1_field2 ON table_name(field1, field2);
`);
```

### [7. Add Foreign Key]()

```typescript
await queryRunner.query(`
  ALTER TABLE child_table
    ADD CONSTRAINT fk_child_table_parent
    FOREIGN KEY (fk_column)
    REFERENCES parent_table(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
`);
```

### [8. Execute Raw SQL]()

```typescript
await queryRunner.query(`
  UPDATE users
  SET active = true
  WHERE created_at > '2024-01-01';
`);
```

### [9. Insert Data (Seed)]()

```typescript
await queryRunner.query(`
  INSERT INTO sectors (name, description)
  VALUES
    ('Technology', 'Technology sector'),
    ('Financial', 'Financial sector'),
    ('Health', 'Health sector');
`);
```

## [Complete Migration Example to Add Field]()

End-to-end example demonstrating column addition to existing table with proper default value, data type specification, and rollback implementation. This pattern applies to any single-column modification scenario.

### [Migration: Add `active` field to `products` table]()

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveToProducts1234567890001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN active;
    `);
  }
}
```

## [Complete Migration Example to Add Foreign Key]()

Comprehensive foreign key addition example including column creation, constraint definition with cascade rules, index creation for query performance, and complete rollback logic. Demonstrates proper relationship establishment between tables.

### [Migration: Add `category_id` relationship in `products`]()

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToProducts1234567890002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN category_id INT;
    `);

    // Add foreign key
    await queryRunner.query(`
      ALTER TABLE products
        ADD CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    `);

    // Create index for performance
    await queryRunner.query(`
      CREATE INDEX idx_products_category_id ON products(category_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove index
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_products_category_id;
    `);

    // Remove foreign key
    await queryRunner.query(`
      ALTER TABLE products
        DROP CONSTRAINT IF EXISTS fk_products_category;
    `);

    // Remove column
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN category_id;
    `);
  }
}
```

## [Automatic Migrations generated by TypeORM]()

Automated migration generation comparing entity definitions with current database schema to produce synchronization migrations. This approach accelerates development by automatically detecting and scripting schema differences.

### [When to use]()

Use `migration:generate` when:
- You have modified existing entities
- You want to synchronize entities with the database
- You prefer TypeORM to generate the SQL

### [How it works]()

1. **Modify your entities**:

```typescript
@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;

  // New column added
  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;
}
```

2. **Generate the migration**:

```bash
npm run typeorm -- migration:generate src/database/migrations/AddBrandToProducts
```

3. **TypeORM detects the differences** and automatically generates:

```typescript
export class AddBrandToProducts1234567890003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD "brand" character varying(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN "brand"
    `);
  }
}
```

4. **Execute the migration**:

```bash
npm run typeorm -- migration:run
```

## [Best Practices when creating TypeORM Migrations]()

Critical guidelines ensuring safe, reversible, and maintainable migrations including down method implementation, transaction usage, development testing, descriptive naming, single responsibility, data preservation, documentation, English naming, and avoiding database logic.

### [1. Always implement `down()`]()

Allow reverting the migration if necessary:

```typescript
public async down(queryRunner: QueryRunner): Promise<void> {
  // Revert exactly what was done in up()
  await queryRunner.dropTable('table_name');
}
```

### [2. Use transactions]()

Migrations already run in a transaction by default. If it fails, everything is reverted.

### [3. Test in development first]()

```bash
# Execute
npm run typeorm -- migration:run

# Revert if there's a problem
npm run typeorm -- migration:revert

# Fix the migration
# Execute again
npm run typeorm -- migration:run
```

### [4. Name appropriately]()

Use descriptive names:
- ✅ `CreateProductsTable`
- ✅ `AddActiveToUsers`
- ✅ `CreateIndexOnQuotesDate`
- ❌ `Migration1`
- ❌ `UpdateTable`

### [5. One responsibility per migration]()

Don't mix multiple unrelated changes:

❌ **Bad**:
```typescript
// CreateProductsAndCategoriesAndOrders.ts
// Creates 3 different tables in one migration
```

✅ **Good**:
```typescript
// CreateProductsTable.ts
// CreateCategoriesTable.ts
// CreateOrdersTable.ts
```

### [6. Be careful with existing data]()

If adding NOT NULL column to table with data:

```typescript
// Add with nullable first
await queryRunner.query(`
  ALTER TABLE products
    ADD COLUMN category_id INT;
`);

// Fill data
await queryRunner.query(`
  UPDATE products
  SET category_id = 1
  WHERE category_id IS NULL;
`);

// Then make NOT NULL
await queryRunner.query(`
  ALTER TABLE products
    ALTER COLUMN category_id SET NOT NULL;
`);
```

### [7. Document complex migrations]()

```typescript
export class ComplexMigration1234567890004 implements MigrationInterface {
  /**
   * This migration does the following:
   * 1. Adds status column
   * 2. Migrates data from active field to status
   * 3. Removes active column
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Implementation...
  }
}
```

### [8. Use English naming for tables and columns]()

**⚠️ IMPORTANT**: All tables and columns must have names in **English**, following lowercase snake_case.

**❌ DON'T DO**:
```sql
CREATE TABLE produtos (
  id_produto INT PRIMARY KEY,
  nome_produto VARCHAR(255),
  data_criacao TIMESTAMPTZ
);
```

**✅ DO**:
```sql
CREATE TABLE products (
  product_id INT PRIMARY KEY,
  product_name VARCHAR(255),
  created_at TIMESTAMPTZ
);
```

**Reason**: International standardization, compatibility with community conventions, better integration with ORMs and tools.

### [9. NEVER create triggers or functions in the database]()

**IMPORTANT**: All business logic must be in the application (backend), NEVER in the database.

**❌ DON'T DO**:
```typescript
// WRONG - Don't create triggers
await queryRunner.query(`
  CREATE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';
`);

await queryRunner.query(`
  CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`);
```

**✅ DO**:
```typescript
// CORRECT - Logic in application (TypeORM does this automatically)
@UpdateDateColumn({ type: 'timestamptz' })
updated_at: Date;
```

**Reasons not to use triggers/functions:**
- **Difficult maintenance**: Logic scattered between application and database
- **Difficult testing**: Cannot test in isolation
- **Difficult debugging**: "Magic" behaviors in database are hard to track
- **Coupling**: Makes code dependent on specific database
- **Versioning**: Makes business logic version control difficult
- **Portability**: Makes migration to another database difficult

**Allowed exceptions** (only if absolutely necessary):
- Custom constraints via `CHECK CONSTRAINT` (data validation)
- Partial or functional indexes (performance)

## [Troubleshooting - Common Migration Problems]()

Common error scenarios and solutions including migration detection issues, duplicate execution errors, forced re-execution procedures, and database recovery from failed migrations. These patterns help diagnose and resolve migration failures.

### [Migration is not being detected]()

Check `database.config.ts`:
```typescript
migrations: [__dirname + '/migrations/*{.ts,.js}'],
```

### [Error: "Migration has already been executed"]()

```bash
# See which were executed
npm run typeorm -- migration:show

# If necessary, revert
npm run typeorm -- migration:revert
```

### [Force re-execution (CAREFUL!)]()

```bash
# Drop and recreate database
npm run db:drop
npm run typeorm -- migration:run
```

### [Migration broke the database]()

```bash
# Revert
npm run typeorm -- migration:revert

# Fix the file
# Execute again
npm run typeorm -- migration:run
```

## [package.json Scripts for Migrations]()

Essential NPM scripts simplifying migration workflow by providing short commands for creation, generation, execution, rollback, and status checking. Verify these scripts exist in package.json for streamlined migration management.

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show"
  }
}
```

## [Real Migration Example from Project]()

Reference to actual project migrations demonstrating real-world implementation patterns including genesis schema, performance indexes, calculated fields, and feature tables. Review these examples for practical migration patterns.

Existing migrations:
- `1728000000000-genesis.ts` - Initial schema
- `1735466400000-add-quote-optimized-index.ts` - Indexes
- `1738275600000-add-wallet-totals.ts` - Calculated fields
- `1738500000000-create-alerts-table.ts` - Alerts table
- And others...

## [References and TypeORM Migrations official documentation]()

Official TypeORM documentation links covering migration concepts, API reference, and advanced patterns. These resources provide comprehensive framework-specific details beyond this guide.

- [TypeORM Migrations](https://typeorm.io/migrations)
- [Migration API](https://typeorm.io/migrations#migration-api)
