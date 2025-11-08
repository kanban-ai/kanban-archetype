# [Como criar uma API no Backend?]()

> Guia passo a passo para criar uma nova API REST no backend usando NestJS.

## [Visão Geral - Como criar API REST completa no NestJS]()

Esta seção apresenta a visão geral do processo de criação de uma API REST no NestJS, detalhando todos os componentes necessários para um CRUD funcional e bem estruturado.

Este guia mostra como criar um CRUD completo seguindo os padrões do projeto, incluindo:
- Módulo NestJS
- Controller (rotas HTTP) **com versionamento v1**
- Service (lógica de negócio)
- Entity (modelo de dados)
- DTOs (validação)
- Documentação Swagger

**IMPORTANTE**: Todas as APIs devem começar com versionamento `/v1/` desde o início. Veja [Como versionar API](./como-versionar-api-backend.md) para entender o porquê.

## [Passo 1: Gerar Resource completo usando NestJS CLI]()

Este passo mostra como utilizar o CLI do NestJS para gerar automaticamente toda estrutura de arquivos necessária para um módulo, economizando tempo e seguindo convenções do framework.

O NestJS CLI gera automaticamente toda a estrutura necessária:

```bash
cd back
nest g resource nome-do-modulo
```

### [Opções interativas:]()

Durante a execução do comando CLI, você será questionado sobre configurações do módulo. Escolha as opções adequadas para criar uma API REST com endpoints CRUD.

1. **Qual tipo de transporte?**
   - Selecione: `REST API`

2. **Gerar pontos de entrada CRUD?**
   - Selecione: `Yes`

Isso criará:
```
src/modules/nome-do-modulo/
 nome-do-modulo.module.ts
 nome-do-modulo.controller.ts
 nome-do-modulo.service.ts
 entities/
    nome-do-modulo.entity.ts
 dto/
     create-nome-do-modulo.dto.ts
     update-nome-do-modulo.dto.ts
```

## [Passo 2: Criar Entity TypeORM como modelo de dados]()

Este passo detalha a criação da entity TypeORM que representa a tabela do banco de dados, definindo estrutura, tipos de colunas e relacionamentos.

**Arquivo**: `entities/nome-do-modulo.entity.ts`

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { User } from '@/auth/entities/user.entity';

@Entity('nome_da_tabela')
export class NomeDoModulo extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  // Relacionamento com User (dono do registro)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;
}
```

### [Dicas importantes:]()

Esta seção lista boas práticas essenciais ao criar entities TypeORM, garantindo consistência e evitando erros comuns no projeto.

- **Sempre estenda `SuperEntity`**: Inclui id, created_at, updated_at
- **Use snake_case para colunas**: Convenção PostgreSQL
- **Especifique `name` em @JoinColumn**: Controle explícito
- **Adicione `userId` separado**: Facilita queries

## [Passo 3: Criar DTOs para validação de dados da API]()

Este passo explica a criação de DTOs (Data Transfer Objects) usando decorators de validação do class-validator para garantir integridade dos dados recebidos nas requisições.

### [Create DTO]()

O Create DTO define a estrutura e validações para criação de novos registros, especificando campos obrigatórios, tipos e regras de negócio.

**Arquivo**: `dto/create-nome-do-modulo.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNomeDoModuloDto {
  @ApiProperty({
    description: 'Nome do item',
    example: 'Meu Item',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @ApiProperty({
    description: 'Descrição detalhada',
    example: 'Descrição completa do item',
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description: 'Se o item está ativo',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
```

### [Update DTO]()

O Update DTO herda do Create DTO tornando todos campos opcionais, permitindo atualizações parciais de registros existentes.

**Arquivo**: `dto/update-nome-do-modulo.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateNomeDoModuloDto } from './create-nome-do-modulo.dto';

export class UpdateNomeDoModuloDto extends PartialType(CreateNomeDoModuloDto) {}
```

> **Nota**: `PartialType` torna todos os campos opcionais automaticamente.

## [Passo 4: Implementar Service com lógica de negócio e CRUD]()

Este passo mostra como implementar o Service contendo toda lógica de negócio e operações CRUD, injetando o repository TypeORM para acesso ao banco de dados.

**Arquivo**: `nome-do-modulo.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNomeDoModuloDto } from './dto/create-nome-do-modulo.dto';
import { UpdateNomeDoModuloDto } from './dto/update-nome-do-modulo.dto';
import { NomeDoModulo } from './entities/nome-do-modulo.entity';

@Injectable()
export class NomeDoModuloService {
  constructor(
    @InjectRepository(NomeDoModulo)
    private repository: Repository<NomeDoModulo>,
  ) {}

  async create(createDto: CreateNomeDoModuloDto, userId: number) {
    const item = this.repository.create({
      ...createDto,
      userId,
    });

    return await this.repository.save(item);
  }

  async findAll(userId: number) {
    return await this.repository.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const item = await this.repository.findOne({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException(`Item ${id} não encontrado`);
    }

    return item;
  }

  async update(id: number, updateDto: UpdateNomeDoModuloDto, userId: number) {
    const item = await this.findOne(id, userId);

    Object.assign(item, updateDto);

    return await this.repository.save(item);
  }

  async remove(id: number, userId: number) {
    const item = await this.findOne(id, userId);

    await this.repository.remove(item);

    return { message: 'Item removido com sucesso' };
  }
}
```

### [Boas práticas do Service:]()

Lista de boas práticas essenciais ao implementar services, focando em segurança, validação e retorno consistente de dados.

1. **Sempre valide o userId**: Garante isolamento de dados
2. **Use `findOne` antes de update/delete**: Valida permissões
3. **Lance exceções apropriadas**: NotFoundException, ForbiddenException
4. **Retorne sempre a entidade atualizada**: Facilita no frontend

## [Passo 5: Implementar Controller com endpoints REST versionados]()

Este passo detalha a implementação do Controller definindo rotas HTTP versionadas, decorators Swagger e integração com o Service.

**Arquivo**: `nome-do-modulo.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NomeDoModuloService } from './nome-do-modulo.service';
import { CreateNomeDoModuloDto } from './dto/create-nome-do-modulo.dto';
import { UpdateNomeDoModuloDto } from './dto/update-nome-do-modulo.dto';

@ApiTags('nome-do-modulo')
@ApiBearerAuth()
@Controller({ path: 'nome-do-modulo', version: '1' })
export class NomeDoModuloController {
  constructor(private readonly service: NomeDoModuloService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo item' })
  @ApiResponse({ status: 201, description: 'Item criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createDto: CreateNomeDoModuloDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os itens' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar item por ID' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar item' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNomeDoModuloDto,
    @Request() req,
  ) {
    return this.service.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover item' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.remove(id, req.user.userId);
  }
}
```

### [Boas práticas do Controller:]()

Recomendações fundamentais para controllers robustos, incluindo documentação automática, validação de tipos e uso correto de verbos HTTP.

1. **Use decoradores Swagger**: Documenta automaticamente
2. **Use `ParseIntPipe`**: Valida e converte parâmetros
3. **Injete `@Request() req`**: Acessa dados do usuário autenticado
4. **Use verbos HTTP corretos**: POST, GET, PATCH, DELETE
5. **Organize rotas RESTful**: `/recurso`, `/recurso/:id`
6. **Sempre use versionamento**: `@Controller({ path: 'recurso', version: '1' })`

## [Passo 6: Configurar Module do NestJS com dependências]()

Este passo explica como configurar o módulo NestJS registrando controllers, providers e importando dependências necessárias como TypeORM.

**Arquivo**: `nome-do-modulo.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NomeDoModuloService } from './nome-do-modulo.service';
import { NomeDoModuloController } from './nome-do-modulo.controller';
import { NomeDoModulo } from './entities/nome-do-modulo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NomeDoModulo]),
  ],
  controllers: [NomeDoModuloController],
  providers: [NomeDoModuloService],
  exports: [NomeDoModuloService], // Se outros módulos precisarem
})
export class NomeDoModuloModule {}
```

## [Passo 7: Registrar novo módulo no AppModule raiz]()

Este passo mostra como importar o módulo recém-criado no AppModule para disponibilizar suas funcionalidades na aplicação.

**Arquivo**: `src/app.module.ts`

```typescript
import { NomeDoModuloModule } from './modules/nome-do-modulo/nome-do-modulo.module';

@Module({
  imports: [
    // ... outros módulos
    NomeDoModuloModule,
  ],
})
export class AppModule {}
```

## [Passo 8: Criar Migration do TypeORM para schema do banco]()

Este passo ensina a criar migrations para versionamento do schema do banco de dados, permitindo criar, modificar ou deletar tabelas de forma controlada.

```bash
npm run typeorm -- migration:create src/database/migrations/CreateNomeDoModuloTable
```

Edite a migration para usar **SQL puro**:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNomeDoModuloTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE nome_da_tabela (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        ativo BOOLEAN DEFAULT true,
        user_id INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_nome_tabela_user_id ON nome_da_tabela(user_id);
    `);

    await queryRunner.query(`
      ALTER TABLE nome_da_tabela
        ADD CONSTRAINT fk_nome_tabela_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE nome_da_tabela;`);
  }
}
```

Execute a migration:

```bash
npm run typeorm -- migration:run
```

## [Passo 9: Testar API REST usando Swagger ou ferramentas HTTP]()

Este passo final mostra como testar os endpoints criados usando interface Swagger UI ou ferramentas de linha de comando como curl.

### [Via Swagger]()

O Swagger UI fornece uma interface visual interativa para testar todos endpoints documentados com decorators @Api.

1. Acesse: `http://localhost:3000/api/docs`
2. Clique em "Authorize" e insira o token JWT
3. Teste os endpoints criados

### [Via curl]()

Exemplos de comandos curl para testar cada operação CRUD da API via linha de comando, útil para automação e scripts.

```bash
# Criar
curl -X POST http://localhost:3000/api/v1/nome-do-modulo \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome": "Teste", "descricao": "Descrição teste"}'

# Listar
curl -X GET http://localhost:3000/api/v1/nome-do-modulo \
  -H "Authorization: Bearer SEU_TOKEN"

# Buscar por ID
curl -X GET http://localhost:3000/api/v1/nome-do-modulo/1 \
  -H "Authorization: Bearer SEU_TOKEN"

# Atualizar
curl -X PATCH http://localhost:3000/api/v1/nome-do-modulo/1 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome": "Teste Atualizado"}'

# Deletar
curl -X DELETE http://localhost:3000/api/v1/nome-do-modulo/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

## [Recursos Avançados para APIs REST no NestJS]()

Esta seção apresenta funcionalidades avançadas para tornar suas APIs mais robustas, incluindo paginação, filtros e tratamento de relacionamentos.

### [Paginação]()

Implementação de paginação para listar grandes volumes de dados de forma eficiente, retornando metadados de navegação.

```typescript
// Service
async findAll(userId: number, page: number = 1, pageSize: number = 10) {
  const [data, total] = await this.repository.findAndCount({
    where: { userId },
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { created_at: 'DESC' },
  });

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// Controller
@Get()
findAll(
  @Query('page') page: string = '1',
  @Query('pageSize') pageSize: string = '10',
  @Request() req,
) {
  return this.service.findAll(req.user.userId, +page, +pageSize);
}
```

### [Filtros e Busca]()

```typescript
// DTO
export class FilterNomeDoModuloDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}

// Service
async findAll(userId: number, filters: FilterNomeDoModuloDto) {
  const where: any = { userId };

  if (filters.nome) {
    where.nome = Like(`%${filters.nome}%`);
  }

  if (filters.ativo !== undefined) {
    where.ativo = filters.ativo;
  }

  return await this.repository.find({ where });
}
```

### [Relacionamentos]()

```typescript
// Carregar com relacionamentos
async findOne(id: number, userId: number) {
  const item = await this.repository.findOne({
    where: { id, userId },
    relations: ['user', 'outroRelacionamento'],
  });

  if (!item) {
    throw new NotFoundException(`Item ${id} não encontrado`);
  }

  return item;
}
```

## [Checklist de Implementação de API REST completa]()

- [ ] Resource gerado com `nest g resource`
- [ ] Entity criada estendendo SuperEntity
- [ ] DTOs criados com validação
- [ ] Service implementado com CRUD completo
- [ ] Controller implementado com rotas REST **e versionamento v1**
- [ ] Module configurado e importado no AppModule
- [ ] Migration criada e executada
- [ ] Documentação Swagger adicionada
- [ ] Validação de userId em todas as operações
- [ ] Versionamento configurado (ver [Como versionar API](./como-versionar-api-backend.md))

## [Padrão de Nomenclatura de arquivos e classes no NestJS]()

Esta seção define as convenções de nomenclatura para arquivos, classes e tabelas do projeto seguindo as melhores práticas do NestJS e TypeORM.

| Tipo | Padrão | Regras | Exemplo |
|------|--------|--------|---------|
| Module | kebab-case | - | `product-category` |
| Entity | PascalCase | Singular | `ProductCategory` |
| Table | snake_case | Minúscula + Plural | `product_categories` |
| DTO | PascalCase | - | `CreateProductCategoryDto` |
| Service | PascalCase | - | `ProductCategoryService` |
| Controller | PascalCase | - | `ProductCategoryController` |

**Importante**:
- **Entity**: Sempre singular em PascalCase (ex: `Product`, `User`)
- **Tabela**: Sempre plural em snake_case minúscula (ex: `products`, `users`)

## [Referências e documentação oficial NestJS e TypeORM]()

- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Providers](https://docs.nestjs.com/providers)
- [TypeORM Entities](https://typeorm.io/entities)
- [class-validator Decorators](https://github.com/typestack/class-validator)
