# [Como integrar com API externa no Backend?]()

> Guia completo sobre como consumir APIs externas no backend NestJS usando Axios.

## [Configuração do Cliente HTTP para integração com APIs externas]()

Esta seção apresenta a configuração de um cliente HTTP reutilizável usando Axios, incluindo interceptors para logging, tratamento de erros e retry automático.

Configuração do HttpService do NestJS com Axios para fazer requisições HTTP:

### [1. Instalar Axios]()

```bash
npm install axios
```

### [2. Criar módulo HTTP customizado]()

**Arquivo**: `src/common/http/http.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { HttpService } from './http.service';

@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
```

### [3. Criar serviço HTTP base]()

**Arquivo**: `src/common/http/http.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 segundos
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

  // Método para criar instância customizada
  createInstance(config: AxiosRequestConfig): AxiosInstance {
    return axios.create(config);
  }
}
```

## [Estrutura de Service para Integração com API externa no NestJS]()

Esta seção define a arquitetura de services especializados em consumir APIs externas, seguindo padrão modular e reutilizável.

Padrão recomendado para criar services que consomem APIs externas:

### [Padrão de Service Externo]()

Crie services específicos para cada API externa na pasta `services/` do módulo.

**Estrutura**:
```
src/modules/providers/
├── providers.module.ts
├── providers.service.ts           # Orquestrador
├── providers.controller.ts
└── services/
    ├── kinvo-provider.service.ts  # Integração Kinvo
    ├── yahoo-provider.service.ts  # Integração Yahoo Finance
    └── b3-provider.service.ts     # Integração B3
```

### [Exemplo: Service de Integração]()

**Arquivo**: `src/modules/providers/services/yahoo-provider.service.ts`

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

## [Autenticação com APIs Externas usando diferentes métodos]()

Implementação de API Key, Bearer Token, Basic Auth e OAuth 2.0:

### [1. API Key no Header]()

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

**Arquivo**: `src/modules/integrations/services/oauth-provider.service.ts`

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
    // Verifica se token está expirado
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

## [Timeout e Retry automático para requisições HTTP]()

Configuração de timeout e retentativas automáticas com backoff exponencial:

### [1. Configurar Timeout]()

```typescript
await this.httpService.get(url, {
  timeout: 5000, // 5 segundos
});
```

### [2. Implementar Retry com Axios Retry]()

```bash
npm install axios-retry
```

**Arquivo**: `src/common/http/http.service.ts` (atualizado)

```typescript
import axiosRetry from 'axios-retry';

constructor() {
  this.axiosInstance = axios.create({
    timeout: 10000,
  });

  // Configurar retry
  axiosRetry(this.axiosInstance, {
    retries: 3, // Número de tentativas
    retryDelay: axiosRetry.exponentialDelay, // Delay exponencial
    retryCondition: (error) => {
      // Retry em erros de rede ou 5xx
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

### [3. Retry Manual com Decorador]()

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

// Uso
@Injectable()
export class ExternalApiService {
  @Retry(3, 1000)
  async fetchData(): Promise<any> {
    return await this.httpService.get('https://api.example.com/data');
  }
}
```

## [Circuit Breaker Pattern para proteger contra APIs instáveis]()

Implementação de circuit breaker para evitar sobrecarga quando API externa falha:

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

  private readonly threshold = 5; // Falhas antes de abrir
  private readonly timeout = 60000; // 1 minuto
  private readonly halfOpenRequests = 3; // Requests em half-open

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

// Uso
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

## [Cache de Respostas de APIs externas com Redis]()

Cachear respostas HTTP para reduzir latência e custos de chamadas externas:

### [1. Cache simples em memória]()

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

    // Verifica se expirou
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

// Uso
@Injectable()
export class YahooProviderService {
  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
  ) {}

  async getQuote(symbol: string): Promise<any> {
    const cacheKey = `quote:${symbol}`;

    // Tenta buscar do cache
    const cached = this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Busca da API
    const data = await this.httpService.get(`/quote?symbol=${symbol}`);

    // Salva no cache por 5 minutos
    this.cacheService.set(cacheKey, data, 300);

    return data;
  }
}
```

### [2. Cache com Redis (Recomendado para produção)]()

> **📖 Documentação completa**: Veja [como-usar-redis-backend.md](./como-usar-redis-backend.md) para configuração global, casos de uso avançados e boas práticas.

**Resumo rápido para cache de API externa:**

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

    // Busca do cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Busca da API
    const data = await this.httpService.get(`/quote?symbol=${symbol}`);

    // Salva no cache (TTL: 5 minutos)
    await this.cacheManager.set(cacheKey, data, 300);

    return data;
  }
}
```

**Nota:** O `CACHE_MANAGER` deve estar disponível globalmente através do `RedisModule` configurado em `src/common/redis/`. Consulte o guia de Redis para setup inicial.

## [Tratamento de Rate Limiting de APIs externas]()

Detectar e lidar com erro 429 (Too Many Requests) de APIs externas:

### [1. Detectar e tratar 429]()

```typescript
@Injectable()
export class ExternalApiService {
  private rateLimitResetAt: Date | null = null;

  async makeRequest<T>(url: string): Promise<T> {
    // Verifica se está em rate limit
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
        // Lê header de retry
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

### [2. Rate Limiting local (Throttle)]()

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

// Uso
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

## [Webhooks - Receber eventos de APIs externas]()

Implementar endpoints para receber callbacks de APIs externas:

### [Receber Webhooks de APIs Externas]()

**Arquivo**: `src/modules/webhooks/webhooks.controller.ts`

```typescript
import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiKeyAuth } from '@/common/decorators/api-key-auth.decorator';
import { WebhooksService } from './webhooks.service';
import * as crypto from 'crypto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  @ApiKeyAuth() // Proteger com API Key
  async stripeWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
  ) {
    // Validar assinatura
    const isValid = this.validateStripeSignature(payload, signature);

    if (!isValid) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    // Processar webhook
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

## [Mocks para Testes]()

Estratégias para criar mocks do HttpService e simular respostas de APIs externas em testes unitários.

### [1. Mock do HttpService]()

**Arquivo**: `src/modules/providers/services/__tests__/yahoo-provider.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@/common/http/http.service';
import { YahooProviderService } from '../yahoo-provider.service';
import { HttpException } from '@nestjs/common';

describe('YahooProviderService', () => {
  let service: YahooProviderService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        YAHOO_FINANCE_API_URL: 'https://api.yahoo.com',
        YAHOO_FINANCE_API_KEY: 'test-api-key',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YahooProviderService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<YahooProviderService>(YahooProviderService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuote', () => {
    it('deve retornar cotação com sucesso', async () => {
      const mockResponse = {
        quoteResponse: {
          result: [
            {
              symbol: 'AAPL',
              regularMarketPrice: 150.0,
              regularMarketChange: 2.5,
              regularMarketChangePercent: 1.69,
              regularMarketTime: 1234567890,
            },
          ],
        },
      };

      mockHttpService.get.mockResolvedValue(mockResponse);

      const result = await service.getQuote('AAPL');

      expect(result).toEqual(mockResponse.quoteResponse.result[0]);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.yahoo.com/quote',
        {
          params: { symbols: 'AAPL' },
          headers: { 'X-API-Key': 'test-api-key' },
        },
      );
    });

    it('deve lançar exceção quando símbolo não for encontrado', async () => {
      mockHttpService.get.mockResolvedValue({
        quoteResponse: { result: [] },
      });

      await expect(service.getQuote('INVALID')).rejects.toThrow(
        HttpException,
      );
    });

    it('deve tratar erro de timeout', async () => {
      const error = new Error('timeout');
      error['code'] = 'ECONNABORTED';

      mockHttpService.get.mockRejectedValue(error);

      await expect(service.getQuote('AAPL')).rejects.toThrow(
        'Request timeout',
      );
    });

    it('deve tratar erro 429 (rate limit)', async () => {
      const error = {
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded' },
        },
      };

      mockHttpService.get.mockRejectedValue(error);

      await expect(service.getQuote('AAPL')).rejects.toThrow(
        'Rate limit exceeded',
      );
    });
  });
});
```

### [2. Usar nock para mock HTTP]()

```bash
npm install --save-dev nock
```

```typescript
import * as nock from 'nock';

describe('YahooProviderService with nock', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('deve fazer requisição real mockada', async () => {
    nock('https://api.yahoo.com')
      .get('/quote')
      .query({ symbols: 'AAPL' })
      .reply(200, {
        quoteResponse: {
          result: [
            {
              symbol: 'AAPL',
              regularMarketPrice: 150.0,
            },
          ],
        },
      });

    const result = await service.getQuote('AAPL');

    expect(result.symbol).toBe('AAPL');
    expect(result.regularMarketPrice).toBe(150.0);
  });
});
```

## [Variáveis de Ambiente para configuração de APIs externas]()

Organização de URLs, tokens e configurações de APIs em .env:

**Arquivo**: `.env`

```env
# API Externa - Yahoo Finance
YAHOO_FINANCE_API_URL=https://api.yahoo.com/v1
YAHOO_FINANCE_API_KEY=sua-api-key-aqui

# API Externa - Kinvo
KINVO_API_URL=https://api.kinvo.com.br
KINVO_API_KEY=sua-api-key-aqui

# API Externa - B3
B3_API_URL=https://api.b3.com.br
B3_USERNAME=seu-usuario
B3_PASSWORD=sua-senha

# OAuth Provider
OAUTH_TOKEN_URL=https://oauth.provider.com/token
OAUTH_CLIENT_ID=seu-client-id
OAUTH_CLIENT_SECRET=seu-client-secret

# Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Validação no ConfigService**:

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

## [Exemplo Completo de Módulo de Providers para APIs externas]()

Implementação real integrando Yahoo Finance, Kinvo e B3:

### [1. Module]()

**Arquivo**: `src/modules/providers/providers.module.ts`

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

**Arquivo**: `src/modules/providers/providers.controller.ts`

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
  @ApiOperation({ summary: 'Buscar cotação de um símbolo' })
  async getQuote(@Param('symbol') symbol: string) {
    return await this.providersService.getQuote(symbol);
  }

  @Get('history/:symbol')
  @ApiOperation({ summary: 'Buscar histórico de cotações' })
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

### [3. Service Orquestrador]()

**Arquivo**: `src/modules/providers/providers.service.ts`

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

    // Tenta buscar de múltiplas fontes (fallback)
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

## [Boas Práticas ao integrar com APIs externas no NestJS]()

Recomendações essenciais para integrações robustas e confiáveis:

### [1. Sempre usar timeout]()
```typescript
timeout: 10000 // 10 segundos
```

### [2. Implementar retry para falhas temporárias]()
- Usar biblioteca axios-retry
- Retry apenas em erros 5xx e erros de rede

### [3. Logging detalhado]()
- Log de todas requisições (debug)
- Log de erros (error)
- Log de retry (warn)

### [4. Tratamento de erros específico]()
- 401: API Key inválida
- 429: Rate limit
- 5xx: Erro do servidor externo
- Timeout: ECONNABORTED

### [5. Cache inteligente]()
- Cachear respostas que mudam pouco
- Usar TTL apropriado
- **Use Redis para produção** - veja [como-usar-redis-backend.md](./como-usar-redis-backend.md)

### [6. Circuit Breaker]()
- Proteger aplicação de APIs instáveis
- Evitar cascata de falhas

### [7. Rate Limiting local]()
- Respeitar limites da API externa
- Implementar throttle quando necessário

### [8. Segurança]()
- **NUNCA** commitar API keys no código
- Usar variáveis de ambiente
- Validar assinaturas de webhooks

### [9. Monitoramento]()
- Métricas de latência
- Taxa de sucesso/erro
- Estado do circuit breaker

### [10. Testes]()
- Mock de todas chamadas HTTP
- Testar cenários de erro
- Testar timeout e retry

## [Checklist de Integração com API externa]()

Lista de verificação para implementação completa de integração:

- [ ] HttpService base criado
- [ ] Service específico para cada API externa
- [ ] Timeout configurado
- [ ] Retry implementado
- [ ] Tratamento de erros específico
- [ ] Cache implementado (se aplicável)
- [ ] Circuit breaker (se aplicável)
- [ ] Rate limiting respeitado
- [ ] Variáveis de ambiente configuradas
- [ ] API keys protegidas
- [ ] Logging implementado
- [ ] Testes unitários criados
- [ ] Documentação Swagger (se expor endpoints)

## [Referências e documentação oficial sobre integrações HTTP]()

Links para documentação do Axios, NestJS HttpModule e boas práticas:

- [Axios Documentation](https://axios-http.com/docs/intro)
- [NestJS HTTP Module](https://docs.nestjs.com/techniques/http-module)
- [axios-retry](https://github.com/softonic/axios-retry)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)
