# Como criar uma Entity TypeORM?

> Guia prático para criar entidades (modelos de dados) com TypeORM no projeto.

## O que é uma Entity?

Uma Entity representa uma tabela no banco de dados. Cada instância da classe é uma linha na tabela.

## Estrutura Básica

### Entity Simples

```typescript
import { Entity, Column } from 'typeorm';
import { SuperEntity } from '@/common/entities/super.entity';

@Entity('products')
export class Product extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;
}
```

### SuperEntity (Classe Base)

Todas as entities devem estender `SuperEntity`:

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

**Vantagens**:
- ID automático
- Timestamps automáticos (created_at, updated_at)
- Padrão consistente em todo projeto

## Tipos de Colunas

### Texto

```typescript
// String curta
@Column({ type: 'varchar', length: 255 })
name: string;

// Texto longo
@Column({ type: 'text', nullable: true })
description: string;
```

### Números

```typescript
// Inteiro
@Column({ type: 'int' })
quantity: number;

// Decimal (para preços, valores monetários)
@Column({ type: 'decimal', precision: 10, scale: 2 })
price: number;

// Float
@Column({ type: 'float' })
percentage: number;
```

### Booleano

```typescript
@Column({ type: 'boolean', default: true })
active: boolean;
```

### Data/Hora

```typescript
@Column({ type: 'timestamptz', nullable: true })
lastLoginAt: Date;

@Column({ type: 'date', nullable: true })
birthDate: Date;
```

### JSON

```typescript
@Column({ type: 'jsonb', nullable: true })
metadata: any;
```

## Relacionamentos

### Many-to-One (N:1)

Exemplo: Vários produtos pertencem a um usuário

```typescript
import { ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/auth/entities/user.entity';

@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;

  // Relacionamento
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Coluna FK (facilita queries)
  @Column({ type: 'int', name: 'user_id' })
  userId: number;
}
```

### One-to-Many (1:N)

Exemplo: Um usuário tem vários produtos

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

### Many-to-Many (N:N)

Exemplo: Produtos têm várias categorias, categorias têm vários produtos

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

## Recursos Avançados

### Índices

```typescript
import { Entity, Column, Index } from 'typeorm';

@Entity('products')
@Index(['name', 'userId']) // Índice composto
export class Product extends SuperEntity {
  @Column()
  @Index() // Índice simples
  name: string;

  @Column()
  userId: number;
}
```

### Unique Constraints

```typescript
@Column({ type: 'varchar', length: 255, unique: true })
email: string;

// Ou unique composto
@Entity('products')
@Index(['code', 'userId'], { unique: true })
export class Product extends SuperEntity {
  @Column()
  code: string;

  @Column()
  userId: number;
}
```

### Valores Padrão

```typescript
@Column({ type: 'boolean', default: true })
active: boolean;

@Column({ type: 'int', default: 0 })
viewCount: number;

@Column({ type: 'varchar', length: 50, default: 'pending' })
status: string;
```

### Colunas Opcionais

```typescript
@Column({ nullable: true })
middleName: string;

@Column({ type: 'text', nullable: true })
bio: string;
```

### Enums

```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

@Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
role: UserRole;
```

### Exclusão de Campos (Sensitive Data)

```typescript
import { Exclude } from 'class-transformer';

@Entity('users')
export class User extends SuperEntity {
  @Column()
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude() // Nunca retorna ao cliente
  passwordHash: string;
}
```

### Soft Delete

```typescript
@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'deleted_at' })
  deletedAt: Date;
}

// No service
async softDelete(id: number) {
  await this.repository.update(id, { deletedAt: new Date() });
}

// Queries excluindo deletados
async findAll() {
  return await this.repository.find({
    where: { deletedAt: IsNull() }
  });
}
```

## Convenções do Projeto

### Nomeação

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Classe | PascalCase | `Product`, `UserProfile` |
| Tabela | snake_case | `products`, `user_profiles` |
| Coluna | snake_case | `user_id`, `created_at` |
| Arquivo | kebab-case | `product.entity.ts` |

### Exemplo Completo

```typescript
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SuperEntity } from '@/common/entities/super.entity';
import { User } from '@/auth/entities/user.entity';
import { Category } from '@/modules/categories/entities/category.entity';

@Entity('products')
@Index(['code', 'userId'], { unique: true })
export class Product extends SuperEntity {
  // Campos básicos
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Valores numéricos
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  // Status
  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Relacionamento com User
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  // Relacionamento com Category
  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'int', nullable: true, name: 'category_id' })
  categoryId: number;

  // Metadados
  @Column({ type: 'jsonb', nullable: true })
  @Exclude()
  internalData: any;

  // Soft delete
  @Column({ type: 'timestamptz', nullable: true, name: 'deleted_at' })
  deletedAt: Date;
}
```

## Registrar Entity no Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // Registrar aqui
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
```

## Usar Entity no Service

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

## Dicas Importantes

1. **Sempre estenda SuperEntity**: Garante ID e timestamps padrão
2. **Use snake_case para nomes de colunas**: Convenção PostgreSQL
3. **Especifique `name` em @JoinColumn**: Controle explícito de FK
4. **Adicione campo ID separado da relação**: Facilita queries (`userId` além de `user`)
5. **Use @Exclude para dados sensíveis**: Senhas, tokens, etc
6. **Crie índices em colunas frequentemente consultadas**: Performance
7. **Use `nullable: true` quando apropriado**: Evite constraints desnecessárias

## Referências

- [TypeORM Entities Documentation](https://typeorm.io/entities)
- [TypeORM Relations Documentation](https://typeorm.io/relations)
- [TypeORM Decorators Reference](https://typeorm.io/decorator-reference)
