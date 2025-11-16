# How does API Key authentication work?

> Comprehensive guide on implementing API Key authentication for service-to-service integrations, webhooks, and automated scripts as an alternative to JWT authentication.

## [What is API Key?]()

API Key is an alternative authentication mechanism to JWT, designed for service-to-service integrations, automated scripts, webhooks, and internal services that don't use user login. Unlike JWT which carries user identity and expires automatically, API Key is a long-lived secret token shared between services, validated by comparing header value against stored secret, commonly used for backend-to-backend communication and system integrations.

### When to use?
Use API Key authentication for backend-to-backend integrations, cron jobs, webhooks, and automated scripts where there is no end-user login flow. Use JWT authentication for user-facing applications including frontend, mobile apps, and any scenario requiring user identity, session management, and automatic token expiration for security.

## [Implementation]()

This section presents the complete API Key authentication implementation process including environment variable configuration with secure key generation using openssl, custom guard creation with Reflector integration for metadata-based route protection, decorator creation for marking routes that require API Key, and global guard registration in main.ts. The implementation follows NestJS best practices for security and supports coexistence with JWT authentication.

### [1. Configure Environment Variable]()

**.env**:
```env
X_API_KEY=your-long-random-secret-key-here
```

Generate a secure key:
```bash
openssl rand -hex 32
```

### [2. Create API Key Guard]()

**`auth/guards/api-key-auth.guard.ts`**:

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

export const API_KEY_AUTH = 'api-key-auth';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route requires API Key
    const requiresApiKey = this.reflector.get<boolean>(
      API_KEY_AUTH,
      context.getHandler(),
    );

    if (!requiresApiKey) {
      return true; // Route doesn't require API Key
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('X_API_KEY');

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
```

### [3. Create Decorator]()

**`auth/decorators/api-key-auth.decorator.ts`**:

```typescript
import { SetMetadata } from '@nestjs/common';

export const API_KEY_AUTH = 'api-key-auth';
export const ApiKeyAuth = () => SetMetadata(API_KEY_AUTH, true);
```

### [4. Register Guard Globally]()

**`main.ts`**:

```typescript
import { ApiKeyAuthGuard } from './auth/guards/api-key-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);

  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new ApiKeyAuthGuard(configService, reflector),
  );

  await app.listen(3000);
}
```

## [How to Use]()

Practical examples of how to apply API Key authentication to NestJS backend endpoints including webhook endpoints that require only API Key by combining @Public and @ApiKeyAuth decorators, and flexible endpoints that accept both JWT and API Key authentication by checking req.user presence. These patterns enable secure service-to-service communication while maintaining backward compatibility with existing JWT-authenticated clients.

### [Endpoint that Accepts API Key]()

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ApiKeyAuth } from '@/auth/decorators/api-key-auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('webhooks')
export class WebhookController {

  @Public() // Doesn't require JWT
  @ApiKeyAuth() // Requires API Key
  @Post('process')
  async processWebhook(@Body() data: any) {
    // Process webhook
    return { success: true };
  }
}
```

### [Endpoint that Accepts JWT OR API Key]()

```typescript
@Controller('data')
export class DataController {

  @Get('sync')
  async syncData(@Request() req) {
    // This endpoint accepts both JWT and API Key
    // If JWT, req.user will be available
    // If API Key, req.user will be undefined

    if (req.user) {
      // Authenticated with JWT
      return this.service.syncForUser(req.user.userId);
    } else {
      // Authenticated with API Key (no specific user)
      return this.service.syncAll();
    }
  }
}
```

## [How to Call the Endpoint]()

Examples of HTTP requests using API Key authentication in different tools and programming languages including cURL for command-line testing, Axios for Node.js server-to-server integrations with environment variable support, and native fetch API for modern JavaScript applications. All examples demonstrate proper X-API-KEY header configuration and JSON content-type for API communication.

### [With cURL]()

```bash
curl -X POST http://localhost:3000/api/webhooks/process \
  -H "X-API-KEY: your-key-here" \
  -H "Content-Type: application/json" \
  -d '{"event": "test"}'
```

### [With Axios (Node.js)]()

```typescript
import axios from 'axios';

const response = await axios.post(
  'http://localhost:3000/api/webhooks/process',
  { event: 'test' },
  {
    headers: {
      'X-API-KEY': process.env.API_KEY,
      'Content-Type': 'application/json',
    },
  }
);
```

### [With fetch]()

```typescript
const response = await fetch('http://localhost:3000/api/webhooks/process', {
  method: 'POST',
  headers: {
    'X-API-KEY': 'your-key-here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ event: 'test' }),
});
```

## [Advanced Implementation]()

Advanced scenarios including multiple API Keys per client using database storage with ApiKey entity for granular access control and usage tracking, rate limiting using NestJS Throttler module to prevent API abuse, and last-used-at timestamps for monitoring and security auditing. These patterns enable enterprise-grade API Key management with per-client key generation, revocation capabilities, and user association for multi-tenant applications.

### [API Key per Client]()

If you need multiple API Keys (one per client):

**1. Create API Keys Table**:

```typescript
@Entity('api_keys')
export class ApiKey extends SuperEntity {
  @Column({ type: 'varchar', length: 64, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_used_at' })
  lastUsedAt: Date;
}
```

**2. Validate in Guard**:

```typescript
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API Key missing');
    }

    const keyRecord = await this.apiKeyRepository.findOne({
      where: { key: apiKey, active: true },
      relations: ['user'],
    });

    if (!keyRecord) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Update last usage
    await this.apiKeyRepository.update(keyRecord.id, {
      lastUsedAt: new Date(),
    });

    // Inject user into request
    request.user = {
      userId: keyRecord.userId,
      apiKeyId: keyRecord.id,
    };

    return true;
  }
}
```

### [Rate Limiting]()

Limit requests per API Key:

```bash
npm install @nestjs/throttler
```

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Public()
@ApiKeyAuth()
@Post('webhook')
async webhook() {
  // Maximum requests configured in module
}
```

## [Document in Swagger]()

Swagger configuration to display and test API Key protected endpoints in interactive documentation using DocumentBuilder addApiKey method in main.ts for global configuration, and @ApiSecurity decorator on controller methods to indicate API Key requirement. This enables developers to test API Key authentication directly in Swagger UI by entering the key in the authorization dialog, improving developer experience and API discoverability.

```typescript
import { ApiHeader, ApiSecurity } from '@nestjs/swagger';

// Configure in main.ts
const config = new DocumentBuilder()
  .addApiKey(
    { type: 'apiKey', name: 'X-API-KEY', in: 'header' },
    'api-key',
  )
  .build();

// Use in controller
@ApiSecurity('api-key')
@ApiKeyAuth()
@Post('webhook')
async webhook() {}
```

## [Security]()

Recommended practices for secure generation, storage and management of API Keys in production including using cryptographically secure random keys of minimum 32 characters, never committing keys to version control, storing keys only in environment variables, rotating keys periodically especially after suspected compromise, using HTTPS to prevent interception, logging API Key usage for auditing, implementing revocation mechanisms for compromised keys, and applying rate limiting to prevent abuse.

### [Best Practices]()

1. **Use long random keys**: Minimum 32 characters
2. **Never commit keys to git**: Use .env
3. **Rotate keys periodically**: Especially if leaked
4. **Use HTTPS in production**: Prevents interception
5. **Usage logging**: Record who used and when
6. **Revocation**: Allow disabling compromised keys
7. **Rate limiting**: Prevent abuse

### [Generate Secure Keys]()

```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## [Differences: JWT vs API Key]()

Detailed comparison between JWT and API Key authentication methods covering usage scenarios, expiration policies, rotation mechanisms, payload capabilities, revocation complexity, and performance characteristics. JWT is designed for end-user authentication with automatic expiration and user data payload but difficult revocation, while API Key is optimized for service integrations with no expiration, easy revocation through database updates, and faster validation but requiring database lookup for each request.

| Aspect | JWT | API Key |
|---------|-----|---------|
| **Usage** | End users | Integrations |
| **Expiration** | Yes (e.g., 24h) | No |
| **Rotation** | Automatic (relogin) | Manual |
| **Payload** | User data | Just key |
| **Revocation** | Difficult | Easy |
| **Performance** | Validates signature | DB lookup |

## [Troubleshooting]()

Solutions for common problems when implementing and using API Key authentication including API Key missing error caused by missing X-API-KEY header in request, Invalid API Key error due to incorrect key value or misconfigured environment variable, and conflicts with JWT authentication resolved by proper guard ordering in main.ts. Each problem includes root cause analysis and specific solutions for quick resolution.

### [Error: "API Key missing"]()

**Cause**: Header `X-API-KEY` not sent

**Solution**: Add header to request

### [Error: "Invalid API Key"]()

**Cause**: Incorrect key or not configured

**Solution**: Check `.env` and sent value

### [Conflict with JWT]()

If endpoint accepts both, configure guard order:

```typescript
// Try JWT first, then API Key
app.useGlobalGuards(
  new JwtAuthGuard(reflector),
  new ApiKeyAuthGuard(configService, reflector),
);
```

## [References]()

- [API Key Best Practices](https://cloud.google.com/endpoints/docs/openapi/when-why-api-key)
- [NestJS Guards](https://docs.nestjs.com/guards)
