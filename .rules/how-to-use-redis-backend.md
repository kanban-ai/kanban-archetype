# [How to use Redis in Backend]()

> Complete guide for using Redis as cache and shared memory for horizontal scalability

## [When to use Redis for cache and shared memory]()

This section identifies appropriate use cases for Redis in the project, focusing on cache, shared counters and temporary data between instances.

- ✅ **Data caching** - Reduce database load
- ✅ **Shared sessions** - Share sessions between instances
- ✅ **Shared counters** - Distributed atomic increments
- ✅ **Rate Limiting** - Control request limits
- ✅ **External API cache** - Avoid repeated requests
- ✅ **Temporary data** - Shared memory between instances
- ❌ **Permanent storage** - Use PostgreSQL for persistent data
- ❌ **Task queues** - Use RabbitMQ for background jobs (see [how-to-use-rabbitmq-backend.md](./how-to-use-rabbitmq-backend.md))
- ❌ **Pub/Sub** - Don't use Redis for communication between instances

## [Redis package installation in NestJS]()

Required packages to integrate Redis as cache using cache-manager in NestJS.

```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis
```

## [Redis Global Configuration using reusable Common Module]()

Setup of a global Redis module configured once and available throughout the application.

### [1. Create common shared RedisModule in NestJS]()

`src/common/redis/redis.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

@Global() // Makes it available to all modules
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: configService.get('REDIS_TTL', 300), // 5 minutes default
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
```

### [2. Register RedisModule in root AppModule]()

`src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    // ... other modules
    RedisModule, // Import once
    // ... domain modules
  ],
})
export class AppModule {}
```

### [3. Configure Redis environment variables]()

`.env`

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=       # Optional
REDIS_DB=0
REDIS_TTL=300         # 5 minutes in seconds
```

## [Redis Basic Usage - Implement simple cache in Services]()

How to inject and use Redis cache manager in services for query and data caching.

### [Inject CACHE_MANAGER in NestJS Services]()

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    const cacheKey = 'products:all';

    // Try to get from cache
    const cached = await this.cacheManager.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // If it doesn't exist, fetch from database
    const products = await this.productRepository.find();

    // Save in cache for 5 minutes
    await this.cacheManager.set(cacheKey, products, 300);

    return products;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;

    const cached = await this.cacheManager.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.productRepository.findOneOrFail({
      where: { id },
    });

    await this.cacheManager.set(cacheKey, product, 300);

    return product;
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.save({
      id,
      ...updateDto,
    });

    // Invalidate related caches
    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:all');

    return product;
  }

  async remove(id: string): Promise<void> {
    await this.productRepository.softDelete(id);

    // Invalidate caches
    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:all');
  }
}
```

## [Available Redis operations with cache-manager]()

Main cache-manager methods to interact with Redis: SET, GET, DEL and FLUSH.

### [1. Save data to Redis using SET]()

```typescript
// Simple
await this.cacheManager.set('key', 'value');

// With TTL (in seconds)
await this.cacheManager.set('key', 'value', 300); // 5 minutes

// Complex object (automatically serialized)
await this.cacheManager.set('user:123', { id: 123, name: 'John' }, 600);
```

### [2. Fetch data from Redis using GET]()

```typescript
// Returns null if doesn't exist
const value = await this.cacheManager.get('key');

// With typing
const user = await this.cacheManager.get<User>('user:123');
```

### [3. Delete keys from Redis using DEL]()

```typescript
// Delete one key
await this.cacheManager.del('key');

// Delete multiple keys
await this.cacheManager.del('key1');
await this.cacheManager.del('key2');
```

### [4. Reset all Redis data using FLUSH]()

```typescript
// ⚠️ Careful: removes ALL keys
await this.cacheManager.reset();
```

## [Advanced Redis Use Cases in Backend]()

Advanced implementations of atomic counters, rate limiting, external API cache and shared sessions.

### [1. Implement shared counter with atomic increment in Redis]()

Useful for statistics, rate limiting, distributed counters.

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createClient } from 'redis';

@Injectable()
export class StatsService {
  private redisClient: any;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    // Access native Redis client for advanced operations
    this.redisClient = (this.cacheManager.store as any).getClient();
  }

  async incrementPageView(pageId: string): Promise<number> {
    const key = `stats:pageview:${pageId}`;

    // INCR is atomic - safe for multiple instances
    const newCount = await this.redisClient.incr(key);

    // Set 24 hour expiration
    await this.redisClient.expire(key, 86400);

    return newCount;
  }

  async getPageViews(pageId: string): Promise<number> {
    const key = `stats:pageview:${pageId}`;
    const count = await this.redisClient.get(key);
    return parseInt(count || '0', 10);
  }
}
```

### [2. Implement Rate Limiting with Redis to control requests]()

Limit requests per user/IP using Redis counters.

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RateLimitService {
  private redisClient: any;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.redisClient = (this.cacheManager.store as any).getClient();
  }

  async checkRateLimit(
    identifier: string, // userId, IP, etc
    limit: number = 100, // maximum requests
    windowSeconds: number = 60, // time window
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:${identifier}`;

    const current = await this.redisClient.incr(key);

    // First request - set expiration
    if (current === 1) {
      await this.redisClient.expire(key, windowSeconds);
    }

    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);

    return { allowed, remaining };
  }
}
```

**Guard to apply rate limit:**

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const identifier = request.user?.id || request.ip;

    const { allowed, remaining } = await this.rateLimitService.checkRateLimit(
      identifier,
      100, // 100 requests
      60,  // per minute
    );

    if (!allowed) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Remaining', remaining);

    return true;
  }
}
```

### [3. Implement external API response cache with Redis]()

Cache external API responses using Redis to reduce latency and costs.

```typescript
@Injectable()
export class ExternalApiService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
  ) {}

  async fetchUserData(userId: string): Promise<any> {
    const cacheKey = `external:user:${userId}`;

    // Try cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from external API
    const response = await this.httpService.axiosRef.get(
      `https://api.example.com/users/${userId}`,
    );

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, response.data, 3600);

    return response.data;
  }
}
```

### [4. Implement shared sessions with Redis for horizontal scaling]()

Use Redis for multiple instances to share user sessions.

```typescript
@Injectable()
export class SessionService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async createSession(userId: string, data: any): Promise<string> {
    const sessionId = randomUUID();
    const key = `session:${sessionId}`;

    await this.cacheManager.set(
      key,
      { userId, ...data },
      3600, // 1 hour
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`;
    return await this.cacheManager.get(key);
  }

  async destroySession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.cacheManager.del(key);
  }

  async refreshSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await this.cacheManager.set(`session:${sessionId}`, session, 3600);
    }
  }
}
```

## [Redis Key Naming Patterns]()

Use consistent hierarchical prefixes to organize Redis data:

```typescript
// ✅ Good - hierarchical and descriptive
'user:123'
'user:123:profile'
'product:456'
'products:category:electronics'
'stats:pageview:home'
'ratelimit:user:123'
'session:abc-def-123'
'cache:api:external:user:789'

// ❌ Bad - no structure
'u123'
'data'
'temp'
```

## [Helper for bulk Redis key invalidation by pattern]()

Utility to delete multiple Redis keys using wildcard patterns.

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private redisClient: any;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.redisClient = (this.cacheManager.store as any).getClient();
  }

  async deleteByPattern(pattern: string): Promise<void> {
    // Find all keys matching the pattern
    const keys = await this.redisClient.keys(pattern);

    if (keys.length > 0) {
      // Delete all
      await this.redisClient.del(...keys);
    }
  }

  // Usage examples:
  // await cacheService.deleteByPattern('product:*')      // All products
  // await cacheService.deleteByPattern('user:123:*')     // Everything from user 123
  // await cacheService.deleteByPattern('cache:api:*')    // All API cache
}
```

## [Configure local Redis with Docker Compose]()

`docker-compose.yml`

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: sdd-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis-data:
```

Start Redis:

```bash
docker-compose up -d redis
```

## [Best Practices when using Redis in NestJS]()

Essential recommendations for efficient and safe Redis usage in production.

### [1. Always define TTL to avoid data accumulation in Redis]()
```typescript
// ✅ Good - avoids infinite memory
await this.cacheManager.set('key', value, 300);

// ❌ Bad - may accumulate old data
await this.cacheManager.set('key', value);
```

### [2. Invalidate Redis cache when updating or deleting data]()
```typescript
async update(id: string, dto: UpdateDto) {
  const updated = await this.repository.save({ id, ...dto });

  // Invalidate related caches
  await this.cacheManager.del(`item:${id}`);
  await this.cacheManager.del('items:all');

  return updated;
}
```

### [3. Use consistent prefixes in Redis keys]()
```typescript
// ✅ Good - easy to identify and invalidate
const cacheKey = `user:${userId}:orders`;

// ❌ Bad - difficult to manage
const cacheKey = `${userId}_orders`;
```

### [4. Handle Redis connection errors without breaking application]()
```typescript
async getCachedData(key: string): Promise<any> {
  try {
    return await this.cacheManager.get(key);
  } catch (error) {
    // Log but don't break application
    console.error('Redis error:', error);
    return null; // Fallback to fetch from database
  }
}
```

### [5. Use common @Global module to reuse Redis throughout application]()
- **Create once** - RedisModule in `src/common/redis/`
- **Global** - `@Global()` decorator to make available in all modules
- **Reuse** - Just inject `CACHE_MANAGER` where needed

### [6. Don't cache sensitive data in Redis]()
```typescript
// ❌ Avoid - sensitive data
await this.cacheManager.set('user:password', hashedPassword);

// ✅ Cache only safe data
await this.cacheManager.set('user:profile', { name, email });
```

## [Redis Implementation Checklist in NestJS]()

- [ ] Redis installed (Docker or local)
- [ ] Packages installed (`@nestjs/cache-manager`, `cache-manager-redis-store`, `redis`)
- [ ] `RedisModule` created in `src/common/redis/`
- [ ] `@Global()` decorator applied
- [ ] Environment variables configured (`.env`)
- [ ] Module imported in `AppModule`
- [ ] TTL defined for all cache operations
- [ ] Consistent naming pattern
- [ ] Invalidation when updating/deleting data
- [ ] Error handling for Redis failures

## [Troubleshooting - Common Redis problems]()

Diagnosis and solutions for common problems when configuring and using Redis in NestJS.

### [Resolve Redis connection refused error]()

```bash
# Check if Redis is running
docker ps | grep redis

# View logs
docker logs sdd-redis

# Restart
docker-compose restart redis
```

### [Debug when Redis cache is not working]()

```typescript
// Debug - check if it's saving
const saved = await this.cacheManager.set('test', 'value', 60);
console.log('Saved:', saved);

const retrieved = await this.cacheManager.get('test');
console.log('Retrieved:', retrieved);
```

### [Investigate and resolve high Redis memory problem]()

```bash
# Connect to Redis CLI
docker exec -it sdd-redis redis-cli

# View memory information
INFO memory

# View all keys (careful in production)
KEYS *

# Clear everything (CAREFUL!)
FLUSHALL
```

## [References and official documentation about Redis and NestJS]()

- [NestJS Cache](https://docs.nestjs.com/techniques/caching)
- [Redis Commands](https://redis.io/commands)
- [cache-manager](https://github.com/node-cache-manager/node-cache-manager)
