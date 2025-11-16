# How to create a scalable implementation pattern in Backend modules?

> Complete guide to best practices for creating scalable and maintainable NestJS modules using SOLID principles, dependency injection, and proven design patterns.

## [Fundamental Principles]()

Essential software design concepts applied to developing scalable NestJS modules including Single Responsibility Principle, Dependency Injection, and Dependency Inversion. These principles ensure code maintainability, testability, and reduce coupling between components, enabling easier refactoring and long-term scalability.

### When to use?
Apply these fundamental principles when designing any NestJS module or service. Use Single Responsibility to ensure each class has one job, Dependency Injection to avoid tight coupling, and Dependency Inversion to depend on abstractions rather than concrete implementations. Essential for all backend development.

### When NOT to use?
These principles are foundational and should always be followed in production code. However, in quick prototypes, proof-of-concepts, or throwaway scripts where long-term maintainability is not a concern, strict adherence may be relaxed for speed of development.

### Example
See subsections below for specific examples of each principle.

### Checklist
- [ ] Each class has a single, well-defined responsibility
- [ ] Dependencies are injected via constructor, not created internally
- [ ] Services depend on interfaces, not concrete implementations
- [ ] Code is testable with mockable dependencies
- [ ] No circular dependencies exist

### Troubleshooting
**Problem:** Circular dependency errors at runtime.
**Solution:** Review your dependency graph and introduce interfaces to break the cycle using Dependency Inversion.

**Problem:** Difficulty testing services due to hard dependencies.
**Solution:** Ensure all dependencies are injected via constructor and use interfaces for better mockability.

### Best Practices
- Keep constructors clean with only dependency injection
- Use interfaces for all external dependencies to enable easy mocking
- Follow the "new is glue" principle - avoid using 'new' in business logic
- Document complex dependency relationships in comments
- Regularly refactor to maintain principle compliance

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

Proven design patterns for structuring scalable and maintainable code in NestJS applications including Use-Case Pattern for business logic, Repository Pattern for data access, DTO Pattern for validation, Strategy Pattern for multiple implementations, and Factory Pattern for object creation. These patterns provide clear separation of concerns and facilitate code reuse.

### When to use?
Apply these implementation patterns when building complex business features that require clear separation between business logic, data access, and validation. Use Use-Cases for complex multi-step operations, Repository for data access abstraction, DTOs for input validation, Strategy for switchable algorithms, and Factory for complex object creation.

### When NOT to use?
Avoid over-engineering simple CRUD operations that don't require complex business logic. For straightforward database reads/writes without processing, direct repository usage in services is acceptable. Don't introduce patterns that add unnecessary complexity without clear benefit.

### Example
See subsections below for specific pattern examples including Use-Case, Repository, DTO, Strategy, and Factory patterns with complete code demonstrations.

### Checklist
- [ ] Use-Cases implemented for complex business rules with multiple transactions
- [ ] Repository pattern used for all data access operations
- [ ] DTOs defined with class-validator decorators for all inputs
- [ ] Strategy pattern applied when multiple algorithm implementations exist
- [ ] Factory pattern used for complex object instantiation logic

### Troubleshooting
**Problem:** Business logic scattered across controllers and services.
**Solution:** Extract complex operations into dedicated Use-Case classes with clear interfaces.

**Problem:** Difficulty switching between different implementations.
**Solution:** Apply Strategy pattern with interface-based dependency injection.

**Problem:** Complex object creation logic cluttering business code.
**Solution:** Move creation logic into dedicated Factory classes.

### Best Practices
- Prefer Use-Cases over fat services for complex operations
- Keep Use-Cases thin with single responsibility (1 interface per use-case)
- Always validate inputs with DTOs before processing
- Use TypeORM repositories instead of custom data access code
- Document pattern usage in code comments for clarity
- Reference ./how-to-create-use-case-backend.md for Use-Case best practices

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

Code structuring in well-defined layers including HTTP, Business, and Data layers to facilitate system maintenance and evolution. Recommended folder structure separates controllers, services, use-cases, entities, DTOs and sub-services. This layered architecture ensures clear boundaries between components and enables independent development and testing of each layer.

### When to use?
Apply this layered organization structure to all NestJS modules to maintain consistency and scalability. Use the HTTP/Business/Data separation for clear responsibility boundaries. Organize complex modules with use-cases folder for business rules, entities for data models, and dto for validation.

### When NOT to use?
For extremely simple modules with only 1-2 files, strict folder separation may be overkill. Small utility modules or shared components may use a flatter structure. However, as modules grow, migrate to this organized structure before complexity becomes unmanageable.

### Example
See subsections below for detailed folder structure examples showing recommended organization with use-cases, entities, DTOs, and services properly separated.

### Checklist
- [ ] Controllers contain only HTTP routing logic, no business rules
- [ ] Complex business logic implemented in use-cases folder
- [ ] Simple CRUD operations remain in service layer
- [ ] Entities folder contains TypeORM models
- [ ] DTOs folder contains input/output validation classes
- [ ] Services folder contains auxiliary sub-services
- [ ] No circular dependencies between layers

### Troubleshooting
**Problem:** Module files exceeding 300 lines and becoming difficult to maintain.
**Solution:** Extract business logic into separate use-cases and break services into smaller sub-services.

**Problem:** Unclear where to place new functionality.
**Solution:** Follow the layer rules: HTTP in controller, business in use-case/service, data in repository/entity.

**Problem:** Difficulty testing due to mixed responsibilities.
**Solution:** Ensure strict layer separation allowing isolated unit testing of each component.

### Best Practices
- Keep controllers thin - only routing and HTTP concerns
- Place complex business rules in use-cases, not services
- Use services for simple CRUD operations
- Group related use-cases in the use-cases folder
- Maintain consistent naming: module.controller.ts, module.service.ts
- Document module structure in top-level comments
- Refer to ./backend-module-folder-structure.md for complete structure guidelines

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

Strategies for consistent and informative error handling using NestJS built-in exceptions like NotFoundException, BadRequestException, ConflictException, and UnauthorizedException. Proper error handling provides meaningful feedback to clients and ensures robust API behavior. Always throw specific exceptions with descriptive messages to improve debugging and user experience.

### When to use?
Use NestJS built-in exceptions for all error scenarios in services, use-cases, and controllers. Throw NotFoundException when resources don't exist, BadRequestException for invalid inputs, ConflictException for constraint violations, UnauthorizedException for auth failures, and ForbiddenException for permission issues.

### When NOT to use?
Avoid creating custom exception classes unless you have very specific error handling requirements not covered by NestJS built-ins. Don't throw generic Error objects - always use the appropriate NestJS exception for consistent HTTP status codes and error response formatting.

### Example
See subsection below for complete examples of using NestJS exceptions including NotFoundException, ConflictException, and BadRequestException with proper error messages.

### Checklist
- [ ] All error scenarios throw appropriate NestJS exceptions
- [ ] Exception messages are descriptive and include context (e.g., IDs, resource names)
- [ ] NotFoundException used when resources are not found
- [ ] BadRequestException used for validation failures
- [ ] ConflictException used for uniqueness constraint violations
- [ ] UnauthorizedException used for authentication failures
- [ ] No generic Error objects thrown in business logic

### Troubleshooting
**Problem:** Clients receive 500 errors instead of specific HTTP status codes.
**Solution:** Ensure you're throwing NestJS exceptions, not generic Error objects.

**Problem:** Error messages expose sensitive implementation details.
**Solution:** Keep messages user-friendly while logging detailed errors server-side with Logger.

**Problem:** Inconsistent error response formats across endpoints.
**Solution:** Use only NestJS built-in exceptions for automatic standardized formatting.

### Best Practices
- Always include resource identifiers in error messages (e.g., "Product 123 not found")
- Use specific exceptions over generic ones (NotFoundException vs BadRequestException)
- Log errors with stack traces using NestJS Logger before throwing
- Validate business rules early and throw exceptions immediately
- Document expected exceptions in Swagger with @ApiResponse decorators
- Never expose database errors directly - wrap in appropriate exceptions

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

Security pattern that ensures users can only access resources they own by filtering database queries by userId. This prevents unauthorized access to data and is critical for multi-tenant applications. Always implement private helper methods to validate ownership before performing update or delete operations, throwing NotFoundException when resource does not belong to the authenticated user.

### When to use?
Apply ownership validation to all protected endpoints that operate on user-specific resources. Always filter database queries by userId for find, update, and delete operations. Critical for multi-tenant applications where users should only access their own data.

### When NOT to use?
Skip ownership validation only for public resources accessible to all users or admin endpoints that explicitly need cross-user access. System-level operations and unauthenticated public endpoints don't require userId filtering.

### Example
See code below demonstrating private helper method pattern for ownership validation with automatic NotFoundException when resource doesn't belong to authenticated user.

### Checklist
- [ ] All protected endpoints filter queries by userId from authenticated request
- [ ] Private findOneOrFail helper method validates ownership
- [ ] Update operations verify ownership before modification
- [ ] Delete operations verify ownership before removal
- [ ] NotFoundException thrown when resource not found or unauthorized
- [ ] No direct access to resources without userId validation

### Troubleshooting
**Problem:** Users can access other users' data by guessing IDs.
**Solution:** Ensure all database queries include userId filter from authenticated request.

**Problem:** Ownership checks duplicated across multiple methods.
**Solution:** Extract into private helper method (e.g., findOneOrFail) and reuse.

**Problem:** Unclear whether 404 is "not found" or "not authorized".
**Solution:** This is correct - return 404 for both to avoid leaking resource existence information.

### Best Practices
- Always include userId in where clause for protected resources
- Create private helper methods for ownership validation to avoid duplication
- Return 404 (NotFoundException) for both missing and unauthorized resources
- Extract userId from authenticated request object, never from request body
- Log unauthorized access attempts for security monitoring
- Document ownership requirements in API documentation

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

Database transactions ensure atomicity of operations involving multiple tables or entities. Use TypeORM DataSource transaction method to wrap related database operations, ensuring that all succeed or all fail together. This prevents data inconsistency when creating orders with items, transferring funds between accounts, or performing any multi-step database operations that must be atomic.

### When to use?
Use database transactions when performing operations that involve multiple related database writes that must all succeed or all fail together. Essential for creating parent-child records (orders with items), transferring between accounts, updating inventory with orders, or any multi-step operation requiring atomicity.

### When NOT to use?
Avoid transactions for single database operations or read-only queries. Don't use for operations involving external APIs or long-running processes as transactions lock database resources. Skip for independent operations that don't need to be atomic.

### Example
See code below showing TypeORM DataSource transaction usage for creating order with multiple items, ensuring all records are saved together or rolled back on failure.

### Checklist
- [ ] All multi-table write operations wrapped in transactions
- [ ] DataSource injected and used for transaction management
- [ ] Transaction callback uses manager parameter for all operations
- [ ] Related records created in correct order (parent before children)
- [ ] Foreign keys properly set within transaction
- [ ] No external API calls inside transaction blocks

### Troubleshooting
**Problem:** Partial data saved when operation fails midway.
**Solution:** Wrap all related operations in a single transaction block to ensure atomicity.

**Problem:** Transaction deadlocks under concurrent load.
**Solution:** Keep transactions short, always acquire locks in same order, avoid external calls.

**Problem:** Cannot access entities saved in transaction from outside.
**Solution:** Return entities from transaction callback - they'll be available after commit.

### Best Practices
- Keep transaction blocks as short as possible to minimize lock duration
- Always use the manager parameter inside transaction callback, not repositories
- Create parent entities before children to satisfy foreign key constraints
- Avoid calling external APIs inside transactions - do before or after
- Handle errors appropriately - transaction automatically rolls back on exception
- Log transaction start/end for debugging and monitoring
- Consider using optimistic locking for concurrent updates

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

Strategic logging at critical points using NestJS Logger service provides visibility into application behavior, facilitates debugging, and enables monitoring. Log at service level with appropriate log levels: log for informational messages, warn for non-critical issues, error for failures with stack traces. Include contextual information like userId, entityId, and operation names to enable effective troubleshooting in production environments.

### When to use?
Add logging to all critical operations including create/update/delete actions, external API calls, business rule validations, error scenarios, and performance-sensitive operations. Use log() for success cases, warn() for recoverable issues, and error() with stack traces for failures.

### When NOT to use?
Avoid logging in simple getters, trivial operations, or high-frequency read operations that would create excessive noise. Don't log sensitive data like passwords, tokens, or PII. Skip logging in private helper methods already covered by public method logs.

### Example
See code below demonstrating NestJS Logger usage with appropriate log levels, contextual information including userId and entityId, and error handling with stack traces.

### Checklist
- [ ] Logger instance created with class name for context
- [ ] Critical operations logged with relevant details
- [ ] Success cases use logger.log() with context
- [ ] Warnings use logger.warn() for recoverable issues
- [ ] Errors use logger.error() with message and stack trace
- [ ] Logs include userId, entityId, and operation context
- [ ] No sensitive data (passwords, tokens, PII) in logs

### Troubleshooting
**Problem:** Cannot identify which user triggered an error in production.
**Solution:** Always include userId in log messages for user-specific operations.

**Problem:** Log messages don't provide enough context to debug issues.
**Solution:** Include entity IDs, operation names, and relevant state information.

**Problem:** Too many logs making it hard to find important information.
**Solution:** Use appropriate log levels and avoid logging trivial operations or loops.

### Best Practices
- Create Logger instance with class name for proper context identification
- Include userId in all user-specific operation logs for traceability
- Include entity IDs when operating on specific records
- Use structured logging with consistent message formats
- Log before and after critical state changes
- Always include stack traces with error logs
- Use log levels appropriately: log (info), warn (recoverable), error (failure)
- Avoid logging in loops - summarize results instead
- Never log sensitive information - mask or exclude from logs

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

Comprehensive verification checklist to ensure all scalability best practices are applied including use-cases for complex logic, dependency injection, validation, error handling, transactions, logging, and documentation. Use this checklist before considering any implementation complete.

### When to use?
Apply this checklist before submitting any implementation for review. Use as final verification step to ensure all scalability patterns and best practices have been implemented. Review checklist when refactoring existing code to identify improvement opportunities.

### When NOT to use?
Don't use this checklist as a step-by-step implementation guide - refer to specific pattern sections above for that. This is a verification tool, not a tutorial.

### Example
See checklist items below covering use-cases, service responsibilities, dependency injection, validation, error handling, transactions, logging, documentation, and naming conventions.

### Checklist
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

### Troubleshooting
**Problem:** Checklist items unclear or ambiguous.
**Solution:** Refer to corresponding sections above for detailed explanations of each item.

**Problem:** Some checklist items don't apply to current implementation.
**Solution:** Mark N/A with explanation, but ensure you're not skipping applicable best practices.

### Best Practices
- Review checklist before submitting for code review
- Document any intentional deviations with rationale
- Use checklist during peer code reviews
- Update checklist based on project-specific requirements
- Refer to detailed sections for implementation guidance on each item

## [Final Tips]()

Quick reference collection of the most important recommendations distilled from all sections above to help developers maintain scalable, maintainable code. These tips represent the core principles that should guide all backend development decisions.

### When to use?
Reference these tips when making design decisions, during code reviews, or when unsure about best approach. Use as quick mental checklist before implementing new features or refactoring existing code.

### When NOT to use?
Don't rely solely on these tips without understanding the detailed sections above. Tips are reminders, not substitutes for comprehensive understanding of patterns and principles.

### Example
See numbered tips below covering use-cases, simplicity, refactoring, interfaces, controller design, testing, documentation, consistency, and naming conventions.

### Checklist
- [ ] Use-Cases implemented for complex business rules with multiple transactions
- [ ] Code starts simple without premature optimization
- [ ] Refactoring performed when files exceed 300 lines
- [ ] Interfaces used to decouple implementations
- [ ] Controllers kept thin with only routing logic
- [ ] Tests written using mocked interfaces for isolation
- [ ] Complex code documented with inline comments
- [ ] English naming used consistently throughout

### Troubleshooting
**Problem:** Uncertain whether to create use-case or keep logic in service.
**Solution:** If multiple transactions or complex business logic, use use-case. Simple CRUD stays in service.

**Problem:** Code becoming difficult to maintain and test.
**Solution:** Refactor into smaller, focused classes following Single Responsibility Principle.

### Best Practices
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

Curated collection of internal documentation and external resources for deeper learning about scalable implementation patterns, clean architecture principles, and NestJS best practices. Use these references to expand understanding beyond this guide.

### When to use?
Consult these references when you need deeper understanding of specific patterns, want to learn theoretical foundations, or need official documentation for NestJS features. Use internal references for project-specific implementation details.

### When NOT to use?
Don't start with external references before reading this guide - they provide broader context but may not be project-specific. For immediate implementation guidance, always prioritize project documentation in .rules first.

### Example
See links below including internal documentation for use-cases and external resources for NestJS best practices, clean architecture, SOLID principles, and interface segregation.

### Checklist
- [ ] Internal project documentation consulted first (./how-to-create-use-case-backend.md)
- [ ] NestJS official docs referenced for framework-specific questions
- [ ] Clean Architecture principles understood for architectural decisions
- [ ] SOLID principles reviewed for design decisions
- [ ] Interface Segregation Principle applied for use-case design

### Troubleshooting
**Problem:** External resources contradict project patterns.
**Solution:** Project documentation in .rules takes precedence - external resources provide general guidance.

**Problem:** References seem outdated or no longer available.
**Solution:** Focus on internal documentation which is maintained for this project specifically.

### Best Practices
- **[Use-Cases in Backend](./how-to-create-use-case-backend.md)** - Complete documentation on Use-Case Pattern
- [NestJS Best Practices](https://docs.nestjs.com/techniques/performance)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)
