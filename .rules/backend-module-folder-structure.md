# [What should be the Backend module folder structure?]()

> Pattern for organizing files and folders for NestJS modules in the project.

## [Standard NestJS Module Structure]()

Standard organization of files and folders for NestJS modules, following framework conventions and best practices.

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

## [Description and Responsibility of Each Module File]()

Detailed explanation of the responsibility and content of each file type in a module structure.

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

Use `use-cases/` folder when:
- Complex business rules with multiple transactions
- Operations involving multiple related responsibilities
- Need for high testability and low coupling

### [Example]()

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

## [When to Create Enums in Backend Module]()

Use `enums/` folder for fixed values:

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

## [Real Examples: Simple and Complex Modules]()

Concrete examples of simple and complex module structures used in the real project.

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

Reference table with naming patterns for each file and class type in the module.

**IMPORTANT**: All classes, interfaces, entities, DTOs, enums and use-cases must be named in **English**, following international TypeScript development conventions.

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

Code organization recommendations based on module size and complexity.

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

Hierarchical project directory structure indicating where domain modules should be created.

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

1. **One module = One responsibility**: Don't mix domains
2. **Start simple**: Don't create unnecessary folders
3. **Refactor when it grows**: If it exceeds 300 lines, separate
4. **Export services**: If other modules need to use them
5. **Separate DTOs**: Always in their own file
6. **Own entities**: One entity per file

## [References]()

- [NestJS Module Documentation](https://docs.nestjs.com/modules)
