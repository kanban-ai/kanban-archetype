# [What TypeScript Patterns Should Be Followed?]()

> Mandatory rules and best practices for TypeScript code in the project (backend and frontend).

## [Overview - TypeScript Mandatory Patterns and Best Practices]()

This document defines the mandatory TypeScript patterns that must be followed in all project code, both backend (NestJS) and frontend (React). The goal is to ensure type-safe, maintainable, and high-quality code.

## [Rule #1: NEVER Use the `any` Type]()

The use of the `any` type is strictly prohibited throughout the codebase. This rule eliminates type safety, hinders code maintenance, hides runtime errors, and nullifies TypeScript's benefits. Use typed alternatives like interfaces, generics, or `unknown` with type guards instead to maintain full compile-time type checking.

### When to use?

Never use the `any` type. This section exists to document what NOT to do. There are no valid use cases for `any` in this codebase. Always use properly typed alternatives like interfaces, type aliases, generics, or `unknown` with type guards for type-safe code that maintains compile-time type checking and IDE autocomplete.

### When NOT to use?

Never use `any` in any situation including function parameters, return types, variable declarations, array types, generic constraints, type assertions, DTO properties, API responses, callbacks, React component props, or any other TypeScript type annotation. There are always better typed alternatives for every scenario.

### Checklist

- [ ] No `any` type in function parameters
- [ ] No `any` type in return types
- [ ] No `any` type in variable declarations
- [ ] No `any[]` array types
- [ ] No `as any` type assertions
- [ ] Use interfaces or types instead of `any`
- [ ] Use generics for reusable type-safe code
- [ ] Use `unknown` with type guards for truly unknown data

### Troubleshooting

**Problem**: TypeScript complains about unknown types from external libraries
**Solution**: Install @types package for the library, create custom .d.ts declaration file, or use `unknown` with proper type guards instead of resorting to `any`

**Problem**: Complex type inference too difficult to express
**Solution**: Break down complex types into smaller interfaces, use utility types like Pick/Omit/Partial, leverage generic constraints, or explicitly define the type structure

### Best Practices

- Use `unknown` instead of `any` when type is truly unknown
- Create interfaces or type aliases for structured data
- Leverage generics for reusable type-safe functions
- Use union types for multiple possible types
- Implement type guards to validate unknown data
- Configure ESLint rule `@typescript-eslint/no-explicit-any: error`

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

## [Rule #2: Always Use `strict: true` in tsconfig.json]()

TypeScript strict mode must be enabled in all projects to enforce the highest level of type safety. This configuration activates critical checks including noImplicitAny, strictNullChecks, strictFunctionTypes, and others that prevent common type-related bugs and ensure code quality through comprehensive compile-time validation.

### When to use?

Always use strict mode in all TypeScript projects without exception. Enable it from project initialization for new projects, and enable it incrementally for legacy projects. Strict mode is mandatory for all backend (NestJS) and frontend (React) code to ensure maximum type safety and catch potential bugs at compile time.

### When NOT to use?

There are no situations where strict mode should be disabled. While migrating legacy JavaScript to TypeScript, you may temporarily disable strict mode, but you must create a migration plan to enable it. Never disable strict mode permanently or for production code.

### Example

```json
// tsconfig.json - Mandatory strict configuration
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Checklist

- [ ] `strict: true` enabled in tsconfig.json
- [ ] `noUnusedLocals: true` configured
- [ ] `noUnusedParameters: true` configured
- [ ] `noImplicitReturns: true` configured
- [ ] `noFallthroughCasesInSwitch: true` configured
- [ ] No compiler errors after enabling strict mode
- [ ] All implicit any errors resolved

### Troubleshooting

**Problem**: Hundreds of errors after enabling strict mode
**Solution**: Enable strict flags incrementally one at a time, start with noImplicitAny, fix all errors before enabling next flag, use TypeScript's incremental compilation to speed up fixes

**Problem**: Third-party library types causing strict mode errors
**Solution**: Install latest @types packages, create custom type declarations in .d.ts files, use module augmentation to extend library types, or wrap library with typed facade

### Best Practices

- Enable strict mode from day one in new projects
- Configure all additional strict flags beyond base strict mode
- Use ESLint TypeScript rules to enforce strict patterns
- Review and fix strict mode violations immediately
- Never use @ts-ignore to bypass strict mode errors
- Document any legitimate @ts-expect-error with explanation
- Understand what strict mode enables (noImplicitAny, strictNullChecks, strictFunctionTypes, etc)

## [Rule #3: Explicit Typing in Interfaces and Types]()

All interfaces, types, function parameters, and return values must have explicit type declarations. Avoid implicit typing and vague types like `string` for values with limited options. Use union types, specific interfaces, and explicit return type annotations for clarity and type safety preventing runtime errors through compile-time validation.

### When to use?

Always use explicit typing for all function parameters, return types, interface properties, type aliases, class properties, and variable declarations when type cannot be clearly inferred. Use union types for limited value sets, explicit return annotations for all functions, and specific interfaces instead of generic object types.

### When NOT to use?

Implicit typing is acceptable only when TypeScript can clearly infer the type from the value assignment (e.g., `const count = 5` clearly infers number). Avoid explicit typing for obvious primitives in variable initialization, but always be explicit for function parameters and returns.

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

### Checklist

- [ ] All function parameters have explicit types
- [ ] All function return types are explicitly declared
- [ ] Interface properties have specific types, not vague types
- [ ] Union types used for limited value sets instead of string
- [ ] Async functions return Promise<T> with explicit type
- [ ] No implicit any from missing type annotations
- [ ] Avoid Function type, use specific function signatures

### Troubleshooting

**Problem**: TypeScript infers wrong type from complex expressions
**Solution**: Add explicit type annotation to variable or return type, break complex expressions into smaller typed steps, use type assertions only when absolutely certain of the type

**Problem**: Union type too complex or hard to maintain
**Solution**: Extract union to named type alias, use enum for related constants, consider using discriminated unions with type field for better type narrowing

### Best Practices

- Always declare return types for functions, especially async functions
- Use union types ('a' | 'b' | 'c') instead of generic string for limited values
- Use specific event types (React.MouseEvent) instead of generic Event
- Prefer interface over type for object shapes (better error messages)
- Use type for unions, intersections, and utility types
- Document complex types with JSDoc comments for better IDE hints

## [Rule #4: Use `unknown` Instead of `any` for Unknown Types]()

When dealing with truly unknown data types (like JSON parsing or external APIs), use the `unknown` type combined with type guards for validation. Unlike `any`, `unknown` forces you to validate the type before use, maintaining type safety while handling unpredictable data sources.

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

## [Rule #5: Naming Conventions for Types and Interfaces]()

All TypeScript types, interfaces, and enums must follow PascalCase naming convention without prefixes like 'I'. This ensures consistency across the codebase and aligns with modern TypeScript best practices. Type aliases should only be used when necessary for clarity or reusability.

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

## [Rule #6: Optional Properties vs Undefined]()

Use the optional property syntax (`?`) for properties that may be absent, rather than explicitly adding `| undefined`. Reserve `| null` for properties that always exist but can have a null value. This distinction clarifies whether a property might not exist versus explicitly being set to null.

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

## [Rule #7: Generics for Reusable Code]()

Leverage TypeScript generics to create reusable, type-safe functions, classes, and interfaces instead of resorting to the `any` type. Generics preserve type information across function boundaries, enabling code reusability while maintaining full type checking and IntelliSense support for different data types.

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

## [Rule #8: Type Assertions with Care]()

Type assertions using the `as` keyword should be used sparingly and only when you have external knowledge about a type that TypeScript cannot infer. Never use `as any` or double assertions (`as unknown as Type`). Prefer type guards and runtime validation over assertions for better type safety.

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

## [Rule #9: Readonly for Immutability]()

Apply the `readonly` modifier to properties and parameters that should not be modified after initialization. This prevents accidental mutations, improves code predictability, and makes your intentions explicit. Use `Readonly<T>` utility type for complete object immutability and readonly arrays to prevent array mutations.

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

## [Rule #10: Avoid Double Type Assertion]()

Double type assertions like `as unknown as Type` are strictly prohibited as they indicate fundamental design problems in your code. This pattern bypasses TypeScript's type system completely and creates a false sense of type safety. Refactor your code structure or use proper type guards instead.

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

This comprehensive checklist ensures your TypeScript code follows all mandatory patterns and best practices. Use it before submitting code for review to verify compliance with type safety requirements, naming conventions, and architectural standards for both backend and frontend code.

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

Configure automated tools to enforce TypeScript patterns and catch violations early in the development cycle. ESLint rules and pre-commit hooks prevent non-compliant code from reaching the repository, ensuring consistent quality across all contributions and reducing code review overhead.

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

For context-specific TypeScript patterns and detailed implementation examples in DTOs, entities, components, and use-cases, refer to these related documentation files that provide practical guidance for applying these typing rules in real-world scenarios.

For more information about typing in specific contexts, see:

- **DTO Validation**: [how-to-use-data-validation-api-backend.md](./how-to-use-data-validation-api-backend.md)
- **React Components**: [how-to-create-common-components-frontend.md](./how-to-create-common-components-frontend.md)
- **Use-Cases**: [how-to-create-use-case-backend.md](./how-to-create-use-case-backend.md)
- **TypeORM Entities**: [how-to-create-typeorm-entity-backend.md](./how-to-create-typeorm-entity-backend.md)

## [Penalties for Violation]()

TypeScript pattern violations are treated seriously as they compromise code quality, maintainability, and type safety across the entire project. Code that does not comply with these mandatory rules will be rejected during review and must be corrected before merging to protect the codebase integrity.

Code that violates these rules:

1. **Will not pass code review**
2. **Will not be merged to main branch**
3. **May break the build if ESLint is configured**
4. **Compromises project quality and maintainability**

**IMPORTANT**: These rules are **mandatory** and non-negotiable. TypeScript only brings benefits when used correctly with strong typing.
