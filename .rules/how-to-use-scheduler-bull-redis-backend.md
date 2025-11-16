# How to use Scheduler with Bull in Backend

> Complete guide to schedule tasks with cron using Bull and @Cron decorator that encapsulates all complexity for distributed scheduled jobs

## [Setting up Bull Scheduler with Custom @Cron Decorator]()

This section covers the complete setup process for Bull-based job scheduling in NestJS, including package installation, global module configuration, custom @Cron decorator implementation, and automatic job registration for distributed cron tasks.

### When to use?

Use Bull Scheduler when you need:
- ✅ Distributed scheduled tasks across multiple application instances without duplication
- ✅ Horizontal scalability where scheduler works correctly with multiple instances
- ✅ Job persistence where scheduled tasks survive server restarts
- ✅ Automatic retry mechanisms for failed scheduled jobs
- ✅ Monitoring dashboard (Bull Board) to visualize and manage schedules
- ✅ Redis coordination to guarantee single execution even with multiple instances
- ✅ Timezone support for different scheduled tasks

### When NOT to use?

Avoid Bull Scheduler when:
- ❌ You need task queues and asynchronous message processing (use RabbitMQ instead)
- ❌ You need simple one-time delayed jobs (use setTimeout or agenda)
- ❌ You don't need distributed coordination (use @nestjs/schedule for single instance)
- ❌ You need real-time event processing (use RabbitMQ)

### Example

**Installation:**

```bash
npm install bull @nestjs/bull
npm install -D @types/bull
```

**Note:** Bull uses Redis as backend. Make sure Redis is configured (see `./how-to-use-redis-backend.md`).

**Global Scheduler Module:**

`src/common/scheduler/scheduler.module.ts`

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
    CronSchedulerRegistry, // Auto-registers @Cron methods
  ],
})
export class AppModule {}
```

**Environment Variables:**

`.env`

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Checklist

- [ ] Bull packages installed (`@nestjs/bull`, `bull`)
- [ ] `SchedulerModule` created in `src/common/scheduler/`
- [ ] `@Global()` decorator applied to module
- [ ] Redis connection configured
- [ ] `scheduler` queue registered in AppModule
- [ ] `DiscoveryModule` imported in AppModule
- [ ] `CronSchedulerRegistry` added to AppModule providers

### Troubleshooting

**Scheduler not executing:**

1. Check if Redis is running: `docker ps | grep redis`
2. Check application logs for "Scheduler registered" messages
3. Verify Bull Board: `http://localhost:3000/admin/queues`
4. Test cron expression at https://crontab.guru

**No schedulers being registered:**

Problem: Logs show `Total schedulers registered: 0` but you have methods with `@Cron`.

Diagnosis:
1. Check if `DiscoveryModule` is imported in AppModule
2. Check if schedulers are in module `providers`
3. Check if `CronSchedulerRegistry` is in AppModule `providers`
4. Check logs to see if providers were found

### Best Practices

- ✅ Configure Bull as a global module
- ✅ Use Redis for distributed coordination
- ✅ Set retry attempts and exponential backoff
- ✅ Keep completed jobs limited (removeOnComplete)
- ✅ Import DiscoveryModule for automatic registration
- ✅ Use Bull Board for monitoring in development
- ❌ Never use for message queues (use RabbitMQ)
- ❌ Never expose Bull Board without authentication in production

## [Creating Custom @Cron Decorator]()

This section demonstrates how to create a custom @Cron decorator that automatically discovers and registers all decorated methods as scheduled jobs in Bull, eliminating boilerplate code and simplifying scheduler implementation.

### When to use?

Use the custom @Cron decorator when:
- ✅ You want to simplify scheduler creation with minimal code
- ✅ You need automatic job discovery and registration
- ✅ You want consistent timezone and retry configuration
- ✅ You need to eliminate Bull boilerplate from business code

### When NOT to use?

Avoid custom decorator when:
- ❌ You need fine-grained control over each job configuration
- ❌ You want to register jobs dynamically at runtime

### Example

**Custom @Cron Decorator:**

`src/common/decorators/cron.decorator.ts`

```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';

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

### Checklist

- [ ] `@Cron` decorator exported
- [ ] `CronSchedulerRegistry` created
- [ ] `DiscoveryModule` imported
- [ ] Registry added to AppModule providers
- [ ] Metadata scanner configured
- [ ] Job processors registered dynamically

### Troubleshooting

**Error "Cannot find module @nestjs/core":**

Cause: Package `@nestjs/core` not installed or incompatible version.

Solution:
```bash
npm install @nestjs/core
```

**CronSchedulerRegistry is not discovering schedulers:**

Cause: `DiscoveryModule` is not imported.

Solution: Add to AppModule:
```typescript
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule, ...],
})
```

### Best Practices

- ✅ Use metadata for decorator configuration
- ✅ Log all registration steps
- ✅ Handle errors during registration
- ✅ Use unique jobId to prevent duplicates
- ✅ Register processors dynamically
- ❌ Don't hardcode queue names
- ❌ Don't skip error handling

## [Using @Cron Decorator in Schedulers]()

This section demonstrates how to use the custom @Cron decorator to create scheduled tasks with minimal boilerplate, including common cron patterns and timezone configuration.

### When to use?

Use @Cron decorator when:
- ✅ You need to schedule recurring tasks
- ✅ You want clean, declarative scheduler code
- ✅ You need timezone-specific scheduling
- ✅ You want automatic error handling and retry

### When NOT to use?

Avoid @Cron when:
- ❌ You need one-time delayed jobs
- ❌ You need dynamic scheduling (runtime changes)

### Example

**Basic Scheduler:**

`src/modules/reports/schedulers/reports.scheduler.ts`

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

**Register in Module:**

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

**Common Cron Expressions:**

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

### Checklist

- [ ] Scheduler class created with `@Injectable()`
- [ ] Methods decorated with `@Cron()`
- [ ] Cron expressions tested and validated
- [ ] Timezone specified when needed
- [ ] Error handling implemented
- [ ] Logging added for monitoring
- [ ] Scheduler registered in module providers

### Troubleshooting

**Scheduler executing multiple times:**

Problem: Job duplicated in each application instance.

Cause: `jobId` is not configured correctly.

Solution: The decorator already configures `jobId: 'cron:${jobName}'` automatically. Check if there are multiple registrations.

**Wrong execution time:**

1. Verify cron expression at https://crontab.guru
2. Check timezone configuration
3. Verify server time: `date`

### Best Practices

- ✅ Document cron expressions with comments
- ✅ Use descriptive job names
- ✅ Specify timezone explicitly
- ✅ Implement proper error handling
- ✅ Log execution start and completion
- ✅ Throw errors to trigger Bull retry
- ❌ Don't add heavy logic in scheduler methods
- ❌ Don't ignore timezone differences

## [Bull Board Dashboard for Monitoring]()

This section explains how to integrate Bull Board, a web-based UI for monitoring and managing Bull queues and scheduled jobs in real-time during development.

### When to use?

Use Bull Board when:
- ✅ You need to monitor scheduled jobs in development
- ✅ You want to debug job execution and failures
- ✅ You need to manually trigger jobs for testing
- ✅ You want to see job history and statistics

### When NOT to use?

Avoid Bull Board when:
- ❌ You're in production without authentication (security risk)
- ❌ You don't need visual monitoring (use logs instead)

### Example

**Installation:**

```bash
npm install @bull-board/api @bull-board/nestjs @bull-board/express
```

**Configure Bull Board Module:**

`src/common/scheduler/bull-board.module.ts`

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

**Access Dashboard:**

```
http://localhost:3000/admin/queues
```

**IMPORTANT:** Protect with authentication in production (API Key or JWT).

### Checklist

- [ ] Bull Board packages installed
- [ ] Bull Board module configured
- [ ] Dashboard accessible in development
- [ ] Authentication added for production
- [ ] Routes protected with guards

### Troubleshooting

**Cannot access dashboard:**

1. Verify route is correctly configured
2. Check if application is running
3. Check for port conflicts
4. Verify no authentication blocking access in dev

**Dashboard shows no queues:**

1. Verify queue name matches
2. Check if jobs are registered
3. Restart application

### Best Practices

- ✅ Use Bull Board in development for debugging
- ✅ Protect dashboard with authentication in production
- ✅ Use API Key or JWT guards
- ✅ Monitor job failures and retries
- ✅ Use dashboard to manually test jobs
- ❌ Never expose publicly without auth
- ❌ Don't rely solely on dashboard (use logging)

## [Testing Schedulers]()

This section demonstrates how to unit test scheduler methods independently of Bull infrastructure, ensuring business logic correctness without depending on scheduled execution.

### When to use?

Test schedulers when:
- ✅ You need to verify business logic
- ✅ You want to test without waiting for cron
- ✅ You need fast, isolated unit tests
- ✅ You want to mock dependencies

### When NOT to use?

Skip testing when:
- ❌ Methods are trivial (just logging)
- ❌ Logic is fully covered by service tests

### Example

**Unit Test:**

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
            cleanupOldData: jest.fn().mockResolvedValue(undefined),
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

  it('should cleanup old data', async () => {
    await scheduler.cleanupOldData();

    expect(service.cleanupOldData).toHaveBeenCalled();
  });

  it('should handle errors and rethrow', async () => {
    jest.spyOn(service, 'generateDailyReport').mockRejectedValue(new Error('Test error'));

    await expect(scheduler.generateDailyReport()).rejects.toThrow('Test error');
  });
});
```

### Checklist

- [ ] Test module created with mocks
- [ ] Scheduler methods tested individually
- [ ] Service methods properly mocked
- [ ] Error handling tested
- [ ] Success cases covered
- [ ] Edge cases considered

### Troubleshooting

**Tests failing:**

1. Verify mocks are properly configured
2. Check async/await usage
3. Verify method signatures match

**Cannot inject dependencies:**

1. Add all dependencies to providers
2. Use proper mock values
3. Verify imports

### Best Practices

- ✅ Test methods directly without Bull
- ✅ Mock all external dependencies
- ✅ Test error handling and retry behavior
- ✅ Use descriptive test names
- ✅ Cover both success and failure cases
- ❌ Don't test Bull internals
- ❌ Don't rely on actual cron execution

## [Manual Job Triggering via API]()

This section shows how to create API endpoints to manually trigger scheduled jobs, useful for testing, debugging, and allowing administrators to run jobs on demand.

### When to use?

Use manual triggering when:
- ✅ You need to test jobs without waiting
- ✅ Admins need to run jobs on demand
- ✅ You want to debug job execution
- ✅ You need to recover from failures

### When NOT to use?

Avoid manual triggering when:
- ❌ Jobs contain sensitive operations
- ❌ No authentication/authorization in place
- ❌ Jobs are resource-intensive (avoid abuse)

### Example

**Controller with Manual Trigger:**

`src/modules/reports/reports.controller.ts`

```typescript
import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ReportsScheduler } from './schedulers/reports.scheduler';
import { ApiKeyGuard } from '@/common/guards/api-key.guard';

@Controller('reports')
@UseGuards(ApiKeyGuard) // Protect endpoints
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

**Usage:**

```bash
curl -X POST http://localhost:3000/reports/trigger/daily-report \
  -H "X-API-Key: your-api-key"
```

### Checklist

- [ ] API endpoints created for job triggers
- [ ] Authentication/authorization implemented
- [ ] Job name validation added
- [ ] Error handling for unknown jobs
- [ ] Response messages clear and informative
- [ ] Endpoint documented

### Troubleshooting

**Unauthorized access:**

1. Verify API key is correct
2. Check guard configuration
3. Verify headers are sent

**Job not found:**

1. Check job name matches exactly
2. Verify mapping in jobMethods
3. Check for typos

### Best Practices

- ✅ Protect endpoints with authentication
- ✅ Validate job names before execution
- ✅ Log manual executions for audit
- ✅ Return clear success/error messages
- ✅ Use guards to restrict access
- ❌ Never expose publicly without auth
- ❌ Don't allow arbitrary code execution

## [Verifying Scheduler Registration]()

This section explains how to verify that schedulers are being correctly discovered and registered when the application starts, including log messages and diagnostic steps.

### When to use?

Verify registration when:
- ✅ Setting up schedulers for the first time
- ✅ Debugging why jobs aren't executing
- ✅ After configuration changes
- ✅ When troubleshooting issues

### When NOT to use?

Skip verification when:
- ❌ Schedulers are working correctly
- ❌ No changes have been made

### Example

**Expected Logs on Startup:**

```bash
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Starting scheduler registration...
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Total providers found: 45
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Found scheduler: ReportsScheduler.generateDailyReport
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] ✅ Scheduler registered: daily-report | Cron: 0 2 * * * | Timezone: America/Sao_Paulo
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Found scheduler: ReportsScheduler.cleanupOldData
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] ✅ Scheduler registered: weekly-cleanup | Cron: 0 3 * * 1 | Timezone: UTC
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Total schedulers registered: 2
```

**If `Total schedulers registered: 0` appears:**

- Check if `DiscoveryModule` is imported in AppModule
- Check if schedulers are in module `providers`
- Check if `CronSchedulerRegistry` is in AppModule `providers`

**If correct number of schedulers appears:**

- Everything working correctly!
- Access Bull Board to confirm: `http://localhost:3000/admin/queues`

### Checklist

- [ ] Application starts without errors
- [ ] Registration logs appear
- [ ] Correct number of schedulers registered
- [ ] Each scheduler shows cron expression
- [ ] Timezone displayed for each job
- [ ] Bull Board shows registered jobs

### Troubleshooting

**No logs appearing:**

1. Verify `CronSchedulerRegistry` is in AppModule
2. Check if `OnModuleInit` is being called
3. Verify logger is configured

**Wrong number of schedulers:**

1. Count @Cron decorated methods
2. Verify all scheduler classes are in providers
3. Check for conditional imports

### Best Practices

- ✅ Monitor logs during application startup
- ✅ Verify scheduler count matches expected
- ✅ Check Bull Board for visual confirmation
- ✅ Document expected scheduler count
- ✅ Set up alerts for registration failures
- ❌ Don't ignore registration errors
- ❌ Don't skip log verification

## [Folder Structure and Organization]()

This section provides the recommended folder structure for organizing schedulers within your NestJS application modules.

### When to use?

Follow this structure when:
- ✅ Creating new schedulers
- ✅ Organizing existing schedulers
- ✅ Maintaining consistency across modules
- ✅ Scaling scheduler count

### When NOT to use?

Deviate from structure when:
- ❌ Your project has established different conventions
- ❌ Single scheduler doesn't need subfolder

### Example

**Recommended Structure:**

```
src/
├── common/
│   ├── decorators/
│   │   └── cron.decorator.ts          # @Cron Decorator
│   └── scheduler/
│       ├── scheduler.module.ts        # Global Scheduler module
│       └── bull-board.module.ts       # Bull Board configuration
├── modules/
│   ├── reports/
│   │   ├── schedulers/
│   │   │   ├── reports.scheduler.ts   # Report schedulers
│   │   │   └── cleanup.scheduler.ts   # Cleanup schedulers
│   │   ├── reports.module.ts
│   │   └── reports.service.ts
│   └── notifications/
│       ├── schedulers/
│       │   └── notifications.scheduler.ts
│       ├── notifications.module.ts
│       └── notifications.service.ts
```

### Checklist

- [ ] Schedulers in `schedulers/` subfolder
- [ ] One scheduler file per responsibility
- [ ] Clear naming convention
- [ ] All schedulers registered in module
- [ ] Common decorator in shared location

### Troubleshooting

**Cannot find decorator:**

1. Check import path is correct
2. Verify decorator is exported
3. Use path alias if configured

### Best Practices

- ✅ Group schedulers in `schedulers/` subfolder
- ✅ One scheduler class per file
- ✅ Use clear, descriptive names
- ✅ Keep schedulers close to related services
- ❌ Don't mix schedulers with other code
- ❌ Don't create monolithic scheduler files

## [Implementation Checklist]()

Complete checklist for implementing Bull Scheduler with @Cron decorator in your NestJS application.

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
- [ ] Logs appear showing registered schedulers
- [ ] Unit tests for schedulers
- [ ] Timezone defined in each `@Cron`
- [ ] Proper logging in all schedulers
- [ ] Error handling implemented
- [ ] Manual trigger endpoints created (optional)
- [ ] Authentication added to Bull Board

## [References and Documentation]()

Official documentation and resources for Bull and NestJS integration.

- [NestJS Bull](https://docs.nestjs.com/techniques/queues)
- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Bull Board](https://github.com/felixmosh/bull-board)
- [Cron Expression Tester](https://crontab.guru)
- [Redis Documentation](https://redis.io/documentation)
