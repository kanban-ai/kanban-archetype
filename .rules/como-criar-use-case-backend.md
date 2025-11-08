# Como criar um Use-Case no Backend NestJS?

> Guia para implementar Use-Cases seguindo princípios SOLID e segregação de interfaces no backend.

## O que é um Use-Case?

Um Use-Case é uma classe que implementa uma ou mais interfaces, onde cada interface representa uma responsabilidade específica do domínio. Esta abordagem promove alta coesão, baixo acoplamento e facilita testes unitários.

**Características principais:**
- Cada interface tem apenas um método (Interface Segregation Principle)
- O Use-Case implementa todos os métodos das interfaces que representa
- Promove separação de responsabilidades (Single Responsibility Principle)
- Facilita mock e teste de componentes isolados

## Quando Usar Use-Cases?

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

## Estrutura de Arquivos

Padrão de organização de arquivos para Use-Cases dentro de um módulo:

```
src/modules/financeiro/
├── financeiro.module.ts
├── financeiro.controller.ts
├── financeiro.service.ts
├── entities/
│   └── transacao.entity.ts
├── dto/
│   ├── create-transacao.dto.ts
│   └── calcular-saldo.dto.ts
├── use-cases/
│   ├── interfaces.ts                    # Todas as interfaces do módulo
│   ├── regras-financeiras.usecase.ts    # Implementação do use-case
│   └── investimentos.usecase.ts          # Outro use-case se necessário
```

### Convenção de Nomenclatura

| Item | Padrão | Exemplo |
|------|--------|---------|
| Pasta | `use-cases/` | Sempre no singular |
| Arquivo de interfaces | `interfaces.ts` | Um único arquivo por módulo |
| Arquivo de use-case | `nome-descritivo.usecase.ts` | kebab-case com sufixo `.usecase` |
| Classe do use-case | `NomeDescritivoUseCase` | PascalCase com sufixo `UseCase` |
| Interface | `NomeResponsabilidade` | PascalCase sem prefixo I |

## Implementação Passo a Passo

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
- Nome descritivo que indica a ação (verbo no infinitivo)
- Um único método público por interface
- Parâmetros explícitos e tipados
- Retorno sempre tipado (pode ser Promise)

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

## Princípios SOLID Aplicados

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

## Testando Use-Cases

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

## Diferenças: Service vs Use-Case

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

## Boas Práticas

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

### 2. Nomenclatura Clara e Descritiva
```typescript
// ❌ Errado: Nomes genéricos
export interface Processar { }
export interface Executar { }

// ✅ Correto: Nomes descritivos
export interface ProcessarInvestimento { }
export interface ExecutarTransferenciaEntreContas { }
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

### 4. Mantenha Use-Cases Coesos
```typescript
// ✅ Use-Case coeso: Apenas operações financeiras
export class RegrasFinanceirasUseCase
  implements CalcularSaldo, ProcessarInvestimento { }

// ❌ Use-Case não coeso: Mistura domínios
export class VariasRegrasUseCase
  implements CalcularSaldo, EnviarEmail, ProcessarPedido { }
```

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

## Checklist de Implementação

Use esta lista para verificar se seu Use-Case está correto:

- [ ] Arquivo `interfaces.ts` criado em `use-cases/`
- [ ] Cada interface tem apenas um método
- [ ] Nomes de interfaces são descritivos (verbo no infinitivo)
- [ ] Use-Case implementa uma ou mais interfaces relacionadas
- [ ] Use-Case está registrado no `providers` do module
- [ ] Use-Case é injetado via interface, não classe concreta
- [ ] Métodos do Use-Case tratam regras de negócio complexas
- [ ] CRUD simples permanece no service tradicional
- [ ] Use-Case tem responsabilidade única e coesa
- [ ] Testes unitários cobrem cada método isoladamente
- [ ] Documentação das interfaces está completa

## Troubleshooting

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

**Problema**: Use-Case implementa mais de 5 interfaces.

**Solução**: Divida em múltiplos Use-Cases coesos:

```typescript
// Em vez de um Use-Case gigante
export class TodasRegrasFinanceirasUseCase
  implements Interface1, Interface2, Interface3, Interface4, Interface5, Interface6 { }

// Divida em Use-Cases específicos
export class RegrasContaCorrenteUseCase
  implements Interface1, Interface2 { }

export class RegrasInvestimentoUseCase
  implements Interface3, Interface4 { }

export class RegrasRelatorioUseCase
  implements Interface5, Interface6 { }
```

## Exemplo Completo: Módulo de Pedidos

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

## Referências

- [NestJS Providers](https://docs.nestjs.com/providers)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)
