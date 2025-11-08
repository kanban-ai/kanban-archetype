# [Como deve ser criado um padrão escalável de implementação no módulo Backend?]()

> Guia de boas práticas para criar módulos escaláveis e manuteníveis no NestJS.

## [Princípios Fundamentais]()

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

### [1. Repository Pattern (TypeORM)]()

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

### [2. DTO Pattern]()

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

### [3. Strategy Pattern]()

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

### [4. Factory Pattern]()

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

- [ ] Um service = Uma responsabilidade
- [ ] Injeção de dependência em tudo
- [ ] Validação com DTOs
- [ ] Tratamento de erros com exceções apropriadas
- [ ] Isolamento por userId
- [ ] Transações para operações atômicas
- [ ] Logging em pontos críticos
- [ ] Documentação Swagger
- [ ] Código type-safe (TypeScript)

## [Dicas Finais]()

1. **Comece simples**: Não otimize prematuramente
2. **Refatore quando necessário**: Quando passar de 300 linhas
3. **Use interfaces**: Para desacoplar implementações
4. **Evite lógica no controller**: Controller só roteia
5. **Service só lógica de negócio**: Sem acesso a HTTP
6. **Teste isoladamente**: Mock de dependências
7. **Doc inline**: Comente código complexo
8. **Consistência**: Siga os padrões do projeto

## [Referências]()

- [NestJS Best Practices](https://docs.nestjs.com/techniques/performance)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
