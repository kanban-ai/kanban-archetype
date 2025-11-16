# How to document with Swagger in the Backend

<document description: Practical guide for documenting REST APIs using Swagger/OpenAPI decorators in NestJS backend, covering controllers, DTOs, responses, and authentication.>

## [What is Swagger and OpenAPI Documentation]()

Swagger (OpenAPI) automatically generates an interactive interface to test and document your API, accessible at http://localhost:3000/api/docs. It provides real-time API documentation, request/response examples, and built-in testing capabilities directly from decorators in your NestJS code.

### When to use?
Use Swagger documentation for every REST API endpoint in your NestJS backend to provide interactive documentation, enable API testing without external tools, facilitate frontend development, and maintain up-to-date API contracts.

### When NOT to use?
Swagger is essential for REST APIs - there's rarely a reason not to use it. However, for GraphQL APIs, use GraphQL Playground instead. For internal-only microservices, lighter documentation might suffice.

### Example
Access Swagger UI at `http://localhost:3000/api/docs` after setup.

### Checklist
- [ ] Swagger installed and configured in main.ts
- [ ] All controllers documented with @ApiTags
- [ ] All endpoints have @ApiOperation
- [ ] All DTOs have @ApiProperty decorators
- [ ] Response types documented with @ApiResponse
- [ ] Authentication documented with @ApiBearerAuth

### Troubleshooting
**Issue**: Swagger UI not accessible
**Solution**: Verify SwaggerModule.setup() is called in main.ts and application is running.

**Issue**: Endpoints missing from documentation
**Solution**: Ensure controllers are properly registered in modules and have @Controller decorator.

### Best Practices
Document every endpoint as you create it - don't leave for later. Use realistic examples in @ApiProperty. Document all possible response codes. Keep documentation synchronized with implementation. Use meaningful descriptions.

## [Initial Setup]()

Basic Swagger setup in NestJS project to enable automatic API documentation through configuration in main.ts file.

### When to use?
Perform initial Swagger setup once when creating a new NestJS project or when adding API documentation to an existing project without Swagger.

### When NOT to use?
Skip if Swagger is already configured. Don't reconfigure unless changing documentation settings like title, version, or authentication schemes.

### Example
See configuration steps below for installing dependencies and configuring main.ts.

### Checklist
- [ ] @nestjs/swagger package installed
- [ ] DocumentBuilder configuration in main.ts
- [ ] SwaggerModule.setup() called with correct path
- [ ] Bearer auth added if using JWT
- [ ] Swagger accessible at /api/docs endpoint

### Troubleshooting
**Issue**: Package installation fails
**Solution**: Ensure compatible @nestjs/swagger version with your NestJS version. Check npm registry connectivity.

**Issue**: Swagger UI shows empty
**Solution**: Verify at least one controller with proper decorators exists and is registered.

### Best Practices
Configure Swagger early in project setup. Use semantic versioning for API version. Include comprehensive description. Add authentication schemes matching your API. Use consistent path (/api/docs is standard).

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

## [Document Controllers and Endpoints]()

Decorators to document REST endpoints including tags for grouping, operation descriptions, parameter definitions, and response specifications using NestJS Swagger decorators.

### When to use?
Apply controller-level decorators (@ApiTags, @ApiBearerAuth) to every controller and endpoint-level decorators (@ApiOperation, @ApiResponse, @ApiParam) to every route handler method for comprehensive API documentation.

### When NOT to use?
All controllers and endpoints should be documented - there are no exceptions. Even internal endpoints benefit from documentation for team clarity.

### Example
See complete controller example below with all necessary decorators for CRUD operations.

### Checklist
- [ ] @ApiTags on controller class
- [ ] @ApiBearerAuth if endpoints require authentication
- [ ] @ApiOperation on every endpoint with summary
- [ ] @ApiResponse for all possible status codes (200, 201, 400, 401, 404, etc.)
- [ ] @ApiParam for route parameters
- [ ] @ApiQuery for query string parameters
- [ ] @ApiBody for request body when needed

### Troubleshooting
**Issue**: Decorators not affecting Swagger UI
**Solution**: Ensure decorators are imported from @nestjs/swagger, not other packages. Restart server after adding decorators.

**Issue**: Response types showing as generic Object
**Solution**: Specify explicit type in @ApiResponse or @ApiOkResponse decorators.

### Best Practices
Add @ApiTags to group related endpoints logically. Write clear, concise summaries in @ApiOperation. Document all response codes including errors. Use @ApiParam for path parameters. Add meaningful descriptions. Keep decorators close to implementation for maintainability.

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

## [Document DTOs and Data Schemas]()

Data Transfer Objects annotation with @ApiProperty to generate accurate documentation of input and output schemas, including validation rules, examples, and field descriptions for comprehensive API contracts.

### When to use?
Add @ApiProperty decorator to every field in every DTO used for request bodies or responses to document field purpose, data types, validation constraints, and provide examples for API consumers.

### When NOT to use?
All DTO properties should be documented without exception. Even internal DTOs benefit from documentation for code clarity and maintenance.

### Example
See DTO examples below with @ApiProperty annotations including descriptions, examples, validation constraints, and enum types.

### Checklist
- [ ] @ApiProperty on every DTO field
- [ ] Description provided for each field
- [ ] Example value included
- [ ] Type explicitly specified
- [ ] Validation constraints documented (min, max, length)
- [ ] Required/optional status clear
- [ ] Enums properly defined with enum property
- [ ] PartialType used for update DTOs

### Troubleshooting
**Issue**: DTO fields not appearing in Swagger
**Solution**: Ensure @ApiProperty decorator is present. Verify DTO is used in controller method signature.

**Issue**: Examples not showing in Swagger UI
**Solution**: Add example property to @ApiProperty. Use realistic, valid data.

### Best Practices
Provide descriptive field descriptions. Use realistic examples matching production data format. Document all constraints matching class-validator decorators. Use PartialType for update DTOs to inherit properties. Keep validation rules synchronized between @ApiProperty and class-validator decorators.

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

## [Document Response Types and Status Codes]()

HTTP response format specification with explicit types, status codes, and data structures using @ApiResponse family decorators to document all possible endpoint outcomes.

### When to use?
Document every possible HTTP response for each endpoint including success responses (200, 201), client errors (400, 401, 404), and server errors (500) to provide complete API contract.

### When NOT to use?
All endpoints must document responses - don't skip this. Even if endpoint only returns 200, document it explicitly for clarity.

### Example
See response documentation examples below showing @ApiOkResponse, @ApiResponse with multiple status codes, and typed responses.

### Checklist
- [ ] Success responses documented (200, 201, 204)
- [ ] Client error responses documented (400, 401, 403, 404)
- [ ] Server error responses included when relevant (500)
- [ ] Response types specified with type parameter
- [ ] Array responses indicated with type: [EntityClass]
- [ ] Descriptions provided for each status code
- [ ] @ApiOkResponse used for standard 200 responses

### Troubleshooting
**Issue**: Response structure not showing correctly
**Solution**: Specify explicit type parameter. Use class entities, not interfaces.

**Issue**: Array responses showing as object
**Solution**: Use type: [EntityClass] syntax for array responses.

### Best Practices
Document all realistic response codes. Use @ApiOkResponse for 200 success. Specify explicit types for better documentation. Include error responses for client and server errors. Provide meaningful descriptions for each status code. Keep response documentation synchronized with actual implementation.

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
