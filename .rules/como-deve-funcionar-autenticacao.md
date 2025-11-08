# [Como deve funcionar a Autenticação?]()

> Guia completo sobre o sistema de autenticação JWT implementado no projeto.

## [Visão Geral]()

O projeto usa autenticação baseada em **JWT (JSON Web Tokens)** com as seguintes características:
- Login com email/senha
- Token JWT para requisições autenticadas
- Refresh automático do token
- Proteção global de rotas (opt-out com @Public())
- Isolamento de dados por usuário

## [Fluxo de Autenticação]()

```
1. Usuário faz signup  Hash senha  Salva no BD
2. Usuário faz login  Valida credenciais  Gera JWT
3. Cliente guarda token  Envia em todas requisições
4. Backend valida token  Extrai userId  Autoriza acesso
```

## [Componentes do Sistema]()

### [1. User Entity]()

```typescript
@Entity('users')
export class User extends SuperEntity {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  @Exclude() // Nunca retorna ao cliente
  passwordHash: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;
}
```

### [2. JWT Strategy]()

Valida o token JWT em cada requisição:

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
    // Valida se usuário ainda existe e está ativo
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, active: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // Retorna dados que serão injetados em req.user
    return {
      userId: user.id,
      email: user.email
    };
  }
}
```

### [3. Local Strategy (Login)]()

Valida credenciais de login:

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
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
  }
}
```

### [4. Auth Service]()

Lógica de autenticação:

```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Validar credenciais
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

  // Gerar token JWT
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

  // Registrar novo usuário
  async signup(signupDto: SignupDto) {
    // Hash da senha
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

Endpoints públicos de autenticação:

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Rota pública
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
    return req.user; // Dados do usuário logado
  }
}
```

## [Guards (Proteção de Rotas)]()

### [JWT Auth Guard (Global)]()

Aplicado globalmente, protege todas as rotas por padrão:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar se rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true; // Permitir acesso
    }

    // Validar JWT
    return super.canActivate(context);
  }
}
```

Registro global no `main.ts`:

```typescript
const reflector = app.get(Reflector);
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

### [Public Decorator]()

Marca rotas como públicas:

```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Uso:

```typescript
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // Rota pública, não requer JWT
}
```

## [Como Usar no Controller]()

### [Acessar Usuário Logado]()

```typescript
@Controller('products')
export class ProductController {
  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId; // ID do usuário logado
    return this.productService.findAll(userId);
  }

  @Post()
  create(@Body() dto: CreateProductDto, @Request() req) {
    return this.productService.create(dto, req.user.userId);
  }
}
```

### [Objeto req.user]()

Injetado automaticamente após validação JWT:

```typescript
{
  userId: number,
  email: string
}
```

## [Isolamento de Dados por Usuário]()

**Regra**: Todos os dados devem ser filtrados por `userId`

### [Service Exemplo]()

```typescript
@Injectable()
export class ProductService {
  async findAll(userId: number) {
    return await this.repository.find({
      where: { userId }, // Filtra por usuário
    });
  }

  async findOne(id: number, userId: number) {
    const product = await this.repository.findOne({
      where: { id, userId }, // Garante que pertence ao usuário
    });

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  async update(id: number, dto: any, userId: number) {
    // Validar ownership primeiro
    const product = await this.findOne(id, userId);

    Object.assign(product, dto);
    return await this.repository.save(product);
  }
}
```

## [Fluxo Completo de Requisição]()

### [1. Signup (Criar conta)]()

**Request**:
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123",
  "fullName": "João Silva"
}
```

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "João Silva"
}
```

### [2. Login]()

**Request**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

### [3. Requisição Autenticada]()

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
    "name": "Produto 1",
    "userId": 1
  }
]
```

## [Frontend: Como Implementar]()

### [1. Armazenar Token]()

Após login bem-sucedido:

```typescript
// Salvar no localStorage
localStorage.setItem('token', response.access_token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### [2. Enviar em Todas Requisições]()

Configurar Axios interceptor:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido/expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### [3. Proteger Rotas (React Router)]()

```typescript
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Uso
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
```

## [Variáveis de Ambiente]()

**.env**:
```env
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres
JWT_EXPIRATION=24h
```

**Importante**:
- Use chave longa e aleatória em produção
- Nunca commite o `.env` no git

## [Segurança]()

### [Boas Práticas Implementadas]()

1. **Senha hasheada com bcrypt**: Nunca salva senha em texto plano
2. **Token com expiração**: 24h por padrão
3. **Validação de usuário ativo**: Verifica em cada requisição
4. **Isolamento de dados**: Filtragem por userId
5. **@Exclude em passwordHash**: Nunca retorna senha ao cliente
6. **Global guard**: Todas rotas protegidas por padrão

### [Melhorias Possíveis]()

- [ ] Refresh tokens para renovação automática
- [ ] Rate limiting em /login
- [ ] Blacklist de tokens (logout real)
- [ ] 2FA (autenticação de dois fatores)
- [ ] OAuth (Google, GitHub, etc)

## [Troubleshooting]()

### [Token inválido/expirado]()

**Erro**: `401 Unauthorized`

**Solução**: Fazer login novamente

### [Usuário desativado]()

**Erro**: `401 Unauthorized`

**Causa**: Campo `active = false` no banco

### [Token não enviado]()

**Erro**: `401 Unauthorized`

**Causa**: Header Authorization ausente ou mal formatado

**Correto**: `Authorization: Bearer <token>`

## [Referências]()

- [JWT.io](https://jwt.io)
- [Passport.js Documentation](https://www.passportjs.org)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
