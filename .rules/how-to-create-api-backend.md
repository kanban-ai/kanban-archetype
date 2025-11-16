# How to Create an API in the Backend

> Step-by-step guide to create a complete REST API in NestJS with TypeORM entities, DTOs, services, controllers, and migrations.

## [Overview]()

This section presents the complete workflow for creating a REST API in NestJS, from generating resources with CLI to implementing entities, DTOs, services, controllers and migrations following project standards.

This guide shows how to create a complete CRUD following project standards, including:
- NestJS Module
- Controller (HTTP routes) **with v1 versioning**
- Service (business logic)
- Entity (data model)
- DTOs (validation)
- Swagger Documentation

**IMPORTANT**: All APIs must start with `/v1/` versioning from the beginning. See [How to version API](./how-to-version-api-backend.md) to understand why.

## [Step 1: Generate complete Resource using NestJS CLI]()

This step shows how to use the NestJS CLI to automatically generate the entire file structure needed for a module, saving time and following framework conventions.

The NestJS CLI automatically generates all the necessary structure:

```bash
cd back
nest g resource module-name
```

### Interactive options:

During CLI command execution, you will be asked about module configurations. Choose the appropriate options to create a REST API with CRUD endpoints.

1. **What transport layer?**
   - Select: `REST API`

2. **Generate CRUD entry points?**
   - Select: `Yes`

This will create:
```
src/modules/module-name/
  module-name.module.ts
  module-name.controller.ts
  module-name.service.ts
  entities/
    module-name.entity.ts
  dto/
    create-module-name.dto.ts
    update-module-name.dto.ts
```

## [Step 2: Create TypeORM Entity as data model]()

This step details the creation of the TypeORM entity that represents the database table, defining structure, column types, and relationships.

**File**: `entities/module-name.entity.ts`

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { User } from '@/auth/entities/user.entity';

@Entity('table_name')
export class ModuleName extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Relationship with User (record owner)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;
}
```

### Important tips:

This section lists essential best practices when creating TypeORM entities, ensuring consistency and avoiding common errors in the project.

- **Always extend `SuperEntity`**: Includes id, created_at, updated_at
- **Use snake_case for columns**: PostgreSQL convention
- **Specify `name` in @JoinColumn**: Explicit control
- **Add separate `userId`**: Facilitates queries

## [Step 3: Create DTOs for API data validation]()

This step explains creating DTOs (Data Transfer Objects) using class-validator decorators to ensure data integrity received in requests.

### Create DTO

The Create DTO defines the structure and validations for creating new records, specifying required fields, types, and business rules.

**File**: `dto/create-module-name.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleNameDto {
  @ApiProperty({
    description: 'Item name',
    example: 'My Item',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed description',
    example: 'Complete item description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether the item is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
```

### Update DTO

The Update DTO inherits from Create DTO making all fields optional, allowing partial updates of existing records.

**File**: `dto/update-module-name.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateModuleNameDto } from './create-module-name.dto';

export class UpdateModuleNameDto extends PartialType(CreateModuleNameDto) {}
```

> **Note**: `PartialType` makes all fields optional automatically.

## [Step 4: Implement Service with business logic and CRUD]()

This step shows how to implement the Service containing all business logic and CRUD operations, injecting the TypeORM repository for database access.

**File**: `module-name.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuleNameDto } from './dto/create-module-name.dto';
import { UpdateModuleNameDto } from './dto/update-module-name.dto';
import { ModuleName } from './entities/module-name.entity';

@Injectable()
export class ModuleNameService {
  constructor(
    @InjectRepository(ModuleName)
    private repository: Repository<ModuleName>,
  ) {}

  async create(createDto: CreateModuleNameDto, userId: number) {
    const item = this.repository.create({
      ...createDto,
      userId,
    });

    return await this.repository.save(item);
  }

  async findAll(userId: number) {
    return await this.repository.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const item = await this.repository.findOne({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }

    return item;
  }

  async update(id: number, updateDto: UpdateModuleNameDto, userId: number) {
    const item = await this.findOne(id, userId);

    Object.assign(item, updateDto);

    return await this.repository.save(item);
  }

  async remove(id: number, userId: number) {
    const item = await this.findOne(id, userId);

    await this.repository.remove(item);

    return { message: 'Item removed successfully' };
  }
}
```

### Service best practices:

List of essential best practices when implementing services, focusing on security, validation, and consistent data return.

1. **Always validate userId**: Ensures data isolation
2. **Use `findOne` before update/delete**: Validates permissions
3. **Throw appropriate exceptions**: NotFoundException, ForbiddenException
4. **Always return the updated entity**: Facilitates frontend work

## [Step 5: Implement Controller with versioned REST endpoints]()

This step details the Controller implementation defining versioned HTTP routes, Swagger decorators, and Service integration.

**File**: `module-name.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ModuleNameService } from './module-name.service';
import { CreateModuleNameDto } from './dto/create-module-name.dto';
import { UpdateModuleNameDto } from './dto/update-module-name.dto';

@ApiTags('module-name')
@ApiBearerAuth()
@Controller({ path: 'module-name', version: '1' })
export class ModuleNameController {
  constructor(private readonly service: ModuleNameService) {}

  @Post()
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  create(@Body() createDto: CreateModuleNameDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all items' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find item by ID' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateModuleNameDto,
    @Request() req,
  ) {
    return this.service.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.remove(id, req.user.userId);
  }
}
```

### Controller best practices:

Fundamental recommendations for robust controllers, including automatic documentation, type validation, and correct use of HTTP verbs.

1. **Use Swagger decorators**: Documents automatically
2. **Use `ParseIntPipe`**: Validates and converts parameters
3. **Inject `@Request() req`**: Accesses authenticated user data
4. **Use correct HTTP verbs**: POST, GET, PATCH, DELETE
5. **Organize RESTful routes**: `/resource`, `/resource/:id`
6. **Always use versioning**: `@Controller({ path: 'resource', version: '1' })`

## [Step 6: Configure NestJS Module with dependencies]()

This step explains how to configure the NestJS module by registering controllers, providers, and importing necessary dependencies like TypeORM.

**File**: `module-name.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleNameService } from './module-name.service';
import { ModuleNameController } from './module-name.controller';
import { ModuleName } from './entities/module-name.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModuleName]),
  ],
  controllers: [ModuleNameController],
  providers: [ModuleNameService],
  exports: [ModuleNameService], // If other modules need it
})
export class ModuleNameModule {}
```

## [Step 7: Register new module in root AppModule]()

This step shows how to import the newly created module into the AppModule to make its functionality available in the application.

**File**: `src/app.module.ts`

```typescript
import { ModuleNameModule } from './modules/module-name/module-name.module';

@Module({
  imports: [
    // ... other modules
    ModuleNameModule,
  ],
})
export class AppModule {}
```

## [Step 8: Create TypeORM Migration for database schema]()

This step teaches how to create migrations for database schema versioning, allowing tables to be created, modified, or deleted in a controlled manner.

```bash
npm run typeorm -- migration:create src/database/migrations/CreateModuleNameTable
```

Edit the migration to use **pure SQL**:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateModuleNameTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE table_name (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        user_id INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_table_name_user_id ON table_name(user_id);
    `);

    await queryRunner.query(`
      ALTER TABLE table_name
        ADD CONSTRAINT fk_table_name_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE table_name;`);
  }
}
```

Run the migration:

```bash
npm run typeorm -- migration:run
```

## [Step 9: Test REST API using Swagger or HTTP tools]()

This final step shows how to test the created endpoints using Swagger UI interface or command-line tools like curl.

### Via Swagger

Swagger UI provides an interactive visual interface to test all endpoints documented with @Api decorators.

1. Access: `http://localhost:3000/api/docs`
2. Click "Authorize" and insert JWT token
3. Test the created endpoints

### Via curl

Examples of curl commands to test each CRUD operation of the API via command line, useful for automation and scripts.

```bash
# Create
curl -X POST http://localhost:3000/api/v1/module-name \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "description": "Test description"}'

# List
curl -X GET http://localhost:3000/api/v1/module-name \
  -H "Authorization: Bearer YOUR_TOKEN"

# Find by ID
curl -X GET http://localhost:3000/api/v1/module-name/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update
curl -X PATCH http://localhost:3000/api/v1/module-name/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test"}'

# Delete
curl -X DELETE http://localhost:3000/api/v1/module-name/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## [Advanced Features for REST APIs in NestJS]()

This section presents advanced functionalities to make your APIs more robust, including pagination, filters, and relationship handling.

### Pagination

Implementation of pagination to list large volumes of data efficiently, returning navigation metadata.

```typescript
// Service
async findAll(userId: number, page: number = 1, pageSize: number = 10) {
  const [data, total] = await this.repository.findAndCount({
    where: { userId },
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { created_at: 'DESC' },
  });

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// Controller
@Get()
findAll(
  @Query('page') page: string = '1',
  @Query('pageSize') pageSize: string = '10',
  @Request() req,
) {
  return this.service.findAll(req.user.userId, +page, +pageSize);
}
```

### Filters and Search

```typescript
// DTO
export class FilterModuleNameDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

// Service
async findAll(userId: number, filters: FilterModuleNameDto) {
  const where: any = { userId };

  if (filters.name) {
    where.name = Like(`%${filters.name}%`);
  }

  if (filters.active !== undefined) {
    where.active = filters.active;
  }

  return await this.repository.find({ where });
}
```

### Relationships

```typescript
// Load with relationships
async findOne(id: number, userId: number) {
  const item = await this.repository.findOne({
    where: { id, userId },
    relations: ['user', 'otherRelationship'],
  });

  if (!item) {
    throw new NotFoundException(`Item ${id} not found`);
  }

  return item;
}
```

## [Complete REST API Implementation Checklist]()

- [ ] Resource generated with `nest g resource`
- [ ] Entity created extending SuperEntity
- [ ] DTOs created with validation
- [ ] Service implemented with complete CRUD
- [ ] Controller implemented with REST routes **and v1 versioning**
- [ ] Module configured and imported in AppModule
- [ ] Migration created and executed
- [ ] Swagger documentation added
- [ ] userId validation in all operations
- [ ] Versioning configured (see [How to version API](./how-to-version-api-backend.md))

## [File and class naming pattern in NestJS]()

This section defines naming conventions for files, classes, and tables in the project following NestJS and TypeORM best practices.

| Type | Pattern | Rules | Example |
|------|---------|-------|---------|
| Module | kebab-case | - | `product-category` |
| Entity | PascalCase | Singular | `ProductCategory` |
| Table | snake_case | Lowercase + Plural | `product_categories` |
| DTO | PascalCase | - | `CreateProductCategoryDto` |
| Service | PascalCase | - | `ProductCategoryService` |
| Controller | PascalCase | - | `ProductCategoryController` |

**Important**:
- **Entity**: Always singular in PascalCase (e.g., `Product`, `User`)
- **Table**: Always plural in lowercase snake_case (e.g., `products`, `users`)

## [Official NestJS and TypeORM documentation references]()

- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Providers](https://docs.nestjs.com/providers)
- [TypeORM Entities](https://typeorm.io/entities)
- [class-validator Decorators](https://github.com/typestack/class-validator)
