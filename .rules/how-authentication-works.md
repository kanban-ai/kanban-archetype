# How Authentication Works

> Complete guide explaining JWT-based authentication system, token validation, user isolation, and secure request handling in the project.

## [JWT-Based Authentication System Overview]()

The project implements JWT-based authentication providing secure, stateless user verification with automatic token refresh, global route protection via opt-out decorators, and complete data isolation ensuring users can only access their own resources.

### When to use?
Use JWT authentication for all user-facing applications including web frontends, mobile apps, and single-page applications where users need to login with credentials. Apply this pattern when you need stateless authentication with automatic session management and user identity tracking across requests.

### When NOT to use?
Do not use JWT for service-to-service integrations, webhooks, or automated scripts where there is no end-user login flow. For these scenarios, use API Key authentication instead. Avoid JWT for public endpoints that should be accessible without authentication.

### Checklist
- [ ] User entity with email, passwordHash, and active fields properly configured
- [ ] JWT_SECRET and JWT_EXPIRATION environment variables set in .env file
- [ ] JWT Strategy validates token and checks user active status
- [ ] Local Strategy validates login credentials with bcrypt comparison
- [ ] Auth Service implements signup, login, and validateUser methods
- [ ] Auth Controller exposes public /login and /signup endpoints
- [ ] Global JwtAuthGuard registered in main.ts with Reflector
- [ ] Public decorator applied to login and signup routes

### Troubleshooting

**401 Unauthorized errors**: Check if token is being sent in Authorization header with Bearer prefix. Verify JWT_SECRET matches between signup and validation. Ensure user account is active in database.

**Token expired errors**: User needs to login again to get a new token. Consider implementing refresh token mechanism for better UX.

**Password validation failing**: Ensure bcrypt is used for both hashing during signup and comparison during login. Check password is not being hashed twice.

### Best Practices

- Use bcrypt with salt rounds of 10 or higher for password hashing security
- Set appropriate JWT expiration times balancing security and user experience
- Never expose passwordHash in API responses by using @Exclude decorator
- Implement global guards with opt-out pattern using Public decorator for better security
- Always filter database queries by userId to ensure data isolation between users

## [Authentication Flow Sequence]()

Step-by-step authentication process from user signup through credential validation to JWT token generation and verification. The flow ensures secure password hashing, token-based session management, and automatic user data injection into request context for authorization.

### When to use?
Follow this flow for implementing complete authentication lifecycle in new applications or when adding authentication to existing projects. Use this sequence to understand request/response patterns for signup, login, and authenticated endpoint access.

### When NOT to use?
This flow does not apply to public endpoints marked with @Public decorator, API Key authenticated endpoints, or server-to-server communications that bypass user authentication entirely.

### Example

```
1. User signs up → Hash password → Save in DB
2. User logs in → Validate credentials → Generate JWT
3. Client stores token → Send in all requests
4. Backend validates token → Extract userId → Authorize access
```

### Checklist
- [ ] Signup endpoint hashes password with bcrypt before saving to database
- [ ] Login endpoint validates credentials and returns JWT token with user data
- [ ] Frontend stores JWT token in localStorage or secure cookie
- [ ] Frontend includes Authorization Bearer token in all authenticated requests
- [ ] Backend validates JWT on each request and injects user data into req.user
- [ ] Expired tokens trigger 401 response and redirect to login

### Troubleshooting

**Signup fails with duplicate key error**: Email already exists in database. Return user-friendly error message about duplicate email.

**Login returns 401 even with correct password**: Check if user.active is false in database. Inactive users should not be able to login.

**Token validation fails intermittently**: Ensure JWT_SECRET is consistent across all application instances and not changing between deployments.

### Best Practices

- Return user data along with access_token in login response for immediate use
- Implement token expiration handling on frontend with automatic redirect to login
- Use HTTPS in production to prevent token interception during transmission
- Consider implementing refresh token mechanism for improved user experience

## [System Components]()

Core architectural components implementing authentication including User entity, JWT strategy for token validation, Local strategy for login, Auth service for credential verification, and Auth controller exposing public endpoints. Each component has specific responsibilities following separation of concerns.

### [1. User Entity]()

```typescript
@Entity('users')
export class User extends SuperEntity {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  @Exclude() // Never return to client
  passwordHash: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;
}
```

### [2. JWT Strategy]()

Validates the JWT token on each request:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Validate if user still exists and is active
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, active: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // Return data that will be injected into req.user
    return {
      userId: user.id,
      email: user.email
    };
  }
}
```

### [3. Local Strategy (Login)]()

Validates login credentials:

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
```

### [4. Auth Service]()

Authentication logic:

```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Validate credentials
  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !user.active) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  // Generate JWT token
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // Register new user
  async signup(signupDto: SignupDto) {
    // Hash password
    const passwordHash = await bcrypt.hash(signupDto.password, 10);

    const user = this.userRepository.create({
      email: signupDto.email,
      name: signupDto.fullName,
      passwordHash,
    });

    await this.userRepository.save(user);

    const { passwordHash: _, ...result } = user;
    return result;
  }
}
```

### [5. Auth Controller]()

Public authentication endpoints:

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Public route
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('me')
  async getProfile(@Request() req) {
    return req.user; // Logged user data
  }
}
```

## [Guards (Route Protection)]()

Global guard implementation using NestJS guard system with JWT validation and Public decorator for opt-out pattern. Guards intercept every request to verify authentication tokens before allowing access to protected routes, ensuring application-wide security by default.

### [JWT Auth Guard (Global)]()

Applied globally, protects all routes by default:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true; // Allow access
    }

    // Validate JWT
    return super.canActivate(context);
  }
}
```

Global registration in `main.ts`:

```typescript
const reflector = app.get(Reflector);
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

### [Public Decorator]()

Marks routes as public:

```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Usage:

```typescript
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // Public route, doesn't require JWT
}
```

## [How to Access Authenticated User in Controllers]()

Practical patterns for accessing authenticated user data in controllers and services using Request object injection. The framework automatically injects user information after successful JWT validation, enabling secure data isolation and user-specific operations throughout the application.

### When to use?
Access req.user in controllers whenever you need to identify which user is making the request for data isolation, authorization checks, or audit logging. Use this pattern in all protected endpoints that require user-specific operations.

### When NOT to use?
Do not access req.user in public endpoints marked with @Public decorator as it will be undefined. Do not use req.user for API Key authenticated endpoints where user context may not exist.

### Example

### [Access Logged User]()

```typescript
@Controller('products')
export class ProductController {
  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId; // Logged user ID
    return this.productService.findAll(userId);
  }

  @Post()
  create(@Body() dto: CreateProductDto, @Request() req) {
    return this.productService.create(dto, req.user.userId);
  }
}
```

### [req.user Object]()

Automatically injected after JWT validation:

```typescript
{
  userId: number,
  email: string
}
```

### Checklist
- [ ] Controller method includes @Request() req parameter to access user data
- [ ] Pass req.user.userId to service methods for data filtering
- [ ] Validate user ownership before update or delete operations
- [ ] Use req.user for audit logging of user actions

### Troubleshooting

**req.user is undefined**: Endpoint may be marked as @Public or JWT validation failed. Check if token is being sent correctly.

**TypeScript errors with req.user**: Create a proper type definition extending Request interface with user property.

### Best Practices

- Always pass userId to service methods explicitly rather than passing entire req object
- Create custom decorators like @CurrentUser() to extract user data cleanly
- Validate resource ownership in service layer before performing operations
- Use req.user.userId for all database queries to enforce data isolation

## [Data Isolation per User Implementation]()

Critical security pattern ensuring all database queries are filtered by authenticated userId to prevent unauthorized data access. This isolation layer guarantees users can only view, modify, or delete their own resources, implementing proper multi-tenant security architecture.

### When to use?
Implement data isolation in all service methods that access user-specific resources to prevent unauthorized cross-user data access. Apply this pattern in multi-tenant applications where each user should only see their own data.

### When NOT to use?
Do not apply user filtering to admin endpoints that need to access all users' data, or to shared resources that are intentionally accessible across users. Public data that is not user-specific does not require userId filtering.

### Example

### [Service Example]()

```typescript
@Injectable()
export class ProductService {
  async findAll(userId: number) {
    return await this.repository.find({
      where: { userId }, // Filter by user
    });
  }

  async findOne(id: number, userId: number) {
    const product = await this.repository.findOne({
      where: { id, userId }, // Ensure it belongs to user
    });

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  async update(id: number, dto: any, userId: number) {
    // Validate ownership first
    const product = await this.findOne(id, userId);

    Object.assign(product, dto);
    return await this.repository.save(product);
  }
}
```

### Checklist
- [ ] All find operations include userId in where clause
- [ ] Update operations validate ownership before modifying data
- [ ] Delete operations confirm user owns the resource being deleted
- [ ] Service methods accept userId as parameter from controller
- [ ] Related entities are filtered by userId through proper joins

### Troubleshooting

**User can see other users' data**: Missing userId filter in repository query. Always include userId in where clause.

**404 errors for valid resources**: User trying to access resource that belongs to another user. This is correct behavior for data isolation.

**Performance issues with userId filtering**: Ensure database index exists on userId column for efficient queries.

### Best Practices

- Always validate ownership before update or delete operations to prevent unauthorized modifications
- Include userId in all database indexes for columns frequently queried together
- Create custom repository methods that automatically include userId filtering
- Use TypeORM query builder with andWhere for complex queries requiring userId filtering
- Throw NotFoundException instead of Unauthorized when resource not found for user to avoid information disclosure

## [Complete Request Flow]()

End-to-end HTTP request examples demonstrating signup, login, and authenticated requests with real payloads and responses. These examples show proper header formatting, token usage, and expected response structures for successful authentication workflows.

### [1. Signup (Create account)]()

**Request**:
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Silva"
}
```

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Silva"
}
```

### [2. Login]()

**Request**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Silva"
  }
}
```

### [3. Authenticated Request]()

**Request**:
```http
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Product 1",
    "userId": 1
  }
]
```

## [Frontend JWT Authentication Implementation]()

Frontend integration guide covering token storage, automatic token injection via Axios interceptors, error handling for expired tokens, and protected route implementation with React Router. These patterns ensure seamless client-side authentication experience.

### When to use?
Implement these frontend patterns in React applications consuming JWT-authenticated APIs. Use Axios interceptors for automatic token injection in all requests and protected routes for securing authenticated pages.

### When NOT to use?
Do not store JWT tokens in localStorage for highly sensitive applications requiring enhanced security. Consider secure HTTP-only cookies instead. These patterns are specific to React Router and Axios; adapt for other frameworks.

### Example

### [1. Store Token]()

After successful login:

```typescript
// Save to localStorage
localStorage.setItem('token', response.access_token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### [2. Send in All Requests]()

Configure Axios interceptor:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Invalid/expired token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### [3. Protect Routes (React Router)]()

```typescript
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Usage
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
```

### Checklist
- [ ] Axios instance configured with baseURL from environment variable
- [ ] Request interceptor adds Authorization Bearer token to all requests
- [ ] Response interceptor handles 401 errors by clearing token and redirecting
- [ ] Login response stores both access_token and user data in localStorage
- [ ] PrivateRoute component checks for token before rendering protected pages
- [ ] Logout function clears token from localStorage and redirects to login

### Troubleshooting

**Token not being sent in requests**: Check if Axios interceptor is registered before making API calls. Verify token is stored correctly in localStorage.

**Infinite redirect loop on login page**: PrivateRoute should not wrap the login page itself. Only protect authenticated routes.

**401 errors after token expires**: Implement token refresh mechanism or show user-friendly message to login again.

### Best Practices

- Clear token and user data immediately on 401 response to prevent stale authentication state
- Use environment variables for API URL to support different environments
- Implement loading state while checking authentication in PrivateRoute
- Consider using React Context for sharing authentication state across components
- Add token expiration check on frontend before making requests to improve UX

## [Environment Variables]()

Required environment configuration for JWT authentication including secret key generation, token expiration settings, and security best practices. Proper environment variable management is critical for production security and token validation consistency.

**.env**:
```env
JWT_SECRET=your-secret-key-here-minimum-32-characters
JWT_EXPIRATION=24h
```

**Important**:
- Use long and random key in production
- Never commit `.env` to git

## [Security]()

Comprehensive security measures implemented including bcrypt password hashing, token expiration, active user validation, data isolation by userId, and password exclusion from responses. Additional improvements like refresh tokens and rate limiting are discussed for enhanced protection.

### [Implemented Best Practices]()

1. **Password hashed with bcrypt**: Never save plain text password
2. **Token with expiration**: 24h by default
3. **Active user validation**: Check on each request
4. **Data isolation**: Filtering by userId
5. **@Exclude on passwordHash**: Never return password to client
6. **Global guard**: All routes protected by default

### [Possible Improvements]()

- [ ] Refresh tokens for automatic renewal
- [ ] Rate limiting on /login
- [ ] Token blacklist (real logout)
- [ ] 2FA (two-factor authentication)
- [ ] OAuth (Google, GitHub, etc)

## [Troubleshooting]()

Common authentication error scenarios and solutions including invalid tokens, disabled users, missing authorization headers, and proper token format. These troubleshooting patterns help diagnose and resolve authentication failures quickly.

### [Invalid/expired token]()

**Error**: `401 Unauthorized`

**Solution**: Login again

### [Disabled user]()

**Error**: `401 Unauthorized`

**Cause**: Field `active = false` in database

### [Token not sent]()

**Error**: `401 Unauthorized`

**Cause**: Authorization header missing or malformed

**Correct**: `Authorization: Bearer <token>`

## [References]()

External documentation links for JWT specification, Passport.js authentication middleware, and NestJS security guidelines. These resources provide deeper understanding of authentication concepts and implementation patterns used in the project.

- [JWT.io](https://jwt.io)
- [Passport.js Documentation](https://www.passportjs.org)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
