# [Como deve funcionar a autenticação com API Key?]()

> Guia sobre autenticação alternativa usando API Key para integrações e serviços externos.

## [O que é API Key?]()

API Key é uma chave de autenticação alternativa ao JWT, usada para:
- Integrações entre serviços
- Scripts automatizados
- Webhooks
- Serviços internos que não usam login de usuário

## [Quando Usar]()

-  **Use API Key**: Integração backend-to-backend, cron jobs, webhooks
- L **Use JWT**: Autenticação de usuários, frontend, apps mobile

## [Implementação]()

Esta seção apresenta o processo completo de implementação de autenticação via API Key, incluindo configuração de variáveis de ambiente, criação de guards e decorators.

### [1. Configurar Variável de Ambiente]()

**.env**:
```env
X_API_KEY=sua-chave-secreta-aqui-longa-e-aleatoria
```

Gere uma chave segura:
```bash
openssl rand -hex 32
```

### [2. Criar API Key Guard]()

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
    // Verificar se rota requer API Key
    const requiresApiKey = this.reflector.get<boolean>(
      API_KEY_AUTH,
      context.getHandler(),
    );

    if (!requiresApiKey) {
      return true; // Rota não requer API Key
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('X_API_KEY');

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('API Key inválida');
    }

    return true;
  }
}
```

### [3. Criar Decorator]()

**`auth/decorators/api-key-auth.decorator.ts`**:

```typescript
import { SetMetadata } from '@nestjs/common';

export const API_KEY_AUTH = 'api-key-auth';
export const ApiKeyAuth = () => SetMetadata(API_KEY_AUTH, true);
```

### [4. Registrar Guard Globalmente]()

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

## [Como Usar]()

Exemplos práticos de como aplicar autenticação API Key em endpoints do backend NestJS.

### [Endpoint que Aceita API Key]()

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ApiKeyAuth } from '@/auth/decorators/api-key-auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('webhooks')
export class WebhookController {

  @Public() // Não requer JWT
  @ApiKeyAuth() // Requer API Key
  @Post('process')
  async processWebhook(@Body() data: any) {
    // Processar webhook
    return { success: true };
  }
}
```

### [Endpoint que Aceita JWT OU API Key]()

```typescript
@Controller('data')
export class DataController {

  @Get('sync')
  async syncData(@Request() req) {
    // Este endpoint aceita tanto JWT quanto API Key
    // Se vier com JWT, req.user estará disponível
    // Se vier com API Key, req.user será undefined

    if (req.user) {
      // Autenticado com JWT
      return this.service.syncForUser(req.user.userId);
    } else {
      // Autenticado com API Key (sem usuário específico)
      return this.service.syncAll();
    }
  }
}
```

## [Como Chamar o Endpoint]()

Exemplos de requisições HTTP utilizando API Key em diferentes ferramentas e linguagens.

### [Com cURL]()

```bash
curl -X POST http://localhost:3000/api/webhooks/process \
  -H "X-API-KEY: sua-chave-aqui" \
  -H "Content-Type: application/json" \
  -d '{"event": "test"}'
```

### [Com Axios (Node.js)]()

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

### [Com fetch]()

```typescript
const response = await fetch('http://localhost:3000/api/webhooks/process', {
  method: 'POST',
  headers: {
    'X-API-KEY': 'sua-chave-aqui',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ event: 'test' }),
});
```

## [Implementação Avançada]()

Cenários avançados incluindo múltiplas API Keys por cliente, controle de acesso granular e rate limiting.

### [API Key por Cliente]()

Se precisar de múltiplas API Keys (uma por cliente):

**1. Criar Tabela de API Keys**:

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

**2. Validar no Guard**:

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
      throw new UnauthorizedException('API Key ausente');
    }

    const keyRecord = await this.apiKeyRepository.findOne({
      where: { key: apiKey, active: true },
      relations: ['user'],
    });

    if (!keyRecord) {
      throw new UnauthorizedException('API Key inválida');
    }

    // Atualizar último uso
    await this.apiKeyRepository.update(keyRecord.id, {
      lastUsedAt: new Date(),
    });

    // Injetar usuário no request
    request.user = {
      userId: keyRecord.userId,
      apiKeyId: keyRecord.id,
    };

    return true;
  }
}
```

### [Rate Limiting]()

Limitar requisições por API Key:

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
  // Máximo de requisições configurado no módulo
}
```

## [Documentar no Swagger]()

Configuração do Swagger para exibir e testar endpoints protegidos por API Key na documentação interativa.

```typescript
import { ApiHeader, ApiSecurity } from '@nestjs/swagger';

// Configurar no main.ts
const config = new DocumentBuilder()
  .addApiKey(
    { type: 'apiKey', name: 'X-API-KEY', in: 'header' },
    'api-key',
  )
  .build();

// Usar no controller
@ApiSecurity('api-key')
@ApiKeyAuth()
@Post('webhook')
async webhook() {}
```

## [Segurança]()

Práticas recomendadas para geração, armazenamento e gerenciamento seguro de API Keys em produção.

### [Boas Práticas]()

1. **Use chaves longas e aleatórias**: Mínimo 32 caracteres
2. **Nunca commite chaves no git**: Use .env
3. **Rotacione chaves periodicamente**: Especialmente se vazar
4. **Use HTTPS em produção**: Evita interceptação
5. **Log de uso**: Registre quem usou e quando
6. **Revogação**: Permita desativar chaves comprometidas
7. **Rate limiting**: Previna abuso

### [Gerar Chaves Seguras]()

```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## [Diferenças: JWT vs API Key]()

Comparação detalhada entre JWT e API Key para auxiliar na escolha do método de autenticação apropriado.

| Aspecto | JWT | API Key |
|---------|-----|---------|
| **Uso** | Usuários finais | Integrações |
| **Expiração** | Sim (ex: 24h) | Não |
| **Rotação** | Automática (relogin) | Manual |
| **Payload** | Dados do usuário | Apenas chave |
| **Revogação** | Difícil | Fácil |
| **Performance** | Valida assinatura | Busca em BD |

## [Troubleshooting]()

Soluções para problemas comuns ao implementar e utilizar autenticação por API Key.

### [Erro: "API Key ausente"]()

**Causa**: Header `X-API-KEY` não enviado

**Solução**: Adicione o header na requisição

### [Erro: "API Key inválida"]()

**Causa**: Chave incorreta ou não configurada

**Solução**: Verifique `.env` e valor enviado

### [Conflito com JWT]()

Se endpoint aceita ambos, configure a ordem dos guards:

```typescript
// Primeiro tenta JWT, depois API Key
app.useGlobalGuards(
  new JwtAuthGuard(reflector),
  new ApiKeyAuthGuard(configService, reflector),
);
```

## [Referências]()

- [API Key Best Practices](https://cloud.google.com/endpoints/docs/openapi/when-why-api-key)
- [NestJS Guards](https://docs.nestjs.com/guards)
