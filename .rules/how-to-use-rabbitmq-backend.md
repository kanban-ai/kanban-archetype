# How to use RabbitMQ in Backend

> Complete guide for using RabbitMQ with Topic Exchange for asynchronous and reliable processing

## [When to use RabbitMQ for queues and asynchronous processing]()

This section defines ideal scenarios for using RabbitMQ in the project, differentiating it from other technologies like Redis for specific use cases.

- ✅ **Asynchronous processing** - Tasks that don't block API response
- ✅ **Long-running tasks** - Time-consuming processes (sending emails, reports, etc)
- ✅ **Automatic retries** - Processes that may fail and need retry
- ✅ **Decoupling** - Separate producers from consumers
- ✅ **Delivery guarantee** - Persistent messages and acknowledgment
- ✅ **Batch processing** - Group multiple tasks
- ✅ **Background jobs** - Tasks executed in background
- ❌ **Data caching** - Use Redis for cache
- ❌ **Synchronous communication** - Use HTTP/REST for immediate responses
- ❌ **Temporary shared data** - Use Redis

## [RabbitMQ package installation in NestJS]()

Required packages to integrate RabbitMQ with NestJS using the microservices module.

```bash
npm install @nestjs/microservices amqplib amqp-connection-manager
```

## [RabbitMQ Architecture with single Topic Exchange]()

This project uses **Topic Exchange** with **A SINGLE EXCHANGE** named `app_exchange`.

### [RabbitMQ Topic Exchange fundamental concepts]()

- **Exchange**: Receives messages and routes them to queues (we use only `app_exchange`)
- **Topic (Routing Key)**: Routing pattern in format `<module>.<resource>.<action>`
- **Queue**: Queue that receives messages based on topic
- **Binding**: Link between Exchange and Queue with topic pattern

### [RabbitMQ Topic naming pattern in project]()

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
- `created`, `updated`, `deleted` - CRUD
- `paid`, `canceled`, `refunded` - Payments
- `sent`, `delivered`, `failed` - Notifications
- `generated`, `processed`, `completed` - Processing
- `filled`, `depleted` - Stock
- `registered`, `activated`, `suspended` - Users
- `placed`, `accepted`, `rejected` - Offers/Bids

## [RabbitMQ Global Configuration using reusable Common Module]()

Setup of a global and reusable RabbitMQ module to be imported once in AppModule.

### [1. Create common RabbitMQModule with Topic Exchange in NestJS]()

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
            // Don't specify queue here - each consumer will have its own queue
            // Single Topic Exchange
            queue: '', // Empty to use specific queues in consumers
            queueOptions: {
              durable: true, // Queue persists after restart
            },
            // Manual message acknowledgment
            noAck: false,
            // Prefetch - how many messages to process simultaneously
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

### [2. Register RabbitMQModule in root AppModule]()

`src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RabbitMQModule } from './common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    // ... other modules
    RabbitMQModule, // Import once
    // ... domain modules
  ],
})
export class AppModule {}
```

### [3. Configure RabbitMQ environment variables]()

`.env`

```bash
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=app_exchange
RABBITMQ_USER=guest        # Optional
RABBITMQ_PASSWORD=guest    # Optional
```

## [RabbitMQ Basic Usage - Publish messages as Producer]()

How to publish events to RabbitMQ with specific topics from Controllers and Services.

### [Publish messages to RabbitMQ with topics in Controllers/Services]()

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

## [Consume RabbitMQ messages with topic patterns]()

Creating consumers that subscribe to specific topics or wildcard patterns to process events asynchronously.

### [1. Create Consumer service to process RabbitMQ messages]()

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

  // Subscribe to topic: order.order.paid
  @EventPattern('order.order.paid')
  async handleOrderPaid(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Order paid: ${data.orderId}`);

      // Send payment confirmation email
      await this.sendPaymentConfirmationEmail(data);

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error processing order paid: ${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  private async sendOrderConfirmationEmail(data: any): Promise<void> {
    // Implement sending logic
  }

  private async sendPaymentConfirmationEmail(data: any): Promise<void> {
    // Implement sending logic
  }
}
```

### [2. Create Consumer with pattern matching using wildcards]()

You can use wildcards to subscribe to multiple RabbitMQ topics:

- `*` - Matches exactly one word
- `#` - Matches zero or more words

```typescript
@Injectable()
export class AuditConsumer {
  private readonly logger = new Logger(AuditConsumer.name);

  // Subscribe to ALL order events (created, updated, deleted, paid, etc)
  @EventPattern('order.order.*')
  async handleAllOrderEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey; // Ex: "order.order.created"

    try {
      this.logger.log(`Order event: ${routingKey}`);

      // Register in audit log
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
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    try {
      this.logger.log(`Payment event: ${routingKey}`);

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

  // Subscribe to ALL "created" events from any module
  @EventPattern('*.*.created')
  async handleAllCreatedEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    try {
      this.logger.log(`New record created: ${routingKey}`);

      // Increment metric
      await this.metricsService.incrementCreated(routingKey);

      channel.ack(originalMsg);
    } catch (error) {
      channel.nack(originalMsg, false, true);
    }
  }
}
```

### [3. Register consumer in module]()

`src/modules/notification/notification.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { NotificationConsumer } from './notification.consumer';

@Module({
  providers: [NotificationConsumer],
})
export class NotificationModule {}
```

### [4. Configure bootstrap with Topic Exchange]()

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
      // Don't specify queue - will be created automatically for each consumer
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
        // Auto-delete when no consumers
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

## [Practical RabbitMQ usage examples by system Module]()

Catalog of real topics and events used in different project modules.

### [Order Module]()

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

### [Payment Module]()

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

### [Notification Module]()

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

### [Product Module]()

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

### [User Module]()

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

### [Report Module]()

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

## [Advanced RabbitMQ Use Cases in Backend]()

Advanced implementations including Dead Letter Queue, retry control, batch processing and horizontal scaling.

### [1. Dead Letter Queue (DLQ) with Topic Exchange]()

Configure DLQ for failed messages.

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
      // Dead Letter Exchange for failed messages
      deadLetterExchange: 'app_exchange_dlx',
      deadLetterRoutingKey: 'failed',
      // Messages expire after 1 hour
      messageTtl: 3600000,
    },
  },
});
```

### [2. Retry control with counter]()

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

    // Get retry count from header
    const retryCount = originalMsg.properties.headers['x-retry-count'] || 0;

    try {
      this.logger.log(`[${routingKey}] Attempt ${retryCount + 1} - Sending email`);

      await this.sendEmail(data);

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`[${routingKey}] Error on attempt ${retryCount + 1}: ${error.message}`);

      if (retryCount >= this.maxRetries) {
        // Exceeded attempts - send to DLQ
        this.logger.error(`[${routingKey}] Max attempts reached. Sending to DLQ.`);
        channel.nack(originalMsg, false, false); // Don't requeue
      } else {
        // Increment counter and resend
        this.logger.warn(`[${routingKey}] Requeuing (attempt ${retryCount + 2})`);

        // Wait before resending (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        await new Promise((resolve) => setTimeout(resolve, delay));

        // NACK with requeue
        channel.nack(originalMsg, false, true);
      }
    }
  }

  private async sendEmail(data: any): Promise<void> {
    // Real implementation
  }
}
```

### [3. Batch processing by topic]()

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

    // When batch size is reached, process
    if (this.batches.get(routingKey).length >= this.batchSize) {
      await this.processBatch(routingKey);
    }

    // Immediate ACK
    channel.ack(originalMsg);
  }

  private async processBatch(routingKey: string): Promise<void> {
    const items = [...this.batches.get(routingKey)];
    this.batches.set(routingKey, []);

    try {
      this.logger.log(`[${routingKey}] Processing batch of ${items.length} items`);

      // Process all at once
      await this.performBatchOperation(items.map((i) => i.data));

      this.logger.log(`[${routingKey}] Batch processed successfully`);
    } catch (error) {
      this.logger.error(`[${routingKey}] Batch error: ${error.message}`);
    }
  }

  private async performBatchOperation(items: any[]): Promise<void> {
    // Implement batch operation
    // Ex: Bulk UPDATE in database
  }
}
```

### [4. Multiple consumers for same topic (scaling)]()

You can have multiple instances of the same consumer processing messages from the same topic in parallel. RabbitMQ distributes messages among them (round-robin).

```bash
# Instance 1
npm run start

# Instance 2 (in another terminal/server)
npm run start

# Both will process messages from 'order.order.created' in parallel
```

## [Configure local RabbitMQ with Docker Compose and Management UI]()

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

Start RabbitMQ:

```bash
docker-compose up -d rabbitmq
```

Access Management UI:
- URL: http://localhost:15672
- User: `guest`
- Password: `guest`

### [Verify Exchange and Bindings in Management UI]()

1. Access **Exchanges** - You'll see `app_exchange` (type: topic)
2. Click on `app_exchange` > **Bindings** - You'll see all bound queues and their patterns
3. Access **Queues** - You'll see all automatically created queues
4. In each queue, see **Bindings** to view which topics it's listening to

## [Best Practices when using RabbitMQ in NestJS]()

Essential recommendations for robust and maintainable queue implementation with RabbitMQ.

### [1. Always follow naming pattern]()

```typescript
// ✅ Good - pattern <module>.<resource>.<action>
'order.order.created'
'payment.payment.paid'
'notification.email.sent'

// ❌ Bad - no pattern
'orderCreated'
'payment_paid'
'email-sent'
```

### [2. Use single exchange]()

```typescript
// ✅ Good - all events go to app_exchange
await this.rabbitClient.emit('order.order.created', data);

// ❌ Bad - multiple exchanges
await this.orderExchange.emit('created', data);
await this.paymentExchange.emit('paid', data);
```

### [3. Validate payload before processing]()

```typescript
@EventPattern('order.order.created')
async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  // Validate structure
  if (!data.orderId || !data.userId) {
    this.logger.error('Invalid payload');
    channel.ack(originalMsg); // ACK to avoid reprocessing
    return;
  }

  // Process...
}
```

### [4. Always use manual ACK/NACK]()

```typescript
// ✅ Good - explicit control
channel.ack(originalMsg);

// ❌ Bad - auto-ack can lose messages
noAck: true
```

### [5. Logging with routing key]()

```typescript
const routingKey = originalMsg.fields.routingKey;
this.logger.log(`[${routingKey}] Processing message`);
this.logger.error(`[${routingKey}] Error: ${error.message}`);
```

### [6. Use wildcards carefully]()

```typescript
// ✅ Good - specific
@EventPattern('order.order.created')

// ⚠️ Careful - may receive many messages
@EventPattern('order.#')

// ⚠️ Too broad
@EventPattern('#')
```

### [7. Separate consumers by responsibility]()

```typescript
// ✅ Good - specialized consumers
notification.consumer.ts    // Notifications
audit.consumer.ts          // Audit
analytics.consumer.ts      // Analytics

// ❌ Bad - everything in one consumer
app.consumer.ts
```

### [8. Timeout for long processing]()

```typescript
async handleLongTask(@Payload() data: any, @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  try {
    // 30 second timeout
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

## [Differences between RabbitMQ and Redis - When to use each]()

Comparative table to help choose between RabbitMQ and Redis based on project needs.

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

## [RabbitMQ Implementation Checklist in NestJS]()

- [ ] RabbitMQ running (Docker or server)
- [ ] Packages installed (`@nestjs/microservices`, `amqplib`, `amqp-connection-manager`)
- [ ] `RabbitMQModule` created in `src/common/rabbitmq/`
- [ ] `@Global()` decorator applied
- [ ] Environment variables configured (`.env`)
- [ ] Module imported in `AppModule`
- [ ] Microservice connected in `main.ts` (`connectMicroservice`)
- [ ] Microservice started (`startAllMicroservices`)
- [ ] Single exchange `app_exchange` configured
- [ ] Queues configured as `durable: true`
- [ ] Manual ACK/NACK (`noAck: false`)
- [ ] Dead Letter Queue configured
- [ ] Consumers created with `@EventPattern` using pattern `<module>.<resource>.<action>`
- [ ] Logging with routing key implemented
- [ ] Error handling with retry
- [ ] Payload validation
- [ ] Monitoring via Management UI

## [Troubleshooting - Common RabbitMQ problems]()

Diagnosis and solutions for frequent problems when configuring and using RabbitMQ in NestJS.

### [RabbitMQ connection refused]()

```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# View logs
docker logs sdd-rabbitmq

# Restart
docker-compose restart rabbitmq
```

### [Messages not being consumed]()

```typescript
// 1. Check if microservice was started
await app.startAllMicroservices();

// 2. Check consumer pattern
@EventPattern('order.order.created') // must match emit

// 3. See logs with routing key
const routingKey = originalMsg.fields.routingKey;
this.logger.log(`Received: ${routingKey}`);
```

### [Exchange not appearing in Management UI]()

```bash
# Exchange is created automatically by NestJS when:
# 1. First message is published (producer)
# 2. First consumer connects

# If it doesn't appear, check:
# - Was microservice started?
# - Was any message published?
# - Check error logs
```

### [Messages going to wrong queue]()

```bash
# Check in Management UI:
# 1. Exchanges > app_exchange > Bindings
# 2. See routing patterns of each queue
# 3. Test pattern with "Publish message"

# Check in code:
# - Does emit routing key match @EventPattern?
# - Are wildcards correct (* vs #)?
```

### [Messages accumulating in queue]()

```bash
# Access Management UI: http://localhost:15672
# Check:
# - Active consumers
# - Consumption rate vs production
# - Errors in logs

# Solutions:
# - Increase number of workers (instances)
# - Optimize consumer code
# - Increase prefetchCount (process more in parallel)
```

### [Duplicate messages]()

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

## [References and official documentation about RabbitMQ and NestJS]()

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [RabbitMQ Topic Exchange](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
- [RabbitMQ Management UI](https://www.rabbitmq.com/management.html)
- [Dead Letter Exchanges](https://www.rabbitmq.com/dlx.html)
- [Routing Keys and Bindings](https://www.rabbitmq.com/tutorials/amqp-concepts.html)
