# What TypeScript patterns should be followed?

> Mandatory rules and best practices for TypeScript code in the project (backend and frontend).

## [Overview]()

This document defines the mandatory TypeScript patterns that must be followed in all project code, both backend (NestJS) and frontend (React). The goal is to ensure type-safe, maintainable, and high-quality code.

## [Rule #1: NEVER use the `any` type]()

**PROHIBITED** to use the `any` type in any part of the code.

### [Why avoid `any`?]()

- **Loses type safety**: TypeScript stops validating the code
- **Hinders maintenance**: No autocomplete or property validation
- **Hides errors**: Bugs only appear at runtime instead of compile-time
- **Propagates uncertainty**: `any` spreads through code like a virus
- **Nullifies TypeScript benefits**: Reverts to pure JavaScript

### [❌ NEVER do this]()

```typescript
// ❌ WRONG - Controller
@Post()
create(@Body() data: any) {  // NEVER accept any
  return this.service.create(data);
}

// ❌ WRONG - Service
async create(data: any) {  // NEVER use any in parameters
  return await this.repository.save(data);
}

// ❌ WRONG - Function
function processData(input: any): any {  // NEVER use any
  return input.someProperty;
}

// ❌ WRONG - Variable
const result: any = await api.get('/users');  // NEVER declare as any

// ❌ WRONG - Component props
interface Props {
  data: any;  // NEVER use any in props
  onClick: (item: any) => void;  // NEVER use any in callbacks
}

// ❌ WRONG - Array
const items: any[] = [];  // NEVER use array of any

// ❌ WRONG - Assertions
const user = response.data as any;  // NEVER use 'as any'
```

### [✅ Use correct alternatives]()

```typescript
// ✅ CORRECT - Use typed DTOs
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.service.create(createUserDto);
}

// ✅ CORRECT - Use interfaces or types
interface User {
  id: number;
  name: string;
  email: string;
}

async function getUser(id: number): Promise<User> {
  return await api.get(`/users/${id}`);
}

// ✅ CORRECT - Use generics when type is variable
function processData<T>(input: T): T {
  return input;
}

// ✅ CORRECT - Use unknown when type is truly unknown
function parseJSON(jsonString: string): unknown {
  return JSON.parse(jsonString);
}

// Then validate the type
const data = parseJSON(response);
if (isUser(data)) {  // Type guard
  console.log(data.name);  // Now TypeScript knows it's User
}

// ✅ CORRECT - Typed props
interface Props {
  user: User;
  onClick: (user: User) => void;
}

// ✅ CORRECT - Typed array
const users: User[] = [];

// ✅ CORRECT - Union types for varied types
type ApiResponse = User | Error | null;
```

### [When you think you need `any`]()

If you're thinking of using `any`, you probably need one of these alternatives:

| Situation | Instead of `any`, use |
|-----------|----------------------|
| Truly unknown type | `unknown` + type guards |
| Generic type | `<T>` generics |
| Multiple possible types | Union types: `string \| number` |
| Any object | `Record<string, unknown>` |
| REST parameters | `...args: T[]` |
| JSON parse | `unknown` + validation |
| Library without types | Create `.d.ts` file |
| API response | Create contract interface |

## [Rule #2: Always use `strict: true` in tsconfig.json]()

TypeScript strict mode must always be enabled.

### [Mandatory configuration]()

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

### [What `strict: true` enables]()

- `noImplicitAny`: Prohibits variables without defined type
- `strictNullChecks`: Null and undefined must be handled explicitly
- `strictFunctionTypes`: Strict validation of function types
- `strictBindCallApply`: Validates bind, call and apply
- `strictPropertyInitialization`: Class properties must be initialized
- `noImplicitThis`: `this` must have explicit type
- `alwaysStrict`: Adds 'use strict' to all files

## [Rule #3: Explicit typing in interfaces and types]()

Always define explicit types for properties, parameters, and returns.

### [❌ WRONG - Implicit or vague types]()

```typescript
// ❌ Properties without type
interface User {
  name;  // Implicit any type
  age;   // Implicit any type
}

// ❌ Too generic type
interface ButtonProps {
  variant?: string;  // Too vague
  onClick?: Function;  // Never use Function
}

// ❌ Implicit return
function calculate(a: number, b: number) {  // Inferred return
  return a + b;
}
```

### [✅ CORRECT - Explicit and specific types]()

```typescript
// ✅ Typed properties
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

// ✅ Union types for limited values
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// ✅ Explicit return
function calculate(a: number, b: number): number {
  return a + b;
}

// ✅ Async always returns Promise<T>
async function getUser(id: number): Promise<User> {
  return await api.get(`/users/${id}`);
}
```

## [Rule #4: Use `unknown` instead of `any` for unknown types]()

When the type is truly unknown, use `unknown` + type guards.

### [Difference between `any` and `unknown`]()

- `any`: Disables type checking (NEVER use)
- `unknown`: Safe type that requires validation before use

### [✅ Correct pattern with `unknown`]()

```typescript
// ✅ Receive unknown data
function parseJSON(jsonString: string): unknown {
  return JSON.parse(jsonString);
}

// ✅ Type guard to validate
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

// ✅ Usage with validation
const data: unknown = parseJSON(response);

if (isUser(data)) {
  // Here TypeScript knows data is User
  console.log(data.name);
  console.log(data.email);
} else {
  throw new Error('Invalid user data');
}
```

### [Common Type Guards]()

```typescript
// Type guard for object
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Type guard for array
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// Custom type guard
function isValidResponse(value: unknown): value is ApiResponse {
  return (
    isObject(value) &&
    'status' in value &&
    'data' in value
  );
}
```

## [Rule #5: Naming conventions for types and interfaces]()

Follow consistent conventions for type names.

### [Mandatory conventions]()

```typescript
// ✅ Interfaces: PascalCase, no 'I' prefix
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

// ❌ AVOID: 'I' prefix in interfaces
interface IUser {}  // Don't use 'I' prefix

// ❌ AVOID: snake_case or camelCase
type user_id = number;  // Wrong
type userId = number;   // Wrong (use type alias only when necessary)
```

## [Rule #6: Optional properties vs undefined]()

Use `?` for optional properties, not `| undefined`.

### [✅ CORRECT]()

```typescript
// ✅ Optional property
interface User {
  id: number;
  name: string;
  email?: string;  // Can be absent or be string
  phone?: string;
}

// ✅ Optional parameter
function greet(name: string, title?: string): string {
  return title ? `${title} ${name}` : name;
}
```

### [❌ WRONG]()

```typescript
// ❌ Don't use | undefined manually
interface User {
  email: string | undefined;  // Use email?: string
}

// ❌ Don't mix explicit undefined with optional
interface User {
  email?: string | undefined;  // Redundant
}
```

### [When to use `| null` vs `?`]()

```typescript
// ✅ Use '?' when property may not exist
interface User {
  nickname?: string;  // May be absent
}

// ✅ Use '| null' when property exists but can be null
interface User {
  deletedAt: Date | null;  // Always exists, but can be null
}
```

## [Rule #7: Generics for reusable code]()

Use generics instead of `any` for reusable functions and classes.

### [✅ Correct examples]()

```typescript
// ✅ Generic function
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstElement([1, 2, 3]);    // number | undefined
const str = firstElement(['a', 'b']);    // string | undefined

// ✅ Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = await api.get('/users/1');
const productsResponse: ApiResponse<Product[]> = await api.get('/products');

// ✅ Generic class
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

### [❌ NEVER use `any` when generics solve it]()

```typescript
// ❌ WRONG
function firstElement(arr: any[]): any {
  return arr[0];
}

// ✅ CORRECT
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

## [Rule #8: Type assertions with care]()

Use type assertions (`as`) only when absolutely necessary.

### [⚠️ Use sparingly]()

```typescript
// ✅ Acceptable: DOM element
const input = document.getElementById('email') as HTMLInputElement;

// ✅ Acceptable: API response validated externally
const user = response.data as User;  // Only if you're sure

// ❌ NEVER use 'as any'
const data = something as any;  // PROHIBITED

// ❌ AVOID: Use type guard instead
if (isUser(data)) {
  // Preferable to using 'as User'
}
```

### [Preferable alternative: Type guards]()

```typescript
// ✅ BETTER: Use type guard
function isHTMLInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.tagName === 'INPUT';
}

const element = document.getElementById('email');
if (element && isHTMLInputElement(element)) {
  console.log(element.value);  // TypeScript knows it's input
}
```

## [Rule #9: Readonly for immutability]()

Use `readonly` to prevent accidental mutations.

### [✅ Correct usage of readonly]()

```typescript
// ✅ Readonly property
interface User {
  readonly id: number;  // Cannot be changed after creation
  name: string;
}

const user: User = { id: 1, name: 'John' };
// user.id = 2;  // ❌ Compilation error

// ✅ Readonly array
function sum(numbers: readonly number[]): number {
  // numbers.push(10);  // ❌ Error: cannot modify
  return numbers.reduce((a, b) => a + b, 0);
}

// ✅ Complete readonly object
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

const config: Readonly<Config> = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};
// config.apiUrl = 'other';  // ❌ Error
```

## [Rule #10: Avoid double type assertion]()

Never use double assertion (`as unknown as Type`), this is a code smell.

### [❌ NEVER do this]()

```typescript
// ❌ Double assertion is a sign of bad design
const user = data as unknown as User;  // VERY WRONG

// ❌ If you need this, your code has problems
const element = event.target as unknown as HTMLInputElement;
```

### [✅ Correct solutions]()

```typescript
// ✅ Use type guard
if (isUser(data)) {
  // Now data is User
}

// ✅ Use runtime validation
const user = validateUser(data);  // Throws error if invalid

// ✅ Refactor code to not need assertion
```

## [TypeScript Patterns Checklist]()

When writing TypeScript code, check:

- [ ] No use of `any` in all code
- [ ] `strict: true` enabled in tsconfig.json
- [ ] All function parameters have explicit types
- [ ] All function returns have explicit types (especially async)
- [ ] Interfaces and types use PascalCase
- [ ] Optional properties use `?` instead of `| undefined`
- [ ] Use `unknown` instead of `any` for unknown types
- [ ] Type guards implemented to validate `unknown`
- [ ] Generics used for reusable code
- [ ] `readonly` used to prevent mutations
- [ ] Avoided use of `as any` and double assertions
- [ ] DTOs created for all API endpoints
- [ ] React component props fully typed

## [Tools to Ensure Quality]()

### [TypeScript ESLint Rules]()

Configure these rules in ESLint:

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

Add automatic verification before commits:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx"
  }
}
```

## [Additional Resources]()

For more information about typing in specific contexts, see:

- **DTO Validation**: [how-to-use-data-validation-api-backend.md](./how-to-use-data-validation-api-backend.md)
- **React Components**: [how-to-create-common-components-frontend.md](./how-to-create-common-components-frontend.md)
- **Use-Cases**: [how-to-create-use-case-backend.md](./how-to-create-use-case-backend.md)
- **TypeORM Entities**: [how-to-create-typeorm-entity-backend.md](./how-to-create-typeorm-entity-backend.md)

## [Penalties for Violation]()

Code that violates these rules:

1. **Will not pass code review**
2. **Will not be merged to main branch**
3. **May break the build if ESLint is configured**
4. **Compromises project quality and maintainability**

**IMPORTANT**: These rules are **mandatory** and non-negotiable. TypeScript only brings benefits when used correctly with strong typing.
