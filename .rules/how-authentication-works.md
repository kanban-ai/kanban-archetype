# How Authentication Works

> Complete guide explaining JWT-based authentication system, token validation, user isolation, and secure request handling in the project.

## [Overview]()

The project implements JWT-based authentication providing secure, stateless user verification with automatic token refresh, global route protection via opt-out decorators, and complete data isolation ensuring users can only access their own resources.

## [Authentication Flow]()

Step-by-step authentication process from user signup through credential validation to JWT token generation and verification. The flow ensures secure password hashing, token-based session management, and automatic user data injection into request context for authorization.

```
1. User signs up → Hash password → Save in DB
2. User logs in → Validate credentials → Generate JWT
3. Client stores token → Send in all requests
4. Backend validates token → Extract userId → Authorize access
```

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

## [How to Use in Controller]()

Practical patterns for accessing authenticated user data in controllers and services using Request object injection. The framework automatically injects user information after successful JWT validation, enabling secure data isolation and user-specific operations throughout the application.

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

## [Data Isolation per User]()

Critical security pattern ensuring all database queries are filtered by authenticated userId to prevent unauthorized data access. This isolation layer guarantees users can only view, modify, or delete their own resources, implementing proper multi-tenant security architecture.

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

## [Frontend: How to Implement]()

Frontend integration guide covering token storage, automatic token injection via Axios interceptors, error handling for expired tokens, and protected route implementation with React Router. These patterns ensure seamless client-side authentication experience.

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
