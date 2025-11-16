# How to Create Use-Cases in NestJS Backend

<document description: Comprehensive guide for implementing thin, focused Use-Cases following SOLID principles, interface segregation, and dependency injection for scalable NestJS backend development.>

## [What is a Use-Case and Core Philosophy]()

A Use-Case is a class implementing one or more interfaces representing specific domain responsibilities. This design promotes high cohesion, low coupling, and facilitates comprehensive unit testing through dependency injection and interface segregation, with strong emphasis on keeping use-cases thin and focused.

### When to use?
Use Use-Cases when implementing complex business logic involving multiple database operations, external API integrations, sophisticated validation rules, or orchestration between multiple services requiring high testability and maintainability.

### When NOT to use?
Avoid Use-Cases for simple CRUD operations, direct database reads/writes without business logic, trivial endpoints, or basic transformations. In these cases, keep logic in the standard service layer.

### Example
See thin use-case example below demonstrating single interface implementation with private helper methods.

### Checklist
- [ ] Use-Case implements one interface (preferred) or max 2-3 related interfaces
- [ ] Each interface has only one public method
- [ ] Use-Case class is under 100-150 lines
- [ ] Private helper methods organize internal logic
- [ ] Dependencies injected through constructor
- [ ] Named in English with UseCase suffix
- [ ] Registered in module providers

### Troubleshooting
**Issue**: Use-Case becoming too large and complex
**Solution**: Split into multiple thin use-cases, each implementing single interface. Better to have many small files than few large ones.

**Issue**: Difficulty testing use-case
**Solution**: Ensure dependencies are injected as interfaces, making them easy to mock. Keep use-cases focused on single responsibility.

### Best Practices
Prefer one use-case per interface for maximum simplicity and testability. Keep use-cases thin (under 100 lines). Use private methods to organize complex logic. Name all interfaces, classes, and methods in English. Follow Interface Segregation Principle religiously.

**Main characteristics:**
- Each interface has only one method (Interface Segregation Principle)
- The Use-Case implements all methods from the interfaces it represents
- Promotes separation of responsibilities (Single Responsibility Principle)
- Facilitates mocking and testing of isolated components
- **Prefer "thin" use-cases**: 1 interface per use-case (ideal) or at most 2-3 related interfaces

**Philosophy: Keep Use-Cases Thin**

**MAIN RULE**: Prefer **one use-case class implementing ONE SINGLE interface/business rule**.

This means you will have **many use-case files** in the project, and this is **desirable and correct**! Don't be afraid to create multiple small files.

**Advantages of this approach:**
- ✅ Small classes focused on a single responsibility
- ✅ Extremely easy to test and mock code
- ✅ Greater reusability and composition
- ✅ Better adherence to SOLID principles (especially SRP)
- ✅ Easy to understand, maintain and modify
- ✅ Reduces coupling between different business rules
- ✅ Allows independent evolution of each rule

**Use-Case class structure:**
- Implementation of **ONE public method** from the interface
- **Private** helper methods to organize internal logic
- Dependencies injected via constructor
- Keeps the class small and cohesive (ideally < 100 lines)

**Example folder structure with multiple use-cases:**
```
src/modules/financial/
├── use-cases/
│   ├── interfaces.ts                           # All module interfaces
│   ├── calculate-balance.usecase.ts            # Use-case 1
│   ├── process-investment.usecase.ts           # Use-case 2
│   ├── generate-report.usecase.ts              # Use-case 3
│   ├── validate-credit.usecase.ts              # Use-case 4
│   ├── calculate-interest.usecase.ts           # Use-case 5
│   ├── process-transfer.usecase.ts             # Use-case 6
│   └── apply-discount.usecase.ts               # Use-case 7
```

**Don't be afraid of having many files!** Having 10-20 small use-cases is **better** than having 2-3 large use-cases.

**Thin Use-Case Example:**

```typescript
// Interface with a single responsibility
export interface CalculatePortfolioBalance {
  calculatePortfolioBalance(userId: number): Promise<BalanceResult>;
}

// Thin use-case implementing one interface
@Injectable()
export class CalculatePortfolioBalanceUseCase implements CalculatePortfolioBalance {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Public method from interface
  async calculatePortfolioBalance(userId: number): Promise<BalanceResult> {
    const assets = await this.getUserAssets(userId);
    const transactions = await this.getUserTransactions(userId);

    const totalInvested = this.calculateTotalInvested(transactions);
    const currentValue = this.calculateCurrentValue(assets);
    const profit = this.calculateProfit(currentValue, totalInvested);

    return {
      totalInvested,
      currentValue,
      profit,
      profitPercentage: (profit / totalInvested) * 100,
    };
  }

  // Private helper methods
  private async getUserAssets(userId: number): Promise<Asset[]> {
    return this.assetRepository.find({ where: { userId } });
  }

  private async getUserTransactions(userId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({ where: { userId } });
  }

  private calculateTotalInvested(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateCurrentValue(assets: Asset[]): number {
    return assets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
  }

  private calculateProfit(currentValue: number, totalInvested: number): number {
    return currentValue - totalInvested;
  }
}
```

Notice that:
- The class is **small** and focused on a single responsibility
- It has only **one public method** (from the interface)
- Uses **private methods** to organize internal logic
- Easy to test each method in isolation

## [When to Use Use-Cases - Detailed Scenarios]()

Use-Cases are recommended when business operations involve complex logic, multiple database transactions, or sophisticated rules requiring high testability and maintainability. They excel at isolating business rules from infrastructure concerns.

### When to use?
Implement Use-Cases for complex business rules involving multiple operations, sophisticated orchestration between services, external API integration requiring error handling and retry logic, or operations needing comprehensive unit testing and mocking.

### When NOT to use?
Skip Use-Cases for simple CRUD operations without business logic, basic database queries, direct read/write operations, or trivial transformations better handled in service methods.

### Example
See specific scenarios below (Complex Business Rules, Multiple Related Responsibilities, Flexibility and Testability needs).

### Checklist
- [ ] Operation involves complex business logic
- [ ] Multiple database transactions required
- [ ] External API integration needed
- [ ] High testability requirement
- [ ] Operation orchestrates multiple services
- [ ] Business rules need isolation from infrastructure

### Troubleshooting
**Issue**: Unclear whether to use Use-Case or Service
**Solution**: If operation is simple CRUD, use Service. If it involves complex logic, multiple steps, or needs extensive testing, use Use-Case.

**Issue**: Use-Case vs multiple service methods
**Solution**: Use-Case provides better interface segregation and testability. Choose Use-Case when isolation and mocking are priorities.

### Best Practices
Create Use-Cases for complex scenarios requiring isolation and testability. Keep simple operations in services. Don't over-engineer simple CRUD with use-cases. Document the reasoning for choosing use-case pattern.

### 1. Complex Business Rules
When an operation involves multiple database transactions or complex business logic.

**Example**: Process an order that involves validating inventory, calculating prices, applying discounts, creating financial transaction and sending notifications.

### 2. Multiple Related Responsibilities
When a service needs to execute several distinct but related actions in the same domain.

**Example**: Financial system that calculates balance, processes investments and generates reports.

### 3. Need for Flexibility and Testability
When you need to test each responsibility in isolation or easily swap implementations.

### When NOT to use Use-Cases?

- **Simple CRUD**: Use the module's standard service
- **Direct operations**: Simple read/write without complex rules
- **Trivial endpoints**: Basic queries without processing

## [File Structure: Thin Use-Cases in Separate Files]()

File organization pattern for Use-Cases within modules, strongly favoring thin, focused files where each use-case implements a single interface. This approach maximizes reusability, testability, and code clarity by creating many small files rather than few large ones.

### When to use?
Always organize use-cases as separate thin files within the use-cases folder of each module. Create one file per use-case implementing one interface for optimal code organization, testability, and maintainability.

### When NOT to use?
Avoid this pattern only in legacy codebases where migration cost is prohibitive. Never create single large files containing multiple use-cases - this defeats the purpose of interface segregation.

### Example
See recommended folder structure below showing multiple thin use-case files versus old anti-pattern of single large file.

### Checklist
- [ ] use-cases folder exists in module
- [ ] interfaces.ts file contains all interface definitions
- [ ] Each use-case in separate file (kebab-case.usecase.ts)
- [ ] Use-case class name is PascalCaseUseCase
- [ ] Interface name is descriptive in English
- [ ] No large multi-use-case files

### Troubleshooting
**Issue**: Too many files feels overwhelming
**Solution**: This is intentional and correct. Many small focused files are easier to navigate, test, and maintain than few large files.

**Issue**: Finding right use-case file
**Solution**: Use descriptive names matching interface purpose. IDE search and barrel exports (index.ts) help navigation.

### Best Practices
Embrace many small files over few large files. Use consistent naming (kebab-case.usecase.ts). Keep interfaces.ts as single source of interface definitions per module. Export use-cases through barrel files for clean imports.

### Example: Structure with Thin Use-Cases (Recommended)

```
src/modules/financial/
├── financial.module.ts
├── financial.controller.ts
├── financial.service.ts
├── entities/
│   └── transaction.entity.ts
├── dto/
│   ├── create-transaction.dto.ts
│   └── calculate-balance.dto.ts
├── use-cases/
│   ├── interfaces.ts                           # All interfaces
│   ├── calculate-balance.usecase.ts            # Use-case 1: Calculate balance
│   ├── process-investment.usecase.ts           # Use-case 2: Process investment
│   ├── generate-report.usecase.ts              # Use-case 3: Generate report
│   ├── validate-credit.usecase.ts              # Use-case 4: Validate credit
│   ├── calculate-interest.usecase.ts           # Use-case 5: Calculate interest
│   ├── process-transfer.usecase.ts             # Use-case 6: Process transfer
│   └── apply-discount.usecase.ts               # Use-case 7: Apply discount
```

**Notice**: Each use-case in a separate file, implementing a single interface/business rule.

### Old Structure (Not Recommended)

```
src/modules/financeiro/
├── use-cases/
│   ├── interfaces.ts
│   └── regras-financeiras.usecase.ts    # ❌ A single large file with multiple rules
```

**Problem**: One large file implementing multiple interfaces, hard to maintain and test.

### Naming Convention

**IMPORTANT**: All interfaces and classes must have names in **English**, following TypeScript naming conventions and international development best practices.

| Item | Pattern | Example | Language |
|------|---------|---------|----------|
| Folder | `use-cases/` | Always singular | English |
| Interfaces file | `interfaces.ts` | Single file per module | English |
| Use-case file | `descriptive-name.usecase.ts` | kebab-case with `.usecase` suffix | English |
| Use-case class | `DescriptiveNameUseCase` | PascalCase with `UseCase` suffix | English |
| Interface | `ResponsibilityName` | PascalCase without I prefix | English |

## [Step-by-Step Use-Case Implementation]()

Detailed implementation workflow covering interface definition, use-case creation, module registration, and dependency injection. Follow this systematic approach to ensure SOLID principles compliance and proper integration with NestJS framework.

### When to use?
Follow this step-by-step process every time you create a new use-case to ensure consistency, proper SOLID principles application, correct module integration, and maintainable code structure.

### When NOT to use?
These steps assume greenfield development. For legacy code refactoring, adapt steps to existing structure while moving towards this ideal pattern incrementally.

### Example
See detailed steps below (Step 1: Define Interfaces, Step 2: Create Use-Case, Step 3: Register in Module, Step 4: Inject in Service/Controller).

### Checklist
- [ ] Interfaces defined in interfaces.ts with descriptive English names
- [ ] Each interface has one method
- [ ] Use-Case implements one (preferred) or few related interfaces
- [ ] Use-Case registered in module providers
- [ ] Use-Case injected via dependency injection
- [ ] All names in English following conventions
- [ ] Private helper methods for complex logic

### Troubleshooting
**Issue**: Dependency injection fails
**Solution**: Ensure use-case is registered in module providers array and @Injectable decorator is present.

**Issue**: Cannot resolve interface dependency
**Solution**: TypeScript interfaces don't exist at runtime. Inject concrete class or use type intersection.

### Best Practices
Follow steps sequentially. Define interfaces first to clarify responsibilities. Keep use-cases thin by implementing minimal interfaces. Always use English naming. Register in module immediately after creation. Test each step before proceeding.

### Step 1: Define the Interfaces

Create the `interfaces.ts` file with all module responsibility interfaces:

**File**: `src/modules/financeiro/use-cases/interfaces.ts`

```typescript
// Each interface represents ONE responsibility
// Each interface has ONLY ONE method

export interface CalculateCurrentBalance {
  calculateCurrentBalance(userId: number): Promise<number>;
}

export interface CalculateMonthlyReturn {
  calculateMonthlyReturn(userId: number, month: number, year: number): Promise<number>;
}

export interface ProcessInvestment {
  processInvestment(
    userId: number,
    amount: number,
    type: string,
  ): Promise<{ success: boolean; transactionId: number }>;
}

export interface GenerateFinancialReport {
  generateFinancialReport(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    initialBalance: number;
    finalBalance: number;
    income: number;
    expenses: number;
  }>;
}
```

**Interface Rules:**
- Descriptive name indicating the action (verb in infinitive) **in English**
- Single public method per interface
- Explicit and typed parameters
- Always typed return (can be Promise)
- **Always name interfaces, classes AND methods in English** (e.g. `CalculateBalance`, `ProcessPayment`, `GenerateReport`)

**IMPORTANT**: All names must be in English:
- ✅ Classes: `CalculateBalanceUseCase`, `ProcessInvestmentUseCase`
- ✅ Interfaces: `CalculateBalance`, `ProcessInvestment`
- ✅ Public methods: `calculateBalance()`, `processInvestment()`
- ✅ Private methods: `getUserAssets()`, `calculateTotalInvested()`
- ❌ NEVER use Portuguese: `calcularSaldo()`, `processarInvestimento()`

### Step 2: Create the Use-Case

Implement the Use-Case that uses one or more interfaces:

**File**: `src/modules/financeiro/use-cases/regras-financeiras.usecase.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transacao } from '../entities/transacao.entity';
import {
  CalculateCurrentBalance,
  CalculateMonthlyReturn,
  ProcessInvestment,
  GenerateFinancialReport
} from './interfaces';

@Injectable()
export class FinancialRulesUseCase
  implements
    CalculateCurrentBalance,
    CalculateMonthlyReturn,
    ProcessInvestment,
    GenerateFinancialReport
{
  constructor(
    @InjectRepository(Transacao)
    private readonly transacaoRepository: Repository<Transacao>,
  ) {}

  async calculateCurrentBalance(userId: number): Promise<number> {
    const result = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'credito' })
      .getRawOne();

    const credits = result?.total || 0;

    const debits = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'debito' })
      .getRawOne();

    const totalDebits = debits?.total || 0;

    return credits - totalDebits;
  }

  async calculateMonthlyReturn(
    userId: number,
    month: number,
    year: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'rendimento' })
      .andWhere('transacao.data BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return result?.total || 0;
  }

  async processInvestment(
    userId: number,
    amount: number,
    type: string,
  ): Promise<{ success: boolean; transactionId: number }> {
    // Validate available balance
    const currentBalance = await this.calculateCurrentBalance(userId);

    if (currentBalance < amount) {
      return { success: false, transactionId: 0 };
    }

    // Create debit transaction (amount outflow)
    const debit = this.transacaoRepository.create({
      userId,
      valor: amount,
      tipo: 'debito',
      descricao: `Investment ${type}`,
      data: new Date(),
    });

    await this.transacaoRepository.save(debit);

    // Create investment record
    const investment = this.transacaoRepository.create({
      userId,
      valor: amount,
      tipo: 'investimento',
      descricao: type,
      data: new Date(),
    });

    const result = await this.transacaoRepository.save(investment);

    return { success: true, transactionId: result.id };
  }

  async generateFinancialReport(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    initialBalance: number;
    finalBalance: number;
    income: number;
    expenses: number;
  }> {
    // Calculate initial balance (before start date)
    const initialBalance = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(CASE WHEN tipo = \'credito\' THEN valor ELSE -valor END)', 'saldo')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.data < :startDate', { startDate })
      .getRawOne();

    // Calculate income in period
    const income = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'credito' })
      .andWhere('transacao.data BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    // Calculate expenses in period
    const expenses = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'debito' })
      .andWhere('transacao.data BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    const totalIncome = income?.total || 0;
    const totalExpenses = expenses?.total || 0;
    const initialBalanceValue = initialBalance?.saldo || 0;
    const finalBalance = initialBalanceValue + totalIncome - totalExpenses;

    return {
      initialBalance: initialBalanceValue,
      finalBalance,
      income: totalIncome,
      expenses: totalExpenses,
    };
  }
}
```

### Step 3: Register in Module

Add the Use-Case to the module providers:

**File**: `src/modules/financeiro/financeiro.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { Transacao } from './entities/transacao.entity';
import { FinancialRulesUseCase } from './use-cases/regras-financeiras.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Transacao])],
  controllers: [FinanceiroController],
  providers: [
    FinanceiroService,
    FinancialRulesUseCase, // Register the Use-Case
  ],
  exports: [
    FinanceiroService,
    FinancialRulesUseCase, // Export if other modules need it
  ],
})
export class FinanceiroModule {}
```

### Step 4: Inject in Service or Controller

Use the Use-Case through Dependency Injection:

**Option A: Inject in Service (Recommended)**

```typescript
import { Injectable } from '@nestjs/common';
import { FinancialRulesUseCase } from './use-cases/regras-financeiras.usecase';
import { CalculateCurrentBalance } from './use-cases/interfaces';

@Injectable()
export class FinanceiroService {
  constructor(
    // Inject via interface (better for testing)
    private readonly financialRules: CalculateCurrentBalance & FinancialRulesUseCase,
  ) {}

  async getBalance(userId: number): Promise<{ balance: number }> {
    const balance = await this.financialRules.calculateCurrentBalance(userId);
    return { balance };
  }
}
```

**Option B: Inject directly in Controller**

```typescript
import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialRulesUseCase } from './use-cases/regras-financeiras.usecase';

@ApiTags('financeiro')
@ApiBearerAuth()
@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private readonly financialRules: FinancialRulesUseCase,
  ) {}

  @Get('balance')
  async getBalance(@Request() req) {
    const balance = await this.financialRules.calculateCurrentBalance(
      req.user.userId,
    );
    return { balance };
  }

  @Post('invest')
  async invest(
    @Body() dto: { amount: number; type: string },
    @Request() req,
  ) {
    return await this.financialRules.processInvestment(
      req.user.userId,
      dto.amount,
      dto.type,
    );
  }

  @Get('report')
  async generateReport(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.financialRules.generateFinancialReport(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
```

## [SOLID Principles Applied in Use-Cases]()

Practical demonstration of how Use-Cases implement each SOLID principle: Single Responsibility through interface segregation, Open-Closed through extension, Liskov Substitution through polymorphism, Interface Segregation through minimal contracts, and Dependency Inversion through abstraction.

### When to use?
Apply SOLID principles rigorously when designing interfaces and use-cases to ensure code is maintainable, testable, extensible, and follows industry best practices. Review these principles during code reviews and architectural decisions.

### When NOT to use?
SOLID principles are always applicable - there's no scenario where you should ignore them. However, don't over-engineer simple scenarios; apply principles pragmatically based on complexity.

### Example
See subsections below demonstrating each SOLID principle (S - Single Responsibility, O - Open/Closed, L - Liskov Substitution, I - Interface Segregation, D - Dependency Inversion).

### Checklist
- [ ] Each interface has single responsibility (S)
- [ ] Use-cases open for extension, closed for modification (O)
- [ ] Implementations substitutable via interfaces (L)
- [ ] Interfaces segregated with minimal methods (I)
- [ ] Dependencies on abstractions not concretions (D)

### Troubleshooting
**Issue**: Unclear which SOLID principle is violated
**Solution**: Review symptoms - large interfaces violate I, mixed responsibilities violate S, concrete dependencies violate D.

**Issue**: Applying SOLID feels over-engineered
**Solution**: SOLID prevents future pain. Start with S and I principles, add others as complexity grows.

### Best Practices
Make SOLID principles non-negotiable in use-case design. Use interfaces for every responsibility. Keep interfaces minimal. Inject dependencies through constructors. Design for extension without modification. Enable substitutability through proper abstractions.

### S - Single Responsibility Principle
Each interface represents a single responsibility. If a responsibility changes, only one method is affected.

```typescript
// ❌ Wrong: Interface with multiple responsibilities
export interface FinancialOperations {
  calculateBalance(userId: number): Promise<number>;
  processInvestment(userId: number, amount: number): Promise<boolean>;
  generateReport(userId: number): Promise<any>;
}

// ✅ Correct: Segregated interfaces
export interface CalculateBalance {
  calculateBalance(userId: number): Promise<number>;
}

export interface ProcessInvestment {
  processInvestment(userId: number, amount: number): Promise<boolean>;
}

export interface GenerateReport {
  generateReport(userId: number): Promise<any>;
}
```

### O - Open/Closed Principle
Use-Cases are open for extension (new interfaces) but closed for modification.

```typescript
// Add new functionality without modifying existing Use-Case
export interface ValidateCredit {
  validateCredit(userId: number, amount: number): Promise<boolean>;
}

// Create new Use-Case or extend existing one
export class AdvancedFinancialRulesUseCase
  extends FinancialRulesUseCase
  implements ValidateCredit
{
  async validateCredit(userId: number, amount: number): Promise<boolean> {
    const balance = await this.calculateCurrentBalance(userId);
    return balance >= amount;
  }
}
```

### L - Liskov Substitution Principle
Any implementation of the interface can replace another without breaking the code.

```typescript
// Multiple implementations of the same interface
export class FinancialRulesUseCase implements CalculateCurrentBalance {
  async calculateCurrentBalance(userId: number): Promise<number> {
    // Standard implementation
  }
}

export class CachedFinancialRulesUseCase implements CalculateCurrentBalance {
  async calculateCurrentBalance(userId: number): Promise<number> {
    // Implementation with cache
  }
}
```

### I - Interface Segregation Principle
Clients should not depend on methods they don't use. Each interface has only one method.

```typescript
// ✅ Controller only needs to calculate balance
export class BalanceController {
  constructor(private readonly calculateBalance: CalculateCurrentBalance) {}

  @Get('balance')
  async getBalance(@Request() req) {
    // Doesn't have access to unnecessary methods
    return await this.calculateBalance.calculateCurrentBalance(req.user.userId);
  }
}
```

### D - Dependency Inversion Principle
Depend on abstractions (interfaces), not concrete implementations.

```typescript
// ✅ Correct: Depends on interface
export class FinanceiroService {
  constructor(
    private readonly calculateBalance: CalculateCurrentBalance, // Interface
  ) {}
}

// ❌ Wrong: Depends on concrete implementation
export class FinanceiroService {
  constructor(
    private readonly financialRules: FinancialRulesUseCase, // Concrete class
  ) {}
}
```

## [Testing Use-Cases]()

Use-Cases require comprehensive unit tests with mocked dependencies to ensure isolated testing of business logic. Tests should cover success scenarios, edge cases, and error handling using Jest framework with arrange-act-assert pattern.

### When to use?
Write comprehensive unit tests for every use-case immediately after implementation, covering all public methods, edge cases, error scenarios, and ensuring 100% code coverage through proper mocking of dependencies.

### When NOT to use?
Never skip use-case testing. These are critical business logic components requiring thorough test coverage. Integration tests complement but don't replace unit tests.

### Example
See referenced guide for complete examples. Use Jest with mocked repositories, services, and external dependencies following arrange-act-assert pattern.

### Checklist
- [ ] Test file created (*.usecase.spec.ts)
- [ ] All dependencies mocked
- [ ] Success scenarios tested
- [ ] Error cases tested
- [ ] Edge cases covered
- [ ] 100% code coverage achieved
- [ ] Arrange-Act-Assert pattern followed

### Troubleshooting
**Issue**: Difficult to mock dependencies
**Solution**: Ensure dependencies are injected as interfaces. Use Jest's jest.fn() and mockImplementation for clean mocks.

**Issue**: Low code coverage
**Solution**: Test all branches including error handling, edge cases, and private method logic paths.

### Best Practices
Test every use-case thoroughly. Mock all external dependencies. Follow AAA pattern. Test both success and failure paths. Aim for 100% coverage. Keep tests readable and maintainable.

**📖 For complete Use-Case testing guide, see**: `./how-to-test-use-cases-jest-backend.md`

The guide contains:
- Complete Jest configuration
- Test templates
- Practical examples of mocking repositories, HttpService and ConfigService
- Arrange-Act-Assert patterns
- Exception and error case testing
- 100% code coverage

## [Comparison: Traditional Service vs Use-Case]()

Side-by-side analysis contrasting traditional service-based architecture with Use-Case-driven design, highlighting differences in responsibility distribution, coupling levels, testability, and dependency management. Use-Cases excel in complex scenarios while services suffice for simple CRUD.

### When to use?
Reference this comparison when deciding between traditional service methods and use-case pattern, explaining architecture to team members, or evaluating existing code for refactoring opportunities.

### When NOT to use?
Don't use this as absolute rules - both patterns have their place. Simple CRUD legitimately belongs in services. Complex business logic benefits from use-cases.

### Example
See comparison table and code examples below demonstrating both approaches.

### Checklist
- [ ] Simple CRUD remains in traditional service
- [ ] Complex logic extracted to use-cases
- [ ] Decision documented for each complex operation
- [ ] Team aligned on when to use each pattern

### Troubleshooting
**Issue**: Everything becoming use-case (over-engineering)
**Solution**: Keep simple CRUD in services. Use use-cases only for complex multi-step operations.

**Issue**: Complex logic buried in services
**Solution**: Refactor to use-cases for better testability and separation of concerns.

### Best Practices
Use traditional services for simple CRUD operations. Apply use-case pattern for complex business logic. Don't force everything into use-cases. Maintain consistent patterns across codebase. Document architectural decisions.

| Aspect | Traditional Service | Use-Case |
|--------|-------------------|----------|
| **When to use** | Simple CRUD, direct operations | Complex rules, multiple transactions |
| **Responsibility** | Multiple operations in same service | One interface = one responsibility |
| **Testability** | Need to mock entire service | Mock only the necessary interface |
| **Dependencies** | Depends on concrete class | Depends on interfaces (abstractions) |
| **Coupling** | More coupled | Low coupling |
| **Example** | `UserService.findAll()` | `CalculateBalanceUseCase.calculateBalance()` |

### Comparative Example

**Traditional Service:**
```typescript
@Injectable()
export class FinanceiroService {
  // All operations in a single service
  async calculateBalance(userId: number) { }
  async processInvestment(userId: number, amount: number) { }
  async generateReport(userId: number) { }
  async validateCredit(userId: number) { }
  // ... 10 more methods
}

// Controller needs to inject complete service
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}
}
```

**Use-Case:**
```typescript
// Segregated into specific interfaces
export interface CalculateCurrentBalance {
  calculateCurrentBalance(userId: number): Promise<number>;
}

// Controller injects only what's necessary
export class BalanceController {
  constructor(private readonly calculateBalance: CalculateCurrentBalance) {}
}
```

## [Best Practices for Thin and Focused Use-Cases]()

Essential guidelines for creating maintainable Use-Cases: one interface per method, descriptive English naming, type aliases for combinations, and preferring single-interface use-cases. These practices ensure code remains modular, testable, and aligned with SOLID principles.

### When to use?
Apply these best practices universally when creating any use-case, during code reviews, when refactoring existing code, or establishing coding standards for the team.

### When NOT to use?
These are mandatory best practices, not optional guidelines. There are no scenarios where you should deviate from these standards.

### Example
See numbered best practices below with code examples demonstrating correct and incorrect patterns.

### Checklist
- [ ] One interface = one method
- [ ] Names in English (interfaces, classes, methods)
- [ ] Use-case implements 1 interface (preferred) or max 2-3
- [ ] Type aliases used for interface combinations
- [ ] Interfaces well-documented
- [ ] Use-case file under 100-150 lines

### Troubleshooting
**Issue**: Team not following best practices
**Solution**: Implement linting rules, code review checklist, and automated formatting. Reference this guide in PR templates.

**Issue**: Legacy code doesn't follow standards
**Solution**: Refactor incrementally. Apply standards to all new code. Plan migration sprints for legacy code.

### Best Practices
Treat these as non-negotiable standards. Enforce through code review and automation. Keep use-cases thin and focused. Use English naming universally. Document interfaces clearly. Prefer many small files over few large files.

### 1. One Interface = One Method
```typescript
// ❌ Wrong
export interface FinancialOperations {
  calculateBalance(userId: number): Promise<number>;
  process(userId: number, amount: number): Promise<void>;
}

// ✅ Correct
export interface CalculateBalance {
  calculateBalance(userId: number): Promise<number>;
}

export interface ProcessOperation {
  process(userId: number, amount: number): Promise<void>;
}
```

### 2. Clear and Descriptive Naming in English
```typescript
// ❌ Wrong: Generic names or in Portuguese
export interface Process { }
export interface Execute { }
export interface ProcessInvestment { }

// ✅ Correct: Descriptive names in English
export interface ProcessInvestment { }
export interface ExecuteTransferBetweenAccounts { }
export interface CalculatePortfolioBalance { }
export interface GenerateFinancialReport { }
```

**Rule**: All interfaces, classes and methods (public and private) must be named in **English** to maintain consistency with:
- TypeScript/JavaScript conventions
- International best practices
- Facilitate collaboration on global projects
- Maintain compatibility with libraries and frameworks

**Examples of correct methods:**
```typescript
// ✅ CORRECT: Methods in English
async calculateBalance(userId: number): Promise<number> { }
async processInvestment(data: InvestmentData): Promise<Result> { }
private async getUserAssets(userId: number): Promise<Asset[]> { }
private calculateTotalInvested(transactions: Transaction[]): number { }

// ❌ WRONG: Methods in Portuguese
async calcularSaldo(userId: number): Promise<number> { }
async processarInvestimento(dados: any): Promise<any> { }
private async obterAtivosDoUsuario(userId: number): Promise<any[]> { }
private calcularTotalInvestido(transacoes: any[]): number { }
```

### 3. Use Type Aliases for Combinations
```typescript
// When a component needs multiple interfaces
type FinancialOperations = CalculateCurrentBalance & ProcessInvestment;

export class FinanceiroService {
  constructor(
    private readonly operations: FinancialOperations,
  ) {}
}
```

### 4. Keep Use-Cases Thin and Cohesive

**GOLDEN RULE**: Prefer **ONE use-case class implementing ONE interface**.

This results in **many small files**, and that's exactly what we want! It's better to have 20 files of 50 lines each than 2 files of 500 lines.

```typescript
// ✅ EXCELLENT: Thin use-case with single interface (PREFERRED)
export class CalculateBalanceUseCase implements CalculateBalance {
  async calculateBalance(userId: number): Promise<number> {
    // Implementation focused on ONE single responsibility
    // Private helper methods allowed
  }
}

// ✅ EXCELLENT: Another thin focused use-case
export class ProcessInvestmentUseCase implements ProcessInvestment {
  async processInvestment(data: InvestmentData): Promise<Result> {
    // Another single responsibility in separate file
  }
}

// ✅ EXCELLENT: One more thin use-case
export class GenerateReportUseCase implements GenerateReport {
  async generateReport(params: ReportParams): Promise<Report> {
    // Focus on a single business rule
  }
}

// ⚠️ ACCEPTABLE: Only if interfaces are VERY related (max 2-3)
export class AccountOperationsUseCase
  implements CalculateBalance, ProcessTransfer { }

// ❌ AVOID: Use-Case with multiple interfaces
export class FinancialOperationsUseCase
  implements CalculateBalance, ProcessInvestment, GenerateReport { }

// ❌ BAD: Fat use-case with many interfaces
export class AllFinancialRulesUseCase
  implements Interface1, Interface2, Interface3, Interface4,
             Interface5, Interface6, Interface7 { }
```

**Preference Hierarchy**:
1. **🥇 IDEAL**: 1 interface = 1 use-case (thin class, single rule)
2. **🥈 ACCEPTABLE**: 2-3 very related interfaces in 1 use-case
3. **🥉 AVOID**: More than 3 interfaces in 1 use-case
4. **🚫 NEVER**: Mix domains or more than 5 interfaces

**Why are many small files better?**
- ✅ Each file represents ONE clear business rule
- ✅ Extremely easy to test in isolation
- ✅ Easy to find and modify specific code
- ✅ Reduces merge conflicts (smaller files)
- ✅ Facilitates code review (small and focused changes)
- ✅ Allows flexible composition of functionalities
- ✅ Religiously follows Single Responsibility Principle

**Real organization example:**
```
use-cases/
├── calculate-portfolio-balance.usecase.ts       # 45 lines
├── calculate-asset-allocation.usecase.ts        # 38 lines
├── process-buy-order.usecase.ts                 # 52 lines
├── process-sell-order.usecase.ts                # 48 lines
├── calculate-profit-loss.usecase.ts             # 41 lines
├── generate-tax-report.usecase.ts               # 67 lines
├── validate-investment-limit.usecase.ts         # 33 lines
├── calculate-dividend-yield.usecase.ts          # 29 lines
└── sync-market-prices.usecase.ts                # 55 lines
```

**Total**: 9 small and focused files instead of 1-2 large and confusing files.

### 5. Document Interfaces
```typescript
/**
 * Calculates a user's current balance considering all
 * credit and debit transactions up to the moment.
 *
 * @param userId - User ID
 * @returns Current balance in decimal number
 */
export interface CalculateCurrentBalance {
  calculateCurrentBalance(userId: number): Promise<number>;
}
```

## [Use-Case Implementation Checklist]()

Comprehensive verification checklist covering interface design, implementation quality, module registration, dependency injection, testing coverage, and adherence to SOLID principles. Use this to validate every use-case before deployment.

### When to use?
Use this checklist for every new use-case before committing code, during code reviews to ensure standards compliance, and when refactoring existing use-cases to verify completeness.

### When NOT to use?
This is a mandatory checklist for all use-cases. Do not skip or selectively apply - every item is important for code quality and maintainability.

### Example
See comprehensive checklist below covering all aspects of use-case implementation.

### Checklist
Use the detailed checklist items below (already provided in the section).

### Troubleshooting
**Issue**: Checklist too long and tedious
**Solution**: Automate what's possible through linting and tests. Use as code review template. Becomes second nature with practice.

**Issue**: Items unclear or ambiguous
**Solution**: Reference specific sections in this guide for clarification. Update checklist wording if confusion persists.

### Best Practices
Review checklist before starting implementation to guide development. Use during code review as objective quality gate. Automate verification where possible. Keep checklist updated as patterns evolve.

- [ ] `interfaces.ts` file created in `use-cases/`
- [ ] Each interface has only one method
- [ ] Interface names are descriptive (verb in infinitive) **in English**
- [ ] **Use-Case preferably implements 1 interface (ideal) or at most 2-3 related interfaces**
- [ ] Use-Case is "thin" - doesn't implement more than 5 interfaces
- [ ] Use-Case is registered in module `providers`
- [ ] Use-Case is injected via interface, not concrete class
- [ ] Use-Case methods handle complex business rules
- [ ] Simple CRUD remains in traditional service
- [ ] Use-Case has single and cohesive responsibility
- [ ] Unit tests cover each method in isolation
- [ ] Interface documentation is complete

## [Troubleshooting: Common Use-Case Problems]()

Solutions for frequent implementation challenges including dependency resolution errors, circular dependencies, and oversized use-cases. These troubleshooting patterns help resolve common NestJS and TypeScript issues when working with use-cases.

### When to use?
Reference this section when encountering errors during use-case implementation, dependency injection failures, circular dependency warnings, or when use-cases become too large and unwieldy.

### When NOT to use?
If issue is not listed here, consult NestJS official documentation, TypeScript documentation, or project-specific troubleshooting guides. Add new patterns here as they're discovered.

### Example
See specific error scenarios and solutions below (Dependency Resolution, Circular Dependency, Oversized Use-Cases).

### Checklist
- [ ] Error message identified and matched to scenario
- [ ] Solution applied correctly
- [ ] Root cause understood to prevent recurrence
- [ ] Similar patterns checked across codebase
- [ ] Documentation updated if new pattern discovered

### Troubleshooting
This is the troubleshooting section itself - see specific scenarios below.

### Best Practices
Document new error patterns as discovered. Share solutions with team. Address root causes, not just symptoms. Refactor to prevent recurring issues. Keep this section updated with team's learnings.

### Error: "Cannot resolve dependency"

**Problem**: NestJS cannot resolve the interface dependency.

**Solution**: TypeScript interfaces are removed at runtime. Inject the concrete class:

```typescript
// ❌ Doesn't work: Interface doesn't exist at runtime
constructor(private readonly calc: CalculateBalance) {}

// ✅ Works: Inject concrete class
constructor(
  private readonly financialRules: FinancialRulesUseCase
) {}

// ✅ Works: Type alias with concrete class
constructor(
  private readonly calc: CalculateBalance & FinancialRulesUseCase
) {}
```

### Error: "Circular dependency"

**Problem**: Use-Case depends on service that depends on use-case.

**Solution**: Use `forwardRef` or restructure dependencies:

```typescript
import { forwardRef, Inject } from '@nestjs/common';

constructor(
  @Inject(forwardRef(() => FinanceiroService))
  private readonly service: FinanceiroService,
) {}
```

### Use-Case too large

**Problem**: Use-Case implements more than 5 interfaces, making the class "fat" and hard to maintain.

**Solution**: Split into multiple thin and cohesive Use-Cases. **Always prefer 1 interface per use-case**.

```typescript
// ❌ BAD: Giant fat use-case
export class AllFinancialRulesUseCase
  implements Interface1, Interface2, Interface3, Interface4, Interface5, Interface6 { }

// ✅ IDEAL: Thin use-cases with one interface each
export class CalculateBalanceUseCase implements CalculateBalance { }
export class ProcessInvestmentUseCase implements ProcessInvestment { }
export class GenerateReportUseCase implements GenerateReport { }
export class ValidateCreditUseCase implements ValidateCredit { }
export class CalculateInterestUseCase implements CalculateInterest { }
export class ProcessTransferUseCase implements ProcessTransfer { }

// ✅ ALTERNATIVE: Use-Cases with very related interfaces (max 2-3)
export class CheckingAccountRulesUseCase
  implements CalculateBalance, ProcessTransfer { }

export class InvestmentRulesUseCase
  implements ProcessInvestment, CalculateInterest { }

export class ReportRulesUseCase
  implements GenerateReport, ValidateCredit { }
```

**Recommendation**: Whenever possible, create use-cases with **a single interface** to keep classes thin, focused and easy to test.

## [Complete Example: Orders Module with Use-Cases]()

End-to-end implementation demonstrating real-world use-case pattern in an orders module, including interface definitions, use-case implementation with multiple responsibilities, and controller integration showcasing practical application of all concepts.

### When to use?
Reference this complete example when setting up new modules with use-cases, as template for consistent implementation across project, or when teaching use-case pattern to team members.

### When NOT to use?
Don't blindly copy this example - adapt to your specific domain and requirements. This demonstrates multi-interface use-case; prefer single-interface use-cases when possible.

### Example
See complete implementation below showing Interfaces, Use-Case, and Controller integration for an orders module.

### Checklist
- [ ] Interfaces clearly defined with single methods
- [ ] Use-case implements all required interfaces
- [ ] Dependencies injected via constructor
- [ ] Business logic well-organized
- [ ] Controller delegates to use-case
- [ ] All names in English
- [ ] Follows project conventions

### Troubleshooting
**Issue**: Example doesn't match my use case
**Solution**: Adapt pattern to your domain. Focus on principles (interface segregation, dependency injection) rather than specific implementation.

**Issue**: Example has multiple interfaces per use-case
**Solution**: This shows it's acceptable for related interfaces. However, prefer splitting into multiple single-interface use-cases when feasible.

### Best Practices
Use as reference, not rigid template. Adapt to specific domain needs. Prefer simpler single-interface use-cases when possible. Ensure all implementations follow project standards. Keep examples updated as patterns evolve.

### Interfaces

```typescript
// src/modules/pedido/use-cases/interfaces.ts
export interface CreateOrder {
  createOrder(userId: number, items: OrderItem[]): Promise<Order>;
}

export interface ValidateInventory {
  validateInventory(items: OrderItem[]): Promise<boolean>;
}

export interface CalculateOrderTotal {
  calculateOrderTotal(items: OrderItem[]): Promise<number>;
}

export interface ApplyDiscount {
  applyDiscount(total: number, coupon?: string): Promise<number>;
}
```

### Use-Case

```typescript
// src/modules/pedido/use-cases/process-order.usecase.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Product } from '@modules/product/entities/product.entity';
import {
  CreateOrder,
  ValidateInventory,
  CalculateOrderTotal,
  ApplyDiscount,
} from './interfaces';

@Injectable()
export class ProcessOrderUseCase
  implements CreateOrder, ValidateInventory, CalculateOrderTotal, ApplyDiscount
{
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async validateInventory(items: OrderItem[]): Promise<boolean> {
    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product || product.inventory < item.quantity) {
        return false;
      }
    }
    return true;
  }

  async calculateOrderTotal(items: OrderItem[]): Promise<number> {
    let total = 0;

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (product) {
        total += product.price * item.quantity;
      }
    }

    return total;
  }

  async applyDiscount(total: number, coupon?: string): Promise<number> {
    if (!coupon) {
      return total;
    }

    // Coupon validation and application logic
    const discount = 0.1; // 10% example
    return total * (1 - discount);
  }

  async createOrder(userId: number, items: OrderItem[]): Promise<Order> {
    // Validate inventory
    const validInventory = await this.validateInventory(items);
    if (!validInventory) {
      throw new BadRequestException('Insufficient inventory');
    }

    // Calculate total
    const total = await this.calculateOrderTotal(items);

    // Create order
    const order = this.orderRepository.create({
      userId,
      total,
      status: 'pending',
      items: JSON.stringify(items),
    });

    return await this.orderRepository.save(order);
  }
}
```

### Controller

```typescript
// src/modules/pedido/pedido.controller.ts
import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessOrderUseCase } from './use-cases/process-order.usecase';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(
    private readonly processOrder: ProcessOrderUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto, @Request() req) {
    return await this.processOrder.createOrder(
      req.user.userId,
      dto.items,
    );
  }
}
```

## [References on Use-Cases and SOLID]()

Curated external resources including NestJS providers documentation, SOLID principles explanations, Clean Architecture guidance, and Interface Segregation Principle references for deepening understanding of use-case patterns and architectural best practices.

### When to use?
Consult these references when deepening understanding of SOLID principles, learning Clean Architecture concepts, understanding NestJS dependency injection, or researching advanced use-case patterns.

### When NOT to use?
Start with this guide before diving into external resources. Use references for deeper understanding, not as replacement for project-specific patterns documented here.

### Example
External documentation and learning resources:
- [NestJS Providers](https://docs.nestjs.com/providers)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)

### Checklist
- [ ] Project guide reviewed first
- [ ] Specific question or topic identified
- [ ] Reference material matches technology stack
- [ ] Patterns adapted to project conventions
- [ ] New learnings documented and shared

### Troubleshooting
**Issue**: External patterns don't match project conventions
**Solution**: Always adapt external examples to follow project standards. When in doubt, follow this guide.

**Issue**: Conflicting advice between sources
**Solution**: Prioritize project-specific patterns in this guide. Discuss with team before adopting conflicting external patterns.

### Best Practices
Use references for foundational understanding. Always filter through project-specific requirements. Share useful references with team. Contribute back learnings to this guide. Keep reference list updated and relevant.
