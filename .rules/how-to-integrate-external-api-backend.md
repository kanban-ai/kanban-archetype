# How to integrate with external APIs in the Backend?

> Complete guide on consuming external APIs in NestJS backend using Axios including HTTP client configuration, authentication, retry logic, caching, and error handling.

## [HTTP Client Configuration for external API integration]()

This section presents configuration of a reusable HTTP client using Axios including base service with 10-second timeout, request and response interceptors for logging, detailed error handling with AxiosError differentiation, and convenience methods for GET, POST, PUT, PATCH, DELETE operations. The HttpService wraps Axios instance providing centralized configuration, consistent logging, and reusable HTTP methods across all external API integrations in the application.

HttpService configuration in NestJS with Axios to make HTTP requests:

### [1. Install Axios]()

```bash
npm install axios
```

### [2. Create custom HTTP module]()

**File**: `src/common/http/http.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { HttpService } from './http.service';

@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
```

### [3. Create base HTTP service]()

**File**: `src/common/http/http.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`[${config.method?.toUpperCase()}] ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `[${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`,
        );
        return response;
      },
      (error: AxiosError) => {
        this.logError(error);
        return Promise.reject(error);
      },
    );
  }

  private logError(error: AxiosError) {
    if (error.response) {
      this.logger.error(
        `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`,
      );
      this.logger.error('Response data:', error.response.data);
    } else if (error.request) {
      this.logger.error('No response received:', error.message);
    } else {
      this.logger.error('Request setup error:', error.message);
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // Method to create custom instance
  createInstance(config: AxiosRequestConfig): AxiosInstance {
    return axios.create(config);
  }
}
```

## [Service Structure for external API Integration in NestJS]()

This section defines the architecture of specialized services to consume external APIs following modular pattern where each external API has its own dedicated service file in the module's services folder. Recommended structure separates orchestrator service from provider-specific services like kinvo-provider.service.ts, yahoo-provider.service.ts, enabling clean separation of concerns, independent testing, and easy addition of new API integrations without modifying existing code.

Recommended pattern to create services that consume external APIs:

### [External Service Pattern]()

Create specific services for each external API in the module's `services/` folder.

**Structure**:
```
src/modules/providers/
├── providers.module.ts
├── providers.service.ts           # Orchestrator
├── providers.controller.ts
└── services/
    ├── kinvo-provider.service.ts  # Kinvo Integration
    ├── yahoo-provider.service.ts  # Yahoo Finance Integration
    └── b3-provider.service.ts     # B3 Integration
```

### [Example: Integration Service]()

**File**: `src/modules/providers/services/yahoo-provider.service.ts`

```typescript
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@/common/http/http.service';
import { AxiosError } from 'axios';

interface YahooFinanceQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
}

@Injectable()
export class YahooProviderService {
  private readonly logger = new Logger(YahooProviderService.name);
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>('YAHOO_FINANCE_API_URL');
    this.apiKey = this.configService.get<string>('YAHOO_FINANCE_API_KEY');
  }

  async getQuote(symbol: string): Promise<YahooFinanceQuote> {
    try {
      const url = `${this.baseURL}/quote`;

      const data = await this.httpService.get<{ quoteResponse: { result: YahooFinanceQuote[] } }>(
        url,
        {
          params: {
            symbols: symbol,
          },
          headers: {
            'X-API-Key': this.apiKey,
          },
        },
      );

      if (!data.quoteResponse.result.length) {
        throw new HttpException(
          `Symbol ${symbol} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return data.quoteResponse.result[0];
    } catch (error) {
      this.handleError(error, 'getQuote');
    }
  }

  async getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    try {
      const url = `${this.baseURL}/history`;

      return await this.httpService.get(url, {
        params: {
          symbol,
          period1: Math.floor(startDate.getTime() / 1000),
          period2: Math.floor(endDate.getTime() / 1000),
          interval: '1d',
        },
        headers: {
          'X-API-Key': this.apiKey,
        },
      });
    } catch (error) {
      this.handleError(error, 'getHistoricalData');
    }
  }

  private handleError(error: any, method: string): never {
    this.logger.error(`Error in ${method}:`, error.message);

    if (error instanceof AxiosError) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        if (status === 401) {
          throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
        }

        if (status === 429) {
          throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        }

        throw new HttpException(
          `Yahoo Finance API error: ${message}`,
          status,
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new HttpException('Request timeout', HttpStatus.REQUEST_TIMEOUT);
      }

      throw new HttpException(
        'Failed to connect to Yahoo Finance',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
```

## [Authentication with External APIs using different methods]()

Implementation of different authentication methods for external APIs including API Key in custom header, Bearer Token in Authorization header, Basic Authentication using username and password, and complete OAuth 2.0 flow with automatic token refresh and expiration handling. Each authentication method demonstrates proper header configuration, credential management using ConfigService, and secure token storage for subsequent authenticated requests to external services.

### [1. API Key in Header]()

```typescript
await this.httpService.get(url, {
  headers: {
    'X-API-Key': this.apiKey,
  },
});
```

### [2. Bearer Token]()

```typescript
await this.httpService.get(url, {
  headers: {
    Authorization: `Bearer ${this.accessToken}`,
  },
});
```

### [3. Basic Authentication]()

```typescript
await this.httpService.get(url, {
  auth: {
    username: this.username,
    password: this.password,
  },
});
```

### [4. OAuth 2.0 Flow]()

**File**: `src/modules/integrations/services/oauth-provider.service.ts`

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@/common/http/http.service';

interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class OAuthProviderService {
  private accessToken: string;
  private refreshToken: string;
  private tokenExpiresAt: Date;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(): Promise<void> {
    const tokenUrl = this.configService.get<string>('OAUTH_TOKEN_URL');
    const clientId = this.configService.get<string>('OAUTH_CLIENT_ID');
    const clientSecret = this.configService.get<string>('OAUTH_CLIENT_SECRET');

    try {
      const response = await this.httpService.post<OAuthTokenResponse>(
        tokenUrl,
        {
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.access_token;
      this.refreshToken = response.refresh_token;
      this.tokenExpiresAt = new Date(Date.now() + response.expires_in * 1000);
    } catch (error) {
      throw new HttpException(
        'Failed to authenticate with OAuth provider',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getAccessToken(): Promise<string> {
    // Check if token is expired
    if (!this.accessToken || new Date() >= this.tokenExpiresAt) {
      await this.authenticate();
    }

    return this.accessToken;
  }

  async makeAuthenticatedRequest<T>(url: string): Promise<T> {
    const token = await this.getAccessToken();

    return await this.httpService.get<T>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
```

## [Timeout and automatic Retry for HTTP requests]()

Timeout configuration and automatic retries with exponential backoff using axios-retry library for network resilience. Implementation includes configurable timeout per request, automatic retry on network errors and 5xx server errors, exponential delay between retries to avoid overwhelming failing servers, retry logging for monitoring, and custom retry decorator for manual retry logic. These patterns prevent cascading failures and improve reliability when consuming unstable external APIs.

### [1. Configure Timeout]()

```typescript
await this.httpService.get(url, {
  timeout: 5000, // 5 seconds
});
```

### [2. Implement Retry with Axios Retry]()

```bash
npm install axios-retry
```

**File**: `src/common/http/http.service.ts` (updated)

```typescript
import axiosRetry from 'axios-retry';

constructor() {
  this.axiosInstance = axios.create({
    timeout: 10000,
  });

  // Configure retry
  axiosRetry(this.axiosInstance, {
    retries: 3, // Number of attempts
    retryDelay: axiosRetry.exponentialDelay, // Exponential delay
    retryCondition: (error) => {
      // Retry on network errors or 5xx
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response?.status >= 500 && error.response?.status < 600)
      );
    },
    onRetry: (retryCount, error, requestConfig) => {
      this.logger.warn(
        `Retry attempt ${retryCount} for ${requestConfig.url}`,
      );
    },
  });

  this.setupInterceptors();
}
```

### [3. Manual Retry with Decorator]()

```typescript
function Retry(maxRetries: number = 3, delayMs: number = 1000) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: any;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;

          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, delayMs * attempt),
            );
          }
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}

// Usage
@Injectable()
export class ExternalApiService {
  @Retry(3, 1000)
  async fetchData(): Promise<any> {
    return await this.httpService.get('https://api.example.com/data');
  }
}
```

## [Circuit Breaker Pattern to protect against unstable APIs]()

Circuit breaker implementation to avoid overload when external API fails by tracking failure count and transitioning between CLOSED, OPEN, and HALF_OPEN states. When failure threshold is exceeded, circuit opens preventing requests for timeout period. After timeout, circuit enters half-open state allowing limited test requests. If test requests succeed, circuit closes resuming normal operation. This pattern protects application from cascading failures and resource exhaustion when external dependencies are unhealthy.

```typescript
import { Injectable, Logger } from '@nestjs/common';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt: Date = new Date();

  private readonly threshold = 5; // Failures before opening
  private readonly timeout = 60000; // 1 minute
  private readonly halfOpenRequests = 3; // Requests in half-open

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (new Date() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }

      this.state = CircuitState.HALF_OPEN;
      this.logger.warn('Circuit breaker is now HALF_OPEN');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.halfOpenRequests) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        this.logger.log('Circuit breaker is now CLOSED');
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = new Date(Date.now() + this.timeout);
      this.logger.error(
        `Circuit breaker is now OPEN until ${this.nextAttempt.toISOString()}`,
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Usage
@Injectable()
export class ExternalApiService {
  constructor(
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<any> {
    return await this.circuitBreaker.execute(() =>
      this.httpService.get('https://api.example.com/data'),
    );
  }
}
```

## [Cache External API Responses with Redis]()

Cache HTTP responses to reduce latency, external call costs, and improve application performance using in-memory cache for simple scenarios or Redis for production environments with distributed cache requirements. Implementation includes cache-aside pattern checking cache before making external requests, configurable TTL for different data types, and automatic cache population on miss. See how-to-use-redis-backend.md for comprehensive Redis configuration and advanced caching strategies.

### [1. Simple in-memory cache]()

```typescript
import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;

    this.cache.set(key, { data, expiresAt });
    this.logger.debug(`Cached data for key: ${key}`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired for key: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit for key: ${key}`);
    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }
}

// Usage
@Injectable()
export class YahooProviderService {
  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
  ) {}

  async getQuote(symbol: string): Promise<any> {
    const cacheKey = `quote:${symbol}`;

    // Try to fetch from cache
    const cached = this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await this.httpService.get(`/quote?symbol=${symbol}`);

    // Save to cache for 5 minutes
    this.cacheService.set(cacheKey, data, 300);

    return data;
  }
}
```

### [2. Cache with Redis (Recommended for production)]()

> **📖 Complete documentation**: See [how-to-use-redis-backend.md](./how-to-use-redis-backend.md) for global configuration, advanced use cases and best practices.

**Quick summary for external API cache:**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class YahooProviderService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async getQuote(symbol: string): Promise<any> {
    const cacheKey = `cache:api:yahoo:quote:${symbol}`;

    // Fetch from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await this.httpService.get(`/quote?symbol=${symbol}`);

    // Save to cache (TTL: 5 minutes)
    await this.cacheManager.set(cacheKey, data, 300);

    return data;
  }
}
```

**Note:** `CACHE_MANAGER` must be globally available through `RedisModule` configured in `src/common/redis/`. See Redis guide for initial setup.

## [External API Rate Limiting handling]()

Detect and handle error 429 Too Many Requests from external APIs by parsing Retry-After header, tracking rate limit reset timestamp, throwing informative error to client with wait time, and implementing local throttling to respect API quotas. Throttle service limits concurrent requests and adds delay between requests preventing rate limit errors. These patterns ensure compliance with external API usage policies and prevent account suspension or service degradation.

### [1. Detect and handle 429]()

```typescript
@Injectable()
export class ExternalApiService {
  private rateLimitResetAt: Date | null = null;

  async makeRequest<T>(url: string): Promise<T> {
    // Check if in rate limit
    if (this.rateLimitResetAt && new Date() < this.rateLimitResetAt) {
      const waitSeconds = Math.ceil(
        (this.rateLimitResetAt.getTime() - Date.now()) / 1000,
      );
      throw new HttpException(
        `Rate limit active. Retry after ${waitSeconds} seconds`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      return await this.httpService.get<T>(url);
    } catch (error) {
      if (error.response?.status === 429) {
        // Read retry header
        const retryAfter = error.response.headers['retry-after'];

        if (retryAfter) {
          const retrySeconds = parseInt(retryAfter, 10);
          this.rateLimitResetAt = new Date(Date.now() + retrySeconds * 1000);
        }
      }

      throw error;
    }
  }
}
```

### [2. Local Rate Limiting (Throttle)]()

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottleService {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private readonly maxConcurrent = 5;
  private readonly delayMs = 1000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.running++;

    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
  }
}

// Usage
@Injectable()
export class ExternalApiService {
  constructor(
    private readonly throttle: ThrottleService,
    private readonly httpService: HttpService,
  ) {}

  async fetchMultipleSymbols(symbols: string[]): Promise<any[]> {
    const promises = symbols.map((symbol) =>
      this.throttle.execute(() =>
        this.httpService.get(`/quote?symbol=${symbol}`),
      ),
    );

    return await Promise.all(promises);
  }
}
```

## [Webhooks - Receive events from external APIs]()

Implement endpoints to receive callbacks from external APIs including webhook controller with signature validation using HMAC SHA256, API Key authentication to prevent unauthorized webhook delivery, and webhook processing service for handling events asynchronously. Signature validation ensures webhook authenticity by comparing request signature against expected signature computed from payload and secret, protecting against spoofed webhook requests and man-in-the-middle attacks.

### [Receive Webhooks from External APIs]()

**File**: `src/modules/webhooks/webhooks.controller.ts`

```typescript
import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiKeyAuth } from '@/common/decorators/api-key-auth.decorator';
import { WebhooksService } from './webhooks.service';
import * as crypto from 'crypto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  @ApiKeyAuth() // Protect with API Key
  async stripeWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
  ) {
    // Validate signature
    const isValid = this.validateStripeSignature(payload, signature);

    if (!isValid) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    // Process webhook
    await this.webhooksService.handleStripeEvent(payload);

    return { received: true };
  }

  private validateStripeSignature(payload: any, signature: string): boolean {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === expectedSignature;
  }
}
```


## [Environment Variables for external API configuration]()

Organization of URLs, tokens and API configurations in .env file including base URLs for each external API, API keys and credentials, OAuth client configuration, and webhook secrets. Use ConfigService registerAs for typed configuration validation and grouping related settings. Never commit credentials to version control, always use environment variables for sensitive data, and maintain separate .env files for development, staging, and production environments.

**File**: `.env`

```env
# External API - Yahoo Finance
YAHOO_FINANCE_API_URL=https://api.yahoo.com/v1
YAHOO_FINANCE_API_KEY=your-api-key-here

# External API - Kinvo
KINVO_API_URL=https://api.kinvo.com.br
KINVO_API_KEY=your-api-key-here

# External API - B3
B3_API_URL=https://api.b3.com.br
B3_USERNAME=your-username
B3_PASSWORD=your-password

# OAuth Provider
OAUTH_TOKEN_URL=https://oauth.provider.com/token
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret

# Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Validation in ConfigService**:

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('external-apis', () => ({
  yahoo: {
    apiUrl: process.env.YAHOO_FINANCE_API_URL,
    apiKey: process.env.YAHOO_FINANCE_API_KEY,
  },
  kinvo: {
    apiUrl: process.env.KINVO_API_URL,
    apiKey: process.env.KINVO_API_KEY,
  },
}));
```

## [Complete Example of Providers Module for external APIs]()

Real implementation integrating multiple external APIs including Yahoo Finance, Kinvo and B3 with dedicated provider services in services folder, orchestrator service implementing fallback pattern trying multiple providers sequentially, controller exposing unified endpoints for quote and history data, and module configuration importing HttpModule and registering all provider services. This architecture demonstrates production-ready external API integration with error resilience and service abstraction.

### [1. Module]()

**File**: `src/modules/providers/providers.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@/common/http/http.module';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { YahooProviderService } from './services/yahoo-provider.service';
import { KinvoProviderService } from './services/kinvo-provider.service';
import { B3ProviderService } from './services/b3-provider.service';
import { CacheService } from '@/common/cache/cache.service';
import { CircuitBreakerService } from '@/common/circuit-breaker/circuit-breaker.service';

@Module({
  imports: [HttpModule],
  controllers: [ProvidersController],
  providers: [
    ProvidersService,
    YahooProviderService,
    KinvoProviderService,
    B3ProviderService,
    CacheService,
    CircuitBreakerService,
  ],
  exports: [ProvidersService],
})
export class ProvidersModule {}
```

### [2. Controller]()

**File**: `src/modules/providers/providers.controller.ts`

```typescript
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';

@ApiTags('Providers')
@ApiBearerAuth()
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get('quote/:symbol')
  @ApiOperation({ summary: 'Fetch quote for a symbol' })
  async getQuote(@Param('symbol') symbol: string) {
    return await this.providersService.getQuote(symbol);
  }

  @Get('history/:symbol')
  @ApiOperation({ summary: 'Fetch quote history' })
  async getHistory(
    @Param('symbol') symbol: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.providersService.getHistory(
      symbol,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
```

### [3. Orchestrator Service]()

**File**: `src/modules/providers/providers.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { YahooProviderService } from './services/yahoo-provider.service';
import { KinvoProviderService } from './services/kinvo-provider.service';
import { B3ProviderService } from './services/b3-provider.service';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    private readonly yahooProvider: YahooProviderService,
    private readonly kinvoProvider: KinvoProviderService,
    private readonly b3Provider: B3ProviderService,
  ) {}

  async getQuote(symbol: string): Promise<any> {
    this.logger.log(`Fetching quote for ${symbol}`);

    // Try to fetch from multiple sources (fallback)
    try {
      return await this.yahooProvider.getQuote(symbol);
    } catch (error) {
      this.logger.warn(`Yahoo failed, trying B3...`);

      try {
        return await this.b3Provider.getQuote(symbol);
      } catch (error) {
        this.logger.error(`All providers failed for ${symbol}`);
        throw error;
      }
    }
  }

  async getHistory(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    return await this.yahooProvider.getHistoricalData(
      symbol,
      startDate,
      endDate,
    );
  }
}
```

## [Best Practices when integrating with external APIs in NestJS]()

Essential recommendations for robust and reliable integrations including always configuring timeout to prevent hanging requests, implementing retry for transient failures on 5xx and network errors, detailed logging at debug and error levels, specific error handling for different HTTP status codes, smart caching with Redis for production, circuit breaker for unstable APIs, local rate limiting to respect external quotas, secure API key management, comprehensive monitoring of latency and error rates, and thorough testing with mocked HTTP calls.

### [1. Always use timeout]()
```typescript
timeout: 10000 // 10 seconds
```

### [2. Implement retry for temporary failures]()
- Use axios-retry library
- Retry only on 5xx errors and network errors

### [3. Detailed logging]()
- Log all requests (debug)
- Log errors (error)
- Log retries (warn)

### [4. Specific error handling]()
- 401: Invalid API Key
- 429: Rate limit
- 5xx: External server error
- Timeout: ECONNABORTED

### [5. Smart caching]()
- Cache responses that change little
- Use appropriate TTL
- **Use Redis for production** - see [how-to-use-redis-backend.md](./how-to-use-redis-backend.md)

### [6. Circuit Breaker]()
- Protect application from unstable APIs
- Avoid failure cascade

### [7. Local Rate Limiting]()
- Respect external API limits
- Implement throttle when necessary

### [8. Security]()
- **NEVER** commit API keys in code
- Use environment variables
- Validate webhook signatures

### [9. Monitoring]()
- Latency metrics
- Success/error rate
- Circuit breaker state

### [10. Testing]()
- Mock all HTTP calls
- Test error scenarios
- Test timeout and retry

## [External API Integration Checklist]()

Verification checklist for complete integration implementation covering base HttpService creation with interceptors, specific service per external API with proper error handling, timeout configuration, retry implementation with exponential backoff, cache with Redis, circuit breaker for resilience, rate limiting compliance, environment variables for configuration, API key security, comprehensive logging, unit tests with mocked HTTP calls, and Swagger documentation for exposed endpoints.

- [ ] Base HttpService created
- [ ] Specific service for each external API
- [ ] Timeout configured
- [ ] Retry implemented
- [ ] Specific error handling
- [ ] Cache implemented (if applicable)
- [ ] Circuit breaker (if applicable)
- [ ] Rate limiting respected
- [ ] Environment variables configured
- [ ] API keys protected
- [ ] Logging implemented
- [ ] Unit tests created
- [ ] Swagger documentation (if exposing endpoints)

## [References and official documentation on HTTP integrations]()

Links to official documentation including Axios HTTP client library, NestJS HTTP Module techniques, axios-retry library for automatic retries, Martin Fowler's Circuit Breaker pattern explanation, and OWASP API Security best practices. These resources provide comprehensive information about HTTP client configuration, interceptor patterns, error handling strategies, resilience patterns, and security considerations for external API integrations.

- [Axios Documentation](https://axios-http.com/docs/intro)
- [NestJS HTTP Module](https://docs.nestjs.com/techniques/http-module)
- [axios-retry](https://github.com/softonic/axios-retry)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)
