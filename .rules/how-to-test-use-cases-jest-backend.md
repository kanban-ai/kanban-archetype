# How to test Use-Cases with Jest in the Backend

> Complete guide to configure and create unit tests exclusively for Use-Case classes using Jest, mocking all external dependencies for isolated execution.

## [Use-Case Testing Principles]()

Unit tests for Use-Cases should:

- **Test only Use-Cases**: Services, Controllers and APIs don't need unit tests
- **Mock all dependencies**: Repositories, external services, HttpService, etc.
- **Isolated execution**: No database, no external APIs, no filesystem
- **Focus on business logic**: Validate rules, calculations and decision flows
- **Use Arrange-Act-Assert pattern**: Clear test organization

## [Initial Jest Setup]()

### [1. Install dependencies]()

```bash
npm install --save-dev @nestjs/testing jest @types/jest ts-jest
```

### [2. Create jest.config.js in project root]()

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.usecase.ts',
    '!**/*.module.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### [3. Add scripts to package.json]()

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

## [Test File Structure]()

### [Location of .spec.ts files]()

```
src/
└── modules/
    └── transactions/
        ├── usecases/
        │   ├── financial-rules.usecase.ts
        │   └── financial-rules.usecase.spec.ts  ← Next to the use-case
        └── entities/
            └── transaction.entity.ts
```

### [Mandatory naming convention]()

- Use-Case: `name.usecase.ts`
- Test: `name.usecase.spec.ts`

## [Basic Use-Case Test Template]()

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NameOfUseCase } from './name-of.usecase';
import { RelatedEntity } from '../entities/entity.entity';

describe('NameOfUseCase', () => {
  let useCase: NameOfUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    // 1. Create mocks for all dependencies
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        getMany: jest.fn(),
      }),
    };

    // 2. Create test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NameOfUseCase,
        {
          provide: getRepositoryToken(RelatedEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    // 3. Get use-case instance
    useCase = module.get<NameOfUseCase>(NameOfUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useCaseMethod', () => {
    it('should execute success scenario', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue({ id: 1, value: 100 });

      // Act
      const result = await useCase.useCaseMethod(1);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw exception when data is invalid', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.useCaseMethod(999)).rejects.toThrow();
    });
  });
});
```

## [Complete Example: FinancialRulesUseCase Test]()

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FinancialRulesUseCase } from './financial-rules.usecase';
import { Transaction } from '../entities/transaction.entity';

describe('FinancialRulesUseCase', () => {
  let useCase: FinancialRulesUseCase;
  let mockTransactionRepository: any;

  beforeEach(async () => {
    // Complete Repository mock
    mockTransactionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      }),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialRulesUseCase,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<FinancialRulesUseCase>(FinancialRulesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateCurrentBalance', () => {
    it('should calculate balance correctly with credits and debits', async () => {
      // Arrange
      mockTransactionRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValueOnce({ total: 5000 }) // Credits
        .mockResolvedValueOnce({ total: 2000 }); // Debits

      // Act
      const balance = await useCase.calculateCurrentBalance(1);

      // Assert
      expect(balance).toBe(3000);
      expect(mockTransactionRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should return 0 when there are no transactions', async () => {
      // Arrange
      mockTransactionRepository.createQueryBuilder().getRawOne.mockResolvedValue(null);

      // Act
      const balance = await useCase.calculateCurrentBalance(1);

      // Assert
      expect(balance).toBe(0);
    });

    it('should consider only transactions from the correct user', async () => {
      // Arrange
      const userId = 42;
      mockTransactionRepository.createQueryBuilder().getRawOne.mockResolvedValue({ total: 1000 });

      // Act
      await useCase.calculateCurrentBalance(userId);

      // Assert
      const queryBuilder = mockTransactionRepository.createQueryBuilder();
      expect(queryBuilder.where).toHaveBeenCalledWith('transaction.userId = :userId', { userId });
    });
  });

  describe('processInvestment', () => {
    it('should process investment with sufficient balance', async () => {
      // Arrange
      jest.spyOn(useCase, 'calculateCurrentBalance').mockResolvedValue(10000);
      mockTransactionRepository.create.mockReturnValue({ id: 1, type: 'INVESTMENT' });
      mockTransactionRepository.save.mockResolvedValue({ id: 1, type: 'INVESTMENT' });

      // Act
      const result = await useCase.processInvestment(1, 5000, 'CDB');

      // Assert
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe(1);
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should fail when balance is insufficient', async () => {
      // Arrange
      jest.spyOn(useCase, 'calculateCurrentBalance').mockResolvedValue(1000);

      // Act
      const result = await useCase.processInvestment(1, 5000, 'CDB');

      // Assert
      expect(result.success).toBe(false);
      expect(result.transactionId).toBe(0);
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });

    it('should validate minimum investment amount', async () => {
      // Arrange
      jest.spyOn(useCase, 'calculateCurrentBalance').mockResolvedValue(10000);

      // Act & Assert
      await expect(useCase.processInvestment(1, 50, 'CDB')).rejects.toThrow(
        'Minimum investment amount is R$ 100',
      );
    });
  });

  describe('validateCreditLimit', () => {
    it('should approve transaction within limit', async () => {
      // Arrange
      jest.spyOn(useCase, 'calculateCurrentBalance').mockResolvedValue(5000);
      const userLimit = 10000;

      // Act
      const approved = await useCase.validateCreditLimit(1, 3000, userLimit);

      // Assert
      expect(approved).toBe(true);
    });

    it('should reject transaction above limit', async () => {
      // Arrange
      jest.spyOn(useCase, 'calculateCurrentBalance').mockResolvedValue(8000);
      const userLimit = 10000;

      // Act
      const approved = await useCase.validateCreditLimit(1, 5000, userLimit);

      // Assert
      expect(approved).toBe(false);
    });
  });
});
```

## [Mocking Multiple Dependencies]()

### [Use-Case with Repository and HttpService]()

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@/common/http/http.service';
import { StockQuoteUseCase } from './stock-quote.usecase';
import { Investment } from '../entities/investment.entity';

describe('StockQuoteUseCase', () => {
  let useCase: StockQuoteUseCase;
  let mockInvestmentRepository: any;
  let mockHttpService: any;

  beforeEach(async () => {
    // Repository mock
    mockInvestmentRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };

    // HttpService mock
    mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockQuoteUseCase,
        {
          provide: getRepositoryToken(Investment),
          useValue: mockInvestmentRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    useCase = module.get<StockQuoteUseCase>(StockQuoteUseCase);
  });

  it('should fetch quote and update investments', async () => {
    // Arrange
    mockInvestmentRepository.find.mockResolvedValue([
      { id: 1, ticker: 'AAPL', quantity: 10 },
    ]);

    mockHttpService.get.mockResolvedValue({
      symbol: 'AAPL',
      price: 150.0,
    });

    mockInvestmentRepository.save.mockResolvedValue({
      id: 1,
      ticker: 'AAPL',
      currentValue: 1500.0,
    });

    // Act
    const result = await useCase.updateQuotes(1);

    // Assert
    expect(result.updatedInvestments).toBe(1);
    expect(mockHttpService.get).toHaveBeenCalledWith('https://api.example.com/quote/AAPL');
  });
});
```

## [Mocking ConfigService]()

```typescript
import { ConfigService } from '@nestjs/config';

describe('UseCase with ConfigService', () => {
  let mockConfigService: any;

  beforeEach(async () => {
    // ConfigService mock
    mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          API_KEY: 'test-key',
          API_URL: 'https://test-api.com',
          MAX_RETRIES: 3,
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourUseCase,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    useCase = module.get<YourUseCase>(YourUseCase);
  });

  it('should use correct configuration', async () => {
    // Act
    await useCase.methodThatUsesConfig();

    // Assert
    expect(mockConfigService.get).toHaveBeenCalledWith('API_KEY');
  });
});
```

## [Testing Exceptions and Errors]()

```typescript
describe('error handling', () => {
  it('should throw BadRequestException when userId is invalid', async () => {
    // Act & Assert
    await expect(useCase.processTransaction(null, 100)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when user does not exist', async () => {
    // Arrange
    mockRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.fetchUserData(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should propagate repository error', async () => {
    // Arrange
    const dbError = new Error('Database connection failed');
    mockRepository.save.mockRejectedValue(dbError);

    // Act & Assert
    await expect(useCase.saveData({})).rejects.toThrow('Database connection failed');
  });
});
```

## [Testing Methods with Jest.spyOn]()

When you need to mock methods from the Use-Case itself:

```typescript
describe('interdependent methods', () => {
  it('should use mocked internal method', async () => {
    // Arrange
    jest.spyOn(useCase, 'calculateCurrentBalance').mockResolvedValue(5000);
    jest.spyOn(useCase, 'applyFee').mockReturnValue(4750);

    // Act
    const result = await useCase.processWithdrawal(1, 1000);

    // Assert
    expect(useCase.calculateCurrentBalance).toHaveBeenCalledWith(1);
    expect(useCase.applyFee).toHaveBeenCalledWith(1000, 0.05);
    expect(result.finalAmount).toBe(3750);
  });
});
```

## [Testing Cases with Dates]()

```typescript
describe('date operations', () => {
  beforeEach(() => {
    // Mock Date for consistent tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate interest based on current date', async () => {
    // Arrange
    mockRepository.findOne.mockResolvedValue({
      startDate: new Date('2024-01-01'),
      initialValue: 1000,
    });

    // Act
    const result = await useCase.calculateAccruedInterest(1);

    // Assert
    expect(result.elapsedDays).toBe(14);
    expect(result.interest).toBeCloseTo(23.33, 2);
  });
});
```

## [Arrange-Act-Assert Pattern]()

Always organize tests following this pattern:

```typescript
it('should do something specific', async () => {
  // Arrange (Prepare)
  // - Configure mocks
  // - Define input data
  // - Prepare initial state
  mockRepository.findOne.mockResolvedValue({ id: 1, value: 100 });
  const input = { userId: 1, value: 50 };

  // Act (Execute)
  // - Execute the method being tested
  const result = await useCase.processOperation(input);

  // Assert (Verify)
  // - Verify the result
  // - Verify dependency calls
  expect(result.success).toBe(true);
  expect(mockRepository.save).toHaveBeenCalled();
});
```

## [Code Coverage]()

### [Run coverage report]()

```bash
npm run test:cov
```

### [Coverage target for Use-Cases]()

Use-Cases should have **100% coverage** as they contain critical business logic:

```javascript
// jest.config.js
module.exports = {
  // ...
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
```

## [Useful Jest Commands]()

```bash
# Run all tests
npm test

# Run in watch mode (re-runs on save)
npm run test:watch

# Run with coverage
npm run test:cov

# Run only one file
npm test financial-rules.usecase.spec

# Run only tests containing "calculate"
npm test -- -t "calculate"

# Debug tests
npm run test:debug
```

## [Use-Case Test Checklist]()

- [ ] `.spec.ts` file next to `.usecase.ts`
- [ ] All repositories mocked
- [ ] All external services mocked
- [ ] ConfigService mocked if used
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] Success scenarios tested
- [ ] Failure scenarios tested
- [ ] Exceptions tested
- [ ] Input validations tested
- [ ] Private methods tested via public methods
- [ ] 100% coverage on use-case
- [ ] No real external dependencies (DB, API, filesystem)

## [Common Errors and Solutions]()

### [Error: Cannot find module '@/...']()

**Solution**: Check `moduleNameMapper` in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### [Error: Repository not provided]()

**Solution**: Add repository mock with `getRepositoryToken()`:

```typescript
{
  provide: getRepositoryToken(MyEntity),
  useValue: mockRepository,
}
```

### [Error: Mock not being called]()

**Solution**: Use `jest.clearAllMocks()` in `afterEach()`.

## [References]()

- To understand Use-Case structure: `./how-to-create-use-case-backend.md`
- For backend code patterns: `./scalable-implementation-pattern-backend.md`
