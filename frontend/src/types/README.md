# Types

Esta pasta contém as definições de tipos TypeScript da aplicação.

## Convenção de nomenclatura

```
{nome}.type.ts
```

## Estrutura

```
types/
├── hello-world.type.ts
├── user.type.ts
├── index.ts
└── README.md
```

## Exemplo de arquivo

```typescript
// user.type.ts

export interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}
```

## Regras

1. **Um arquivo por domínio**: Agrupe tipos relacionados no mesmo arquivo
2. **Sempre exportar no index.ts**: Facilita imports
3. **Usar `interface`**: Preferir `interface` sobre `type` para objetos
4. **Sufixo `Dto`**: Para objetos de transferência (create, update)
5. **Datas como `string`**: APIs retornam datas como ISO strings

## Export no index.ts

```typescript
// index.ts
export * from './user.type';
export * from './hello-world.type';
```

## Uso

```typescript
import type { User, CreateUserDto } from '@/types';
```
