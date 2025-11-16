# Backend Module Folder Structure

> Standardized pattern for organizing files and folders in NestJS modules, ensuring consistency, scalability, and maintainability across the project.

## [Standard NestJS Module Structure]()

Recommended file and folder organization for NestJS modules following framework conventions and industry best practices. This structure balances modularity, discoverability, and maintainability while supporting both simple CRUD and complex business logic use cases.

### When to use?
Use this structure for all new NestJS modules in the project to ensure consistency. Apply this pattern when creating domain modules that handle business entities, API endpoints, and data persistence with TypeORM, ensuring uniform organization across the codebase.

### When NOT to use?
Do not use this structure for shared utility modules like common helpers, authentication modules, or infrastructure modules like database configuration. These special-purpose modules may have different organizational needs that don't follow the standard CRUD pattern.

### Example

```
src/modules/module-name/
├── module-name.module.ts          # Module configuration
├── module-name.controller.ts      # HTTP routes (endpoints)
├── module-name.service.ts         # Simple CRUD business logic
├── entities/                      # Data models
│   └── module-name.entity.ts
├── dto/                          # Data Transfer Objects
│   ├── create-module-name.dto.ts
│   └── update-module-name.dto.ts
├── use-cases/                    # Use-Cases with complex rules (optional)
│   ├── interfaces.ts             # Segregated interfaces
│   └── business-rules.usecase.ts # Use-case implementation
└── enums/                        # Enumerations (optional)
    └── module-name-status.enum.ts
```

### Checklist
- [ ] Module file with @Module decorator configuring imports, controllers, providers, and exports
- [ ] Controller file with REST endpoints using proper HTTP decorators
- [ ] Service file for simple CRUD operations or delegating to use-cases
- [ ] Entities folder containing TypeORM entity classes
- [ ] DTOs folder with create and update data transfer objects
- [ ] Use-cases folder added when business logic complexity requires it
- [ ] Enums folder created when fixed value sets are needed

### Troubleshooting

**Module not loading**: Ensure the module is imported in the parent module (usually app.module.ts) and all providers are properly declared.

**Circular dependency errors**: Check for circular imports between modules. Use forwardRef() or restructure to avoid bidirectional dependencies.

**Entity not recognized**: Verify the entity is registered in TypeOrmModule.forFeature() array in the module file.

### Best Practices

- Keep module files focused on a single business domain for better maintainability
- Start with the minimal structure (module, controller, service, entities, dto) and add folders as needed
- Use barrel exports (index.ts) in folders with multiple files for cleaner imports
- Always co-locate related files within the same module folder rather than creating global folders

## [Description and Responsibility of Each Module File]()

Comprehensive guide detailing the specific role, content patterns, and usage guidelines for each file type in a NestJS module. Understanding these responsibilities ensures proper separation of concerns and maintains clean architecture throughout the application.

### [Module (*.module.ts)]()

Declares and organizes the module:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleNameController } from './module-name.controller';
import { ModuleNameService } from './module-name.service';
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

### [Controller (*.controller.ts)]()

Defines REST endpoints:

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('module-name')
@ApiBearerAuth()
@Controller('module-name')
export class ModuleNameController {
  constructor(private readonly service: ModuleNameService) {}

  @Post()
  create(@Body() dto: CreateDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.userId);
  }

  // Other endpoints...
}
```

### [Service (*.service.ts)]()

Contains simple CRUD business logic. For complex rules, use Use-Cases:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ModuleNameService {
  constructor(
    @InjectRepository(ModuleName)
    private repository: Repository<ModuleName>,
  ) {}

  // Simple CRUD remains in service
  async create(dto: CreateDto, userId: number) {
    const entity = this.repository.create({ ...dto, userId });
    return await this.repository.save(entity);
  }

  async findAll(userId: number) {
    return await this.repository.find({ where: { userId } });
  }

  // For complex rules, delegate to Use-Cases
}
```

### [Entity (entities/*.entity.ts)]()

Data model (database table):

```typescript
import { Entity, Column } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';

@Entity('table_name')
export class ModuleName extends SuperEntity {
  @Column()
  name: string;

  // Other fields...
}
```

**IMPORTANT**: The entity must be located **inside the module**, not in a centralized folder. The only centralized entity is `SuperEntity`.

### [DTOs (dto/*.dto.ts)]()

Input data validation:

```typescript
// create-*.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateModuleNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

// update-*.dto.ts
import { PartialType } from '@nestjs/swagger';

export class UpdateModuleNameDto extends PartialType(CreateModuleNameDto) {}
```

## [When to Create Use-Cases Folder in Module]()

Guidelines for deciding when to introduce use-cases folder for complex business logic versus keeping simple operations in services. Use-cases are appropriate when operations involve multiple transactions, sophisticated validation, or require high testability through interface segregation.

### When to use?
Create a use-cases folder when your module requires complex business logic involving multiple entities, transactions spanning several database operations, sophisticated validation rules beyond simple DTO validation, or when you need interface segregation for better testability and dependency injection patterns.

### When NOT to use?
Do not create use-cases for simple CRUD operations that only involve basic create, read, update, delete actions on a single entity. Keep straightforward business logic in the service file to avoid over-engineering and unnecessary complexity for simple modules.

### Example

```
src/modules/financial/
├── financial.module.ts
├── financial.controller.ts
├── financial.service.ts                    # Simple CRUD
└── use-cases/
    ├── interfaces.ts                       # Segregated interfaces
    └── financial-rules.usecase.ts          # Complex business logic
```

```typescript
// use-cases/interfaces.ts
export interface CalculateCurrentBalance {
  calculateCurrentBalance(userId: number): Promise<number>;
}

export interface ProcessInvestment {
  processInvestment(userId: number, amount: number, type: string): Promise<boolean>;
}

// use-cases/financial-rules.usecase.ts
@Injectable()
export class FinancialRulesUseCase
  implements CalculateCurrentBalance, ProcessInvestment
{
  async calculateCurrentBalance(userId: number): Promise<number> {
    // Implementation with multiple queries and rules
  }

  async processInvestment(userId: number, amount: number, type: string): Promise<boolean> {
    // Implementation with transactions and complex validations
  }
}
```

**See more**: [How to create Use-Cases](./how-to-create-use-case-backend.md)

### Checklist
- [ ] Business logic requires multiple database queries or transactions
- [ ] Logic involves complex validations beyond DTO class-validator rules
- [ ] Operation coordinates multiple entities or external services
- [ ] Testability requires interface segregation for mocking dependencies
- [ ] Service file exceeds 200-300 lines indicating complexity

### Troubleshooting

**When to split use-cases**: If a single use-case file exceeds 300 lines, split into multiple use-case files by business responsibility.

**Circular dependencies with service**: Inject use-cases into service, never inject service into use-case. Use-cases should depend on repositories directly.

### Best Practices

- Create one use-case class per major business operation or feature
- Use interface segregation with separate interfaces for each method
- Keep use-cases focused on business logic, delegate data access to repositories
- Write comprehensive unit tests for use-cases using mocked repositories

## [When to Create Enums in Backend Module]()

Best practices for organizing enumeration types representing fixed value sets like statuses, types, or categories. Enums provide type safety, improve code readability, and ensure database consistency when used with TypeORM enum column types.

### When to use?
Create enums when your module has fixed value sets like statuses, types, categories, or predefined options that should be type-safe and validated. Use enums for database columns that should only accept specific values, ensuring data integrity and providing autocomplete in TypeScript.

### When NOT to use?
Do not use enums for dynamic values that may change frequently or be user-configurable. Avoid enums for values that should be stored in a separate database table with additional metadata, or when the set of values is large and might require runtime configuration.

### Example

```typescript
// enums/alert-type.enum.ts
export enum AlertType {
  DAILY_VARIATION = 'daily_variation',
  PRICE_TARGET = 'price_target',
  VOLUME_SPIKE = 'volume_spike',
}

// Usage in entity
@Column({ type: 'enum', enum: AlertType })
type: AlertType;
```

### Checklist
- [ ] Enum uses PascalCase naming following TypeScript conventions
- [ ] Enum values use snake_case for database column compatibility
- [ ] Enum is exported from its own file in the enums folder
- [ ] Entity column uses @Column with type: 'enum' and enum property
- [ ] DTO validates enum values using @IsEnum() decorator from class-validator

### Troubleshooting

**Database enum type errors**: When adding or removing enum values, create a migration to update the database enum type definition.

**Validation errors**: Ensure DTOs use @IsEnum(EnumType) decorator for proper request validation.

**TypeScript errors**: Import enum properly in entity and DTO files, and ensure enum values match database column constraints.

### Best Practices

- Use string enum values instead of numeric for better database readability
- Keep enum values in snake_case to match database naming conventions
- Document what each enum value represents using JSDoc comments
- Create separate enums for different concerns rather than one large enum

## [Real Examples: Simple and Complex Modules]()

Practical examples contrasting simple CRUD modules with complex modules containing use-cases, enums, and advanced features. These real-world patterns demonstrate how module structure evolves based on business logic complexity and feature requirements.

### [Simple Module (Asset)]()

```
src/modules/asset/
├── asset.module.ts
├── asset.controller.ts
├── asset.service.ts
├── entities/
│   └── asset.entity.ts
└── dto/
    ├── create-asset.dto.ts
    └── update-asset.dto.ts
```

### [Complex Module (Financial)]()

```
src/modules/financial/
├── financial.module.ts
├── financial.controller.ts
├── financial.service.ts
├── entities/
│   └── transaction.entity.ts
├── dto/
│   ├── create-transaction.dto.ts
│   └── process-investment.dto.ts
├── use-cases/
│   ├── interfaces.ts
│   ├── financial-rules.usecase.ts
│   └── tax-calculations.usecase.ts
└── enums/
    └── transaction-type.enum.ts
```

## [Naming Conventions in English for Classes and Interfaces]()

Standardized naming patterns for all module elements ensuring consistency and international compatibility. Following English naming conventions with proper case styles facilitates collaboration, integrates with TypeScript ecosystem, and maintains professional code standards.

**IMPORTANT**: All classes, interfaces, entities, DTOs, enums and use-cases must be named in English, following international TypeScript development conventions.

| Item | Pattern | Example | Language |
|------|---------|---------|----------|
| Module folder | kebab-case | `asset-group` | English |
| File | kebab-case | `asset-group.service.ts` | English |
| Class | PascalCase | `AssetGroupService` | English |
| Entity | PascalCase | `AssetGroup` | English |
| DTO | PascalCase | `CreateAssetGroupDto` | English |
| Interface (Use-Case) | PascalCase without I | `CalculateBalance` | English |
| Use-Case | PascalCase with UseCase | `FinancialRulesUseCase` | English |
| Enum | PascalCase | `AssetStatus` | English |

**Examples of correct naming**:
- ✅ `ProcessInvestment`, `CalculateBalance`, `GenerateReport`
- ❌ `ProcessarInvestimento`, `CalcularSaldo`, `GerarRelatorio`

## [Module Organization by Size and Complexity]()

Progressive structure guidelines adapting module organization to codebase size. Start simple with flat structures for small modules, introduce use-cases for medium complexity, and fully subdivide with guards and multiple use-cases for large, feature-rich modules.

### [Small Module (< 300 lines)]()

Keep everything in main files:
```
module/
├── module.module.ts
├── module.controller.ts
├── module.service.ts
├── entities/
│   └── module.entity.ts
└── dto/
    ├── create-module.dto.ts
    └── update-module.dto.ts
```

### [Medium Module (300-1000 lines)]()

Separate responsibilities into use-cases:
```
module/
├── module.module.ts
├── module.controller.ts
├── module.service.ts
├── entities/
├── dto/
└── use-cases/
    ├── interfaces.ts
    └── business-rules.usecase.ts
```

### [Large Module (> 1000 lines)]()

Subdivide completely with multiple use-cases:
```
module/
├── module.module.ts
├── module.controller.ts
├── module.service.ts
├── entities/
├── dto/
├── use-cases/
│   ├── interfaces.ts
│   ├── business-rules-a.usecase.ts
│   └── business-rules-b.usecase.ts
├── enums/
└── guards/
    └── module-permission.guard.ts
```

## [Module Location in Project Structure]()

Project-wide directory hierarchy showing proper module placement within the NestJS application. All domain modules reside in src/modules with shared code in common, authentication in auth, and database configurations separated from business logic.

```
back/src/
├── app.module.ts          # Root module
├── main.ts               # Entry point
├── auth/                 # Authentication (special)
├── common/               # Shared code
├── database/             # Configs and migrations
└── modules/              # Domain modules
    ├── asset/
    ├── wallet/
    ├── quote/
    └── ...
```

## [Practical Tips for Module Organization]()

Essential organizational principles for maintaining clean module architecture including single responsibility, progressive refactoring, proper exports, DTO separation, and entity organization. These tips prevent common pitfalls and ensure modules remain maintainable as they grow.

1. **One module = One responsibility**: Don't mix domains
2. **Start simple**: Don't create unnecessary folders
3. **Refactor when it grows**: If it exceeds 300 lines, separate
4. **Export services**: If other modules need to use them
5. **Separate DTOs**: Always in their own file
6. **Own entities**: One entity per file

## [References]()

Official NestJS documentation link providing deeper insights into module system, dependency injection, and architectural patterns. This reference expands on concepts presented here with framework-specific implementation details.

- [NestJS Module Documentation](https://docs.nestjs.com/modules)
