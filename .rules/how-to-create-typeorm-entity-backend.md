# How to Create TypeORM Entities

<document description: Comprehensive guide for creating TypeORM entities with relationships, soft delete, proper naming conventions, and PostgreSQL column types in NestJS backend applications.>

## [TypeORM Entity Fundamentals and Purpose]()

Entities are TypeScript classes providing object-relational mapping between application code and PostgreSQL tables. Each entity class represents a table structure with typed properties mapping to columns, enabling type-safe database operations, automatic query generation, and maintaining strong typing throughout the application stack.

### When to use?
Use TypeORM entities when you need to represent database tables as TypeScript classes with automatic CRUD operations, relationship management, and type safety. Essential for any NestJS backend application using PostgreSQL as the database layer.

### When NOT to use?
Avoid creating entities for temporary data structures, API responses that don't map to tables, utility classes without database persistence, or when using raw SQL queries exclusively without ORM benefits.

## [Entity Location in the NestJS project]()

Entity organization follows modular architecture with entities residing within their respective module folders rather than centralized location. Only SuperEntity base class is centralized in database folder, ensuring each module maintains its own domain models for better encapsulation, separation of concerns, and module independence.

### When to use?
Use modular entity organization when building scalable NestJS applications where each business domain (products, users, orders) should maintain its own data models independently from other modules.

### When NOT to use?
Avoid this pattern for very small applications with only 1-2 entities where centralized entity folder might be simpler, or when creating shared base entities like SuperEntity that all modules inherit.

### Example
```
src/
├── database/
│   └── entities/
│       └── super.entity.ts          # ← Only centralized entity
└── modules/
    ├── products/
    │   └── entities/
    │       └── product.entity.ts    # ← Products module entity
    └── categories/
        └── entities/
            └── category.entity.ts   # ← Categories module entity
```

### Checklist
- [ ] SuperEntity exists in database/entities folder
- [ ] Each module has its own entities folder
- [ ] Entity files use kebab-case with .entity.ts suffix
- [ ] No business entities in central database/entities folder

### Troubleshooting
**Issue**: Import errors when accessing entities across modules
**Solution**: Export entity in module's index.ts and import through module path, not direct file path

**Issue**: Circular dependency between entities
**Solution**: Use string-based relationship references like `() => Product` instead of direct imports

### Best Practices
Always keep SuperEntity and SoftDeletableEntity centralized while placing business entities in their respective modules. Use barrel exports (index.ts) to simplify imports. Follow consistent folder structure across all modules.

## [Basic TypeORM Entity Structure in NestJS]()

Standard entity implementation patterns using SuperEntity for automatic ID and timestamps or SoftDeletableEntity for soft delete capability. These base classes provide consistent behavior across all entities while reducing boilerplate code, ensuring timestamp handling consistency, and maintaining database best practices with timestamptz column types.

### When to use?
Use basic entity structure extending SuperEntity when creating standard database tables that need automatic ID generation, created_at and updated_at timestamps, without requiring soft delete functionality or complex custom configurations.

### When NOT to use?
Don't use SuperEntity when you need soft delete capability (use SoftDeletableEntity instead), when entity requires custom primary key strategy, or when working with legacy databases with non-standard ID patterns.

### Example
```typescript
import { Entity, Column } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';

@Entity('products') // Table: snake_case, lowercase, plural
export class Product extends SuperEntity { // Class: PascalCase, singular
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;
}
```

**SuperEntity provides:**
- Automatic `id` field (primary key, auto-increment)
- Automatic `created_at` timestamp (timestamptz)
- Automatic `updated_at` timestamp (timestamptz)
- Extends TypeORM BaseEntity for Active Record pattern

**Note**: Notice that the class is `Product` (singular, PascalCase) but the table is `'products'` (plural, snake_case, lowercase).

### Checklist
- [ ] Entity class extends SuperEntity
- [ ] Entity decorator uses snake_case plural table name
- [ ] Class name is PascalCase singular
- [ ] All columns use explicit type definitions
- [ ] Column names follow snake_case convention
- [ ] Proper column constraints (length, precision, default)

### Troubleshooting
**Issue**: Timestamps not auto-updating
**Solution**: Ensure entity extends SuperEntity and uses @UpdateDateColumn decorator correctly. Verify timestamptz type is used, not timestamp.

**Issue**: Table name mismatch in database
**Solution**: Check @Entity decorator has correct table name in snake_case. Run migrations to sync schema.

### Best Practices
Always extend SuperEntity for new entities to maintain consistency. Use explicit column types and constraints. Follow naming conventions strictly: PascalCase for classes, snake_case for tables and columns, English names throughout.

### [SuperEntity (Base Class)]()

All entities must extend `SuperEntity`:

```typescript
export abstract class SuperEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

**IMPORTANT**: Always use `timestamptz` (not `timestamp with time zone`) in TypeORM entities.

**Advantages**:
- Automatic ID
- Automatic timestamps (created_at, updated_at)
- Consistent pattern across entire project

### [SoftDeletableEntity (Soft Delete)]()

For entities that need soft delete, use `SoftDeletableEntity` which extends `SuperEntity`:

```typescript
export abstract class SoftDeletableEntity extends SuperEntity {
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date;
}
```

**IMPORTANT**: Always use `timestamptz` (not `timestamp with time zone`) in TypeORM entities.

**When to use**:
- When you need to keep history of deleted records
- When deletion should be reversible
- For auditing and compliance

**How to use**:
```typescript
import { Entity, Column } from 'typeorm';
import { SoftDeletableEntity } from '@database/entities/soft-deletable.entity';

@Entity('products')
export class Product extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
```

## [Column Types available in TypeORM]()

Comprehensive catalog of PostgreSQL data types supported by TypeORM including text types for strings, numeric types for integers and decimals, boolean flags, timestamp types for dates, and JSONB for flexible data structures. Proper type selection ensures data integrity and query performance.

### When to use?
Use appropriate column types when defining entity properties to match PostgreSQL data types, ensure data validation at database level, optimize storage and performance, and maintain type safety between application and database layers.

### When NOT to use?
Avoid using column types that don't match your data needs (e.g., text for short strings, varchar for large content, float for monetary values). Don't use generic 'any' types when specific TypeScript types provide better safety.

### Example
See subsections below for specific type examples (Text, Numbers, Boolean, Date/Time, JSON).

### Checklist
- [ ] varchar with explicit length for short strings
- [ ] text for long content without length limit
- [ ] decimal with precision and scale for monetary values
- [ ] int for whole numbers
- [ ] boolean for true/false flags
- [ ] timestamptz for dates with timezone
- [ ] jsonb for flexible JSON data

### Troubleshooting
**Issue**: Precision loss with monetary values
**Solution**: Use decimal type with explicit precision and scale, never use float for money.

**Issue**: Timezone inconsistencies
**Solution**: Always use timestamptz instead of timestamp or date for datetime values.

### Best Practices
Choose the most restrictive type that fits your data. Use varchar with appropriate length limits for validation. Always use decimal for monetary values. Prefer timestamptz over timestamp for timezone support. Use jsonb over json for better performance.

### [Text]()

```typescript
// Short string
@Column({ type: 'varchar', length: 255 })
name: string;

// Long text
@Column({ type: 'text', nullable: true })
description: string;
```

### [Numbers]()

```typescript
// Integer
@Column({ type: 'int' })
quantity: number;

// Decimal (for prices, monetary values)
@Column({ type: 'decimal', precision: 10, scale: 2 })
price: number;

// Float
@Column({ type: 'float' })
percentage: number;
```

### [Boolean]()

```typescript
@Column({ type: 'boolean', default: true })
active: boolean;
```

### [Date/Time]()

```typescript
@Column({ type: 'timestamptz', nullable: true })
lastLoginAt: Date;

@Column({ type: 'date', nullable: true })
birthDate: Date;
```

### [JSON]()

```typescript
@Column({ type: 'jsonb', nullable: true })
metadata: any;
```

## [Relationships between TypeORM Entities]()

Relationship implementation using TypeORM decorators to define foreign keys and associations between entities. Supports many-to-one, one-to-many, and many-to-many patterns with automatic join handling, eager loading capabilities, and bidirectional navigation between related entities.

### When to use?
Use TypeORM relationships when entities have associations in the database (foreign keys), when you need to fetch related data automatically, navigate between related objects in code, or maintain referential integrity through ORM instead of raw SQL joins.

### When NOT to use?
Avoid defining relationships for temporary associations, denormalized data, cross-database references, or when manual join queries provide better performance for specific use cases. Don't create bidirectional relationships unless navigation from both sides is actually needed.

### Example
See subsections below for ManyToOne, OneToMany, and ManyToMany relationship patterns.

### Checklist
- [ ] Relationship decorator matches cardinality (@ManyToOne, @OneToMany, @ManyToMany)
- [ ] @JoinColumn used on the owner side with explicit name
- [ ] Separate ID field added alongside relationship for easier queries
- [ ] Lazy/eager loading strategy considered
- [ ] Cascade options configured appropriately
- [ ] Bidirectional relationships properly configured on both sides

### Troubleshooting
**Issue**: Circular dependency errors between entities
**Solution**: Use lazy imports with arrow functions `() => Product` in relationship decorators.

**Issue**: Foreign key not created in database
**Solution**: Ensure @JoinColumn is on the correct side (ManyToOne side) and migrations are run.

**Issue**: Related data not loading
**Solution**: Add `relations: ['relationName']` in find options or use eager loading.

### Best Practices
Always add explicit column name in @JoinColumn using snake_case. Include separate ID field for relationships to simplify queries without joins. Use lazy loading by default, eager only when always needed. Avoid circular eager loading. Document relationship purpose with comments.

### [Many-to-One (N:1)]()

Example: Multiple products belong to one user

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { User } from '@/auth/entities/user.entity';

@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;

  // Relationship
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // FK column (facilitates queries)
  @Column({ type: 'int', name: 'user_id' })
  userId: number;
}
```

### [One-to-Many (1:N)]()

Example: One user has multiple products

```typescript
import { OneToMany } from 'typeorm';
import { Product } from '@/modules/products/entities/product.entity';

@Entity('users')
export class User extends SuperEntity {
  @Column()
  name: string;

  @OneToMany(() => Product, product => product.user)
  products: Product[];
}
```

### [Many-to-Many (N:N)]()

Example: Products have multiple categories, categories have multiple products

```typescript
import { ManyToMany, JoinTable } from 'typeorm';
import { Category } from '@/modules/categories/entities/category.entity';

@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'category_id' },
  })
  categories: Category[];
}
```

## [Advanced TypeORM Entity Features]()

Advanced entity configuration including index creation for query optimization, unique constraints for data integrity, default values for column initialization, nullable fields, enum types for fixed sets, field exclusion for sensitive data, and soft delete implementation for recoverable deletions.

### When to use?
Use advanced features when you need database-level optimizations (indexes), data integrity constraints (unique), default initialization values, optional fields, controlled vocabularies (enums), sensitive data protection, or soft delete functionality for audit trails.

### When NOT to use?
Avoid premature optimization with indexes before performance issues are identified. Don't use unique constraints when business logic requires duplicates. Skip default values when null represents meaningful state. Don't overuse enums for frequently changing value sets.

### Example
See subsections below for specific advanced features (Indexes, Unique Constraints, Default Values, Enums, etc.).

### Checklist
- [ ] Indexes created on frequently queried columns
- [ ] Unique constraints match business rules
- [ ] Default values set where appropriate
- [ ] Nullable properly configured for optional fields
- [ ] Enums used for fixed value sets
- [ ] Sensitive fields marked with @Exclude
- [ ] Soft delete via SoftDeletableEntity when needed

### Troubleshooting
**Issue**: Slow queries on large tables
**Solution**: Add @Index on columns used in WHERE, JOIN, or ORDER BY clauses.

**Issue**: Duplicate constraint violations
**Solution**: Add unique constraints or composite unique indexes on columns that must be unique.

**Issue**: Sensitive data exposed in API responses
**Solution**: Use @Exclude decorator from class-transformer on password and token fields.

### Best Practices
Create indexes on foreign keys and frequently searched columns. Use composite indexes for multi-column queries. Always exclude sensitive fields from serialization. Use enums for status fields. Apply default values at database level for consistency. Mark truly optional fields as nullable.

### [Indexes]()

```typescript
import { Entity, Column, Index } from 'typeorm';

@Entity('products')
@Index(['name', 'userId']) // Composite index
export class Product extends SuperEntity {
  @Column()
  @Index() // Simple index
  name: string;

  @Column()
  userId: number;
}
```

### [Unique Constraints]()

```typescript
@Column({ type: 'varchar', length: 255, unique: true })
email: string;

// Or composite unique
@Entity('products')
@Index(['code', 'userId'], { unique: true })
export class Product extends SuperEntity {
  @Column()
  code: string;

  @Column()
  userId: number;
}
```

### [Default Values]()

```typescript
@Column({ type: 'boolean', default: true })
active: boolean;

@Column({ type: 'int', default: 0 })
viewCount: number;

@Column({ type: 'varchar', length: 50, default: 'pending' })
status: string;
```

### [Optional Columns]()

```typescript
@Column({ nullable: true })
middleName: string;

@Column({ type: 'text', nullable: true })
bio: string;
```

### [Enums]()

```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

@Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
role: UserRole;
```

### [Field Exclusion (Sensitive Data)]()

```typescript
import { Exclude } from 'class-transformer';

@Entity('users')
export class User extends SuperEntity {
  @Column()
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude() // Never return to client
  passwordHash: string;
}
```

### [Soft Delete]()

To implement soft delete, your entity must extend `SoftDeletableEntity` instead of `SuperEntity`:

```typescript
import { Entity, Column } from 'typeorm';
import { SoftDeletableEntity } from '@database/entities/soft-deletable.entity';

@Entity('products')
export class Product extends SoftDeletableEntity {
  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
```

**In the service**, use TypeORM's native methods for soft delete:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
  ) {}

  // Soft delete using native method
  async softDelete(id: number) {
    return await this.repository.softDelete(id);
  }

  // Restore deleted record
  async restore(id: number) {
    return await this.repository.restore(id);
  }

  // List only non-deleted records (default)
  async findAll() {
    return await this.repository.find({
      order: { created_at: 'DESC' }
    });
  }

  // List including deleted
  async findAllWithDeleted() {
    return await this.repository.find({
      withDeleted: true,
      order: { created_at: 'DESC' }
    });
  }

  // List only deleted
  async findOnlyDeleted() {
    return await this.repository
      .createQueryBuilder('product')
      .withDeleted()
      .where('product.deleted_at IS NOT NULL')
      .getMany();
  }
}
```

**Important**: When you use `SoftDeletableEntity`, TypeORM automatically:
- Excludes deleted records from queries by default
- Uses `softDelete()` and `softRemove()` instead of permanently deleting
- Provides `withDeleted: true` option to include deleted records

## [Entity Naming Conventions in the Project]()

Standardized naming conventions ensuring consistency across the codebase with PascalCase for entity classes, snake_case for database tables and columns, English naming for international compatibility, and proper singular/plural usage following TypeScript and PostgreSQL best practices.

### When to use?
Always follow these naming conventions for every entity, table, column, and file in the project to maintain consistency, improve readability, enable international collaboration, and align with TypeScript/PostgreSQL community standards.

### When NOT to use?
Never deviate from these conventions. These are mandatory project standards. Do not use Portuguese names, camelCase for tables/columns, or inconsistent casing patterns.

### Example
See table below and complete example demonstrating all naming conventions.

### Checklist
- [ ] Entity class is PascalCase singular (e.g., Product, UserProfile)
- [ ] Table name is snake_case lowercase plural in English (e.g., products, user_profiles)
- [ ] Column names are snake_case lowercase in English (e.g., user_id, created_at)
- [ ] File name is kebab-case singular with .entity.ts (e.g., product.entity.ts)
- [ ] No Portuguese names anywhere in entities
- [ ] Foreign keys end with _id suffix
- [ ] Timestamp columns use standard names (created_at, updated_at, deleted_at)

### Troubleshooting
**Issue**: Query builder errors with column names
**Solution**: Ensure all column names use snake_case, not camelCase. Check migrations match entity definitions.

**Issue**: Inconsistent naming across team
**Solution**: Enforce conventions through code review and linting. Reference this guide.

### Best Practices
Use descriptive English names that clearly indicate purpose. Maintain consistency between entity property names (camelCase) and column names (snake_case). Use @Column({ name: 'snake_case_name' }) when TypeScript property differs. Follow PostgreSQL naming conventions for better tool support.

### [Naming]()

| Element | Convention | Rules | Example |
|---------|-----------|-------|---------|
| Entity Class | PascalCase | Singular | `Product`, `UserProfile` |
| Database Table | snake_case | Lowercase + Plural + **English** | `products`, `user_profiles` |
| Column | snake_case | Lowercase + **English** | `user_id`, `created_at` |
| File | kebab-case | Singular + `.entity.ts` | `product.entity.ts` |

**Naming Rules:**
- **Entity (class)**: Always in **PascalCase** and **singular** (e.g. `Product`, `User`, `Category`)
- **Table (database)**: Always in **lowercase snake_case** and **plural** and in **English** (e.g. `products`, `users`, `categories`)
- **Columns**: Always in **lowercase snake_case** and in **English** (e.g. `created_at`, `user_id`, `product_name`)
- **File**: Always in **kebab-case** in **singular** with `.entity.ts` suffix (e.g. `product.entity.ts`)

**⚠️ IMPORTANT - Language:**
- **Tables and columns**: ALWAYS in **English** (e.g. `products`, `user_id`, `created_at`)
- **Avoid**: Names in Portuguese like `produtos`, `id_usuario`, `data_criacao`
- **Reason**: International standardization, compatibility with community conventions, better integration with ORMs and tools

### [Complete Example]()

```typescript
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SuperEntity } from '@database/entities/super.entity';
import { User } from '@/auth/entities/user.entity';
import { Category } from '@/modules/categories/entities/category.entity';

@Entity('products')
@Index(['code', 'userId'], { unique: true })
export class Product extends SuperEntity {
  // Basic fields
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Numeric values
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  // Status
  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Relationship with User
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  // Relationship with Category
  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'int', nullable: true, name: 'category_id' })
  categoryId: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  @Exclude()
  internalData: any;
}
```

## [Register Entity in NestJS Module]()

Entity registration process using TypeOrmModule.forFeature to make entities available for dependency injection within modules. Proper registration enables repository access in services and ensures TypeORM tracks the entity for migrations and query building.

### When to use?
Register every entity immediately after creation in the module where it belongs using TypeOrmModule.forFeature([Entity]). Required for dependency injection, repository access, and proper TypeORM functionality including migrations.

### When NOT to use?
Don't register entities in modules that don't use them directly. Avoid registering same entity in multiple modules - instead export the service/repository from owning module and import that module elsewhere.

### Example
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // Register here
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
```

### Checklist
- [ ] Entity imported in module file
- [ ] Entity added to TypeOrmModule.forFeature array
- [ ] Module exports service if other modules need access
- [ ] Controller registered in controllers array
- [ ] Service registered in providers array

### Troubleshooting
**Issue**: "Repository not found" error
**Solution**: Ensure entity is registered in TypeOrmModule.forFeature in the module where repository is injected.

**Issue**: Circular dependency between modules
**Solution**: Use forwardRef or restructure to have one module own the entity and others import it.

### Best Practices
Register entities only in their owning module. Export the service rather than registering entity in multiple modules. Keep module lean by importing only required entities. Document why shared entities are exported.

## [Use Entity in Service with Repository Pattern]()

Repository pattern implementation for database operations using dependency injection to access TypeORM repositories. Repositories provide type-safe methods for querying, inserting, updating, and deleting records with support for relations, ordering, and complex queries.

### When to use?
Use repository pattern in services when performing database operations like create, read, update, delete. Inject repositories via @InjectRepository for type-safe data access and leverage TypeORM's query builder for complex queries.

### When NOT to use?
Don't inject repositories directly in controllers - use services as intermediary layer. Avoid repository pattern for simple data transformations or business logic without database interaction.

### Example
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
  ) {}

  async findAll() {
    return await this.repository.find({
      relations: ['user', 'category'],
      where: { active: true },
      order: { created_at: 'DESC' },
    });
  }

  async create(data: any) {
    const product = this.repository.create(data);
    return await this.repository.save(product);
  }
}
```

### Checklist
- [ ] Repository injected via @InjectRepository decorator
- [ ] Repository type matches entity (Repository<Product>)
- [ ] Service marked with @Injectable decorator
- [ ] Relations specified when needed in find options
- [ ] Proper error handling for database operations
- [ ] Transactions used for multi-step operations

### Troubleshooting
**Issue**: Repository is undefined in service
**Solution**: Ensure entity is registered in module's TypeOrmModule.forFeature and service is in providers array.

**Issue**: Relations not loading
**Solution**: Add `relations: ['relationName']` to find options or use query builder with leftJoinAndSelect.

### Best Practices
Always inject repositories through constructor for testability. Use repository.create() before repository.save() for proper entity instantiation. Leverage query builder for complex queries. Handle errors appropriately with try-catch. Use transactions for operations that must succeed or fail together.

## [Important Tips when working with TypeORM Entities]()

Critical best practices for entity development including proper base class selection, timestamptz usage for dates, snake_case for columns, explicit foreign key naming, separate ID fields for relations, sensitive data exclusion, index creation, nullable fields, and avoiding manual deleted_at.

### When to use?
Review these tips before creating any new entity, during code reviews, when troubleshooting entity-related issues, or when optimizing existing entity definitions for better performance and maintainability.

### When NOT to use?
These are general guidelines - some may not apply to legacy database integrations or specific edge cases. Use judgment when working with constraints beyond your control.

### Example
See numbered tips below demonstrating critical entity development patterns.

### Checklist
- [ ] Correct base class chosen (SuperEntity vs SoftDeletableEntity)
- [ ] All timestamps use timestamptz type
- [ ] Column names in snake_case
- [ ] Explicit name in @JoinColumn for foreign keys
- [ ] Separate ID fields added for relationships
- [ ] Sensitive data marked with @Exclude
- [ ] Indexes on frequently queried columns
- [ ] Nullable set appropriately for optional fields
- [ ] No manual deleted_at (use SoftDeletableEntity)

### Troubleshooting
**Issue**: Best practices being ignored by team
**Solution**: Implement automated linting rules, code review checklist, and reference this guide in PR templates.

**Issue**: Legacy database doesn't follow conventions
**Solution**: Use @Column({ name: 'legacy_name' }) to map between code conventions and database reality.

### Best Practices
Treat these tips as mandatory project standards, not suggestions. Automate enforcement where possible through linting and testing. Document any intentional deviations with clear reasoning.

**Key Tips:**

1. **Choose the correct base class**:
   - `SuperEntity`: For normal entities (without soft delete)
   - `SoftDeletableEntity`: For entities that need soft delete
2. **Always use `timestamptz` for dates**: NEVER use `timestamp with time zone` in TypeORM entities
3. **Use snake_case for column names**: PostgreSQL convention
4. **Specify `name` in @JoinColumn**: Explicit FK control
5. **Add separate ID field from relation**: Facilitates queries (`userId` in addition to `user`)
6. **Use @Exclude for sensitive data**: Passwords, tokens, etc
7. **Create indexes on frequently queried columns**: Performance
8. **Use `nullable: true` when appropriate**: Avoid unnecessary constraints
9. **Don't add deleted_at manually**: If you need soft delete, use `SoftDeletableEntity`

## [References and TypeORM official documentation]()

Official TypeORM documentation links covering entities, relationships, and decorator reference. These resources provide comprehensive framework documentation with additional patterns and advanced usage scenarios beyond this guide.

### When to use?
Reference official documentation when encountering advanced scenarios not covered here, learning about new TypeORM features, debugging complex issues, or seeking authoritative explanations of decorator behavior and options.

### When NOT to use?
Avoid diving into documentation for basic patterns already covered in this guide. Don't blindly copy advanced patterns without understanding - this guide provides project-specific best practices that should be followed first.

### Example
Official TypeORM documentation resources:
- [TypeORM Entities Documentation](https://typeorm.io/entities)
- [TypeORM Relations Documentation](https://typeorm.io/relations)
- [TypeORM Decorators Reference](https://typeorm.io/decorator-reference)

### Checklist
- [ ] Check this guide first before consulting external docs
- [ ] Validate external patterns against project conventions
- [ ] Ensure any new patterns align with existing codebase
- [ ] Document any advanced patterns adopted from official docs

### Troubleshooting
**Issue**: Official documentation examples don't match project patterns
**Solution**: Adapt examples to follow project conventions (naming, base classes, etc). When in doubt, follow this guide.

**Issue**: Feature exists in TypeORM but not documented here
**Solution**: Consult official docs but ensure implementation follows project standards. Consider contributing pattern back to this guide.

### Best Practices
Use official docs for authoritative TypeORM behavior reference. Always adapt examples to project conventions before implementing. Prefer project-specific patterns in this guide over generic documentation examples. Keep this guide updated as TypeORM evolves.
