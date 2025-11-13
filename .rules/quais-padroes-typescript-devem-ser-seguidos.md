# Quais padrões TypeScript devem ser seguidos?

> Regras e boas práticas obrigatórias para código TypeScript no projeto (backend e frontend).

## [Visão Geral]()

Este documento define os padrões obrigatórios de TypeScript que devem ser seguidos em todo o código do projeto, tanto backend (NestJS) quanto frontend (React). O objetivo é garantir código type-safe, manutenível e de alta qualidade.

## [Regra #1: NUNCA use o tipo `any`]()

**PROIBIDO** usar o tipo `any` em qualquer parte do código.

### [Por que evitar `any`?]()

- **Perde a segurança de tipos**: TypeScript deixa de validar o código
- **Dificulta manutenção**: Não há autocomplete ou validação de propriedades
- **Esconde erros**: Bugs só aparecem em runtime ao invés de compile-time
- **Propaga incerteza**: `any` se espalha pelo código como um vírus
- **Anula os benefícios do TypeScript**: Volta a ser JavaScript puro

### [❌ NUNCA faça isso]()

```typescript
// ❌ ERRADO - Controller
@Post()
create(@Body() data: any) {  // NUNCA aceite any
  return this.service.create(data);
}

// ❌ ERRADO - Service
async create(data: any) {  // NUNCA use any em parâmetros
  return await this.repository.save(data);
}

// ❌ ERRADO - Função
function processData(input: any): any {  // NUNCA use any
  return input.someProperty;
}

// ❌ ERRADO - Variável
const result: any = await api.get('/users');  // NUNCA declare como any

// ❌ ERRADO - Props de componente
interface Props {
  data: any;  // NUNCA use any em props
  onClick: (item: any) => void;  // NUNCA use any em callbacks
}

// ❌ ERRADO - Array
const items: any[] = [];  // NUNCA use array de any

// ❌ ERRADO - Assertions
const user = response.data as any;  // NUNCA use 'as any'
```

### [✅ Use alternativas corretas]()

```typescript
// ✅ CORRETO - Use DTOs tipados
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.service.create(createUserDto);
}

// ✅ CORRETO - Use interfaces ou types
interface User {
  id: number;
  name: string;
  email: string;
}

async function getUser(id: number): Promise<User> {
  return await api.get(`/users/${id}`);
}

// ✅ CORRETO - Use generics quando o tipo é variável
function processData<T>(input: T): T {
  return input;
}

// ✅ CORRETO - Use unknown quando o tipo é realmente desconhecido
function parseJSON(jsonString: string): unknown {
  return JSON.parse(jsonString);
}

// Depois valide o tipo
const data = parseJSON(response);
if (isUser(data)) {  // Type guard
  console.log(data.name);  // Agora TypeScript sabe que é User
}

// ✅ CORRETO - Props tipadas
interface Props {
  user: User;
  onClick: (user: User) => void;
}

// ✅ CORRETO - Array tipado
const users: User[] = [];

// ✅ CORRETO - Union types para tipos variados
type ApiResponse = User | Error | null;
```

### [Quando você pensa que precisa de `any`]()

Se você está pensando em usar `any`, provavelmente precisa de uma destas alternativas:

| Situação | Ao invés de `any`, use |
|----------|------------------------|
| Tipo realmente desconhecido | `unknown` + type guards |
| Tipo genérico | `<T>` generics |
| Múltiplos tipos possíveis | Union types: `string \| number` |
| Qualquer objeto | `Record<string, unknown>` |
| Parâmetros REST | `...args: T[]` |
| JSON parse | `unknown` + validação |
| Biblioteca sem tipos | Crie arquivo `.d.ts` |
| Resposta de API | Crie interface do contrato |

## [Regra #2: Sempre use `strict: true` no tsconfig.json]()

O modo strict do TypeScript deve estar sempre habilitado.

### [Configuração obrigatória]()

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### [O que o `strict: true` habilita]()

- `noImplicitAny`: Proíbe variáveis sem tipo definido
- `strictNullChecks`: Null e undefined devem ser tratados explicitamente
- `strictFunctionTypes`: Validação estrita de tipos de funções
- `strictBindCallApply`: Valida bind, call e apply
- `strictPropertyInitialization`: Propriedades de classe devem ser inicializadas
- `noImplicitThis`: `this` deve ter tipo explícito
- `alwaysStrict`: Adiciona 'use strict' em todos os arquivos

## [Regra #3: Tipagem explícita em interfaces e types]()

Sempre defina tipos explícitos para propriedades, parâmetros e retornos.

### [❌ ERRADO - Tipos implícitos ou vagos]()

```typescript
// ❌ Propriedades sem tipo
interface User {
  name;  // Tipo implícito any
  age;   // Tipo implícito any
}

// ❌ Tipo muito genérico
interface ButtonProps {
  variant?: string;  // Muito vago
  onClick?: Function;  // Nunca use Function
}

// ❌ Retorno implícito
function calculate(a: number, b: number) {  // Retorno inferido
  return a + b;
}
```

### [✅ CORRETO - Tipos explícitos e específicos]()

```typescript
// ✅ Propriedades tipadas
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

// ✅ Union types para valores limitados
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// ✅ Retorno explícito
function calculate(a: number, b: number): number {
  return a + b;
}

// ✅ Async sempre retorna Promise<T>
async function getUser(id: number): Promise<User> {
  return await api.get(`/users/${id}`);
}
```

## [Regra #4: Use `unknown` ao invés de `any` para tipos desconhecidos]()

Quando o tipo é realmente desconhecido, use `unknown` + type guards.

### [Diferença entre `any` e `unknown`]()

- `any`: Desabilita verificação de tipos (NUNCA use)
- `unknown`: Tipo seguro que requer validação antes de usar

### [✅ Padrão correto com `unknown`]()

```typescript
// ✅ Receber dado desconhecido
function parseJSON(jsonString: string): unknown {
  return JSON.parse(jsonString);
}

// ✅ Type guard para validar
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

// ✅ Uso com validação
const data: unknown = parseJSON(response);

if (isUser(data)) {
  // Aqui TypeScript sabe que data é User
  console.log(data.name);
  console.log(data.email);
} else {
  throw new Error('Invalid user data');
}
```

### [Type Guards comuns]()

```typescript
// Type guard para objeto
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Type guard para array
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// Type guard customizado
function isValidResponse(value: unknown): value is ApiResponse {
  return (
    isObject(value) &&
    'status' in value &&
    'data' in value
  );
}
```

## [Regra #5: Nomenclatura de tipos e interfaces]()

Siga convenções consistentes para nomes de tipos.

### [Convenções obrigatórias]()

```typescript
// ✅ Interfaces: PascalCase, sem prefixo 'I'
interface User {}
interface CreateUserDto {}
interface UserRepository {}

// ✅ Types: PascalCase
type UserId = number;
type UserRole = 'admin' | 'user' | 'guest';
type ApiResponse<T> = { data: T; status: number };

// ✅ Enums: PascalCase
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

// ❌ EVITE: Prefixo 'I' em interfaces
interface IUser {}  // Não use prefixo 'I'

// ❌ EVITE: snake_case ou camelCase
type user_id = number;  // Errado
type userId = number;   // Errado (use type alias apenas quando necessário)
```

## [Regra #6: Propriedades opcionais vs undefined]()

Use `?` para propriedades opcionais, não `| undefined`.

### [✅ CORRETO]()

```typescript
// ✅ Propriedade opcional
interface User {
  id: number;
  name: string;
  email?: string;  // Pode estar ausente ou ser string
  phone?: string;
}

// ✅ Parâmetro opcional
function greet(name: string, title?: string): string {
  return title ? `${title} ${name}` : name;
}
```

### [❌ ERRADO]()

```typescript
// ❌ Não use | undefined manualmente
interface User {
  email: string | undefined;  // Use email?: string
}

// ❌ Não misture undefined explícito com opcional
interface User {
  email?: string | undefined;  // Redundante
}
```

### [Quando usar `| null` vs `?`]()

```typescript
// ✅ Use '?' quando a propriedade pode não existir
interface User {
  nickname?: string;  // Pode estar ausente
}

// ✅ Use '| null' quando a propriedade existe mas pode ser nula
interface User {
  deletedAt: Date | null;  // Sempre existe, mas pode ser null
}
```

## [Regra #7: Generics para código reutilizável]()

Use generics ao invés de `any` para funções e classes reutilizáveis.

### [✅ Exemplos corretos]()

```typescript
// ✅ Função genérica
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstElement([1, 2, 3]);    // number | undefined
const str = firstElement(['a', 'b']);    // string | undefined

// ✅ Interface genérica
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = await api.get('/users/1');
const productsResponse: ApiResponse<Product[]> = await api.get('/products');

// ✅ Classe genérica
class Repository<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }
}

const userRepo = new Repository<User>();
const productRepo = new Repository<Product>();
```

### [❌ NUNCA use `any` quando generics resolve]()

```typescript
// ❌ ERRADO
function firstElement(arr: any[]): any {
  return arr[0];
}

// ✅ CORRETO
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

## [Regra #8: Type assertions com cuidado]()

Use type assertions (`as`) apenas quando absolutamente necessário.

### [⚠️ Use com moderação]()

```typescript
// ✅ Aceitável: Elemento DOM
const input = document.getElementById('email') as HTMLInputElement;

// ✅ Aceitável: API response validada externamente
const user = response.data as User;  // Apenas se você tem certeza

// ❌ NUNCA use 'as any'
const data = something as any;  // PROIBIDO

// ❌ EVITE: Use type guard ao invés
if (isUser(data)) {
  // Preferível a usar 'as User'
}
```

### [Alternativa preferível: Type guards]()

```typescript
// ✅ MELHOR: Use type guard
function isHTMLInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.tagName === 'INPUT';
}

const element = document.getElementById('email');
if (element && isHTMLInputElement(element)) {
  console.log(element.value);  // TypeScript sabe que é input
}
```

## [Regra #9: Readonly para imutabilidade]()

Use `readonly` para prevenir mutações acidentais.

### [✅ Uso correto de readonly]()

```typescript
// ✅ Propriedade readonly
interface User {
  readonly id: number;  // Não pode ser alterado após criação
  name: string;
}

const user: User = { id: 1, name: 'John' };
// user.id = 2;  // ❌ Erro de compilação

// ✅ Array readonly
function sum(numbers: readonly number[]): number {
  // numbers.push(10);  // ❌ Erro: não pode modificar
  return numbers.reduce((a, b) => a + b, 0);
}

// ✅ Objeto readonly completo
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

const config: Readonly<Config> = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};
// config.apiUrl = 'other';  // ❌ Erro
```

## [Regra #10: Evite type assertion duplo]()

Nunca use double assertion (`as unknown as Type`), isso é code smell.

### [❌ NUNCA faça isso]()

```typescript
// ❌ Double assertion é sinal de design ruim
const user = data as unknown as User;  // MUITO ERRADO

// ❌ Se você precisa disso, seu código tem problemas
const element = event.target as unknown as HTMLInputElement;
```

### [✅ Soluções corretas]()

```typescript
// ✅ Use type guard
if (isUser(data)) {
  // Agora data é User
}

// ✅ Use validação runtime
const user = validateUser(data);  // Lança erro se inválido

// ✅ Refatore o código para não precisar de assertion
```

## [Checklist de Padrões TypeScript]()

Ao escrever código TypeScript, verifique:

- [ ] Nenhum uso de `any` em todo o código
- [ ] `strict: true` habilitado no tsconfig.json
- [ ] Todos os parâmetros de função têm tipos explícitos
- [ ] Todos os retornos de função têm tipos explícitos (especialmente async)
- [ ] Interfaces e types usam PascalCase
- [ ] Propriedades opcionais usam `?` ao invés de `| undefined`
- [ ] Use `unknown` ao invés de `any` para tipos desconhecidos
- [ ] Type guards implementados para validar `unknown`
- [ ] Generics usados para código reutilizável
- [ ] `readonly` usado para prevenir mutações
- [ ] Evitado uso de `as any` e double assertions
- [ ] DTOs criados para todos os endpoints da API
- [ ] Props de componentes React totalmente tipadas

## [Ferramentas para Garantir Qualidade]()

### [ESLint Rules TypeScript]()

Configure estas regras no ESLint:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### [Pre-commit Hook]()

Adicione verificação automática antes de commits:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx"
  }
}
```

## [Recursos Adicionais]()

Para mais informações sobre tipagem em contextos específicos, consulte:

- **Validação de DTOs**: [como-usar-validacao-de-dados-api-backend.md](./como-usar-validacao-de-dados-api-backend.md)
- **Componentes React**: [como-criar-componentes-comum-frontend.md](./como-criar-componentes-comum-frontend.md)
- **Use-Cases**: [como-criar-use-case-backend.md](./como-criar-use-case-backend.md)
- **TypeORM Entities**: [como-criar-uma-entity-typeorm-backend.md](./como-criar-uma-entity-typeorm-backend.md)

## [Penalidades por Violação]()

Código que violar estas regras:

1. **Não passará no code review**
2. **Não será mergeado para a branch principal**
3. **Pode quebrar o build se ESLint estiver configurado**
4. **Compromete a qualidade e manutenibilidade do projeto**

**IMPORTANTE**: Estas regras são **obrigatórias** e não negociáveis. TypeScript só traz benefícios quando usado corretamente com tipagem forte.
