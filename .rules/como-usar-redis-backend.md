# [Como usar Redis no Backend]()

> Guia completo para usar Redis como cache e memória compartilhada para escalabilidade horizontal

## [Quando usar Redis para cache e memória compartilhada]()

Esta seção identifica os casos de uso apropriados para Redis no projeto, focando em cache, contadores compartilhados e dados temporários entre instâncias.

- ✅ **Cache de dados** - Reduzir carga no banco de dados
- ✅ **Sessões compartilhadas** - Compartilhar sessões entre instâncias
- ✅ **Contadores compartilhados** - Incrementos atômicos distribuídos
- ✅ **Rate Limiting** - Controlar limite de requisições
- ✅ **Cache de API externa** - Evitar requisições repetidas
- ✅ **Dados temporários** - Memória compartilhada entre instâncias
- ❌ **Armazenamento permanente** - Use PostgreSQL para dados persistentes
- ❌ **Filas de tarefas** - Use RabbitMQ para background jobs (veja [como-usar-rabbitmq-backend.md](./como-usar-rabbitmq-backend.md))
- ❌ **Pub/Sub** - Não usar Redis para comunicação entre instâncias

## [Instalação de pacotes Redis no NestJS]()

Pacotes necessários para integrar Redis como cache usando cache-manager no NestJS.

```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis
```

## [Configuração Global do Redis usando Common Module reutilizável]()

Setup de um módulo Redis global configurado uma única vez e disponível em toda aplicação.

### [1. Criar RedisModule comum compartilhado no NestJS]()

`src/common/redis/redis.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

@Global() // Torna disponível para todos os módulos
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: configService.get('REDIS_TTL', 300), // 5 minutos padrão
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
```

### [2. Registrar RedisModule no AppModule raiz]()

`src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    // ... outros módulos
    RedisModule, // Importar uma única vez
    // ... módulos de domínio
  ],
})
export class AppModule {}
```

### [3. Configurar variáveis de ambiente do Redis]()

`.env`

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=       # Opcional
REDIS_DB=0
REDIS_TTL=300         # 5 minutos em segundos
```

## [Uso Básico do Redis - Implementar cache simples em Services]()

Como injetar e utilizar o cache manager do Redis em services para cache de consultas e dados.

### [Injetar CACHE_MANAGER em Services do NestJS]()

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

    // Tentar pegar do cache
    const cached = await this.cacheManager.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Se não existe, buscar do banco
    const products = await this.productRepository.find();

    // Salvar no cache por 5 minutos
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

    // Invalidar caches relacionados
    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:all');

    return product;
  }

  async remove(id: string): Promise<void> {
    await this.productRepository.softDelete(id);

    // Invalidar caches
    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:all');
  }
}
```

## [Operações disponíveis no Redis com cache-manager]()

Métodos principais do cache-manager para interagir com Redis: SET, GET, DEL e FLUSH.

### [1. Salvar dados no Redis usando SET]()

```typescript
// Simples
await this.cacheManager.set('key', 'value');

// Com TTL (em segundos)
await this.cacheManager.set('key', 'value', 300); // 5 minutos

// Objeto complexo (serializado automaticamente)
await this.cacheManager.set('user:123', { id: 123, name: 'João' }, 600);
```

### [2. Buscar dados do Redis usando GET]()

```typescript
// Retorna null se não existir
const value = await this.cacheManager.get('key');

// Com tipagem
const user = await this.cacheManager.get<User>('user:123');
```

### [3. Deletar chaves do Redis usando DEL]()

```typescript
// Deletar uma chave
await this.cacheManager.del('key');

// Deletar múltiplas chaves
await this.cacheManager.del('key1');
await this.cacheManager.del('key2');
```

### [4. Resetar todos dados do Redis usando FLUSH]()

```typescript
// ⚠️ Cuidado: remove TODAS as chaves
await this.cacheManager.reset();
```

## [Casos de Uso Avançados do Redis no Backend]()

Implementações avançadas de contadores atômicos, rate limiting, cache de API externa e sessões compartilhadas.

### [1. Implementar contador compartilhado com incremento atômico no Redis]()

Útil para estatísticas, rate limiting, contadores distribuídos.

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createClient } from 'redis';

@Injectable()
export class StatsService {
  private redisClient: any;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    // Acessar cliente Redis nativo para operações avançadas
    this.redisClient = (this.cacheManager.store as any).getClient();
  }

  async incrementPageView(pageId: string): Promise<number> {
    const key = `stats:pageview:${pageId}`;

    // INCR é atômico - seguro para múltiplas instâncias
    const newCount = await this.redisClient.incr(key);

    // Definir expiração de 24 horas
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

### [2. Implementar Rate Limiting com Redis para controlar requisições]()

Limitar requisições por usuário/IP usando contadores Redis.

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
    limit: number = 100, // máximo de requisições
    windowSeconds: number = 60, // janela de tempo
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:${identifier}`;

    const current = await this.redisClient.incr(key);

    // Primeira requisição - definir expiração
    if (current === 1) {
      await this.redisClient.expire(key, windowSeconds);
    }

    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);

    return { allowed, remaining };
  }
}
```

**Guard para aplicar rate limit:**

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
      100, // 100 requisições
      60,  // por minuto
    );

    if (!allowed) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Adicionar headers de rate limit
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Remaining', remaining);

    return true;
  }
}
```

### [3. Implementar cache de respostas de APIs externas com Redis]()

Cachear respostas de APIs externas usando Redis para reduzir latência e custos.

```typescript
@Injectable()
export class ExternalApiService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
  ) {}

  async fetchUserData(userId: string): Promise<any> {
    const cacheKey = `external:user:${userId}`;

    // Tentar cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar da API externa
    const response = await this.httpService.axiosRef.get(
      `https://api.example.com/users/${userId}`,
    );

    // Cachear por 1 hora
    await this.cacheManager.set(cacheKey, response.data, 3600);

    return response.data;
  }
}
```

### [4. Implementar sessões compartilhadas com Redis para escala horizontal]()

Usar Redis para múltiplas instâncias compartilharem sessões de usuário.

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
      3600, // 1 hora
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

## [Padrões de Nomenclatura de Chaves no Redis]()

Use prefixos hierárquicos consistentes para organizar dados Redis:

```typescript
// ✅ Bom - hierárquico e descritivo
'user:123'
'user:123:profile'
'product:456'
'products:category:electronics'
'stats:pageview:home'
'ratelimit:user:123'
'session:abc-def-123'
'cache:api:external:user:789'

// ❌ Ruim - sem estrutura
'u123'
'data'
'temp'
```

## [Helper para invalidação em massa de chaves Redis por padrão]()

Utilitário para deletar múltiplas chaves Redis usando padrões com wildcards.

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
    // Buscar todas as chaves que correspondem ao padrão
    const keys = await this.redisClient.keys(pattern);

    if (keys.length > 0) {
      // Deletar todas
      await this.redisClient.del(...keys);
    }
  }

  // Exemplos de uso:
  // await cacheService.deleteByPattern('product:*')      // Todos produtos
  // await cacheService.deleteByPattern('user:123:*')     // Tudo do usuário 123
  // await cacheService.deleteByPattern('cache:api:*')    // Todo cache de API
}
```

## [Configurar Redis local com Docker Compose]()

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

Subir o Redis:

```bash
docker-compose up -d redis
```

## [Boas Práticas ao usar Redis no NestJS]()

Recomendações essenciais para uso eficiente e seguro de Redis em produção.

### [1. Sempre definir TTL para evitar acúmulo de dados no Redis]()
```typescript
// ✅ Bom - evita memória infinita
await this.cacheManager.set('key', value, 300);

// ❌ Ruim - pode acumular dados antigos
await this.cacheManager.set('key', value);
```

### [2. Invalidar cache do Redis ao atualizar ou deletar dados]()
```typescript
async update(id: string, dto: UpdateDto) {
  const updated = await this.repository.save({ id, ...dto });

  // Invalidar caches relacionados
  await this.cacheManager.del(`item:${id}`);
  await this.cacheManager.del('items:all');

  return updated;
}
```

### [3. Usar prefixos consistentes nas chaves Redis]()
```typescript
// ✅ Bom - fácil identificar e invalidar
const cacheKey = `user:${userId}:orders`;

// ❌ Ruim - difícil gerenciar
const cacheKey = `${userId}_orders`;
```

### [4. Tratar erros de conexão do Redis sem quebrar aplicação]()
```typescript
async getCachedData(key: string): Promise<any> {
  try {
    return await this.cacheManager.get(key);
  } catch (error) {
    // Log mas não quebra a aplicação
    console.error('Redis error:', error);
    return null; // Fallback para buscar do banco
  }
}
```

### [5. Usar módulo comum @Global para reutilizar Redis em toda aplicação]()
- **Criar uma vez** - RedisModule no `src/common/redis/`
- **Global** - Decorator `@Global()` para disponibilizar em todos módulos
- **Reutilizar** - Apenas injetar `CACHE_MANAGER` onde precisar

### [6. Não cachear dados sensíveis no Redis]()
```typescript
// ❌ Evitar - dados sensíveis
await this.cacheManager.set('user:password', hashedPassword);

// ✅ Cachear apenas dados seguros
await this.cacheManager.set('user:profile', { name, email });
```

## [Checklist de Implementação do Redis no NestJS]()

- [ ] Redis instalado (Docker ou local)
- [ ] Pacotes instalados (`@nestjs/cache-manager`, `cache-manager-redis-store`, `redis`)
- [ ] `RedisModule` criado em `src/common/redis/`
- [ ] `@Global()` decorator aplicado
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Módulo importado no `AppModule`
- [ ] TTL definido para todas operações de cache
- [ ] Padrão de nomenclatura consistente
- [ ] Invalidação ao atualizar/deletar dados
- [ ] Tratamento de erro para quedas do Redis

## [Troubleshooting - Problemas comuns ao usar Redis]()

Diagnóstico e solução de problemas comuns ao configurar e usar Redis no NestJS.

### [Resolver erro Redis connection refused]()

```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Ver logs
docker logs sdd-redis

# Reiniciar
docker-compose restart redis
```

### [Debugar quando cache do Redis não está funcionando]()

```typescript
// Debug - verificar se está salvando
const saved = await this.cacheManager.set('test', 'value', 60);
console.log('Saved:', saved);

const retrieved = await this.cacheManager.get('test');
console.log('Retrieved:', retrieved);
```

### [Investigar e resolver problema de memória alta no Redis]()

```bash
# Conectar ao Redis CLI
docker exec -it sdd-redis redis-cli

# Ver informações de memória
INFO memory

# Ver todas as chaves (cuidado em produção)
KEYS *

# Limpar tudo (CUIDADO!)
FLUSHALL
```

## [Referências e documentação oficial sobre Redis e NestJS]()

- [NestJS Cache](https://docs.nestjs.com/techniques/caching)
- [Redis Commands](https://redis.io/commands)
- [cache-manager](https://github.com/node-cache-manager/node-cache-manager)
