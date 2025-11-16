# [How to create a TypeORM Entity?]()

> Practical guide to creating entities (data models) with TypeORM in the project.

## [What is a TypeORM Entity and what is it for]()

This section explains the fundamental concept of entities in TypeORM and their function as object-relational mapping between TypeScript and PostgreSQL.

Entities are TypeScript classes that represent PostgreSQL tables:

An Entity represents a table in the database. Each instance of the class is a row in the table.

## [Entity Location in the NestJS project]()

This section defines the recommended organization of entities in the project, following a modular pattern instead of centralized.

Entities should be inside the module folder, not centralized:

- **SuperEntity**: Centralized in `src/database/entities/super.entity.ts` (shared by all modules)
- **Other Entities**: Inside each module in `src/modules/[module-name]/entities/[name].entity.ts`

### [Structure example:]()
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

## [Basic TypeORM Entity Structure in NestJS]()

This section presents the standard entity structure in the project, including use of SuperEntity and SoftDeletableEntity for common functionalities.

How to create entities that extend SuperEntity or SoftDeletableEntity:

### [Simple Entity]()

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

**Note**: Notice that the class is `Product` (singular, PascalCase) but the table is `'products'` (plural, snake_case, lowercase).

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

This section catalogs all data types supported by TypeORM for PostgreSQL columns, with practical usage examples.

Complete list of data types for PostgreSQL columns:

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

This section teaches how to implement relationships between tables using TypeORM decorators, enabling queries with joins and eager loading.

How to create Many-to-One, One-to-Many and Many-to-Many relationships:

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

This section presents advanced features to optimize queries and ensure data integrity with indexes, constraints and special types.

Indexes, unique constraints, default values and enums:

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

Established patterns for classes, tables and columns:

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

How to import entities with TypeOrmModule.forFeature:

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

## [Use Entity in Service with Repository Pattern]()

Inject repository to perform database operations:

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

## [Important Tips when working with TypeORM Entities]()

Essential best practices to avoid common problems:

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

Links to official documentation of entities and decorators:

- [TypeORM Entities Documentation](https://typeorm.io/entities)
- [TypeORM Relations Documentation](https://typeorm.io/relations)
- [TypeORM Decorators Reference](https://typeorm.io/decorator-reference)
