# Como testar Use-Cases com Jest no Backend?

Guia completo para configurar e criar testes unitários exclusivamente para classes de Use-Case usando Jest, mockando todas as dependências externas para execução isolada.

## [Princípios dos Testes de Use-Case]()

Testes unitários de Use-Cases devem:

- **Testar apenas Use-Cases**: Services, Controllers e APIs não precisam de testes unitários
- **Mockar todas as dependências**: Repositories, serviços externos, HttpService, etc.
- **Execução isolada**: Sem banco de dados, sem APIs externas, sem filesystem
- **Focar na lógica de negócio**: Validar regras, cálculos e fluxos de decisão
- **Usar padrão Arrange-Act-Assert**: Organização clara dos testes

## [Configuração Inicial do Jest]()

### [1. Instalar dependências]()

```bash
npm install --save-dev @nestjs/testing jest @types/jest ts-jest
```

### [2. Criar jest.config.js na raiz do projeto]()

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

### [3. Adicionar scripts no package.json]()

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

## [Estrutura de Arquivo de Teste]()

### [Localização dos arquivos .spec.ts]()

```
src/
└── modules/
    └── transacoes/
        ├── usecases/
        │   ├── regras-financeiras.usecase.ts
        │   └── regras-financeiras.usecase.spec.ts  ← Ao lado do use-case
        └── entities/
            └── transacao.entity.ts
```

### [Nomenclatura obrigatória]()

- Use-Case: `nome.usecase.ts`
- Teste: `nome.usecase.spec.ts`

## [Template Básico de Teste de Use-Case]()

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NomeDoUseCase } from './nome-do.usecase';
import { EntidadeRelacionada } from '../entities/entidade.entity';

describe('NomeDoUseCase', () => {
  let useCase: NomeDoUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    // 1. Criar mocks de todas as dependências
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

    // 2. Criar módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NomeDoUseCase,
        {
          provide: getRepositoryToken(EntidadeRelacionada),
          useValue: mockRepository,
        },
      ],
    }).compile();

    // 3. Obter instância do use-case
    useCase = module.get<NomeDoUseCase>(NomeDoUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('metodoDoUseCase', () => {
    it('deve executar cenário de sucesso', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue({ id: 1, valor: 100 });

      // Act
      const resultado = await useCase.metodoDoUseCase(1);

      // Assert
      expect(resultado).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('deve lançar exceção quando dados inválidos', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.metodoDoUseCase(999)).rejects.toThrow();
    });
  });
});
```

## [Exemplo Completo: Teste de RegrasFinanceirasUseCase]()

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegrasFinanceirasUseCase } from './regras-financeiras.usecase';
import { Transacao } from '../entities/transacao.entity';

describe('RegrasFinanceirasUseCase', () => {
  let useCase: RegrasFinanceirasUseCase;
  let mockTransacaoRepository: any;

  beforeEach(async () => {
    // Mock completo do Repository
    mockTransacaoRepository = {
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
        RegrasFinanceirasUseCase,
        {
          provide: getRepositoryToken(Transacao),
          useValue: mockTransacaoRepository,
        },
      ],
    }).compile();

    useCase = module.get<RegrasFinanceirasUseCase>(RegrasFinanceirasUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calcularSaldoAtual', () => {
    it('deve calcular saldo corretamente com créditos e débitos', async () => {
      // Arrange
      mockTransacaoRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValueOnce({ total: 5000 }) // Créditos
        .mockResolvedValueOnce({ total: 2000 }); // Débitos

      // Act
      const saldo = await useCase.calcularSaldoAtual(1);

      // Assert
      expect(saldo).toBe(3000);
      expect(mockTransacaoRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('deve retornar 0 quando não há transações', async () => {
      // Arrange
      mockTransacaoRepository.createQueryBuilder().getRawOne.mockResolvedValue(null);

      // Act
      const saldo = await useCase.calcularSaldoAtual(1);

      // Assert
      expect(saldo).toBe(0);
    });

    it('deve considerar apenas transações do usuário correto', async () => {
      // Arrange
      const userId = 42;
      mockTransacaoRepository.createQueryBuilder().getRawOne.mockResolvedValue({ total: 1000 });

      // Act
      await useCase.calcularSaldoAtual(userId);

      // Assert
      const queryBuilder = mockTransacaoRepository.createQueryBuilder();
      expect(queryBuilder.where).toHaveBeenCalledWith('transacao.userId = :userId', { userId });
    });
  });

  describe('processarInvestimento', () => {
    it('deve processar investimento com saldo suficiente', async () => {
      // Arrange
      jest.spyOn(useCase, 'calcularSaldoAtual').mockResolvedValue(10000);
      mockTransacaoRepository.create.mockReturnValue({ id: 1, tipo: 'INVESTIMENTO' });
      mockTransacaoRepository.save.mockResolvedValue({ id: 1, tipo: 'INVESTIMENTO' });

      // Act
      const resultado = await useCase.processarInvestimento(1, 5000, 'CDB');

      // Assert
      expect(resultado.sucesso).toBe(true);
      expect(resultado.transacaoId).toBe(1);
      expect(mockTransacaoRepository.save).toHaveBeenCalled();
    });

    it('deve falhar quando saldo insuficiente', async () => {
      // Arrange
      jest.spyOn(useCase, 'calcularSaldoAtual').mockResolvedValue(1000);

      // Act
      const resultado = await useCase.processarInvestimento(1, 5000, 'CDB');

      // Assert
      expect(resultado.sucesso).toBe(false);
      expect(resultado.transacaoId).toBe(0);
      expect(mockTransacaoRepository.save).not.toHaveBeenCalled();
    });

    it('deve validar valor mínimo de investimento', async () => {
      // Arrange
      jest.spyOn(useCase, 'calcularSaldoAtual').mockResolvedValue(10000);

      // Act & Assert
      await expect(useCase.processarInvestimento(1, 50, 'CDB')).rejects.toThrow(
        'Valor mínimo de investimento é R$ 100',
      );
    });
  });

  describe('validarLimiteCredito', () => {
    it('deve aprovar transação dentro do limite', async () => {
      // Arrange
      jest.spyOn(useCase, 'calcularSaldoAtual').mockResolvedValue(5000);
      const limiteUsuario = 10000;

      // Act
      const aprovado = await useCase.validarLimiteCredito(1, 3000, limiteUsuario);

      // Assert
      expect(aprovado).toBe(true);
    });

    it('deve reprovar transação acima do limite', async () => {
      // Arrange
      jest.spyOn(useCase, 'calcularSaldoAtual').mockResolvedValue(8000);
      const limiteUsuario = 10000;

      // Act
      const aprovado = await useCase.validarLimiteCredito(1, 5000, limiteUsuario);

      // Assert
      expect(aprovado).toBe(false);
    });
  });
});
```

## [Mockando Múltiplas Dependências]()

### [Use-Case com Repository e HttpService]()

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@/common/http/http.service';
import { CotacaoAcoesUseCase } from './cotacao-acoes.usecase';
import { Investimento } from '../entities/investimento.entity';

describe('CotacaoAcoesUseCase', () => {
  let useCase: CotacaoAcoesUseCase;
  let mockInvestimentoRepository: any;
  let mockHttpService: any;

  beforeEach(async () => {
    // Mock do Repository
    mockInvestimentoRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };

    // Mock do HttpService
    mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CotacaoAcoesUseCase,
        {
          provide: getRepositoryToken(Investimento),
          useValue: mockInvestimentoRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    useCase = module.get<CotacaoAcoesUseCase>(CotacaoAcoesUseCase);
  });

  it('deve buscar cotação e atualizar investimentos', async () => {
    // Arrange
    mockInvestimentoRepository.find.mockResolvedValue([
      { id: 1, ticker: 'AAPL', quantidade: 10 },
    ]);

    mockHttpService.get.mockResolvedValue({
      symbol: 'AAPL',
      price: 150.0,
    });

    mockInvestimentoRepository.save.mockResolvedValue({
      id: 1,
      ticker: 'AAPL',
      valorAtual: 1500.0,
    });

    // Act
    const resultado = await useCase.atualizarCotacoes(1);

    // Assert
    expect(resultado.investimentosAtualizados).toBe(1);
    expect(mockHttpService.get).toHaveBeenCalledWith('https://api.example.com/quote/AAPL');
  });
});
```

## [Mockando ConfigService]()

```typescript
import { ConfigService } from '@nestjs/config';

describe('UseCase com ConfigService', () => {
  let mockConfigService: any;

  beforeEach(async () => {
    // Mock do ConfigService
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
        SeuUseCase,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    useCase = module.get<SeuUseCase>(SeuUseCase);
  });

  it('deve usar configurações corretas', async () => {
    // Act
    await useCase.metodoQueUsaConfig();

    // Assert
    expect(mockConfigService.get).toHaveBeenCalledWith('API_KEY');
  });
});
```

## [Testando Exceções e Erros]()

```typescript
describe('tratamento de erros', () => {
  it('deve lançar BadRequestException quando userId inválido', async () => {
    // Act & Assert
    await expect(useCase.processarTransacao(null, 100)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve lançar NotFoundException quando usuário não existe', async () => {
    // Arrange
    mockRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.buscarDadosUsuario(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve propagar erro do repository', async () => {
    // Arrange
    const erroDb = new Error('Database connection failed');
    mockRepository.save.mockRejectedValue(erroDb);

    // Act & Assert
    await expect(useCase.salvarDados({})).rejects.toThrow('Database connection failed');
  });
});
```

## [Testando Métodos com Jest.spyOn]()

Quando precisa mockar métodos do próprio Use-Case:

```typescript
describe('métodos interdependentes', () => {
  it('deve usar método interno mockado', async () => {
    // Arrange
    jest.spyOn(useCase, 'calcularSaldoAtual').mockResolvedValue(5000);
    jest.spyOn(useCase, 'aplicarTaxa').mockReturnValue(4750);

    // Act
    const resultado = await useCase.processarSaque(1, 1000);

    // Assert
    expect(useCase.calcularSaldoAtual).toHaveBeenCalledWith(1);
    expect(useCase.aplicarTaxa).toHaveBeenCalledWith(1000, 0.05);
    expect(resultado.valorFinal).toBe(3750);
  });
});
```

## [Testando Casos com Datas]()

```typescript
describe('operações com datas', () => {
  beforeEach(() => {
    // Mock de Date para testes consistentes
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve calcular juros baseado na data atual', async () => {
    // Arrange
    mockRepository.findOne.mockResolvedValue({
      dataInicio: new Date('2024-01-01'),
      valorInicial: 1000,
    });

    // Act
    const resultado = await useCase.calcularJurosAcumulados(1);

    // Assert
    expect(resultado.diasDecorridos).toBe(14);
    expect(resultado.juros).toBeCloseTo(23.33, 2);
  });
});
```

## [Padrão Arrange-Act-Assert]()

Sempre organize testes seguindo este padrão:

```typescript
it('deve fazer algo específico', async () => {
  // Arrange (Preparar)
  // - Configure mocks
  // - Defina dados de entrada
  // - Prepare estado inicial
  mockRepository.findOne.mockResolvedValue({ id: 1, valor: 100 });
  const entrada = { userId: 1, valor: 50 };

  // Act (Agir)
  // - Execute o método sendo testado
  const resultado = await useCase.processarOperacao(entrada);

  // Assert (Verificar)
  // - Verifique o resultado
  // - Verifique chamadas de dependências
  expect(resultado.sucesso).toBe(true);
  expect(mockRepository.save).toHaveBeenCalled();
});
```

## [Cobertura de Código]()

### [Executar relatório de cobertura]()

```bash
npm run test:cov
```

### [Meta de cobertura para Use-Cases]()

Use-Cases devem ter **100% de cobertura** pois contêm lógica de negócio crítica:

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

## [Comandos Jest Úteis]()

```bash
# Rodar todos os testes
npm test

# Rodar em modo watch (re-executa ao salvar)
npm run test:watch

# Rodar com cobertura
npm run test:cov

# Rodar apenas um arquivo
npm test regras-financeiras.usecase.spec

# Rodar apenas testes que contém "calcular"
npm test -- -t "calcular"

# Debug de testes
npm run test:debug
```

## [Checklist de Teste de Use-Case]()

- [ ] Arquivo `.spec.ts` ao lado do `.usecase.ts`
- [ ] Todos os repositories mockados
- [ ] Todos os services externos mockados
- [ ] ConfigService mockado se usado
- [ ] Testes seguem padrão Arrange-Act-Assert
- [ ] Cenários de sucesso testados
- [ ] Cenários de falha testados
- [ ] Exceções testadas
- [ ] Validações de entrada testadas
- [ ] Métodos privados testados via métodos públicos
- [ ] Cobertura de 100% no use-case
- [ ] Sem dependências externas reais (DB, API, filesystem)

## [Erros Comuns e Soluções]()

### [Erro: Cannot find module '@/...']()

**Solução**: Verificar `moduleNameMapper` no `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### [Erro: Repository not provided]()

**Solução**: Adicionar mock do repository com `getRepositoryToken()`:

```typescript
{
  provide: getRepositoryToken(MinhaEntity),
  useValue: mockRepository,
}
```

### [Erro: Mock não está sendo chamado]()

**Solução**: Use `jest.clearAllMocks()` no `afterEach()`.

## [Referências]()

- Para entender estrutura de Use-Cases: `./como-criar-use-case-backend.md`
- Para padrões de código backend: `./como-deve-ser-criado-um-padrao-escalavel-de-implementacao-no-modulo-backend.md`
