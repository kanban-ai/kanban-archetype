# How to version APIs in the Backend

> Complete guide to implement REST API versioning in the backend using NestJS.

## [Why version REST APIs in the backend]()

This section explains the critical importance of API versioning to maintain backward compatibility and allow evolution without breaking existing clients.

REST API versioning in NestJS is **essential** to avoid breaking integrations and allow controlled evolution:

1. **Don't break existing integrations**: Old clients continue working
2. **Evolve contracts**: Add/remove fields without impact
3. **Multiple simultaneous versions**: Support legacy and new clients
4. **Gradual migration**: Give clients time to migrate
5. **Professionalism**: Demonstrates development maturity

### When to use?

Use API versioning from the start when building production REST APIs that external clients or frontend applications will consume. Always implement versioning when you expect the API to evolve over time with potential breaking changes to contracts, data structures, or business logic.

### When NOT to use?

Don't use API versioning for internal microservices that communicate within the same deployment boundary, throwaway prototypes, or single-use scripts. Also avoid versioning for APIs that will never have external consumers or when complete control over all clients exists.

### Example

```typescript
// main.ts - Enable versioning globally
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(3000);
}
```

### Checklist

- [ ] Versioning enabled in main.ts with VersioningType.URI
- [ ] All controllers have explicit version decorators
- [ ] Folder structure organized by version (v1/, v2/)
- [ ] Swagger documentation separated by version
- [ ] CHANGELOG documenting API changes between versions

### Troubleshooting

**Issue**: Routes not accessible after enabling versioning
**Solution**: Ensure all controllers have explicit `@Version()` decorator or set defaultVersion in enableVersioning configuration.

**Issue**: Swagger documentation not showing versioned routes
**Solution**: Create separate DocumentBuilder configurations for each version and use the include option to specify controllers per version.

### Best Practices

- Always start with v1 even for the first version to establish versioning pattern from the beginning
- Use URL versioning (VersioningType.URI) for clarity and ease of debugging over header or query parameter versioning
- Maintain at least two versions simultaneously during transition periods with minimum 6-month deprecation window

## [When to create a new REST API version]()

Criteria to decide when to increment the API version in NestJS:

### [✅ Version when:]()

- **Contract change**: Remove/rename fields
- **Behavior change**: Different logic for the same route
- **Breaking changes**: Any change that breaks existing clients
- **From the start**: Always begin with `/v1/` even if it's the first version

### [❌ Don't need to version when:]()

- **Adding new optional fields**: Doesn't break clients
- **Adding new endpoints**: Doesn't affect existing routes
- **Bug fixes**: Maintains the contract
- **Performance improvements**: Doesn't change external behavior

### When to use?

Create a new API version when introducing breaking changes such as removing or renaming fields, changing response structures, modifying authentication mechanisms, or altering business logic that affects existing endpoints. Version increment is necessary when backward compatibility cannot be maintained.

### When NOT to use?

Don't increment version when adding optional fields, creating new endpoints, fixing bugs, improving performance, or making internal refactoring that doesn't affect external API contracts. These changes are backward compatible and can be safely deployed without versioning.

### Example

```typescript
// Scenario requiring new version: Changing response structure
// V1: Returns array directly
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Get()
  findAll() {
    return [{ id: 1, name: 'John' }];
  }
}

// V2: Returns with pagination (breaking change)
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  @Get()
  findAll() {
    return { data: [{ id: 1, name: 'John' }], pagination: { page: 1 } };
  }
}
```

### Checklist

- [ ] Identified breaking changes requiring new version
- [ ] Verified if changes can be made backward compatible
- [ ] Documented changes in CHANGELOG with migration guide
- [ ] Both versions tested and working simultaneously
- [ ] Deprecation notice added to old version

### Troubleshooting

**Issue**: Unsure if change requires new version
**Solution**: If existing clients will break or need code changes to work, it's a breaking change requiring new version. Test with actual client integration.

**Issue**: Too many versions accumulating
**Solution**: Establish deprecation policy with sunset dates. Remove versions after 6-12 month transition period once client migration is complete.

### Best Practices

- Document all breaking changes with before/after examples in CHANGELOG
- Provide migration guides showing how to upgrade from old version to new version
- Communicate version changes to API consumers well in advance with clear deprecation timeline

## [REST API Versioning Strategies]()

Comparison of main strategies for versioning REST APIs in NestJS:

### [1. URL Versioning (Recommended) ⭐]()

Version in the URL is the **simplest and clearest** approach.

```
GET /api/v1/users
GET /api/v2/users
```

**Advantages**:
- ✅ Easy to understand and debug
- ✅ Testable in browser
- ✅ Clear Swagger documentation
- ✅ HTTP caching works well
- ✅ NestJS has native support

**Disadvantages**:
- ❌ Different URLs for same functionality

### [2. Header Versioning]()

Version in HTTP header.

```
GET /api/users
Accept: application/vnd.api.v1+json
```

**Advantages**:
- ✅ Clean URL
- ✅ Follows REST standards

**Disadvantages**:
- ❌ Harder to test
- ❌ Less discoverable
- ❌ HTTP caching can be problematic

### [3. Query Parameter Versioning]()

Version as parameter.

```
GET /api/users?version=1
```

**Advantages**:
- ✅ Simple to implement

**Disadvantages**:
- ❌ Mixes version with query params
- ❌ Less professional
- ❌ Not recommended

## [URL Versioning Implementation in NestJS]()

Complete guide to implement URL versioning in NestJS using VersioningType.URI:

### [Step 1: Enable global versioning in main.ts]()

**File**: `src/main.ts`

```typescript
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Enable URL versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Default version if not specified
  });

  // ... rest of configuration

  await app.listen(3000);
}
bootstrap();
```

### [Step 2: Apply versioning to NestJS Controllers]()

**Option A: Version on entire Controller**

```typescript
import { Controller, Get, Version } from '@nestjs/common';

@Controller('users')
export class UsersController {
  // Route: GET /api/v1/users
  @Get()
  @Version('1')
  findAllV1() {
    return { version: 'v1', users: [] };
  }

  // Route: GET /api/v2/users
  @Get()
  @Version('2')
  findAllV2() {
    return {
      version: 'v2',
      data: [], // different structure
      pagination: { page: 1, total: 0 }
    };
  }
}
```

**Option B: Separate Controller per version** (Recommended)

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

### [Step 3: Organize folder structure by version in the project]()

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

### [Step 4: Register multiple Controller versions in Module]()

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

## [Complete Example of API Evolution from V1 to V2]()

Practical example showing how to evolve an API while maintaining compatibility:

### [V1: Initial API structure]()

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
    // Returns array directly
    return this.service.findAll();
  }
}
```

**Response V1**:
```json
[
  { "id": 1, "name": "John", "email": "john@email.com" },
  { "id": 2, "name": "Mary", "email": "mary@email.com" }
]
```

### [V2: Evolved structure with pagination and breaking changes]()

```typescript
// v2/dto/create-user.dto.ts
export class CreateUserDtoV2 {
  @ApiProperty()
  @IsString()
  firstName: string; // Split name into firstName/lastName

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string; // New field
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
    // Returns with pagination
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
      "firstName": "John",
      "lastName": "Silva",
      "email": "john@email.com",
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

## [Share code between API versions using patterns]()

Techniques to reuse code between V1 and V2 without duplication:

### [Adapter Pattern to convert DTOs between versions]()

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
    // Convert V2 to V1 (internal structure)
    const userV1: CreateUserDtoV1 = {
      name: `${dto.firstName} ${dto.lastName}`,
      email: dto.email,
    };

    const user = this.repository.create(userV1);
    return await this.repository.save(user);
  }
}
```

### [Shared base Service with inheritance between versions]()

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
    return users; // Returns array directly
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

## [Swagger documentation separated by API version]()

How to configure multiple Swagger instances for each API version:

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger V1
  const configV1 = new DocumentBuilder()
    .setTitle('API V1')
    .setDescription('API V1 - Legacy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentV1 = SwaggerModule.createDocument(app, configV1, {
    include: [UsersV1Controller], // Include only V1 controllers
  });
  SwaggerModule.setup('api/docs/v1', app, documentV1);

  // Swagger V2
  const configV2 = new DocumentBuilder()
    .setTitle('API V2')
    .setDescription('API V2 - Current')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const documentV2 = SwaggerModule.createDocument(app, configV2, {
    include: [UsersV2Controller], // Include only V2 controllers
  });
  SwaggerModule.setup('api/docs/v2', app, documentV2);

  await app.listen(3000);
}
```

**Access**:
- Swagger V1: `http://localhost:3000/api/docs/v1`
- Swagger V2: `http://localhost:3000/api/docs/v2`

## [Deprecation strategy for old API versions]()

How to deprecate old versions professionally and give clients time:

### [1. Warn about deprecation using HTTP headers]()

```typescript
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Get()
  @ApiOperation({
    summary: 'List users',
    deprecated: true, // Mark as deprecated in Swagger
  })
  @ApiResponse({
    status: 200,
    description: 'DEPRECATED: Use /api/v2/users',
    headers: {
      'X-API-Warn': {
        description: 'API will be discontinued on 2026-01-01',
        schema: { type: 'string' }
      }
    }
  })
  findAll(@Res() res: Response) {
    // Warning header
    res.setHeader('X-API-Warn', 'API v1 will be discontinued on 2026-01-01. Migrate to v2.');
    res.setHeader('X-API-Deprecation-Date', '2026-01-01');
    res.setHeader('X-API-Sunset', '2026-06-01'); // Removal date

    return res.json(this.service.findAll());
  }
}
```

### [2. Disable and remove old version after transition period]()

```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '2', // New default version
});

// Remove UsersV1Controller from Module after transition period
```

## [Best Practices when versioning REST APIs in NestJS]()

Essential recommendations for professional API versioning:

### [1. Always start with v1 from the beginning]()

```typescript
// ❌ Wrong
@Controller('users')
export class UsersController {}

// ✅ Correct
@Controller({ path: 'users', version: '1' })
export class UsersController {}
```

### [2. Document changes between versions in CHANGELOG]()

Create `CHANGELOG-API.md` file:

```markdown
## V2 (2025-11-02)

### Breaking Changes
- `name` was split into `firstName` and `lastName`
- `GET /users` now returns pagination instead of direct array

### Additions
- `phone` field added

### Migration Guide
- V1: `{ name: "John Silva" }`
- V2: `{ firstName: "John", lastName: "Silva" }`
```

### [3. Increment major version only for breaking changes]()

- **v1 → v2**: Breaking change (different structure)
- **v1.1**: Add optional field (doesn't break)
- **v1.2**: New endpoint (doesn't break)

### [4. Maintain support for at least 2 simultaneous versions]()

- **v1**: Legacy version (deprecated)
- **v2**: Current version (recommended)
- **v3**: Beta version (optional)

### [5. Define minimum transition period of 6 months]()

Give at least **6 months** between:
1. New version release
2. Old version deprecation
3. Old version removal

## [Frontend: How to consume versioned APIs with Axios]()

React frontend configuration to work with versioned APIs:

```typescript
// src/config/api.config.ts
import axios from 'axios';

const API_VERSION = 'v2'; // Centralize the version

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Usage
api.get('/users'); // calls /api/v2/users
```


## [API Versioning Checklist in NestJS]()

Verification checklist to ensure complete versioning implementation:

- [ ] Versioning enabled in main.ts
- [ ] Controllers always with explicit version (start with v1)
- [ ] Swagger separated by version
- [ ] Folder structure organized (v1/, v2/)
- [ ] CHANGELOG-API.md documenting changes
- [ ] Deprecation headers configured
- [ ] Frontend using centralized version
- [ ] Tests for each version
- [ ] Transition period defined (minimum 6 months)

## [Troubleshooting - Common API versioning problems]()

Solutions for frequent errors when implementing versioning in NestJS:

### [Fix error: Cannot GET /api/users]()

```typescript
// Make sure you have version defined
@Controller({ path: 'users', version: '1' })
export class UsersController {}

// And versioning enabled
app.enableVersioning({
  type: VersioningType.URI,
});
```

### [Fix Swagger not showing API versions]()

```typescript
// Use include in SwaggerModule.createDocument
const document = SwaggerModule.createDocument(app, config, {
  include: [UsersV1Controller], // Include explicitly
});
```

### [Fix problem with defaultVersion not working]()

```typescript
// defaultVersion only works if controller doesn't specify version
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1', // Used only if controller has no @Version
});
```

## [References and official documentation on API versioning]()

Links to official NestJS documentation and API versioning best practices:

- [NestJS Versioning](https://docs.nestjs.com/techniques/versioning)
- [API Versioning Best Practices](https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/)
- [HTTP Sunset Header](https://datatracker.ietf.org/doc/html/rfc8594)

---

**Golden rule**: Always use versioning from the start (v1), even if you don't plan to create v2 in the future. It's better to have v1 and never need v2, than to have no versioning and need to make a breaking change.
