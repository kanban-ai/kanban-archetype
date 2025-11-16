# [How to document with Swagger in the Backend?]()

> Practical guide to documenting APIs using Swagger/OpenAPI in NestJS.

## [What is Swagger?]()

Swagger (OpenAPI) automatically generates an interactive interface to test and document your API. Access at: `http://localhost:3000/api/docs`

## [Initial Setup]()

Basic Swagger setup in NestJS project to enable automatic API documentation.

### [1. Install dependencies]()

```bash
npm install @nestjs/swagger
```

### [2. Configure in main.ts]()

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Complete API documentation')
    .setVersion('1.0')
    .addBearerAuth() // JWT support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
```

## [Document Controllers]()

Decorators to document REST endpoints including tags, operations, parameters and responses.

### [Main Decorators]()

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

### [Complete Example]()

```typescript
@ApiTags('products') // Groups endpoints
@ApiBearerAuth() // Requires JWT token
@Controller({ path: 'products', version: '1' })
export class ProductController {

  @Post()
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findAll(+page, +pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find product by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove product' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

## [Document DTOs]()

Data Transfer Objects annotation with @ApiProperty to generate accurate documentation of input and output schemas.

### [Create DTO Example]()

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Dell Notebook',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed product description',
    example: 'Dell Inspiron 15 Notebook, Intel i7, 16GB RAM',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price in reais',
    example: 2500.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
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

For update DTOs, use `PartialType`:

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// Inherits all properties but makes them optional
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### [With Enum]()

```typescript
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
```

## [Document Responses]()

HTTP response format specification with types, status codes and data structures.

### [Response with Type]()

```typescript
import { ApiResponse, ApiOkResponse } from '@nestjs/swagger';

@ApiOkResponse({
  description: 'Product list',
  type: [ProductEntity], // Array of products
})
@Get()
findAll() {
  return this.service.findAll();
}

@ApiOkResponse({
  description: 'Product found',
  type: ProductEntity, // One product
})
@Get(':id')
findOne(@Param('id') id: number) {
  return this.service.findOne(id);
}
```

### [Multiple Responses]()

```typescript
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Invalid data' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Not found' })
@Post()
create(@Body() dto: CreateProductDto) {
  return this.service.create(dto);
}
```

## [Useful Decorators]()

Collection of @nestjs/swagger decorators to document different API aspects declaratively.

### [@ApiTags]()

Groups related endpoints:

```typescript
@ApiTags('products')
@Controller({ path: 'products', version: '1' })
export class ProductController {}

@ApiTags('categories')
@Controller({ path: 'categories', version: '1' })
export class CategoryController {}
```

### [@ApiBearerAuth]()

Indicates endpoint requires JWT token:

```typescript
@ApiBearerAuth()
@Controller({ path: 'products', version: '1' })
export class ProductController {}
```

### [@ApiOperation]()

Describes what the endpoint does:

```typescript
@ApiOperation({
  summary: 'Create new product',
  description: 'Endpoint to create a new product in the system',
})
@Post()
create() {}
```

### [@ApiParam]()

Documents route parameters:

```typescript
@ApiParam({
  name: 'id',
  type: Number,
  description: 'Unique product ID',
  example: 1,
})
@Get(':id')
findOne(@Param('id') id: number) {}
```

### [@ApiQuery]()

Documents query parameters:

```typescript
@ApiQuery({
  name: 'search',
  required: false,
  type: String,
  description: 'Search term',
})
@ApiQuery({
  name: 'active',
  required: false,
  type: Boolean,
  description: 'Filter only active',
})
@Get()
findAll(
  @Query('search') search?: string,
  @Query('active') active?: boolean,
) {}
```

### [@ApiBody]()

Documents request body:

```typescript
@ApiBody({
  type: CreateProductDto,
  description: 'Product data',
})
@Post()
create(@Body() dto: CreateProductDto) {}
```

### [@ApiProperty in DTO]()

Documents properties:

```typescript
@ApiProperty({
  description: 'Product name',
  example: 'Notebook',
  minLength: 3,
  maxLength: 255,
  required: true,
})
name: string;

@ApiProperty({
  description: 'Price',
  example: 1500.00,
  minimum: 0,
  type: Number,
})
price: number;

@ApiProperty({
  description: 'Product tags',
  type: [String],
  example: ['electronics', 'computer'],
  required: false,
})
tags?: string[];
```

### [@ApiPropertyOptional]()

For optional fields:

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';

@ApiPropertyOptional({
  description: 'Optional description',
  example: 'Detailed description',
})
description?: string;
```

## [Hide Properties]()

Methods to exclude sensitive properties from Swagger documentation and API responses.

### [@ApiHideProperty]()

Hides property from documentation:

```typescript
import { ApiHideProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty()
  email: string;

  @ApiHideProperty() // Doesn't appear in Swagger
  passwordHash: string;
}
```

### [@Exclude (class-transformer)]()

Excludes from serialization:

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  @Exclude() // Never returns to client
  passwordHash: string;
}
```

## [Test in Swagger UI]()

Instructions to use Swagger's interactive interface to test authenticated and unauthenticated endpoints.

### [1. Access documentation]()

```
http://localhost:3000/api/docs
```

### [2. Authenticate]()

1. Click the "Authorize" button (padlock)
2. Paste the JWT token: `Bearer your_token_here`
3. Click "Authorize"

### [3. Test endpoints]()

1. Expand the desired endpoint
2. Click "Try it out"
3. Fill in the parameters
4. Click "Execute"
5. See the response

## [Document Pagination]()

Generic DTO example to document paginated responses consistently throughout the API.

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

// Usage
@ApiOkResponse({
  description: 'Paginated product list',
  type: PaginatedResponseDto,
})
@Get()
findAll() {
  return this.service.findAllPaginated();
}
```

## [Documentation Checklist]()

For each endpoint:
- [ ] **@Controller with versioning (`version: '1'`)**
- [ ] @ApiTags on controller
- [ ] @ApiBearerAuth (if protected)
- [ ] @ApiOperation (summary)
- [ ] @ApiResponse for each status
- [ ] @ApiParam for route parameters
- [ ] @ApiQuery for query parameters
- [ ] @ApiProperty on all DTO fields
- [ ] Examples in @ApiProperty

> **IMPORTANT**: All APIs must use versioning. See [How to version API](./how-to-version-api-backend.md).

## [Tips]()

1. **Use realistic examples**: Helps those who will use the API
2. **Document all status codes**: 200, 400, 401, 404, etc
3. **Describe fields well**: What it is, expected format
4. **Group with @ApiTags**: Organizes documentation
5. **Hide sensitive data**: Use @Exclude or @ApiHideProperty

## [References]()

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
