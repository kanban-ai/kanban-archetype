# [Como documentar com Swagger no Backend?]()

> Guia prático para documentar APIs usando Swagger/OpenAPI no NestJS.

## [O que é Swagger?]()

Swagger (OpenAPI) gera automaticamente uma interface interativa para testar e documentar sua API. Acesse em: `http://localhost:3000/api/docs`

## [Configuração Inicial]()

Setup básico do Swagger no projeto NestJS para habilitar documentação automática de APIs.

### [1. Instalar dependências]()

```bash
npm install @nestjs/swagger
```

### [2. Configurar no main.ts]()

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentação completa da API')
    .setVersion('1.0')
    .addBearerAuth() // Suporte a JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
```

## [Documentar Controllers]()

Decorators para documentar endpoints REST incluindo tags, operações, parâmetros e respostas.

### [Decorators Principais]()

```typescript
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
```

### [Exemplo Completo]()

```typescript
@ApiTags('products') // Agrupa endpoints
@ApiBearerAuth() // Requer token JWT
@Controller({ path: 'products', version: '1' })
export class ProductController {

  @Post()
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Itens por página',
  })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findAll(+page, +pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do produto',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover produto' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

## [Documentar DTOs]()

Anotação de Data Transfer Objects com @ApiProperty para gerar documentação precisa dos schemas de entrada e saída.

### [Exemplo Create DTO]()

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Notebook Dell',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada do produto',
    example: 'Notebook Dell Inspiron 15, Intel i7, 16GB RAM',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Preço em reais',
    example: 2500.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Quantidade em estoque',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number;
}
```

### [Update DTO]()

Para DTOs de update, use `PartialType`:

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// Herda todas as propriedades mas torna opcionais
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### [Com Enum]()

```typescript
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Status do produto',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
```

## [Documentar Respostas]()

Especificação de formatos de resposta HTTP com tipos, status codes e estruturas de dados.

### [Resposta com Type]()

```typescript
import { ApiResponse, ApiOkResponse } from '@nestjs/swagger';

@ApiOkResponse({
  description: 'Lista de produtos',
  type: [ProductEntity], // Array de produtos
})
@Get()
findAll() {
  return this.service.findAll();
}

@ApiOkResponse({
  description: 'Produto encontrado',
  type: ProductEntity, // Um produto
})
@Get(':id')
findOne(@Param('id') id: number) {
  return this.service.findOne(id);
}
```

### [Múltiplas Respostas]()

```typescript
@ApiResponse({ status: 200, description: 'Sucesso' })
@ApiResponse({ status: 400, description: 'Dados inválidos' })
@ApiResponse({ status: 401, description: 'Não autorizado' })
@ApiResponse({ status: 404, description: 'Não encontrado' })
@Post()
create(@Body() dto: CreateProductDto) {
  return this.service.create(dto);
}
```

## [Decorators Úteis]()

Coleção de decorators do @nestjs/swagger para documentar diferentes aspectos da API de forma declarativa.

### [@ApiTags]()

Agrupa endpoints relacionados:

```typescript
@ApiTags('products')
@Controller({ path: 'products', version: '1' })
export class ProductController {}

@ApiTags('categories')
@Controller({ path: 'categories', version: '1' })
export class CategoryController {}
```

### [@ApiBearerAuth]()

Indica que endpoint requer token JWT:

```typescript
@ApiBearerAuth()
@Controller({ path: 'products', version: '1' })
export class ProductController {}
```

### [@ApiOperation]()

Descreve o que o endpoint faz:

```typescript
@ApiOperation({
  summary: 'Criar novo produto',
  description: 'Endpoint para criar um novo produto no sistema',
})
@Post()
create() {}
```

### [@ApiParam]()

Documenta parâmetros de rota:

```typescript
@ApiParam({
  name: 'id',
  type: Number,
  description: 'ID único do produto',
  example: 1,
})
@Get(':id')
findOne(@Param('id') id: number) {}
```

### [@ApiQuery]()

Documenta query parameters:

```typescript
@ApiQuery({
  name: 'search',
  required: false,
  type: String,
  description: 'Termo de busca',
})
@ApiQuery({
  name: 'active',
  required: false,
  type: Boolean,
  description: 'Filtrar apenas ativos',
})
@Get()
findAll(
  @Query('search') search?: string,
  @Query('active') active?: boolean,
) {}
```

### [@ApiBody]()

Documenta body da requisição:

```typescript
@ApiBody({
  type: CreateProductDto,
  description: 'Dados do produto',
})
@Post()
create(@Body() dto: CreateProductDto) {}
```

### [@ApiProperty no DTO]()

Documenta propriedades:

```typescript
@ApiProperty({
  description: 'Nome do produto',
  example: 'Notebook',
  minLength: 3,
  maxLength: 255,
  required: true,
})
name: string;

@ApiProperty({
  description: 'Preço',
  example: 1500.00,
  minimum: 0,
  type: Number,
})
price: number;

@ApiProperty({
  description: 'Tags do produto',
  type: [String],
  example: ['eletrônico', 'computador'],
  required: false,
})
tags?: string[];
```

### [@ApiPropertyOptional]()

Para campos opcionais:

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';

@ApiPropertyOptional({
  description: 'Descrição opcional',
  example: 'Descrição detalhada',
})
description?: string;
```

## [Ocultar Propriedades]()

Métodos para excluir propriedades sensíveis da documentação Swagger e das respostas da API.

### [@ApiHideProperty]()

Oculta propriedade da documentação:

```typescript
import { ApiHideProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty()
  email: string;

  @ApiHideProperty() // Não aparece no Swagger
  passwordHash: string;
}
```

### [@Exclude (class-transformer)]()

Exclui da serialização:

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  @Exclude() // Nunca retorna ao cliente
  passwordHash: string;
}
```

## [Testar no Swagger UI]()

Instruções para utilizar a interface interativa do Swagger para testar endpoints autenticados e não autenticados.

### [1. Acessar a documentação]()

```
http://localhost:3000/api/docs
```

### [2. Autenticar]()

1. Clique no botão "Authorize" (cadeado)
2. Cole o token JWT: `Bearer seu_token_aqui`
3. Clique em "Authorize"

### [3. Testar endpoints]()

1. Expanda o endpoint desejado
2. Clique em "Try it out"
3. Preencha os parâmetros
4. Clique em "Execute"
5. Veja a resposta

## [Documentar Paginação]()

Exemplo de DTO genérico para documentar respostas paginadas de forma consistente em toda API.

```typescript
export class PaginatedResponseDto<T> {
  @ApiProperty({ type: [Object] })
  data: T[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

// Uso
@ApiOkResponse({
  description: 'Lista paginada de produtos',
  type: PaginatedResponseDto,
})
@Get()
findAll() {
  return this.service.findAllPaginated();
}
```

## [Checklist de Documentação]()

Para cada endpoint:
- [ ] **@Controller com versionamento (`version: '1'`)**
- [ ] @ApiTags no controller
- [ ] @ApiBearerAuth (se protegido)
- [ ] @ApiOperation (summary)
- [ ] @ApiResponse para cada status
- [ ] @ApiParam para parâmetros de rota
- [ ] @ApiQuery para query parameters
- [ ] @ApiProperty em todos os campos dos DTOs
- [ ] Exemplos em @ApiProperty

> **IMPORTANTE**: Todas as APIs devem usar versionamento. Veja [Como versionar API](./como-versionar-api-backend.md).

## [Dicas]()

1. **Use exemplos realistas**: Ajuda quem vai usar a API
2. **Documente todos os status codes**: 200, 400, 401, 404, etc
3. **Descreva bem os campos**: O que é, formato esperado
4. **Agrupe com @ApiTags**: Organiza a documentação
5. **Oculte dados sensíveis**: Use @Exclude ou @ApiHideProperty

## [Referências]()

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
