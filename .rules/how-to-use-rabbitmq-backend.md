# How to use RabbitMQ in Backend

> Complete guide for using RabbitMQ with Topic Exchange for asynchronous and reliable processing in distributed systems

## [Setting up RabbitMQ with Topic Exchange in NestJS]()

This section covers the complete setup process for integrating RabbitMQ with NestJS using Topic Exchange pattern, including package installation, global module configuration, environment setup, and basic producer/consumer implementation.

### When to use?

Use RabbitMQ when you need:
- ✅ Asynchronous processing of tasks that shouldn't block API responses
- ✅ Long-running operations like sending emails, generating reports, or processing large datasets
- ✅ Automatic retry mechanisms for operations that may fail
- ✅ Delivery guarantees with persistent messages and acknowledgment
- ✅ Decoupling between producers and consumers for better scalability
- ✅ Batch processing capabilities to group multiple tasks
- ✅ Background job execution independent of API lifecycle

### When NOT to use?

Avoid RabbitMQ when:
- ❌ You need data caching (use Redis instead)
- ❌ You require synchronous communication (use HTTP/REST for immediate responses)
- ❌ You need temporary shared data between instances (use Redis)
- ❌ You're implementing simple operations without retry requirements

### Example

**Installation:**

```bash
npm install @nestjs/microservices amqplib amqp-connection-manager
```

**Global RabbitMQ Module Configuration:**

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
            queue: '', // Empty to use specific queues in consumers
            queueOptions: {
              durable: true, // Queue persists after restart
            },
            noAck: false, // Manual message acknowledgment
            prefetchCount: 1, // Process one message at a time
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

**Register in AppModule:**

`src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RabbitMQModule } from './common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitMQModule, // Import once
    // ... other modules
  ],
})
export class AppModule {}
```

**Environment Variables:**

`.env`

```bash
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=app_exchange
RABBITMQ_USER=guest        # Optional
RABBITMQ_PASSWORD=guest    # Optional
```

### Checklist

- [ ] RabbitMQ running (Docker or server)
- [ ] Packages installed (`@nestjs/microservices`, `amqplib`, `amqp-connection-manager`)
- [ ] `RabbitMQModule` created in `src/common/rabbitmq/`
- [ ] `@Global()` decorator applied to module
- [ ] Environment variables configured (`.env`)
- [ ] Module imported in `AppModule`
- [ ] Microservice connected in `main.ts` (`connectMicroservice`)
- [ ] Microservice started (`startAllMicroservices`)

### Troubleshooting

**RabbitMQ connection refused:**

```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# View logs
docker logs sdd-rabbitmq

# Restart
docker-compose restart rabbitmq
```

**Exchange not appearing in Management UI:**

Exchange is created automatically by NestJS when:
1. First message is published (producer)
2. First consumer connects

If it doesn't appear, check:
- Was microservice started?
- Was any message published?
- Check error logs

### Best Practices

- ✅ Configure RabbitMQ as a global module to reuse across all modules
- ✅ Always use manual ACK/NACK (`noAck: false`) to avoid message loss
- ✅ Set queues as durable (`durable: true`) to persist after restarts
- ✅ Use environment variables for connection settings
- ✅ Import RabbitMQModule only once in AppModule
- ✅ Use prefetchCount to control parallel processing
- ❌ Never expose RabbitMQ credentials in code

## [Understanding Topic Exchange Architecture]()

This section explains the Topic Exchange pattern used in this project with a single exchange named `app_exchange`, including fundamental concepts, routing patterns, and topic naming conventions.

### When to use?

Use Topic Exchange when you need:
- ✅ Flexible message routing based on patterns
- ✅ Multiple consumers subscribing to different message types
- ✅ Wildcard-based message filtering (`*` for one word, `#` for multiple words)
- ✅ Organized event naming with hierarchical structure
- ✅ Centralized message routing through a single exchange

### When NOT to use?

Avoid Topic Exchange when:
- ❌ You need direct point-to-point communication (use Direct Exchange)
- ❌ You need to broadcast to all queues (use Fanout Exchange)
- ❌ You don't need pattern-based routing

### Example

**Topic Naming Pattern:**

```
<module_name>.<resource_name>.<action>
```

**Examples:**
- `order.order.created` - Order created
- `order.order.updated` - Order updated
- `order.order.deleted` - Order deleted
- `payment.payment.paid` - Payment completed
- `notification.email.sent` - Email sent
- `report.invoice.generated` - Report generated
- `product.stock.filled` - Stock replenished
- `user.user.registered` - User registered
- `auction.bid.placed` - Bid placed

**Common actions:**
- `created`, `updated`, `deleted` - CRUD operations
- `paid`, `canceled`, `refunded` - Payments
- `sent`, `delivered`, `failed` - Notifications
- `generated`, `processed`, `completed` - Processing
- `filled`, `depleted` - Stock
- `registered`, `activated`, `suspended` - Users
- `placed`, `accepted`, `rejected` - Offers/Bids

### Checklist

- [ ] Single exchange `app_exchange` configured
- [ ] Topic naming follows `<module>.<resource>.<action>` pattern
- [ ] Queues configured as `durable: true`
- [ ] Routing keys match expected patterns

### Troubleshooting

**Messages going to wrong queue:**

Check in Management UI:
1. Navigate to Exchanges > app_exchange > Bindings
2. Review routing patterns of each queue
3. Test pattern with "Publish message" feature

Check in code:
- Does emit routing key match @EventPattern?
- Are wildcards correct (`*` vs `#`)?

### Best Practices

- ✅ Always follow the naming pattern `<module>.<resource>.<action>`
- ✅ Use a single exchange (`app_exchange`) for all events
- ✅ Document your topic patterns in the module
- ✅ Use descriptive action names
- ❌ Avoid inconsistent naming patterns
- ❌ Don't create multiple exchanges without good reason

## [Publishing Messages as Producer]()

This section demonstrates how to publish events to RabbitMQ from Controllers and Services using specific topics for message routing.

### When to use?

Publish messages when:
- ✅ An important business event occurs (order created, payment completed)
- ✅ You need to notify other parts of the system asynchronously
- ✅ You want to decouple event producers from consumers
- ✅ You need to trigger background jobs or workflows

### When NOT to use?

Avoid publishing messages when:
- ❌ You need immediate synchronous response
- ❌ The operation is trivial and doesn't require notification
- ❌ You're simply updating local state without external impact

### Example

**Publishing from Controllers/Services:**

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

    // Publish event with topic: order.order.created
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

    // Publish event: order.order.paid
    await this.rabbitClient.emit('order.order.paid', {
      orderId: order.id,
      paidAt: order.paidAt,
      amount: order.total,
    });

    return order;
  }
}
```

**Module-specific Examples:**

**Order Module:**
```typescript
await this.rabbitClient.emit('order.order.created', { orderId, userId });
await this.rabbitClient.emit('order.order.paid', { orderId, amount });
await this.rabbitClient.emit('order.order.canceled', { orderId, reason });
```

**Payment Module:**
```typescript
await this.rabbitClient.emit('payment.payment.created', { paymentId });
await this.rabbitClient.emit('payment.payment.paid', { paymentId, amount });
await this.rabbitClient.emit('payment.payment.refunded', { paymentId, amount });
```

### Checklist

- [ ] Inject `RABBITMQ_SERVICE` via constructor
- [ ] Use descriptive topic names following pattern
- [ ] Include relevant data in message payload
- [ ] Emit messages after successful operations
- [ ] Use `await` for emit operations

### Troubleshooting

**Messages not being published:**

1. Check if RabbitMQ service is injected correctly
2. Verify RabbitMQ connection is established
3. Check error logs for connection issues
4. Verify topic name format is correct

### Best Practices

- ✅ Inject `RABBITMQ_SERVICE` using `@Inject()` decorator
- ✅ Use `await` for `emit()` operations
- ✅ Include only necessary data in payloads
- ✅ Publish after successful database operations
- ✅ Use try/catch for error handling
- ❌ Don't block API responses waiting for message processing
- ❌ Don't include sensitive data in messages

## [Consuming Messages with Topic Patterns]()

This section covers creating consumers that subscribe to specific topics or wildcard patterns to process events asynchronously with proper acknowledgment handling.

### When to use?

Create consumers when:
- ✅ You need to react to specific business events
- ✅ You want to process messages asynchronously
- ✅ You need to implement retry logic for failed operations
- ✅ You want to scale processing independently

### When NOT to use?

Avoid consumers when:
- ❌ You need synchronous processing
- ❌ The operation is too simple (use direct service calls)
- ❌ Real-time response is required

### Example

**Basic Consumer:**

`src/modules/notification/notification.consumer.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Injectable()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  // Subscribe to topic: order.order.created
  @EventPattern('order.order.created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Order created: ${data.orderId}`);

      // Send confirmation email
      await this.sendOrderConfirmationEmail(data);

      this.logger.log(`Confirmation email sent for order ${data.orderId}`);

      // Confirm processing (ACK)
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error processing order created: ${error.message}`);

      // Reject and requeue (NACK with requeue)
      channel.nack(originalMsg, false, true);
    }
  }

  private async sendOrderConfirmationEmail(data: any): Promise<void> {
    // Implement sending logic
  }
}
```

**Consumer with Pattern Matching:**

```typescript
@Injectable()
export class AuditConsumer {
  private readonly logger = new Logger(AuditConsumer.name);

  // Subscribe to ALL order events (created, updated, deleted, paid, etc)
  @EventPattern('order.order.*')
  async handleAllOrderEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    try {
      this.logger.log(`Order event: ${routingKey}`);

      await this.auditService.log({
        topic: routingKey,
        data,
        timestamp: new Date(),
      });

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error in audit: ${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  // Subscribe to ALL payment module events
  @EventPattern('payment.#')
  async handleAllPaymentEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    // Implementation
  }

  // Subscribe to ALL "created" events from any module
  @EventPattern('*.*.created')
  async handleAllCreatedEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    // Implementation
  }
}
```

**Register Consumer:**

`src/modules/notification/notification.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { NotificationConsumer } from './notification.consumer';

@Module({
  providers: [NotificationConsumer],
})
export class NotificationModule {}
```

**Bootstrap Configuration:**

`src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Add RabbitMQ microservice with Topic Exchange
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('RABBITMQ_URL', 'amqp://localhost:5672')],
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
        autoDelete: false,
      },
    },
  });

  // Start microservice
  await app.startAllMicroservices();

  // Start HTTP API
  await app.listen(3000);
}
bootstrap();
```

### Checklist

- [ ] Consumer created with `@Injectable()` decorator
- [ ] Methods decorated with `@EventPattern()`
- [ ] Proper ACK/NACK handling implemented
- [ ] Error handling with try/catch
- [ ] Logging for monitoring
- [ ] Consumer registered in module providers
- [ ] Microservice started in `main.ts`

### Troubleshooting

**Messages not being consumed:**

1. Check if microservice was started: `await app.startAllMicroservices()`
2. Verify consumer pattern matches publisher topic
3. Check logs with routing key
4. Verify consumer is registered in module providers

**Messages accumulating in queue:**

1. Access Management UI: http://localhost:15672
2. Check active consumers
3. Check consumption rate vs production
4. Increase number of workers (instances)
5. Optimize consumer code
6. Increase prefetchCount for parallel processing

### Best Practices

- ✅ Always use try/catch in consumer methods
- ✅ Call `channel.ack()` after successful processing
- ✅ Call `channel.nack()` on errors to retry
- ✅ Log routing keys for debugging
- ✅ Validate payload structure before processing
- ✅ Use wildcards carefully (`*` for one word, `#` for multiple)
- ✅ Separate consumers by responsibility
- ❌ Never use `noAck: true` in production
- ❌ Don't ignore error handling

## [Advanced RabbitMQ Patterns]()

This section demonstrates advanced implementation patterns including Dead Letter Queue for failed messages, retry control with exponential backoff, batch processing, and horizontal scaling strategies.

### When to use?

Use advanced patterns when:
- ✅ You need sophisticated error handling with DLQ
- ✅ You require controlled retry mechanisms
- ✅ You want to process messages in batches
- ✅ You need to scale horizontally with multiple instances

### When NOT to use?

Avoid advanced patterns when:
- ❌ Your use case is simple and doesn't need them
- ❌ You're just starting and need basic functionality first
- ❌ The added complexity isn't justified

### Example

**Dead Letter Queue Configuration:**

```typescript
// src/main.ts
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.RMQ,
  options: {
    urls: [configService.get('RABBITMQ_URL')],
    noAck: false,
    prefetchCount: 1,
    queueOptions: {
      durable: true,
      deadLetterExchange: 'app_exchange_dlx',
      deadLetterRoutingKey: 'failed',
      messageTtl: 3600000, // 1 hour
    },
  },
});
```

**Retry Control with Counter:**

```typescript
@Injectable()
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);
  private readonly maxRetries = 3;

  @EventPattern('notification.email.sent')
  async handleEmailSend(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const retryCount = originalMsg.properties.headers['x-retry-count'] || 0;

    try {
      this.logger.log(`Attempt ${retryCount + 1} - Sending email`);
      await this.sendEmail(data);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error on attempt ${retryCount + 1}: ${error.message}`);

      if (retryCount >= this.maxRetries) {
        this.logger.error('Max attempts reached. Sending to DLQ.');
        channel.nack(originalMsg, false, false); // Don't requeue
      } else {
        this.logger.warn(`Requeuing (attempt ${retryCount + 2})`);

        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        await new Promise((resolve) => setTimeout(resolve, delay));

        channel.nack(originalMsg, false, true);
      }
    }
  }
}
```

**Batch Processing:**

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

    // Add to batch
    if (!this.batches.has(routingKey)) {
      this.batches.set(routingKey, []);
    }

    this.batches.get(routingKey).push({ data, originalMsg });

    // Process when batch size is reached
    if (this.batches.get(routingKey).length >= this.batchSize) {
      await this.processBatch(routingKey);
    }

    channel.ack(originalMsg);
  }

  private async processBatch(routingKey: string): Promise<void> {
    const items = [...this.batches.get(routingKey)];
    this.batches.set(routingKey, []);

    try {
      this.logger.log(`Processing batch of ${items.length} items`);
      await this.performBatchOperation(items.map((i) => i.data));
      this.logger.log('Batch processed successfully');
    } catch (error) {
      this.logger.error(`Batch error: ${error.message}`);
    }
  }
}
```

**Horizontal Scaling:**

Multiple instances can process messages from the same topic in parallel. RabbitMQ distributes messages among them (round-robin).

```bash
# Instance 1
npm run start

# Instance 2 (in another terminal/server)
npm run start

# Both will process messages from topics in parallel
```

### Checklist

- [ ] Dead Letter Queue configured
- [ ] Retry mechanism implemented
- [ ] Exponential backoff configured
- [ ] Batch size defined appropriately
- [ ] Multiple instances tested
- [ ] Monitoring configured

### Troubleshooting

**Duplicate messages:**

```typescript
// Implement idempotency in consumer
const processedIds = new Set();

@EventPattern('order.order.created')
async handleOrderCreated(@Payload() data: any) {
  if (processedIds.has(data.orderId)) {
    this.logger.warn(`Duplicate message ignored: ${data.orderId}`);
    channel.ack(originalMsg);
    return;
  }

  processedIds.add(data.orderId);
  // Process...
}
```

### Best Practices

- ✅ Configure Dead Letter Queue for failed messages
- ✅ Implement retry with exponential backoff
- ✅ Use batch processing for high-volume operations
- ✅ Test horizontal scaling before production
- ✅ Implement idempotency for duplicate handling
- ✅ Set appropriate TTL for messages
- ❌ Don't retry indefinitely without DLQ
- ❌ Don't batch without size limits

## [Local RabbitMQ Setup with Docker]()

This section provides Docker Compose configuration for running RabbitMQ locally with Management UI for development and testing purposes.

### When to use?

Use Docker setup when:
- ✅ You need local development environment
- ✅ You want Management UI for debugging
- ✅ You need quick setup and teardown
- ✅ You want consistent environment across team

### When NOT to use?

Avoid Docker when:
- ❌ You have production RabbitMQ server
- ❌ You prefer native installation
- ❌ Docker is not available in your environment

### Example

**Docker Compose Configuration:**

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

**Start RabbitMQ:**

```bash
docker-compose up -d rabbitmq
```

**Access Management UI:**
- URL: http://localhost:15672
- User: `guest`
- Password: `guest`

**Verify Setup:**

1. Access **Exchanges** - You'll see `app_exchange` (type: topic)
2. Click on `app_exchange` > **Bindings** - View all bound queues and patterns
3. Access **Queues** - View all automatically created queues
4. Check **Bindings** in each queue to see which topics it's listening to

### Checklist

- [ ] Docker installed and running
- [ ] `docker-compose.yml` created
- [ ] RabbitMQ container started
- [ ] Management UI accessible at port 15672
- [ ] Exchanges visible in UI
- [ ] Queues being created automatically

### Troubleshooting

**Container fails to start:**

```bash
# Check container logs
docker logs sdd-rabbitmq

# Check if port is already in use
lsof -i :5672
lsof -i :15672

# Remove and recreate container
docker-compose down -v
docker-compose up -d rabbitmq
```

**Cannot access Management UI:**

1. Verify container is running: `docker ps | grep rabbitmq`
2. Check if port 15672 is exposed
3. Verify healthcheck status: `docker inspect sdd-rabbitmq`
4. Check browser console for errors

### Best Practices

- ✅ Use volumes for data persistence
- ✅ Configure healthcheck for container monitoring
- ✅ Use Management UI for debugging in development
- ✅ Set proper credentials (change default in production)
- ✅ Monitor container logs regularly
- ❌ Never expose Management UI publicly without authentication
- ❌ Don't use guest/guest credentials in production

## [Differences between RabbitMQ and Redis]()

This comparative section helps you choose the right tool based on your specific needs, comparing RabbitMQ's message queue capabilities with Redis's caching and data storage features.

### When to use?

Use this comparison when:
- ✅ You're deciding between RabbitMQ and Redis
- ✅ You need to understand trade-offs
- ✅ You're architecting a new feature
- ✅ You want to optimize existing implementation

### When NOT to use?

This comparison is not needed when:
- ❌ You clearly need caching (use Redis)
- ❌ You clearly need message queues (use RabbitMQ)
- ❌ You're already using the right tool

### Example

| Feature | RabbitMQ | Redis |
|---------|----------|-------|
| **Primary use** | Message queues with topics | Cache and shared data |
| **Delivery guarantee** | ✅ Yes (ACK/NACK) | ❌ No |
| **Persistence** | ✅ Durable messages | ⚠️ Optional (may lose data) |
| **Retries** | ✅ Automatic with DLQ | ❌ Manual |
| **Topic routing** | ✅ Topic Exchange with wildcards | ❌ Not available |
| **Asynchronous processing** | ✅ Ideal | ❌ Not recommended |
| **Ordering** | ✅ FIFO guaranteed | ⚠️ Not guaranteed |
| **Speed** | ⚠️ Moderate | ✅ Very fast |
| **Horizontal scaling** | ✅ Multiple consumers | ✅ Data sharing |
| **When to use** | Background jobs, events, retry | Cache, sessions, counters |

**Use RabbitMQ for:**
- Background job processing
- Event-driven architectures
- Reliable message delivery
- Asynchronous workflows

**Use Redis for:**
- Caching frequently accessed data
- Session storage
- Rate limiting
- Temporary data storage

### Checklist

- [ ] Identified use case requirements
- [ ] Compared delivery guarantees needed
- [ ] Evaluated persistence requirements
- [ ] Considered performance needs
- [ ] Determined scaling strategy

### Troubleshooting

**Chose wrong tool:**

If using RabbitMQ for caching or Redis for queues:
1. Identify the actual requirement
2. Migrate to appropriate tool
3. Update implementation
4. Test thoroughly

### Best Practices

- ✅ Use RabbitMQ for asynchronous message processing
- ✅ Use Redis for caching and temporary data
- ✅ Combine both when needed (RabbitMQ for jobs, Redis for cache)
- ✅ Understand trade-offs before choosing
- ❌ Don't use RabbitMQ for caching
- ❌ Don't use Redis for reliable message queues

## [References and Documentation]()

Official documentation and resources for RabbitMQ and NestJS integration.

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [RabbitMQ Topic Exchange](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
- [RabbitMQ Management UI](https://www.rabbitmq.com/management.html)
- [Dead Letter Exchanges](https://www.rabbitmq.com/dlx.html)
- [Routing Keys and Bindings](https://www.rabbitmq.com/tutorials/amqp-concepts.html)
