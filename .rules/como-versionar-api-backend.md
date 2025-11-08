# [Como versionar API no Backend?]()

> Guia completo para implementar versionamento de API REST no backend usando NestJS.

## [Por que versionar APIs?]()

O versionamento de API é **essencial** para:

1. **Não quebrar integrações existentes**: Clientes antigos continuam funcionando
2. **Evoluir contratos**: Adicionar/remover campos sem impacto
3. **Múltiplas versões simultâneas**: Suportar clientes legados e novos
4. **Migração gradual**: Dar tempo aos clientes para migrarem
5. **Profissionalismo**: Demonstra maturidade no desenvolvimento

## [Quando versionar?]()

### [✅ Versione quando:]()

- **Mudança de contrato**: Remover/renomear campos
- **Mudança de comportamento**: Lógica diferente para mesma rota
- **Breaking changes**: Qualquer mudança que quebre clientes existentes
- **Desde o início**: Sempre comece com `/v1/` mesmo que seja a primeira versão

### [❌ Não precisa versionar quando:]()

- **Adicionar novos campos opcionais**: Não quebra clientes
- **Adicionar novos endpoints**: Não afeta rotas existentes
- **Corrigir bugs**: Mantém o contrato
- **Melhorar performance**: Não muda comportamento externo

## [Estratégias de Versionamento]()

### [1. URL Versioning (Recomendado) ⭐]()

Versão na URL é a abordagem **mais simples e clara**.

```
GET /api/v1/users
GET /api/v2/users
```

**Vantagens**:
- ✅ Fácil de entender e debugar
- ✅ Testável no navegador
- ✅ Documentação clara no Swagger
- ✅ Cache HTTP funciona bem
- ✅ NestJS tem suporte nativo

**Desvantagens**:
- ❌ URLs diferentes para mesma funcionalidade

### [2. Header Versioning]()

Versão no header HTTP.

```
GET /api/users
Accept: application/vnd.api.v1+json
```

**Vantagens**:
- ✅ URL limpa
- ✅ Segue padrões REST

**Desvantagens**:
- ❌ Mais difícil de testar
- ❌ Menos descobrível
- ❌ Cache HTTP pode ser problemático

### [3. Query Parameter Versioning]()

Versão como parâmetro.

```
GET /api/users?version=1
```

**Vantagens**:
- ✅ Simples de implementar

**Desvantagens**:
- ❌ Mistura versão com query params
- ❌ Menos profissional
- ❌ Não recomendado

## [Implementação no NestJS (URL Versioning)]()

### [Passo 1: Habilitar versionamento global]()

**Arquivo**: `src/main.ts`

```typescript
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Prefixo global
  app.setGlobalPrefix('api');

  // Habilitar versionamento por URL
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Versão padrão se não especificada
  });

  // ... resto da configuração

  await app.listen(3000);
}
bootstrap();
```

### [Passo 2: Versionar Controller]()

**Opção A: Versão no Controller inteiro**

```typescript
import { Controller, Get, Version } from '@nestjs/common';

@Controller('users')
export class UsersController {
  // Rota: GET /api/v1/users
  @Get()
  @Version('1')
  findAllV1() {
    return { version: 'v1', users: [] };
  }

  // Rota: GET /api/v2/users
  @Get()
  @Version('2')
  findAllV2() {
    return {
      version: 'v2',
      data: [], // estrutura diferente
      pagination: { page: 1, total: 0 }
    };
  }
}
```

**Opção B: Controller separado por versão** (Recomendado)

```typescript
// controllers/v1/users.controller.ts
@ApiTags('users-v1')
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Get()
  findAll() {
    return { users: [] };
  }
}

// controllers/v2/users.controller.ts
@ApiTags('users-v2')
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  @Get()
  findAll() {
    return { data: [], pagination: {} };
  }
}
```

### [Passo 3: Estrutura de pastas por versão]()

```
src/modules/users/
├── users.module.ts
├── entities/
│   └── user.entity.ts
├── v1/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
└── v2/
    ├── users.controller.ts
    ├── users.service.ts
    └── dto/
        ├── create-user.dto.ts
        └── update-user.dto.ts
```

### [Passo 4: Registrar múltiplas versões no Module]()

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

// V1
import { UsersV1Controller } from './v1/users.controller';
import { UsersV1Service } from './v1/users.service';

// V2
import { UsersV2Controller } from './v2/users.controller';
import { UsersV2Service } from './v2/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersV1Controller, UsersV2Controller],
  providers: [UsersV1Service, UsersV2Service],
})
export class UsersModule {}
```

## [Exemplo Completo: Evolução de API]()

### [V1: Estrutura inicial]()

```typescript
// v1/dto/create-user.dto.ts
export class CreateUserDtoV1 {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}

// v1/users.controller.ts
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Post()
  create(@Body() dto: CreateUserDtoV1) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    // Retorna array direto
    return this.service.findAll();
  }
}
```

**Response V1**:
```json
[
  { "id": 1, "name": "João", "email": "joao@email.com" },
  { "id": 2, "name": "Maria", "email": "maria@email.com" }
]
```

### [V2: Estrutura com paginação e campos novos]()

```typescript
// v2/dto/create-user.dto.ts
export class CreateUserDtoV2 {
  @ApiProperty()
  @IsString()
  firstName: string; // Separou name em firstName/lastName

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string; // Campo novo
}

// v2/users.controller.ts
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  @Post()
  create(@Body() dto: CreateUserDtoV2) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    // Retorna com paginação
    return this.service.findAll(page, limit);
  }
}
```

**Response V2**:
```json
{
  "data": [
    {
      "id": 1,
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao@email.com",
      "phone": "+5511999999999"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## [Compartilhar código entre versões]()

### [Adapter Pattern para DTOs]()

```typescript
// v2/users.service.ts
import { CreateUserDtoV1 } from '../v1/dto/create-user.dto';
import { CreateUserDtoV2 } from './dto/create-user.dto';

@Injectable()
export class UsersV2Service {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async create(dto: CreateUserDtoV2) {
    // Converte V2 para V1 (estrutura interna)
    const userV1: CreateUserDtoV1 = {
      name: `${dto.firstName} ${dto.lastName}`,
      email: dto.email,
    };

    const user = this.repository.create(userV1);
    return await this.repository.save(user);
  }
}
```

### [Service compartilhado com transformações]()

```typescript
// shared/users-base.service.ts
@Injectable()
export class UsersBaseService {
  constructor(
    @InjectRepository(User)
    protected repository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    return await this.repository.findOneBy({ id });
  }
}

// v1/users.service.ts
@Injectable()
export class UsersV1Service extends UsersBaseService {
  async findAll() {
    const users = await this.repository.find();
    return users; // Retorna array direto
  }
}

// v2/users.service.ts
@Injectable()
export class UsersV2Service extends UsersBaseService {
  async findAll(page: number, limit: number) {
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

## [Documentação Swagger por versão]()

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger V1
  const configV1 = new DocumentBuilder()
    .setTitle('API V1')
    .setDescription('API V1 - Legado')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentV1 = SwaggerModule.createDocument(app, configV1, {
    include: [UsersV1Controller], // Incluir apenas controllers V1
  });
  SwaggerModule.setup('api/docs/v1', app, documentV1);

  // Swagger V2
  const configV2 = new DocumentBuilder()
    .setTitle('API V2')
    .setDescription('API V2 - Atual')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const documentV2 = SwaggerModule.createDocument(app, configV2, {
    include: [UsersV2Controller], // Incluir apenas controllers V2
  });
  SwaggerModule.setup('api/docs/v2', app, documentV2);

  await app.listen(3000);
}
```

**Acesso**:
- Swagger V1: `http://localhost:3000/api/docs/v1`
- Swagger V2: `http://localhost:3000/api/docs/v2`

## [Estratégia de Deprecação]()

### [1. Avisar sobre deprecação]()

```typescript
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Get()
  @ApiOperation({
    summary: 'Listar usuários',
    deprecated: true, // Marca como deprecated no Swagger
  })
  @ApiResponse({
    status: 200,
    description: 'DEPRECATED: Use /api/v2/users',
    headers: {
      'X-API-Warn': {
        description: 'API será descontinuada em 2026-01-01',
        schema: { type: 'string' }
      }
    }
  })
  findAll(@Res() res: Response) {
    // Header de aviso
    res.setHeader('X-API-Warn', 'API v1 será descontinuada em 2026-01-01. Migre para v2.');
    res.setHeader('X-API-Deprecation-Date', '2026-01-01');
    res.setHeader('X-API-Sunset', '2026-06-01'); // Data de remoção

    return res.json(this.service.findAll());
  }
}
```

### [2. Desabilitar versão antiga]()

```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '2', // Nova versão padrão
});

// Remover UsersV1Controller do Module após período de transição
```

## [Boas Práticas]()

### [1. Sempre comece com v1]()

```typescript
// ❌ Errado
@Controller('users')
export class UsersController {}

// ✅ Correto
@Controller({ path: 'users', version: '1' })
export class UsersController {}
```

### [2. Documente mudanças entre versões]()

Crie arquivo `CHANGELOG-API.md`:

```markdown
## V2 (2025-11-02)

### Breaking Changes
- `name` foi dividido em `firstName` e `lastName`
- `GET /users` agora retorna paginação ao invés de array direto

### Additions
- Campo `phone` adicionado

### Migration Guide
- V1: `{ name: "João Silva" }`
- V2: `{ firstName: "João", lastName: "Silva" }`
```

### [3. Versão major apenas para breaking changes]()

- **v1 → v2**: Breaking change (estrutura diferente)
- **v1.1**: Adicionar campo opcional (não quebra)
- **v1.2**: Novo endpoint (não quebra)

### [4. Suporte no mínimo 2 versões simultâneas]()

- **v1**: Versão legada (deprecated)
- **v2**: Versão atual (recomendada)
- **v3**: Versão beta (opcional)

### [5. Período de transição]()

Dê pelo menos **6 meses** entre:
1. Lançamento da nova versão
2. Deprecação da versão antiga
3. Remoção da versão antiga

## [Frontend: Consumir APIs versionadas]()

```typescript
// src/config/api.config.ts
import axios from 'axios';

const API_VERSION = 'v2'; // Centralize a versão

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Usar
api.get('/users'); // chama /api/v2/users
```

## [Testes: Versões diferentes]()

```typescript
// users.controller.spec.ts
describe('UsersV1Controller', () => {
  it('GET /api/v1/users - retorna array', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('UsersV2Controller', () => {
  it('GET /api/v2/users - retorna paginação', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v2/users')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
  });
});
```

## [Checklist de Versionamento]()

- [ ] Versionamento habilitado no main.ts
- [ ] Controllers sempre com versão explícita (começar com v1)
- [ ] Swagger separado por versão
- [ ] Estrutura de pastas organizada (v1/, v2/)
- [ ] CHANGELOG-API.md documentando mudanças
- [ ] Headers de deprecação configurados
- [ ] Frontend usando versão centralizada
- [ ] Testes para cada versão
- [ ] Período de transição definido (mínimo 6 meses)

## [Troubleshooting]()

### [Erro: Cannot GET /api/users]()

```typescript
// Certifique-se de ter versão definida
@Controller({ path: 'users', version: '1' })
export class UsersController {}

// E versionamento habilitado
app.enableVersioning({
  type: VersioningType.URI,
});
```

### [Swagger não mostra versão]()

```typescript
// Use include no SwaggerModule.createDocument
const document = SwaggerModule.createDocument(app, config, {
  include: [UsersV1Controller], // Incluir explicitamente
});
```

### [Versão padrão não funciona]()

```typescript
// defaultVersion só funciona se controller não especificar versão
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1', // Usado apenas se controller não tiver @Version
});
```

## [Referências]()

- [NestJS Versioning](https://docs.nestjs.com/techniques/versioning)
- [API Versioning Best Practices](https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/)
- [HTTP Sunset Header](https://datatracker.ietf.org/doc/html/rfc8594)

---

**Regra de ouro**: Sempre use versionamento desde o início (v1), mesmo que não planeje criar v2 no futuro. É melhor ter v1 e nunca precisar de v2, do que não ter versionamento e precisar fazer breaking change.
