# [Como deve ser criado um padrão escalável de implementação no módulo Backend?]()

> Guia de boas práticas para criar módulos escaláveis e manuteníveis no NestJS.

## [Princípios Fundamentais]()

Conceitos essenciais de design de software aplicados ao desenvolvimento de módulos escaláveis no NestJS.

### [1. Single Responsibility Principle]()

Cada classe deve ter uma única responsabilidade:

```typescript
// L Ruim - Service fazendo tudo
@Injectable()
export class ProductService {
  async create() { /* ... */ }
  async sendEmail() { /* ... */ }  // Não deveria estar aqui
  async generatePDF() { /* ... */ } // Não deveria estar aqui
}

// > Bom - Responsabilidades separadas
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

Sempre use injeção de dependência:

```typescript
// L Ruim - Criando dependências
@Injectable()
export class ProductService {
  private emailService = new EmailService(); // Ruim

  async create() { /* ... */ }
}

// > Bom - Injetando dependências
@Injectable()
export class ProductService {
  constructor(
    private emailService: EmailService, // Injetado
    private pdfService: PdfService,     // Injetado
  ) {}
}
```

### [3. Inversão de Dependência]()

Dependa de abstrações, não de implementações:

```typescript
// Interface (contrato)
export interface INotificationService {
  send(message: string): Promise<void>;
}

// Implementações
@Injectable()
export class EmailNotificationService implements INotificationService {
  async send(message: string) {
    // Enviar email
  }
}

@Injectable()
export class SmsNotificationService implements INotificationService {
  async send(message: string) {
    // Enviar SMS
  }
}

// Service depende da interface
@Injectable()
export class ProductService {
  constructor(
    @Inject('INotificationService')
    private notificationService: INotificationService,
  ) {}

  async create(dto) {
    const product = await this.repository.save(dto);
    await this.notificationService.send('Produto criado');
    return product;
  }
}
```

## [Padrões de Implementação]()

Padrões de design comprovados para estruturar código escalável e manutenível em aplicações NestJS.

### [1. Use-Case Pattern (Padrão Principal para Regras de Negócio)]()

**Para regras de negócio complexas, SEMPRE use Use-Cases.**

Use-Cases são o padrão recomendado para implementar lógica de negócio complexa no backend. Eles seguem o princípio de segregação de interfaces (ISP) e promovem código testável e manutenível.

**Quando usar Use-Cases:**
- Regras de negócio complexas com múltiplas transações
- Operações que envolvem múltiplas entidades
- Lógica que precisa ser testada isoladamente
- Processos que podem ter múltiplas implementações

**Quando NÃO usar Use-Cases:**
- CRUD simples e operações diretas
- Leitura/escrita básica sem processamento
- Consultas triviais sem regras de negócio

**Estrutura básica:**
```typescript
// 1. Definir interface com uma responsabilidade
export interface CalculateBalance {
  calculateBalance(userId: number): Promise<number>;
}

// 2. Implementar Use-Case magro (1 interface = 1 use-case)
@Injectable()
export class CalculateBalanceUseCase implements CalculateBalance {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async calculateBalance(userId: number): Promise<number> {
    // Implementação com métodos privados auxiliares
    const credits = await this.getCredits(userId);
    const debits = await this.getDebits(userId);
    return credits - debits;
  }

  private async getCredits(userId: number): Promise<number> {
    // Lógica auxiliar privada
  }

  private async getDebits(userId: number): Promise<number> {
    // Lógica auxiliar privada
  }
}

// 3. Injetar no controller via interface
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

**IMPORTANTE**: Consulte a documentação completa em `./como-criar-use-case-backend.md` para:
- Estrutura de arquivos e pastas
- Convenções de nomenclatura (sempre em inglês)
- Use-Cases magros (1 interface por use-case)
- Exemplos completos e boas práticas
- Testes unitários
- Comparação com Services tradicionais

### [2. Repository Pattern (TypeORM)]()

Use repository do TypeORM para acesso a dados:

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

Use DTOs para validação e transferência de dados:

```typescript
// DTO para entrada
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

Use quando há múltiplas implementações de um comportamento:

```typescript
// Interface da estratégia
export interface IPaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

// Implementações
@Injectable()
export class CreditCardStrategy implements IPaymentStrategy {
  async process(amount: number) {
    // Processar cartão de crédito
  }
}

@Injectable()
export class PixStrategy implements IPaymentStrategy {
  async process(amount: number) {
    // Processar PIX
  }
}

// Service que usa estratégias
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
      throw new BadRequestException('Método de pagamento inválido');
    }
    return await strategy.process(amount);
  }
}
```

### [5. Factory Pattern]()

Use para criação complexa de objetos:

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
        throw new BadRequestException('Tipo de relatório inválido');
    }
  }
}
```

## [Organização Escalável]()

Estruturação de código em camadas bem definidas para facilitar manutenção e evolução do sistema.

### [Separação por Camadas]()

```
modulo/
 modulo.controller.ts    # Camada HTTP
 modulo.service.ts        # Camada de negócio
 modulo.repository.ts     # Camada de dados (opcional)
 entities/               # Modelo de dados
 dto/                    # Validação
 services/               # Sub-services
```

**Estrutura Recomendada com Use-Cases:**

```
modulo/
 modulo.controller.ts    # Camada HTTP
 modulo.service.ts        # CRUD simples e operações diretas
 use-cases/              # ⭐ Regras de negócio complexas (RECOMENDADO)
   interfaces.ts         # Interfaces segregadas por responsabilidade
   calculate-balance.usecase.ts
   process-payment.usecase.ts
   generate-report.usecase.ts
 entities/               # Modelo de dados TypeORM
 dto/                    # Validação de entrada/saída
 services/               # Sub-services auxiliares
```

**IMPORTANTE**:
- ✅ Use **Use-Cases** para regras de negócio complexas, múltiplas transações e lógica que precisa ser testada isoladamente
- ✅ Use **Service** apenas para CRUD simples e operações diretas
- ✅ Consulte `./como-criar-use-case-backend.md` para documentação completa sobre Use-Cases

### [Exemplo Real]()

```typescript
// Controller - Camada HTTP
@Controller('products')
export class ProductController {
  constructor(private service: ProductService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }
}

// Service - Camada de Negócio
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
    private notificationService: NotificationService,
    private inventoryService: InventoryService,
  ) {}

  async create(dto: CreateProductDto, userId: number) {
    // Validação de negócio
    await this.validateStock(dto.stock);

    // Criar produto
    const product = this.repository.create({
      ...dto,
      userId,
    });

    const saved = await this.repository.save(product);

    // Processos paralelos
    await Promise.all([
      this.notificationService.notifyCreation(saved),
      this.inventoryService.registerProduct(saved),
    ]);

    return saved;
  }

  private async validateStock(stock: number) {
    if (stock < 0) {
      throw new BadRequestException('Estoque não pode ser negativo');
    }
  }
}
```

## [Error Handling]()

Estratégias para tratamento de erros consistente e informativo usando exceções do NestJS.

### [Use Exceções do NestJS]()

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
      throw new NotFoundException(`Produto ${id} não encontrado`);
    }

    return product;
  }

  async create(dto: CreateProductDto, userId: number) {
    // Validar regra de negócio
    const existing = await this.repository.findOne({
      where: { code: dto.code, userId },
    });

    if (existing) {
      throw new ConflictException('Produto com este código já existe');
    }

    return await this.repository.save({ ...dto, userId });
  }
}
```

## [Validação de Ownership]()

Sempre valide que o recurso pertence ao usuário:

```typescript
@Injectable()
export class ProductService {
  // Método auxiliar privado
  private async findOneOrFail(id: number, userId: number) {
    const product = await this.repository.findOne({
      where: { id, userId }, // Filtra por usuário
    });

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  // Usar em todos os métodos
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

## [Transações]()

Use transações para operações atômicas:

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
    // Executar em transação
    return await this.dataSource.transaction(async (manager) => {
      // Criar pedido
      const order = manager.create(Order, {
        userId,
        total: dto.total,
      });
      await manager.save(order);

      // Criar itens
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

Adicione logging estratégico:

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  async create(dto: CreateProductDto, userId: number) {
    this.logger.log(`Criando produto para usuário ${userId}`);

    try {
      const product = await this.repository.save({ ...dto, userId });

      this.logger.log(`Produto ${product.id} criado com sucesso`);
      return product;

    } catch (error) {
      this.logger.error(`Erro ao criar produto: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```


## [Checklist de Escalabilidade]()

- [ ] **Use-Cases para regras de negócio complexas** (consulte `./como-criar-use-case-backend.md`)
- [ ] Um service = Uma responsabilidade (CRUD simples)
- [ ] Segregação de interfaces (Use-Case Pattern)
- [ ] Injeção de dependência em tudo
- [ ] Validação com DTOs
- [ ] Tratamento de erros com exceções apropriadas
- [ ] Isolamento por userId
- [ ] Transações para operações atômicas
- [ ] Logging em pontos críticos
- [ ] Documentação Swagger
- [ ] Código type-safe (TypeScript)
- [ ] Nomenclatura em inglês para classes, interfaces e métodos

## [Dicas Finais]()

1. **Use Use-Cases para regras complexas**: Sempre que houver múltiplas transações ou lógica de negócio complexa
2. **Prefira Use-Cases magros**: 1 interface por use-case (consulte `./como-criar-use-case-backend.md`)
3. **Comece simples**: Não otimize prematuramente
4. **Refatore quando necessário**: Quando passar de 300 linhas ou houver complexidade
5. **Use interfaces**: Para desacoplar implementações (Use-Case Pattern)
6. **Evite lógica no controller**: Controller só roteia, Use-Case processa
7. **Service apenas para CRUD simples**: Regras complexas vão em Use-Cases
8. **Teste isoladamente**: Mock de interfaces, não de classes concretas
9. **Doc inline**: Comente código complexo
10. **Consistência**: Siga os padrões do projeto
11. **Nomenclatura em inglês**: Classes, interfaces e métodos sempre em inglês

## [Referências]()

- **[Use-Cases no Backend](./como-criar-use-case-backend.md)** - Documentação completa sobre Use-Case Pattern
- [NestJS Best Practices](https://docs.nestjs.com/techniques/performance)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)
