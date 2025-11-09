# Como criar um Use-Case no Backend NestJS?

> Guia para implementar Use-Cases seguindo princípios SOLID e segregação de interfaces no backend.

## [O que é um Use-Case?]()

Um Use-Case é uma classe que implementa uma ou mais interfaces, onde cada interface representa uma responsabilidade específica do domínio. Esta abordagem promove alta coesão, baixo acoplamento e facilita testes unitários.

**Características principais:**
- Cada interface tem apenas um método (Interface Segregation Principle)
- O Use-Case implementa todos os métodos das interfaces que representa
- Promove separação de responsabilidades (Single Responsibility Principle)
- Facilita mock e teste de componentes isolados
- **Prefira use-cases "magros"**: 1 interface por use-case (ideal) ou no máximo 2-3 interfaces relacionadas

**Filosofia: Keep Use-Cases Thin (Mantenha Use-Cases Magros)**

**REGRA PRINCIPAL**: Prefira **uma classe use-case implementando UMA ÚNICA interface/regra de negócio**.

Isso significa que você terá **muitos arquivos de use-case** no projeto, e isso é **desejável e correto**! Não tenha medo de criar múltiplos arquivos pequenos.

**Vantagens dessa abordagem:**
- ✅ Classes pequenas e focadas em uma única responsabilidade
- ✅ Código extremamente fácil de testar e mockar
- ✅ Maior reusabilidade e composição
- ✅ Melhor aderência aos princípios SOLID (especialmente SRP)
- ✅ Fácil de entender, manter e modificar
- ✅ Reduz acoplamento entre diferentes regras de negócio
- ✅ Permite evolução independente de cada regra

**Estrutura de uma classe Use-Case:**
- Implementação de **UM método público** da interface
- Métodos **privados** auxiliares para organizar a lógica interna
- Dependências injetadas via construtor
- Mantém a classe pequena e coesa (idealmente < 100 linhas)

**Exemplo de estrutura de pasta com múltiplos use-cases:**
```
src/modules/financial/
├── use-cases/
│   ├── interfaces.ts                           # Todas interfaces do módulo
│   ├── calculate-balance.usecase.ts            # Use-case 1
│   ├── process-investment.usecase.ts           # Use-case 2
│   ├── generate-report.usecase.ts              # Use-case 3
│   ├── validate-credit.usecase.ts              # Use-case 4
│   ├── calculate-interest.usecase.ts           # Use-case 5
│   ├── process-transfer.usecase.ts             # Use-case 6
│   └── apply-discount.usecase.ts               # Use-case 7
```

**Não tenha medo de ter muitos arquivos!** Ter 10-20 use-cases pequenos é **melhor** do que ter 2-3 use-cases grandes.

**Exemplo de Use-Case Magro:**

```typescript
// Interface com uma única responsabilidade
export interface CalculatePortfolioBalance {
  calculatePortfolioBalance(userId: number): Promise<BalanceResult>;
}

// Use-Case magro implementando uma interface
@Injectable()
export class CalculatePortfolioBalanceUseCase implements CalculatePortfolioBalance {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Método público da interface
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

  // Métodos privados auxiliares
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

Observe que:
- A classe é **pequena** e focada em uma única responsabilidade
- Tem apenas **um método público** (da interface)
- Usa **métodos privados** para organizar a lógica interna
- É fácil de testar cada método isoladamente

## [Quando Usar Use-Cases?]()

Use Use-Cases quando há:

### 1. Regras de Negócio Complexas
Quando uma operação envolve múltiplas transações de banco de dados ou lógica de negócio complexa.

**Exemplo**: Processar um pedido que envolve validar estoque, calcular preços, aplicar descontos, criar transação financeira e enviar notificações.

### 2. Múltiplas Responsabilidades Relacionadas
Quando um serviço precisa executar várias ações distintas mas relacionadas ao mesmo domínio.

**Exemplo**: Sistema financeiro que calcula saldo, processa investimentos e gera relatórios.

### 3. Necessidade de Flexibilidade e Testabilidade
Quando você precisa testar cada responsabilidade isoladamente ou trocar implementações facilmente.

### Quando NÃO usar Use-Cases?

- **CRUD simples**: Use o service padrão do módulo
- **Operações diretas**: Leitura/escrita simples sem regras complexas
- **Endpoints triviais**: Consultas básicas sem processamento

## Estrutura de Arquivos: Use-Cases Magros em Arquivos Separados

Padrão de organização de arquivos para Use-Cases dentro de um módulo.

**IMPORTANTE**: Prefira criar **muitos arquivos pequenos** (1 use-case = 1 arquivo = 1 interface) ao invés de poucos arquivos grandes.

### Exemplo: Estrutura com Use-Cases Magros (Recomendado)

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
│   ├── interfaces.ts                           # Todas interfaces
│   ├── calculate-balance.usecase.ts            # Use-case 1: Calcular saldo
│   ├── process-investment.usecase.ts           # Use-case 2: Processar investimento
│   ├── generate-report.usecase.ts              # Use-case 3: Gerar relatório
│   ├── validate-credit.usecase.ts              # Use-case 4: Validar crédito
│   ├── calculate-interest.usecase.ts           # Use-case 5: Calcular juros
│   ├── process-transfer.usecase.ts             # Use-case 6: Processar transferência
│   └── apply-discount.usecase.ts               # Use-case 7: Aplicar desconto
```

**Observe**: Cada use-case em um arquivo separado, implementando uma única interface/regra de negócio.

### Estrutura Antiga (Não Recomendada)

```
src/modules/financeiro/
├── use-cases/
│   ├── interfaces.ts
│   └── regras-financeiras.usecase.ts    # ❌ Um único arquivo grande com várias regras
```

**Problema**: Um arquivo grande implementando múltiplas interfaces, difícil de manter e testar.

### Convenção de Nomenclatura

**IMPORTANTE**: Todas as interfaces e classes devem ter nomes em **inglês**, seguindo as convenções de nomenclatura do TypeScript e boas práticas internacionais de desenvolvimento.

| Item | Padrão | Exemplo | Idioma |
|------|--------|---------|--------|
| Pasta | `use-cases/` | Sempre no singular | inglês |
| Arquivo de interfaces | `interfaces.ts` | Um único arquivo por módulo | inglês |
| Arquivo de use-case | `descriptive-name.usecase.ts` | kebab-case com sufixo `.usecase` | inglês |
| Classe do use-case | `DescriptiveNameUseCase` | PascalCase com sufixo `UseCase` | inglês |
| Interface | `ResponsibilityName` | PascalCase sem prefixo I | inglês |

## [Implementação Passo a Passo de Use-Cases]()

### Passo 1: Definir as Interfaces

Crie o arquivo `interfaces.ts` com todas as interfaces de responsabilidades do módulo:

**Arquivo**: `src/modules/financeiro/use-cases/interfaces.ts`

```typescript
// Cada interface representa UMA responsabilidade
// Cada interface tem APENAS UM método

export interface CalcularSaldoAtual {
  calcularSaldoAtual(userId: number): Promise<number>;
}

export interface CalcularRendimentoMensal {
  calcularRendimentoMensal(userId: number, mes: number, ano: number): Promise<number>;
}

export interface ProcessarInvestimento {
  processarInvestimento(
    userId: number,
    valor: number,
    tipo: string,
  ): Promise<{ sucesso: boolean; transacaoId: number }>;
}

export interface GerarRelatorioFinanceiro {
  gerarRelatorioFinanceiro(
    userId: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<{
    saldoInicial: number;
    saldoFinal: number;
    receitas: number;
    despesas: number;
  }>;
}
```

**Regras das Interfaces:**
- Nome descritivo que indica a ação (verbo no infinitivo) **em inglês**
- Um único método público por interface
- Parâmetros explícitos e tipados
- Retorno sempre tipado (pode ser Promise)
- **Sempre nomear interfaces, classes E métodos em inglês** (ex: `CalculateBalance`, `ProcessPayment`, `GenerateReport`)

**IMPORTANTE**: Todos os nomes devem ser em inglês:
- ✅ Classes: `CalculateBalanceUseCase`, `ProcessInvestmentUseCase`
- ✅ Interfaces: `CalculateBalance`, `ProcessInvestment`
- ✅ Métodos públicos: `calculateBalance()`, `processInvestment()`
- ✅ Métodos privados: `getUserAssets()`, `calculateTotalInvested()`
- ❌ NUNCA use português: `calcularSaldo()`, `processarInvestimento()`

### Passo 2: Criar o Use-Case

Implemente o Use-Case que utiliza uma ou mais interfaces:

**Arquivo**: `src/modules/financeiro/use-cases/regras-financeiras.usecase.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transacao } from '../entities/transacao.entity';
import {
  CalcularSaldoAtual,
  CalcularRendimentoMensal,
  ProcessarInvestimento,
  GerarRelatorioFinanceiro
} from './interfaces';

@Injectable()
export class RegrasFinanceirasUseCase
  implements
    CalcularSaldoAtual,
    CalcularRendimentoMensal,
    ProcessarInvestimento,
    GerarRelatorioFinanceiro
{
  constructor(
    @InjectRepository(Transacao)
    private readonly transacaoRepository: Repository<Transacao>,
  ) {}

  async calcularSaldoAtual(userId: number): Promise<number> {
    const result = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'credito' })
      .getRawOne();

    const creditos = result?.total || 0;

    const debitos = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'debito' })
      .getRawOne();

    const totalDebitos = debitos?.total || 0;

    return creditos - totalDebitos;
  }

  async calcularRendimentoMensal(
    userId: number,
    mes: number,
    ano: number,
  ): Promise<number> {
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);

    const result = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'rendimento' })
      .andWhere('transacao.data BETWEEN :dataInicio AND :dataFim', {
        dataInicio,
        dataFim,
      })
      .getRawOne();

    return result?.total || 0;
  }

  async processarInvestimento(
    userId: number,
    valor: number,
    tipo: string,
  ): Promise<{ sucesso: boolean; transacaoId: number }> {
    // Validar saldo disponível
    const saldoAtual = await this.calcularSaldoAtual(userId);

    if (saldoAtual < valor) {
      return { sucesso: false, transacaoId: 0 };
    }

    // Criar transação de débito (saída do valor)
    const debito = this.transacaoRepository.create({
      userId,
      valor: valor,
      tipo: 'debito',
      descricao: `Investimento ${tipo}`,
      data: new Date(),
    });

    await this.transacaoRepository.save(debito);

    // Criar registro de investimento
    const investimento = this.transacaoRepository.create({
      userId,
      valor: valor,
      tipo: 'investimento',
      descricao: tipo,
      data: new Date(),
    });

    const resultado = await this.transacaoRepository.save(investimento);

    return { sucesso: true, transacaoId: resultado.id };
  }

  async gerarRelatorioFinanceiro(
    userId: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<{
    saldoInicial: number;
    saldoFinal: number;
    receitas: number;
    despesas: number;
  }> {
    // Calcular saldo inicial (antes da data início)
    const saldoInicial = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(CASE WHEN tipo = \'credito\' THEN valor ELSE -valor END)', 'saldo')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.data < :dataInicio', { dataInicio })
      .getRawOne();

    // Calcular receitas no período
    const receitas = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'credito' })
      .andWhere('transacao.data BETWEEN :dataInicio AND :dataFim', {
        dataInicio,
        dataFim,
      })
      .getRawOne();

    // Calcular despesas no período
    const despesas = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'debito' })
      .andWhere('transacao.data BETWEEN :dataInicio AND :dataFim', {
        dataInicio,
        dataFim,
      })
      .getRawOne();

    const totalReceitas = receitas?.total || 0;
    const totalDespesas = despesas?.total || 0;
    const saldoInicialValor = saldoInicial?.saldo || 0;
    const saldoFinal = saldoInicialValor + totalReceitas - totalDespesas;

    return {
      saldoInicial: saldoInicialValor,
      saldoFinal,
      receitas: totalReceitas,
      despesas: totalDespesas,
    };
  }
}
```

### Passo 3: Registrar no Module

Adicione o Use-Case aos providers do módulo:

**Arquivo**: `src/modules/financeiro/financeiro.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { Transacao } from './entities/transacao.entity';
import { RegrasFinanceirasUseCase } from './use-cases/regras-financeiras.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Transacao])],
  controllers: [FinanceiroController],
  providers: [
    FinanceiroService,
    RegrasFinanceirasUseCase, // Registrar o Use-Case
  ],
  exports: [
    FinanceiroService,
    RegrasFinanceirasUseCase, // Exportar se outros módulos precisarem
  ],
})
export class FinanceiroModule {}
```

### Passo 4: Injetar no Service ou Controller

Use o Use-Case através de Dependency Injection:

**Opção A: Injetar no Service (Recomendado)**

```typescript
import { Injectable } from '@nestjs/common';
import { RegrasFinanceirasUseCase } from './use-cases/regras-financeiras.usecase';
import { CalcularSaldoAtual } from './use-cases/interfaces';

@Injectable()
export class FinanceiroService {
  constructor(
    // Injetar via interface (melhor para testes)
    private readonly regrasFinanceiras: CalcularSaldoAtual & RegrasFinanceirasUseCase,
  ) {}

  async obterSaldo(userId: number): Promise<{ saldo: number }> {
    const saldo = await this.regrasFinanceiras.calcularSaldoAtual(userId);
    return { saldo };
  }
}
```

**Opção B: Injetar diretamente no Controller**

```typescript
import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RegrasFinanceirasUseCase } from './use-cases/regras-financeiras.usecase';

@ApiTags('financeiro')
@ApiBearerAuth()
@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private readonly regrasFinanceiras: RegrasFinanceirasUseCase,
  ) {}

  @Get('saldo')
  async obterSaldo(@Request() req) {
    const saldo = await this.regrasFinanceiras.calcularSaldoAtual(
      req.user.userId,
    );
    return { saldo };
  }

  @Post('investir')
  async investir(
    @Body() dto: { valor: number; tipo: string },
    @Request() req,
  ) {
    return await this.regrasFinanceiras.processarInvestimento(
      req.user.userId,
      dto.valor,
      dto.tipo,
    );
  }

  @Get('relatorio')
  async gerarRelatorio(
    @Request() req,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return await this.regrasFinanceiras.gerarRelatorioFinanceiro(
      req.user.userId,
      new Date(dataInicio),
      new Date(dataFim),
    );
  }
}
```

## [Princípios SOLID Aplicados em Use-Cases]()

### S - Single Responsibility Principle
Cada interface representa uma única responsabilidade. Se uma responsabilidade mudar, apenas um método é afetado.

```typescript
// ❌ Errado: Interface com múltiplas responsabilidades
export interface FinanceiroOperacoes {
  calcularSaldo(userId: number): Promise<number>;
  processarInvestimento(userId: number, valor: number): Promise<boolean>;
  gerarRelatorio(userId: number): Promise<any>;
}

// ✅ Correto: Interfaces segregadas
export interface CalcularSaldo {
  calcularSaldo(userId: number): Promise<number>;
}

export interface ProcessarInvestimento {
  processarInvestimento(userId: number, valor: number): Promise<boolean>;
}

export interface GerarRelatorio {
  gerarRelatorio(userId: number): Promise<any>;
}
```

### O - Open/Closed Principle
Use-Cases são abertos para extensão (novas interfaces) mas fechados para modificação.

```typescript
// Adicionar nova funcionalidade sem modificar o Use-Case existente
export interface ValidarCredito {
  validarCredito(userId: number, valor: number): Promise<boolean>;
}

// Criar novo Use-Case ou estender o existente
export class RegrasFinanceirasAvancadasUseCase
  extends RegrasFinanceirasUseCase
  implements ValidarCredito
{
  async validarCredito(userId: number, valor: number): Promise<boolean> {
    const saldo = await this.calcularSaldoAtual(userId);
    return saldo >= valor;
  }
}
```

### L - Liskov Substitution Principle
Qualquer implementação da interface pode substituir outra sem quebrar o código.

```typescript
// Múltiplas implementações da mesma interface
export class RegrasFinanceirasUseCase implements CalcularSaldoAtual {
  async calcularSaldoAtual(userId: number): Promise<number> {
    // Implementação padrão
  }
}

export class RegrasFinanceirasCacheUseCase implements CalcularSaldoAtual {
  async calcularSaldoAtual(userId: number): Promise<number> {
    // Implementação com cache
  }
}
```

### I - Interface Segregation Principle
Clientes não devem depender de métodos que não usam. Cada interface tem apenas um método.

```typescript
// ✅ Controller só precisa de calcular saldo
export class SaldoController {
  constructor(private readonly calcularSaldo: CalcularSaldoAtual) {}

  @Get('saldo')
  async getSaldo(@Request() req) {
    // Não tem acesso a métodos desnecessários
    return await this.calcularSaldo.calcularSaldoAtual(req.user.userId);
  }
}
```

### D - Dependency Inversion Principle
Dependa de abstrações (interfaces), não de implementações concretas.

```typescript
// ✅ Correto: Depende da interface
export class FinanceiroService {
  constructor(
    private readonly calcularSaldo: CalcularSaldoAtual, // Interface
  ) {}
}

// ❌ Errado: Depende da implementação concreta
export class FinanceiroService {
  constructor(
    private readonly regrasFinanceiras: RegrasFinanceirasUseCase, // Classe concreta
  ) {}
}
```

## [Testando Use-Cases com Mocks e Segregação de Interfaces]()

Use-Cases são altamente testáveis devido à segregação de interfaces:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegrasFinanceirasUseCase } from './regras-financeiras.usecase';
import { Transacao } from '../entities/transacao.entity';

describe('RegrasFinanceirasUseCase', () => {
  let useCase: RegrasFinanceirasUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    // Mock do repository
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      }),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegrasFinanceirasUseCase,
        {
          provide: getRepositoryToken(Transacao),
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<RegrasFinanceirasUseCase>(RegrasFinanceirasUseCase);
  });

  describe('calcularSaldoAtual', () => {
    it('deve calcular saldo corretamente', async () => {
      // Arrange
      mockRepository.createQueryBuilder().getRawOne
        .mockResolvedValueOnce({ total: 1000 }) // Créditos
        .mockResolvedValueOnce({ total: 300 });  // Débitos

      // Act
      const resultado = await useCase.calcularSaldoAtual(1);

      // Assert
      expect(resultado).toBe(700);
    });

    it('deve retornar 0 quando não há transações', async () => {
      mockRepository.createQueryBuilder().getRawOne
        .mockResolvedValue(null);

      const resultado = await useCase.calcularSaldoAtual(1);

      expect(resultado).toBe(0);
    });
  });

  describe('processarInvestimento', () => {
    it('deve processar investimento com saldo suficiente', async () => {
      // Mock calcularSaldoAtual
      jest.spyOn(useCase, 'calcularSaldoAtual').mockResolvedValue(1000);

      mockRepository.create.mockReturnValue({ id: 1 });
      mockRepository.save.mockResolvedValue({ id: 1 });

      const resultado = await useCase.processarInvestimento(1, 500, 'CDB');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.transacaoId).toBe(1);
    });

    it('deve falhar quando saldo insuficiente', async () => {
      jest.spyOn(useCase, 'calcularSaldoAtual').mockResolvedValue(100);

      const resultado = await useCase.processarInvestimento(1, 500, 'CDB');

      expect(resultado.sucesso).toBe(false);
      expect(resultado.transacaoId).toBe(0);
    });
  });
});
```

## [Comparação: Service Tradicional vs Use-Case]()

Comparação entre abordagem tradicional com Services e abordagem com Use-Cases:

| Aspecto | Service Tradicional | Use-Case |
|---------|-------------------|----------|
| **Quando usar** | CRUD simples, operações diretas | Regras complexas, múltiplas transações |
| **Responsabilidade** | Múltiplas operações no mesmo service | Uma interface = uma responsabilidade |
| **Testabilidade** | Precisa mockar o service inteiro | Mock apenas a interface necessária |
| **Dependências** | Depende da classe concreta | Depende de interfaces (abstrações) |
| **Acoplamento** | Mais acoplado | Baixo acoplamento |
| **Exemplo** | `UserService.findAll()` | `CalcularSaldoUseCase.calcularSaldo()` |

### Exemplo Comparativo

**Service Tradicional:**
```typescript
@Injectable()
export class FinanceiroService {
  // Todas operações em um único service
  async calcularSaldo(userId: number) { }
  async processarInvestimento(userId: number, valor: number) { }
  async gerarRelatorio(userId: number) { }
  async validarCredito(userId: number) { }
  // ... 10 métodos mais
}

// Controller precisa injetar service completo
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}
}
```

**Use-Case:**
```typescript
// Segregado em interfaces específicas
export interface CalcularSaldoAtual {
  calcularSaldoAtual(userId: number): Promise<number>;
}

// Controller injeta apenas o necessário
export class SaldoController {
  constructor(private readonly calcularSaldo: CalcularSaldoAtual) {}
}
```

## [Boas Práticas para Use-Cases Magros e Focados]()

### 1. Uma Interface = Um Método
```typescript
// ❌ Errado
export interface OperacoesFinanceiras {
  calcularSaldo(userId: number): Promise<number>;
  processar(userId: number, valor: number): Promise<void>;
}

// ✅ Correto
export interface CalcularSaldo {
  calcularSaldo(userId: number): Promise<number>;
}

export interface ProcessarOperacao {
  processar(userId: number, valor: number): Promise<void>;
}
```

### 2. Nomenclatura Clara e Descritiva em Inglês
```typescript
// ❌ Errado: Nomes genéricos ou em português
export interface Processar { }
export interface Executar { }
export interface ProcessarInvestimento { }

// ✅ Correto: Nomes descritivos em inglês
export interface ProcessInvestment { }
export interface ExecuteTransferBetweenAccounts { }
export interface CalculatePortfolioBalance { }
export interface GenerateFinancialReport { }
```

**Regra**: Todas as interfaces, classes e métodos (públicos e privados) devem ser nomeados em **inglês** para manter consistência com:
- Convenções do TypeScript/JavaScript
- Boas práticas internacionais
- Facilitar colaboração em projetos globais
- Manter compatibilidade com bibliotecas e frameworks

**Exemplos de métodos corretos:**
```typescript
// ✅ CORRETO: Métodos em inglês
async calculateBalance(userId: number): Promise<number> { }
async processInvestment(data: InvestmentData): Promise<Result> { }
private async getUserAssets(userId: number): Promise<Asset[]> { }
private calculateTotalInvested(transactions: Transaction[]): number { }

// ❌ ERRADO: Métodos em português
async calcularSaldo(userId: number): Promise<number> { }
async processarInvestimento(dados: any): Promise<any> { }
private async obterAtivosDoUsuario(userId: number): Promise<any[]> { }
private calcularTotalInvestido(transacoes: any[]): number { }
```

### 3. Use Type Aliases para Combinações
```typescript
// Quando um componente precisa de múltiplas interfaces
type OperacoesFinanceiras = CalcularSaldoAtual & ProcessarInvestimento;

export class FinanceiroService {
  constructor(
    private readonly operacoes: OperacoesFinanceiras,
  ) {}
}
```

### 4. Mantenha Use-Cases Magros e Coesos

**REGRA DE OURO**: Prefira **UMA classe use-case implementando UMA interface**.

Isso resulta em **muitos arquivos pequenos**, e isso é exatamente o que queremos! É melhor ter 20 arquivos de 50 linhas cada do que 2 arquivos de 500 linhas.

```typescript
// ✅ EXCELENTE: Use-Case magro com uma única interface (PREFERENCIAL)
export class CalculateBalanceUseCase implements CalculateBalance {
  async calculateBalance(userId: number): Promise<number> {
    // Implementação focada em UMA única responsabilidade
    // Métodos privados auxiliares permitidos
  }
}

// ✅ EXCELENTE: Outro use-case magro focado
export class ProcessInvestmentUseCase implements ProcessInvestment {
  async processInvestment(data: InvestmentData): Promise<Result> {
    // Outra responsabilidade única em arquivo separado
  }
}

// ✅ EXCELENTE: Mais um use-case magro
export class GenerateReportUseCase implements GenerateReport {
  async generateReport(params: ReportParams): Promise<Report> {
    // Foco em uma única regra de negócio
  }
}

// ⚠️ ACEITÁVEL: Apenas se as interfaces forem MUITO relacionadas (máximo 2-3)
export class AccountOperationsUseCase
  implements CalculateBalance, ProcessTransfer { }

// ❌ EVITE: Use-Case com múltiplas interfaces
export class FinancialOperationsUseCase
  implements CalculateBalance, ProcessInvestment, GenerateReport { }

// ❌ RUIM: Use-Case gordo com muitas interfaces
export class AllFinancialRulesUseCase
  implements Interface1, Interface2, Interface3, Interface4,
             Interface5, Interface6, Interface7 { }
```

**Hierarquia de Preferência**:
1. **🥇 IDEAL**: 1 interface = 1 use-case (classe magra, regra única)
2. **🥈 ACEITÁVEL**: 2-3 interfaces muito relacionadas em 1 use-case
3. **🥉 EVITE**: Mais de 3 interfaces em 1 use-case
4. **🚫 NUNCA**: Misturar domínios ou mais de 5 interfaces

**Por que ter muitos arquivos pequenos é melhor?**
- ✅ Cada arquivo representa UMA regra de negócio clara
- ✅ Extremamente fácil de testar isoladamente
- ✅ Fácil de encontrar e modificar código específico
- ✅ Reduz conflitos em merges (arquivos menores)
- ✅ Facilita code review (mudanças pequenas e focadas)
- ✅ Permite composição flexível de funcionalidades
- ✅ Segue religiosamente o Single Responsibility Principle

**Exemplo real de organização:**
```
use-cases/
├── calculate-portfolio-balance.usecase.ts       # 45 linhas
├── calculate-asset-allocation.usecase.ts        # 38 linhas
├── process-buy-order.usecase.ts                 # 52 linhas
├── process-sell-order.usecase.ts                # 48 linhas
├── calculate-profit-loss.usecase.ts             # 41 linhas
├── generate-tax-report.usecase.ts               # 67 linhas
├── validate-investment-limit.usecase.ts         # 33 linhas
├── calculate-dividend-yield.usecase.ts          # 29 linhas
└── sync-market-prices.usecase.ts                # 55 linhas
```

**Total**: 9 arquivos pequenos e focados ao invés de 1-2 arquivos grandes e confusos.

### 5. Documente as Interfaces
```typescript
/**
 * Calcula o saldo atual de um usuário considerando todas
 * as transações de crédito e débito até o momento.
 *
 * @param userId - ID do usuário
 * @returns Saldo atual em número decimal
 */
export interface CalcularSaldoAtual {
  calcularSaldoAtual(userId: number): Promise<number>;
}
```

## [Checklist de Implementação de Use-Cases]()

Use esta lista para verificar se seu Use-Case está correto:

- [ ] Arquivo `interfaces.ts` criado em `use-cases/`
- [ ] Cada interface tem apenas um método
- [ ] Nomes de interfaces são descritivos (verbo no infinitivo) **em inglês**
- [ ] **Use-Case implementa preferencialmente 1 interface (ideal) ou no máximo 2-3 interfaces relacionadas**
- [ ] Use-Case está "magro" - não implementa mais de 5 interfaces
- [ ] Use-Case está registrado no `providers` do module
- [ ] Use-Case é injetado via interface, não classe concreta
- [ ] Métodos do Use-Case tratam regras de negócio complexas
- [ ] CRUD simples permanece no service tradicional
- [ ] Use-Case tem responsabilidade única e coesa
- [ ] Testes unitários cobrem cada método isoladamente
- [ ] Documentação das interfaces está completa

## [Troubleshooting: Problemas Comuns em Use-Cases]()

### Erro: "Cannot resolve dependency"

**Problema**: NestJS não consegue resolver a dependência da interface.

**Solução**: Interfaces TypeScript são removidas em runtime. Injete a classe concreta:

```typescript
// ❌ Não funciona: Interface não existe em runtime
constructor(private readonly calc: CalcularSaldo) {}

// ✅ Funciona: Injete a classe concreta
constructor(
  private readonly regrasFinanceiras: RegrasFinanceirasUseCase
) {}

// ✅ Funciona: Type alias com classe concreta
constructor(
  private readonly calc: CalcularSaldo & RegrasFinanceirasUseCase
) {}
```

### Erro: "Circular dependency"

**Problema**: Use-Case depende de service que depende de use-case.

**Solução**: Use `forwardRef` ou reestruture as dependências:

```typescript
import { forwardRef, Inject } from '@nestjs/common';

constructor(
  @Inject(forwardRef(() => FinanceiroService))
  private readonly service: FinanceiroService,
) {}
```

### Use-Case muito grande

**Problema**: Use-Case implementa mais de 5 interfaces, tornando a classe "gorda" e difícil de manter.

**Solução**: Divida em múltiplos Use-Cases magros e coesos. **Prefira sempre 1 interface por use-case**.

```typescript
// ❌ RUIM: Use-Case gigante e gordo
export class AllFinancialRulesUseCase
  implements Interface1, Interface2, Interface3, Interface4, Interface5, Interface6 { }

// ✅ IDEAL: Use-Cases magros com uma interface cada
export class CalculateBalanceUseCase implements CalculateBalance { }
export class ProcessInvestmentUseCase implements ProcessInvestment { }
export class GenerateReportUseCase implements GenerateReport { }
export class ValidateCreditUseCase implements ValidateCredit { }
export class CalculateInterestUseCase implements CalculateInterest { }
export class ProcessTransferUseCase implements ProcessTransfer { }

// ✅ ALTERNATIVA: Use-Cases com interfaces muito relacionadas (máx 2-3)
export class CheckingAccountRulesUseCase
  implements CalculateBalance, ProcessTransfer { }

export class InvestmentRulesUseCase
  implements ProcessInvestment, CalculateInterest { }

export class ReportRulesUseCase
  implements GenerateReport, ValidateCredit { }
```

**Recomendação**: Sempre que possível, crie use-cases com **uma única interface** para manter as classes magras, focadas e fáceis de testar.

## [Exemplo Completo: Módulo de Pedidos com Use-Cases]()

Exemplo completo de um módulo real usando Use-Cases:

### Interfaces

```typescript
// src/modules/pedido/use-cases/interfaces.ts
export interface CriarPedido {
  criarPedido(userId: number, items: ItemPedido[]): Promise<Pedido>;
}

export interface ValidarEstoque {
  validarEstoque(items: ItemPedido[]): Promise<boolean>;
}

export interface CalcularTotalPedido {
  calcularTotalPedido(items: ItemPedido[]): Promise<number>;
}

export interface AplicarDesconto {
  aplicarDesconto(total: number, cupom?: string): Promise<number>;
}
```

### Use-Case

```typescript
// src/modules/pedido/use-cases/processar-pedido.usecase.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../entities/pedido.entity';
import { Produto } from '@modules/produto/entities/produto.entity';
import {
  CriarPedido,
  ValidarEstoque,
  CalcularTotalPedido,
  AplicarDesconto,
} from './interfaces';

@Injectable()
export class ProcessarPedidoUseCase
  implements CriarPedido, ValidarEstoque, CalcularTotalPedido, AplicarDesconto
{
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  async validarEstoque(items: ItemPedido[]): Promise<boolean> {
    for (const item of items) {
      const produto = await this.produtoRepository.findOne({
        where: { id: item.produtoId },
      });

      if (!produto || produto.estoque < item.quantidade) {
        return false;
      }
    }
    return true;
  }

  async calcularTotalPedido(items: ItemPedido[]): Promise<number> {
    let total = 0;

    for (const item of items) {
      const produto = await this.produtoRepository.findOne({
        where: { id: item.produtoId },
      });

      if (produto) {
        total += produto.preco * item.quantidade;
      }
    }

    return total;
  }

  async aplicarDesconto(total: number, cupom?: string): Promise<number> {
    if (!cupom) {
      return total;
    }

    // Lógica de validação e aplicação de cupom
    const desconto = 0.1; // 10% de exemplo
    return total * (1 - desconto);
  }

  async criarPedido(userId: number, items: ItemPedido[]): Promise<Pedido> {
    // Validar estoque
    const estoqueValido = await this.validarEstoque(items);
    if (!estoqueValido) {
      throw new BadRequestException('Estoque insuficiente');
    }

    // Calcular total
    const total = await this.calcularTotalPedido(items);

    // Criar pedido
    const pedido = this.pedidoRepository.create({
      userId,
      total,
      status: 'pendente',
      items: JSON.stringify(items),
    });

    return await this.pedidoRepository.save(pedido);
  }
}
```

### Controller

```typescript
// src/modules/pedido/pedido.controller.ts
import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessarPedidoUseCase } from './use-cases/processar-pedido.usecase';
import { CriarPedidoDto } from './dto/criar-pedido.dto';

@ApiTags('pedidos')
@ApiBearerAuth()
@Controller('pedidos')
export class PedidoController {
  constructor(
    private readonly processarPedido: ProcessarPedidoUseCase,
  ) {}

  @Post()
  async criar(@Body() dto: CriarPedidoDto, @Request() req) {
    return await this.processarPedido.criarPedido(
      req.user.userId,
      dto.items,
    );
  }
}
```

## [Referências sobre Use-Cases e SOLID]()

- [NestJS Providers](https://docs.nestjs.com/providers)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)
