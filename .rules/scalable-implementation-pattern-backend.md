# [How to create a scalable implementation pattern in Backend modules?]()

> Guide to best practices for creating scalable and maintainable modules in NestJS.

## [Fundamental Principles]()

Essential software design concepts applied to developing scalable NestJS modules.

### [1. Single Responsibility Principle]()

Each class should have a single responsibility:

```typescript
// ❌ Bad - Service doing everything
@Injectable()
export class ProductService {
  async create() { /* ... */ }
  async sendEmail() { /* ... */ }  // Shouldn't be here
  async generatePDF() { /* ... */ } // Shouldn't be here
}

// ✅ Good - Separated responsibilities
@Injectable()
export class ProductService {
  constructor(
    private emailService: EmailService,
    private pdfService: PdfService,
  ) {}

  async create(dto) {
    const product = await this.repository.save(dto);
    await this.emailService.sendCreationEmail(product);
    return product;
  }
}
```

### [2. Dependency Injection]()

Always use dependency injection:

```typescript
// ❌ Bad - Creating dependencies
@Injectable()
export class ProductService {
  private emailService = new EmailService(); // Bad

  async create() { /* ... */ }
}

// ✅ Good - Injecting dependencies
@Injectable()
export class ProductService {
  constructor(
    private emailService: EmailService, // Injected
    private pdfService: PdfService,     // Injected
  ) {}
}
```

### [3. Dependency Inversion]()

Depend on abstractions, not implementations:

```typescript
// Interface (contract)
export interface INotificationService {
  send(message: string): Promise<void>;
}

// Implementations
@Injectable()
export class EmailNotificationService implements INotificationService {
  async send(message: string) {
    // Send email
  }
}

@Injectable()
export class SmsNotificationService implements INotificationService {
  async send(message: string) {
    // Send SMS
  }
}

// Service depends on interface
@Injectable()
export class ProductService {
  constructor(
    @Inject('INotificationService')
    private notificationService: INotificationService,
  ) {}

  async create(dto) {
    const product = await this.repository.save(dto);
    await this.notificationService.send('Product created');
    return product;
  }
}
```

## [Implementation Patterns]()

Proven design patterns for structuring scalable and maintainable code in NestJS applications.

### [1. Use-Case Pattern (Main Pattern for Business Rules)]()

**For complex business rules, ALWAYS use Use-Cases.**

Use-Cases are the recommended pattern for implementing complex business logic in the backend. They follow the Interface Segregation Principle (ISP) and promote testable and maintainable code.

**When to use Use-Cases:**
- Complex business rules with multiple transactions
- Operations involving multiple entities
- Logic that needs to be tested in isolation
- Processes that can have multiple implementations

**When NOT to use Use-Cases:**
- Simple CRUD and direct operations
- Basic read/write without processing
- Trivial queries without business rules

**Basic structure:**
```typescript
// 1. Define interface with single responsibility
export interface CalculateBalance {
  calculateBalance(userId: number): Promise<number>;
}

// 2. Implement thin Use-Case (1 interface = 1 use-case)
@Injectable()
export class CalculateBalanceUseCase implements CalculateBalance {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async calculateBalance(userId: number): Promise<number> {
    // Implementation with private helper methods
    const credits = await this.getCredits(userId);
    const debits = await this.getDebits(userId);
    return credits - debits;
  }

  private async getCredits(userId: number): Promise<number> {
    // Private helper logic
  }

  private async getDebits(userId: number): Promise<number> {
    // Private helper logic
  }
}

// 3. Inject in controller via interface
@Controller('balance')
export class BalanceController {
  constructor(
    private readonly calculateBalance: CalculateBalance,
  ) {}

  @Get()
  async getBalance(@Request() req) {
    return await this.calculateBalance.calculateBalance(req.user.userId);
  }
}
```

**IMPORTANT**: See the complete documentation in `./how-to-create-use-case-backend.md` for:
- File and folder structure
- Naming conventions (always in English)
- Thin Use-Cases (1 interface per use-case)
- Complete examples and best practices
- Unit tests
- Comparison with traditional Services

### [2. Repository Pattern (TypeORM)]()

Use TypeORM repository for data access:

```typescript
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
  ) {}

  async findAll(userId: number) {
    return await this.repository.find({
      where: { userId },
    });
  }
}
```

### [3. DTO Pattern]()

Use DTOs for validation and data transfer:

```typescript
// DTO for input
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}

// Controller
@Post()
create(@Body() dto: CreateProductDto) {
  return this.service.create(dto);
}

// Service
async create(dto: CreateProductDto, userId: number) {
  const product = this.repository.create({
    ...dto,
    userId,
  });
  return await this.repository.save(product);
}
```

### [4. Strategy Pattern]()

Use when there are multiple implementations of a behavior:

```typescript
// Strategy interface
export interface IPaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

// Implementations
@Injectable()
export class CreditCardStrategy implements IPaymentStrategy {
  async process(amount: number) {
    // Process credit card
  }
}

@Injectable()
export class PixStrategy implements IPaymentStrategy {
  async process(amount: number) {
    // Process PIX
  }
}

// Service that uses strategies
@Injectable()
export class PaymentService {
  private strategies = new Map<string, IPaymentStrategy>();

  constructor(
    private creditCardStrategy: CreditCardStrategy,
    private pixStrategy: PixStrategy,
  ) {
    this.strategies.set('credit_card', this.creditCardStrategy);
    this.strategies.set('pix', this.pixStrategy);
  }

  async processPayment(method: string, amount: number) {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw new BadRequestException('Invalid payment method');
    }
    return await strategy.process(amount);
  }
}
```

### [5. Factory Pattern]()

Use for complex object creation:

```typescript
@Injectable()
export class ReportFactory {
  createReport(type: string, data: any): IReport {
    switch (type) {
      case 'pdf':
        return new PdfReport(data);
      case 'excel':
        return new ExcelReport(data);
      case 'csv':
        return new CsvReport(data);
      default:
        throw new BadRequestException('Invalid report type');
    }
  }
}
```

## [Scalable Organization]()

Code structuring in well-defined layers to facilitate system maintenance and evolution.

### [Layer Separation]()

```
module/
├── module.controller.ts    # HTTP layer
├── module.service.ts        # Business layer
├── module.repository.ts     # Data layer (optional)
├── entities/               # Data model
├── dto/                    # Validation
└── services/               # Sub-services
```

**Recommended Structure with Use-Cases:**

```
module/
├── module.controller.ts    # HTTP layer
├── module.service.ts        # Simple CRUD and direct operations
├── use-cases/              # ⭐ Complex business rules (RECOMMENDED)
│   ├── interfaces.ts         # Interfaces segregated by responsibility
│   ├── calculate-balance.usecase.ts
│   ├── process-payment.usecase.ts
│   └── generate-report.usecase.ts
├── entities/               # TypeORM data model
├── dto/                    # Input/output validation
└── services/               # Auxiliary sub-services
```

**IMPORTANT**:
- ✅ Use **Use-Cases** for complex business rules, multiple transactions and logic that needs to be tested in isolation
- ✅ Use **Service** only for simple CRUD and direct operations
- ✅ See `./how-to-create-use-case-backend.md` for complete Use-Cases documentation

### [Real Example]()

```typescript
// Controller - HTTP Layer
@Controller('products')
export class ProductController {
  constructor(private service: ProductService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }
}

// Service - Business Layer
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
    private notificationService: NotificationService,
    private inventoryService: InventoryService,
  ) {}

  async create(dto: CreateProductDto, userId: number) {
    // Business validation
    await this.validateStock(dto.stock);

    // Create product
    const product = this.repository.create({
      ...dto,
      userId,
    });

    const saved = await this.repository.save(product);

    // Parallel processes
    await Promise.all([
      this.notificationService.notifyCreation(saved),
      this.inventoryService.registerProduct(saved),
    ]);

    return saved;
  }

  private async validateStock(stock: number) {
    if (stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }
  }
}
```

## [Error Handling]()

Strategies for consistent and informative error handling using NestJS exceptions.

### [Use NestJS Exceptions]()

```typescript
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class ProductService {
  async findOne(id: number, userId: number) {
    const product = await this.repository.findOne({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto, userId: number) {
    // Validate business rule
    const existing = await this.repository.findOne({
      where: { code: dto.code, userId },
    });

    if (existing) {
      throw new ConflictException('Product with this code already exists');
    }

    return await this.repository.save({ ...dto, userId });
  }
}
```

## [Ownership Validation]()

Always validate that the resource belongs to the user:

```typescript
@Injectable()
export class ProductService {
  // Private helper method
  private async findOneOrFail(id: number, userId: number) {
    const product = await this.repository.findOne({
      where: { id, userId }, // Filter by user
    });

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  // Use in all methods
  async update(id: number, dto: UpdateProductDto, userId: number) {
    const product = await this.findOneOrFail(id, userId);

    Object.assign(product, dto);
    return await this.repository.save(product);
  }

  async remove(id: number, userId: number) {
    const product = await this.findOneOrFail(id, userId);
    return await this.repository.remove(product);
  }
}
```

## [Transactions]()

Use transactions for atomic operations:

```typescript
import { DataSource } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemRepository: Repository<OrderItem>,
  ) {}

  async createOrder(dto: CreateOrderDto, userId: number) {
    // Execute in transaction
    return await this.dataSource.transaction(async (manager) => {
      // Create order
      const order = manager.create(Order, {
        userId,
        total: dto.total,
      });
      await manager.save(order);

      // Create items
      const items = dto.items.map(item =>
        manager.create(OrderItem, {
          ...item,
          orderId: order.id,
        })
      );
      await manager.save(items);

      return order;
    });
  }
}
```

## [Logging]()

Add strategic logging:

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  async create(dto: CreateProductDto, userId: number) {
    this.logger.log(`Creating product for user ${userId}`);

    try {
      const product = await this.repository.save({ ...dto, userId });

      this.logger.log(`Product ${product.id} created successfully`);
      return product;

    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```


## [Scalability Checklist]()

- [ ] **Use-Cases for complex business rules** (see `./how-to-create-use-case-backend.md`)
- [ ] One service = One responsibility (simple CRUD)
- [ ] Interface segregation (Use-Case Pattern)
- [ ] Dependency injection everywhere
- [ ] Validation with DTOs
- [ ] Error handling with appropriate exceptions
- [ ] Isolation by userId
- [ ] Transactions for atomic operations
- [ ] Logging at critical points
- [ ] Swagger documentation
- [ ] Type-safe code (TypeScript)
- [ ] English naming for classes, interfaces and methods

## [Final Tips]()

1. **Use Use-Cases for complex rules**: Whenever there are multiple transactions or complex business logic
2. **Prefer thin Use-Cases**: 1 interface per use-case (see `./how-to-create-use-case-backend.md`)
3. **Start simple**: Don't optimize prematurely
4. **Refactor when needed**: When exceeding 300 lines or complexity arises
5. **Use interfaces**: To decouple implementations (Use-Case Pattern)
6. **Avoid logic in controller**: Controller only routes, Use-Case processes
7. **Service only for simple CRUD**: Complex rules go in Use-Cases
8. **Test in isolation**: Mock interfaces, not concrete classes
9. **Inline docs**: Comment complex code
10. **Consistency**: Follow project patterns
11. **English naming**: Classes, interfaces and methods always in English

## [References]()

- **[Use-Cases in Backend](./how-to-create-use-case-backend.md)** - Complete documentation on Use-Case Pattern
- [NestJS Best Practices](https://docs.nestjs.com/techniques/performance)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)
