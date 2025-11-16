# [How to use Scheduler with Bull in Backend]()

> Complete guide to schedule tasks with cron using Bull and @Cron decorator that encapsulates all complexity

## [When to use Scheduler with Bull]()

This section defines Bull Scheduler features for scheduled tasks.

- ✅ **Distributed scheduled tasks** - Multiple application instances without duplication
- ✅ **Horizontal scalability** - Scheduler works correctly with multiple instances
- ✅ **Persistence** - Jobs survive server restarts
- ✅ **Automatic retry** - Failed jobs are automatically reprocessed
- ✅ **Monitoring** - Bull Board dashboard to visualize schedules
- ✅ **Coordination via Redis** - Guarantees single execution even with multiple instances

**IMPORTANT:** This guide focuses exclusively on **scheduler** (scheduled tasks with cron). For queues and asynchronous message processing, use RabbitMQ (see `./how-to-use-rabbitmq-backend.md`).

## [Bull Scheduler Features]()

Available features for scheduled tasks with Bull.

| Feature | Description |
|---------|-----------|
| **Distributed execution** | ✅ Only one instance executes even with multiple replicas |
| **Persistence** | ✅ Jobs survive server restarts |
| **Automatic retry** | ✅ Configurable with exponential backoff |
| **Horizontal scaling** | ✅ Automatically coordinated via Redis |
| **Visual dashboard** | ✅ Bull Board UI for monitoring |
| **Timezone** | ✅ Support for different timezones per job |
| **Monitoring** | ✅ History of executions and failures |

## [Installation of dependencies]()

```bash
npm install bull @nestjs/bull
npm install -D @types/bull
```

**Note:** Bull uses Redis as backend. Make sure Redis is configured (see `./how-to-use-redis-backend.md`).

## [Simplified folder structure]()

Recommended organization for schedulers:

```
src/
├── common/
│   ├── decorators/
│   │   └── cron.decorator.ts          # @Cron Decorator (encapsulates Bull)
│   └── scheduler/
│       └── scheduler.module.ts        # Global Scheduler module
├── modules/
│   └── reports/
│       ├── schedulers/
│       │   └── reports.scheduler.ts   # Module schedulers
│       ├── reports.module.ts
│       └── reports.service.ts
```

## [Step 1: Configure Global SchedulerModule]()

Create global module that configures Bull once.

**File:** `src/common/scheduler/scheduler.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class SchedulerModule {}
```

**Register in AppModule:**

```typescript
import { Module } from '@nestjs/common';
import { SchedulerModule } from './common/scheduler/scheduler.module';

@Module({
  imports: [
    SchedulerModule, // Register globally
    // other modules...
  ],
})
export class AppModule {}
```

## [Step 2: Create @Cron Decorator that encapsulates complexity]()

This decorator encapsulates ALL Bull complexity. You just need to decorate methods.

**File:** `src/common/decorators/cron.decorator.ts`

```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

const CRON_METADATA_KEY = 'scheduler:cron';

export interface CronOptions {
  name?: string;
  timezone?: string;
}

/**
 * Decorator to schedule methods with cron expression
 *
 * @param expression - Cron expression (ex: '0 * * * *' for every hour)
 * @param options - Optional options (name, timezone)
 *
 * @example
 * ```typescript
 * @Cron('0 2 * * *', { name: 'daily-report', timezone: 'America/Sao_Paulo' })
 * async generateDailyReport() {
 *   console.log('Daily report generated');
 * }
 * ```
 */
export function Cron(expression: string, options?: CronOptions): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(CRON_METADATA_KEY, { expression, options }, target, propertyKey);
  };
}

/**
 * Service that automatically registers all methods decorated with @Cron
 *
 * IMPORTANT: This service must be in AppModule (root module) providers
 */
@Injectable()
export class CronSchedulerRegistry implements OnModuleInit {
  private readonly logger = new Logger(CronSchedulerRegistry.name);
  private readonly queueName = 'scheduler';

  constructor(
    @InjectQueue('scheduler') private readonly queue: Queue,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Starting scheduler registration...');
    await this.registerCronJobs();
  }

  private async registerCronJobs(): Promise<void> {
    const providers = this.discoveryService.getProviders();
    this.logger.log(`Total providers found: ${providers.length}`);

    let totalJobs = 0;

    for (const wrapper of providers) {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') continue;

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const metadata = Reflect.getMetadata(CRON_METADATA_KEY, prototype, methodName);

        if (metadata) {
          this.logger.log(
            `Found scheduler: ${instance.constructor.name}.${methodName}`,
          );
          await this.registerJob(instance, methodName, metadata);
          totalJobs++;
        }
      }
    }

    this.logger.log(`Total schedulers registered: ${totalJobs}`);
  }

  private async registerJob(
    instance: object,
    methodName: string,
    metadata: { expression: string; options?: CronOptions },
  ): Promise<void> {
    const { expression, options } = metadata;
    const jobName = options?.name || `${instance.constructor.name}.${methodName}`;

    try {
      await this.queue.add(
        jobName,
        { instance: instance.constructor.name, method: methodName },
        {
          repeat: {
            cron: expression,
            tz: options?.timezone || 'UTC',
          },
          jobId: `cron:${jobName}`,
        },
      );

      // Register processor dynamically
      this.queue.process(jobName, async (job) => {
        this.logger.log(`Executing: ${job.name}`);
        await instance[methodName].call(instance);
      });

      this.logger.log(
        `✅ Scheduler registered: ${jobName} | Cron: ${expression} | Timezone: ${options?.timezone || 'UTC'}`,
      );
    } catch (error) {
      this.logger.error(`Error registering scheduler ${jobName}:`, error.stack);
    }
  }
}
```

## [Step 3: Configure Scheduler module in AppModule]()

Add queue and registry to root module.

**File:** `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DiscoveryModule } from '@nestjs/core';
import { SchedulerModule } from './common/scheduler/scheduler.module';
import { CronSchedulerRegistry } from './common/decorators/cron.decorator';

@Module({
  imports: [
    SchedulerModule,
    DiscoveryModule,
    BullModule.registerQueue({ name: 'scheduler' }),
    // other modules...
  ],
  providers: [
    CronSchedulerRegistry, // Registry that auto-registers @Cron
  ],
})
export class AppModule {}
```

## [Step 4: Use @Cron in your schedulers]()

Now just decorate methods with @Cron - all complexity is encapsulated!

**File:** `src/modules/reports/schedulers/reports.scheduler.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@/common/decorators/cron.decorator';
import { ReportsService } from '../reports.service';

@Injectable()
export class ReportsScheduler {
  private readonly logger = new Logger(ReportsScheduler.name);

  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Generate daily report at 2am (Sao Paulo timezone)
   */
  @Cron('0 2 * * *', { name: 'daily-report', timezone: 'America/Sao_Paulo' })
  async generateDailyReport(): Promise<void> {
    this.logger.log('Starting daily report generation');

    try {
      await this.reportsService.generateDailyReport();
      this.logger.log('Daily report generated successfully');
    } catch (error) {
      this.logger.error('Error generating daily report', error.stack);
      throw error; // Bull will retry automatically
    }
  }

  /**
   * Clean old data every Monday at 3am
   */
  @Cron('0 3 * * 1', { name: 'weekly-cleanup' })
  async cleanupOldData(): Promise<void> {
    this.logger.log('Starting weekly cleanup');
    await this.reportsService.cleanupOldData();
  }

  /**
   * Check integrations every 15 minutes
   */
  @Cron('*/15 * * * *', { name: 'check-integrations' })
  async checkIntegrations(): Promise<void> {
    this.logger.log('Checking integrations');
    await this.reportsService.checkIntegrations();
  }
}
```

**Register in module:**

```typescript
import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsScheduler } from './schedulers/reports.scheduler';

@Module({
  providers: [
    ReportsService,
    ReportsScheduler, // Just add to providers
  ],
})
export class ReportsModule {}
```

**Done!** Schedulers will be automatically registered in Bull when the application starts.

## [Example: Common Cron Expressions]()

Quick reference of cron expressions for frequent schedules.

```typescript
// Every minute
@Cron('* * * * *')

// Every 5 minutes
@Cron('*/5 * * * *')

// Every hour (at minute 0)
@Cron('0 * * * *')

// Every day at 2am
@Cron('0 2 * * *')

// Every Monday at 9am
@Cron('0 9 * * 1')

// First day of month at 00:00
@Cron('0 0 1 * *')

// Monday to Friday at 8am
@Cron('0 8 * * 1-5')

// Every 15 minutes between 9am and 5pm
@Cron('*/15 9-17 * * *')
```

**Format:** `minute hour day month day_of_week`

- `*` = any value
- `*/n` = every n units
- `n-m` = range from n to m
- `n,m` = specific values n and m

**Test expressions:** https://crontab.guru

## [How to add Bull Board Dashboard]()

Bull Board provides web UI to monitor schedulers in real time.

**Install:**

```bash
npm install @bull-board/api @bull-board/nestjs @bull-board/express
```

**Configure:**

**File:** `src/common/scheduler/bull-board.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'scheduler',
      adapter: ExpressAdapter,
    }),
  ],
})
export class BullBoardConfigModule {}
```

**Register in AppModule:**

```typescript
import { Module } from '@nestjs/common';
import { BullBoardConfigModule } from './common/scheduler/bull-board.module';

@Module({
  imports: [
    BullBoardConfigModule,
    // other modules...
  ],
})
export class AppModule {}
```

**Access:**
```
http://localhost:3000/admin/queues
```

**IMPORTANT:** Protect with authentication in production (API Key or JWT).

## [Environment Variables]()

Add to `.env` file:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## [Testing Schedulers]()

**Test method directly (without Bull):**

```typescript
import { Test } from '@nestjs/testing';
import { ReportsScheduler } from './reports.scheduler';
import { ReportsService } from './reports.service';

describe('ReportsScheduler', () => {
  let scheduler: ReportsScheduler;
  let service: ReportsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReportsScheduler,
        {
          provide: ReportsService,
          useValue: {
            generateDailyReport: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    scheduler = module.get(ReportsScheduler);
    service = module.get(ReportsService);
  });

  it('should generate daily report', async () => {
    await scheduler.generateDailyReport();

    expect(service.generateDailyReport).toHaveBeenCalled();
  });
});
```

## [Trigger Scheduler Manually via API]()

Useful for testing and debugging.

**File:** `src/modules/reports/reports.controller.ts`

```typescript
import { Controller, Post, Param } from '@nestjs/common';
import { ReportsScheduler } from './schedulers/reports.scheduler';

@Controller('reports')
export class ReportsController {
  constructor(private readonly scheduler: ReportsScheduler) {}

  /**
   * Trigger scheduler manually
   * POST /reports/trigger/daily-report
   */
  @Post('trigger/:jobName')
  async triggerJob(@Param('jobName') jobName: string): Promise<{ message: string }> {
    // Map job name to method
    const jobMethods = {
      'daily-report': () => this.scheduler.generateDailyReport(),
      'weekly-cleanup': () => this.scheduler.cleanupOldData(),
      'check-integrations': () => this.scheduler.checkIntegrations(),
    };

    const method = jobMethods[jobName];
    if (!method) {
      throw new Error(`Job ${jobName} not found`);
    }

    await method();

    return { message: `Job ${jobName} executed successfully` };
  }
}
```

## [Best Practices]()

Implementation checklist to ensure quality and scalability.

- ✅ **Global SchedulerModule** - Configure once, use in all modules
- ✅ **CronSchedulerRegistry in AppModule** - Register in root module
- ✅ **Configure retry and backoff** - At least 3 attempts with exponential backoff
- ✅ **Proper logging** - NestJS Logger in all schedulers
- ✅ **Error handling** - Try/catch and throw to trigger retry
- ✅ **Explicit timezone** - Always define timezone in options
- ✅ **Clear naming** - Descriptive name for each scheduler
- ✅ **Document cron expressions** - Comment explaining when it executes
- ✅ **Test schedulers** - Unit tests calling methods directly
- ✅ **Bull Board in development** - Facilitates debugging and monitoring
- ✅ **Unique jobId** - `cron:${jobName}` to avoid duplication
- ❌ **NEVER expose Bull Board in production without auth** - Use API Key or JWT
- ❌ **NEVER use for queues** - Use RabbitMQ for asynchronous messages
- ❌ **NEVER add heavy logic** - Delegate to services

## [Troubleshooting]()

Common problems and solutions:

### [Scheduler executing multiple times]()

**Problem:** Job duplicated in each application instance.

**Cause:** `jobId` is not configured correctly.

**Solution:** The decorator already configures `jobId: 'cron:${jobName}'` automatically. Check if there are multiple registrations.

### [Scheduler not executing]()

**Diagnosis:**
1. Check if Redis is running: `docker ps`
2. Check application logs for message "Scheduler registered"
3. Check Bull Board: `http://localhost:3000/admin/queues`
4. Test cron expression at https://crontab.guru

### [No schedulers being registered]()

**Problem:** Logs show `Total schedulers registered: 0` but you have methods with `@Cron`.

**Diagnosis:**
1. Check if `DiscoveryModule` is imported in AppModule
2. Check if schedulers are in module `providers`
3. Check if `CronSchedulerRegistry` is in AppModule `providers`
4. Check logs to see if providers were found

### [Error "Cannot find module @nestjs/core"]()

**Cause:** Package `@nestjs/core` not installed or incompatible version.

**Solution:**
```bash
npm install @nestjs/core
```

### [CronSchedulerRegistry is not discovering schedulers]()

**Cause:** `DiscoveryModule` is not imported.

**Solution:** Add to AppModule:
```typescript
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule, ...],
})
```

## [How to verify if schedulers were registered]()

When starting the application, you MUST see logs like these:

```bash
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Starting scheduler registration...
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Total providers found: 45
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Found scheduler: ReportsScheduler.generateDailyReport
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] ✅ Scheduler registered: daily-report | Cron: 0 2 * * * | Timezone: America/Sao_Paulo
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Found scheduler: ReportsScheduler.cleanupOldData
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] ✅ Scheduler registered: weekly-cleanup | Cron: 0 3 * * 1 | Timezone: UTC
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Total schedulers registered: 2
```

**❌ If `Total schedulers registered: 0` appears:**
- Check if `DiscoveryModule` is imported in AppModule
- Check if schedulers are in module `providers`
- Check if `CronSchedulerRegistry` is in AppModule `providers`

**✅ If correct number of schedulers appears:**
- Everything working correctly!
- Access Bull Board to confirm: `http://localhost:3000/admin/queues`

## [Implementation Checklist]()

- [ ] Redis installed and running
- [ ] Bull packages installed (`@nestjs/bull`, `bull`)
- [ ] `SchedulerModule` created in `src/common/scheduler/`
- [ ] `CronSchedulerRegistry` created in `src/common/decorators/cron.decorator.ts`
- [ ] `@Cron` decorator exported
- [ ] `scheduler` queue registered in AppModule
- [ ] `CronSchedulerRegistry` added to AppModule providers
- [ ] `DiscoveryModule` imported in AppModule
- [ ] Schedulers created with methods decorated by `@Cron`
- [ ] Schedulers added to module providers
- [ ] Environment variables configured (`.env`)
- [ ] Bull Board configured for development
- [ ] Logs appear showing registered schedulers (check "Total schedulers registered")
- [ ] Unit tests for schedulers
- [ ] Timezone defined in each `@Cron`
- [ ] Proper logging in all schedulers

## [Summary: How to use in 4 steps]()

### [1. Initial setup (once)]()

```bash
# Install
npm install bull @nestjs/bull

# Create SchedulerModule (src/common/scheduler/scheduler.module.ts)
# Create @Cron decorator (src/common/decorators/cron.decorator.ts)
# Register in AppModule
```

### [2. Create scheduler]()

```typescript
@Injectable()
export class MyScheduler {
  @Cron('0 * * * *', { name: 'hourly-task' })
  async myTask() {
    console.log('Executed every hour');
  }
}
```

### [3. Register in module]()

```typescript
@Module({
  providers: [MyScheduler],
})
export class MyModule {}
```

### [4. Done!]()

The scheduler will be automatically registered when the application starts.

---

**Documentation generated by**: Claude Code
**Last update**: November 13, 2025
