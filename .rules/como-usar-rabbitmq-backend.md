# [Como usar RabbitMQ no Backend]()

> Guia completo para usar RabbitMQ com Topic Exchange para processamento assíncrono e confiável

## [Quando usar RabbitMQ para filas e processamento assíncrono]()

Esta seção define os cenários ideais para utilizar RabbitMQ no projeto, diferenciando-o de outras tecnologias como Redis para casos de uso específicos.

- ✅ **Processamento assíncrono** - Tarefas que não bloqueiam a resposta da API
- ✅ **Tarefas demoradas** - Processamentos longos (envio de emails, relatórios, etc)
- ✅ **Retentativas automáticas** - Processos que podem falhar e precisam retry
- ✅ **Desacoplamento** - Separar produtores de consumidores
- ✅ **Garantia de entrega** - Mensagens persistentes e confirmação
- ✅ **Processamento em lote** - Agrupar múltiplas tarefas
- ✅ **Background jobs** - Tarefas executadas em segundo plano
- ❌ **Cache de dados** - Use Redis para cache
- ❌ **Comunicação síncrona** - Use HTTP/REST para respostas imediatas
- ❌ **Dados temporários compartilhados** - Use Redis

## [Instalação de pacotes RabbitMQ no NestJS]()

Pacotes necessários para integrar RabbitMQ com NestJS usando o módulo de microservices.

```bash
npm install @nestjs/microservices amqplib amqp-connection-manager
```

## [Arquitetura RabbitMQ com Topic Exchange única]()

Este projeto usa **Topic Exchange** com **UMA ÚNICA EXCHANGE** chamada `app_exchange`.

### [Conceitos fundamentais do RabbitMQ Topic Exchange]()

- **Exchange**: Recebe mensagens e roteia para filas (usamos apenas `app_exchange`)
- **Topic (Routing Key)**: Padrão de roteamento no formato `<module>.<resource>.<action>`
- **Queue**: Fila que recebe mensagens baseado no topic
- **Binding**: Ligação entre Exchange e Queue com pattern de topic

### [Padrão de Nomenclatura de Tópicos RabbitMQ no projeto]()

```
<module_name>.<resource_name>.<action>
```

**Exemplos:**
- `order.order.created` - Pedido criado
- `order.order.updated` - Pedido atualizado
- `order.order.deleted` - Pedido deletado
- `payment.payment.paid` - Pagamento realizado
- `notification.email.sent` - Email enviado
- `report.invoice.generated` - Relatório gerado
- `product.stock.filled` - Estoque reabastecido
- `user.user.registered` - Usuário registrado
- `auction.bid.placed` - Lance realizado

**Ações comuns:**
- `created`, `updated`, `deleted` - CRUD
- `paid`, `canceled`, `refunded` - Pagamentos
- `sent`, `delivered`, `failed` - Notificações
- `generated`, `processed`, `completed` - Processamentos
- `filled`, `depleted` - Estoque
- `registered`, `activated`, `suspended` - Usuários
- `placed`, `accepted`, `rejected` - Ofertas/Lances

## [Configuração Global do RabbitMQ usando Common Module reutilizável]()

Setup de um módulo RabbitMQ global e reutilizável para ser importado uma única vez no AppModule.

### [1. Criar RabbitMQModule comum com Topic Exchange no NestJS]()

`src/common/rabbitmq/rabbitmq.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('RABBITMQ_URL', 'amqp://localhost:5672')],
            // Não especificar queue aqui - cada consumer terá sua própria fila
            // Exchange única do tipo Topic
            queue: '', // Vazio para usar filas específicas nos consumers
            queueOptions: {
              durable: true, // Fila persiste após restart
            },
            // Reconhecimento manual de mensagens
            noAck: false,
            // Prefetch - quantas mensagens processar simultaneamente
            prefetchCount: 1,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
```

### [2. Registrar RabbitMQModule no AppModule raiz]()

`src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RabbitMQModule } from './common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    // ... outros módulos
    RabbitMQModule, // Importar uma única vez
    // ... módulos de domínio
  ],
})
export class AppModule {}
```

### [3. Configurar variáveis de ambiente do RabbitMQ]()

`.env`

```bash
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=app_exchange
RABBITMQ_USER=guest        # Opcional
RABBITMQ_PASSWORD=guest    # Opcional
```

## [Uso Básico do RabbitMQ - Publicar mensagens como Producer]()

Como publicar eventos no RabbitMQ com tópicos específicos a partir de Controllers e Services.

### [Publicar mensagens no RabbitMQ com tópicos em Controllers/Services]()

```typescript
import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,
  ) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    const order = await this.orderService.create(dto);

    // Publicar evento com tópico: order.order.created
    await this.rabbitClient.emit('order.order.created', {
      orderId: order.id,
      userId: order.userId,
      total: order.total,
      createdAt: order.createdAt,
    });

    return order;
  }

  @Post(':id/pay')
  async payOrder(@Param('id') id: string) {
    const order = await this.orderService.pay(id);

    // Publicar evento: order.order.paid
    await this.rabbitClient.emit('order.order.paid', {
      orderId: order.id,
      paidAt: order.paidAt,
      amount: order.total,
    });

    return order;
  }
}
```

## [Consumir mensagens do RabbitMQ com pattern de tópicos]()

Criação de consumers que subscrevem a tópicos específicos ou padrões com wildcards para processar eventos assincronamente.

### [1. Criar serviço Consumer para processar mensagens do RabbitMQ]()

`src/modules/notification/notification.consumer.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Injectable()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  // Subscrever ao tópico: order.order.created
  @EventPattern('order.order.created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Pedido criado: ${data.orderId}`);

      // Enviar email de confirmação
      await this.sendOrderConfirmationEmail(data);

      this.logger.log(`Email de confirmação enviado para pedido ${data.orderId}`);

      // Confirmar processamento (ACK)
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Erro ao processar pedido criado: ${error.message}`);

      // Rejeitar e reenviar para fila (NACK com requeue)
      channel.nack(originalMsg, false, true);
    }
  }

  // Subscrever ao tópico: order.order.paid
  @EventPattern('order.order.paid')
  async handleOrderPaid(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Pedido pago: ${data.orderId}`);

      // Enviar email de pagamento confirmado
      await this.sendPaymentConfirmationEmail(data);

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Erro ao processar pedido pago: ${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  private async sendOrderConfirmationEmail(data: any): Promise<void> {
    // Implementar lógica de envio
  }

  private async sendPaymentConfirmationEmail(data: any): Promise<void> {
    // Implementar lógica de envio
  }
}
```

### [2. Criar Consumer com pattern matching usando wildcards]()

Você pode usar wildcards para subscrever a múltiplos tópicos RabbitMQ:

- `*` - Corresponde exatamente a uma palavra
- `#` - Corresponde a zero ou mais palavras

```typescript
@Injectable()
export class AuditConsumer {
  private readonly logger = new Logger(AuditConsumer.name);

  // Subscrever a TODOS os eventos de order (created, updated, deleted, paid, etc)
  @EventPattern('order.order.*')
  async handleAllOrderEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey; // Ex: "order.order.created"

    try {
      this.logger.log(`Evento de pedido: ${routingKey}`);

      // Registrar no log de auditoria
      await this.auditService.log({
        topic: routingKey,
        data,
        timestamp: new Date(),
      });

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Erro no audit: ${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  // Subscrever a TODOS os eventos do módulo payment
  @EventPattern('payment.#')
  async handleAllPaymentEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    try {
      this.logger.log(`Evento de pagamento: ${routingKey}`);

      await this.auditService.log({
        topic: routingKey,
        data,
        timestamp: new Date(),
      });

      channel.ack(originalMsg);
    } catch (error) {
      channel.nack(originalMsg, false, true);
    }
  }

  // Subscrever a TODOS os eventos "created" de qualquer módulo
  @EventPattern('*.*.created')
  async handleAllCreatedEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    try {
      this.logger.log(`Novo registro criado: ${routingKey}`);

      // Incrementar métrica
      await this.metricsService.incrementCreated(routingKey);

      channel.ack(originalMsg);
    } catch (error) {
      channel.nack(originalMsg, false, true);
    }
  }
}
```

### [3. Registrar consumidor no módulo]()

`src/modules/notification/notification.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { NotificationConsumer } from './notification.consumer';

@Module({
  providers: [NotificationConsumer],
})
export class NotificationModule {}
```

### [4. Configurar bootstrap com Topic Exchange]()

`src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Adicionar microserviço RabbitMQ com Topic Exchange
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('RABBITMQ_URL', 'amqp://localhost:5672')],
      // Não especificar queue - será criada automaticamente para cada consumer
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
        // Auto-delete quando não houver consumers
        autoDelete: false,
      },
    },
  });

  // Iniciar microserviço
  await app.startAllMicroservices();

  // Iniciar API HTTP
  await app.listen(3000);
}
bootstrap();
```

## [Exemplos Práticos de uso do RabbitMQ por Módulo do sistema]()

Catálogo de tópicos e eventos reais utilizados em diferentes módulos do projeto.

### [Módulo Order]()

```typescript
// Producer
await this.rabbitClient.emit('order.order.created', { orderId, userId });
await this.rabbitClient.emit('order.order.updated', { orderId, changes });
await this.rabbitClient.emit('order.order.deleted', { orderId });
await this.rabbitClient.emit('order.order.paid', { orderId, amount });
await this.rabbitClient.emit('order.order.canceled', { orderId, reason });
await this.rabbitClient.emit('order.order.shipped', { orderId, trackingCode });

// Consumer
@EventPattern('order.order.created')
@EventPattern('order.order.paid')
@EventPattern('order.order.canceled')
```

### [Módulo Payment]()

```typescript
// Producer
await this.rabbitClient.emit('payment.payment.created', { paymentId });
await this.rabbitClient.emit('payment.payment.paid', { paymentId, amount });
await this.rabbitClient.emit('payment.payment.refunded', { paymentId, amount });
await this.rabbitClient.emit('payment.payment.failed', { paymentId, error });

// Consumer
@EventPattern('payment.payment.paid')
@EventPattern('payment.payment.failed')
```

### [Módulo Notification]()

```typescript
// Producer
await this.rabbitClient.emit('notification.email.sent', { emailId, to });
await this.rabbitClient.emit('notification.email.failed', { emailId, error });
await this.rabbitClient.emit('notification.sms.sent', { smsId, to });
await this.rabbitClient.emit('notification.push.sent', { pushId, userId });

// Consumer
@EventPattern('notification.email.sent')
@EventPattern('notification.email.failed')
```

### [Módulo Product]()

```typescript
// Producer
await this.rabbitClient.emit('product.product.created', { productId });
await this.rabbitClient.emit('product.product.updated', { productId });
await this.rabbitClient.emit('product.stock.filled', { productId, quantity });
await this.rabbitClient.emit('product.stock.depleted', { productId });
await this.rabbitClient.emit('product.price.changed', { productId, oldPrice, newPrice });

// Consumer
@EventPattern('product.product.created')
@EventPattern('product.stock.depleted')
```

### [Módulo User]()

```typescript
// Producer
await this.rabbitClient.emit('user.user.registered', { userId, email });
await this.rabbitClient.emit('user.user.activated', { userId });
await this.rabbitClient.emit('user.user.suspended', { userId, reason });
await this.rabbitClient.emit('user.user.deleted', { userId });

// Consumer
@EventPattern('user.user.registered')
@EventPattern('user.user.activated')
```

### [Módulo Report]()

```typescript
// Producer
await this.rabbitClient.emit('report.invoice.generated', { reportId, userId });
await this.rabbitClient.emit('report.summary.generated', { reportId, period });
await this.rabbitClient.emit('report.export.completed', { reportId, format });
await this.rabbitClient.emit('report.export.failed', { reportId, error });

// Consumer
@EventPattern('report.invoice.generated')
@EventPattern('report.export.completed')
```

## [Casos de Uso Avançados do RabbitMQ no Backend]()

Implementações avançadas incluindo Dead Letter Queue, controle de retries, processamento em lote e escala horizontal.

### [1. Dead Letter Queue (DLQ) com Topic Exchange]()

Configurar DLQ para mensagens que falharam.

`src/main.ts`

```typescript
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.RMQ,
  options: {
    urls: [configService.get('RABBITMQ_URL')],
    noAck: false,
    prefetchCount: 1,
    queueOptions: {
      durable: true,
      // Dead Letter Exchange para mensagens que falharam
      deadLetterExchange: 'app_exchange_dlx',
      deadLetterRoutingKey: 'failed',
      // Mensagens expiram após 1 hora
      messageTtl: 3600000,
    },
  },
});
```

### [2. Controle de Retries com contador]()

```typescript
@Injectable()
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);
  private readonly maxRetries = 3;

  @EventPattern('notification.email.sent')
  async handleEmailSend(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    // Obter número de tentativas do header
    const retryCount = originalMsg.properties.headers['x-retry-count'] || 0;

    try {
      this.logger.log(`[${routingKey}] Tentativa ${retryCount + 1} - Enviando email`);

      await this.sendEmail(data);

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`[${routingKey}] Erro na tentativa ${retryCount + 1}: ${error.message}`);

      if (retryCount >= this.maxRetries) {
        // Excedeu tentativas - enviar para DLQ
        this.logger.error(`[${routingKey}] Máximo de tentativas atingido. Enviando para DLQ.`);
        channel.nack(originalMsg, false, false); // Não requeue
      } else {
        // Incrementar contador e reenviar
        this.logger.warn(`[${routingKey}] Reenviando para fila (tentativa ${retryCount + 2})`);

        // Aguardar antes de reenviar (backoff exponencial)
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        await new Promise((resolve) => setTimeout(resolve, delay));

        // NACK com requeue
        channel.nack(originalMsg, false, true);
      }
    }
  }

  private async sendEmail(data: any): Promise<void> {
    // Implementação real
  }
}
```

### [3. Processamento em lote por tópico]()

```typescript
@Injectable()
export class BatchConsumer {
  private batches: Map<string, any[]> = new Map();
  private readonly batchSize = 10;
  private readonly logger = new Logger(BatchConsumer.name);

  @EventPattern('product.stock.updated')
  async handleStockUpdate(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    // Adicionar ao lote
    if (!this.batches.has(routingKey)) {
      this.batches.set(routingKey, []);
    }

    this.batches.get(routingKey).push({ data, originalMsg });

    // Quando atingir tamanho do lote, processar
    if (this.batches.get(routingKey).length >= this.batchSize) {
      await this.processBatch(routingKey);
    }

    // ACK imediato
    channel.ack(originalMsg);
  }

  private async processBatch(routingKey: string): Promise<void> {
    const items = [...this.batches.get(routingKey)];
    this.batches.set(routingKey, []);

    try {
      this.logger.log(`[${routingKey}] Processando lote de ${items.length} itens`);

      // Processar todos de uma vez
      await this.performBatchOperation(items.map((i) => i.data));

      this.logger.log(`[${routingKey}] Lote processado com sucesso`);
    } catch (error) {
      this.logger.error(`[${routingKey}] Erro no lote: ${error.message}`);
    }
  }

  private async performBatchOperation(items: any[]): Promise<void> {
    // Implementar operação em lote
    // Ex: UPDATE em massa no banco de dados
  }
}
```

### [4. Múltiplos consumers para o mesmo tópico (escala)]()

Você pode ter múltiplas instâncias do mesmo consumer processando mensagens do mesmo tópico em paralelo. RabbitMQ distribui as mensagens entre eles (round-robin).

```bash
# Instância 1
npm run start

# Instância 2 (em outro terminal/servidor)
npm run start

# Ambas processarão mensagens de 'order.order.created' em paralelo
```

## [Configurar RabbitMQ local com Docker Compose e Management UI]()

`docker-compose.yml`

```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: sdd-rabbitmq
    ports:
      - "5672:5672"    # AMQP
      - "15672:15672"  # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  rabbitmq-data:
```

Subir o RabbitMQ:

```bash
docker-compose up -d rabbitmq
```

Acessar Management UI:
- URL: http://localhost:15672
- Usuário: `guest`
- Senha: `guest`

### [Verificar Exchange e Bindings no Management UI]()

1. Acesse **Exchanges** - Você verá `app_exchange` (type: topic)
2. Clique em `app_exchange` > **Bindings** - Verá todas as filas vinculadas e seus patterns
3. Acesse **Queues** - Verá todas as filas criadas automaticamente
4. Em cada fila, veja **Bindings** para ver quais tópicos ela está ouvindo

## [Boas Práticas ao usar RabbitMQ no NestJS]()

Recomendações essenciais para implementação robusta e manutenível de filas com RabbitMQ.

### [1. Sempre seguir padrão de nomenclatura]()

```typescript
// ✅ Bom - padrão <module>.<resource>.<action>
'order.order.created'
'payment.payment.paid'
'notification.email.sent'

// ❌ Ruim - sem padrão
'orderCreated'
'payment_paid'
'email-sent'
```

### [2. Usar uma única exchange]()

```typescript
// ✅ Bom - todos eventos vão para app_exchange
await this.rabbitClient.emit('order.order.created', data);

// ❌ Ruim - múltiplas exchanges
await this.orderExchange.emit('created', data);
await this.paymentExchange.emit('paid', data);
```

### [3. Validar payload antes de processar]()

```typescript
@EventPattern('order.order.created')
async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  // Validar estrutura
  if (!data.orderId || !data.userId) {
    this.logger.error('Payload inválido');
    channel.ack(originalMsg); // ACK para não reprocessar
    return;
  }

  // Processar...
}
```

### [4. Sempre usar ACK/NACK manual]()

```typescript
// ✅ Bom - controle explícito
channel.ack(originalMsg);

// ❌ Ruim - auto-ack pode perder mensagens
noAck: true
```

### [5. Logging com routing key]()

```typescript
const routingKey = originalMsg.fields.routingKey;
this.logger.log(`[${routingKey}] Processando mensagem`);
this.logger.error(`[${routingKey}] Erro: ${error.message}`);
```

### [6. Usar wildcards com cuidado]()

```typescript
// ✅ Bom - específico
@EventPattern('order.order.created')

// ⚠️ Cuidado - pode receber muitas mensagens
@EventPattern('order.#')

// ⚠️ Muito abrangente
@EventPattern('#')
```

### [7. Separar consumers por responsabilidade]()

```typescript
// ✅ Bom - consumers especializados
notification.consumer.ts    // Notificações
audit.consumer.ts          // Auditoria
analytics.consumer.ts      // Analytics

// ❌ Ruim - tudo num consumer
app.consumer.ts
```

### [8. Timeout para processamento longo]()

```typescript
async handleLongTask(@Payload() data: any, @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  try {
    // Timeout de 30 segundos
    await Promise.race([
      this.processLongTask(data),
      this.timeout(30000),
    ]);

    channel.ack(originalMsg);
  } catch (error) {
    channel.nack(originalMsg, false, true);
  }
}

private timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
}
```

## [Diferenças entre RabbitMQ e Redis - Quando usar cada um]()

Tabela comparativa para auxiliar na escolha entre RabbitMQ e Redis baseado nas necessidades do projeto.

| Recurso | RabbitMQ | Redis |
|---------|----------|-------|
| **Uso principal** | Filas de mensagens com tópicos | Cache e dados compartilhados |
| **Garantia de entrega** | ✅ Sim (ACK/NACK) | ❌ Não |
| **Persistência** | ✅ Mensagens duráveis | ⚠️ Opcional (pode perder dados) |
| **Retentativas** | ✅ Automático com DLQ | ❌ Manual |
| **Roteamento por tópico** | ✅ Topic Exchange com wildcards | ❌ Não possui |
| **Processamento assíncrono** | ✅ Ideal | ❌ Não recomendado |
| **Ordenação** | ✅ FIFO garantido | ⚠️ Não garantido |
| **Velocidade** | ⚠️ Moderada | ✅ Muito rápida |
| **Escala horizontal** | ✅ Múltiplos consumers | ✅ Compartilhamento de dados |
| **Quando usar** | Background jobs, eventos, retry | Cache, sessões, contadores |

## [Checklist de Implementação do RabbitMQ no NestJS]()

- [ ] RabbitMQ rodando (Docker ou servidor)
- [ ] Pacotes instalados (`@nestjs/microservices`, `amqplib`, `amqp-connection-manager`)
- [ ] `RabbitMQModule` criado em `src/common/rabbitmq/`
- [ ] `@Global()` decorator aplicado
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Módulo importado no `AppModule`
- [ ] Microserviço conectado no `main.ts` (`connectMicroservice`)
- [ ] Microserviço iniciado (`startAllMicroservices`)
- [ ] Exchange única `app_exchange` configurada
- [ ] Filas configuradas como `durable: true`
- [ ] ACK/NACK manual (`noAck: false`)
- [ ] Dead Letter Queue configurada
- [ ] Consumers criados com `@EventPattern` usando padrão `<module>.<resource>.<action>`
- [ ] Logging com routing key implementado
- [ ] Tratamento de erros com retry
- [ ] Validação de payload
- [ ] Monitoramento via Management UI

## [Troubleshooting - Problemas comuns ao usar RabbitMQ]()

Diagnóstico e solução de problemas frequentes ao configurar e usar RabbitMQ no NestJS.

### [RabbitMQ connection refused]()

```bash
# Verificar se RabbitMQ está rodando
docker ps | grep rabbitmq

# Ver logs
docker logs sdd-rabbitmq

# Reiniciar
docker-compose restart rabbitmq
```

### [Mensagens não estão sendo consumidas]()

```typescript
// 1. Verificar se microserviço foi iniciado
await app.startAllMicroservices();

// 2. Verificar pattern do consumer
@EventPattern('order.order.created') // deve corresponder ao emit

// 3. Ver logs com routing key
const routingKey = originalMsg.fields.routingKey;
this.logger.log(`Recebido: ${routingKey}`);
```

### [Exchange não aparece no Management UI]()

```bash
# A exchange é criada automaticamente pelo NestJS ao:
# 1. Publicar primeira mensagem (producer)
# 2. Conectar primeiro consumer

# Se não aparecer, verificar:
# - Microserviço foi iniciado?
# - Alguma mensagem foi publicada?
# - Verificar logs de erro
```

### [Mensagens indo para fila errada]()

```bash
# Verificar no Management UI:
# 1. Exchanges > app_exchange > Bindings
# 2. Ver routing patterns de cada fila
# 3. Testar pattern com "Publish message"

# Verificar no código:
# - Routing key do emit corresponde ao @EventPattern?
# - Wildcards estão corretos (* vs #)?
```

### [Mensagens acumulando na fila]()

```bash
# Acessar Management UI: http://localhost:15672
# Verificar:
# - Consumers ativos
# - Taxa de consumo vs produção
# - Erros nos logs

# Soluções:
# - Aumentar número de workers (instâncias)
# - Otimizar código do consumer
# - Aumentar prefetchCount (processar mais em paralelo)
```

### [Mensagens duplicadas]()

```typescript
// Implementar idempotência no consumer
const processedIds = new Set();

@EventPattern('order.order.created')
async handleOrderCreated(@Payload() data: any) {
  if (processedIds.has(data.orderId)) {
    this.logger.warn(`Mensagem duplicada ignorada: ${data.orderId}`);
    channel.ack(originalMsg);
    return;
  }

  processedIds.add(data.orderId);
  // Processar...
}
```

## [Referências e documentação oficial sobre RabbitMQ e NestJS]()

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [RabbitMQ Topic Exchange](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
- [RabbitMQ Management UI](https://www.rabbitmq.com/management.html)
- [Dead Letter Exchanges](https://www.rabbitmq.com/dlx.html)
- [Routing Keys and Bindings](https://www.rabbitmq.com/tutorials/amqp-concepts.html)
