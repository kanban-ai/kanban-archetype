# Services

Esta pasta contém os serviços de comunicação com a API.

## Convenção de nomenclatura

```
{nome}.service.ts
```

## Estrutura

```
services/
├── api.ts                 # Instância do axios configurada
├── hello-world.service.ts
├── user.service.ts
├── index.ts
└── README.md
```

## Arquivo api.ts

Configuração base do axios:

```typescript
// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

## Exemplo de service

```typescript
// user.service.ts
import api from './api';
import type { User, CreateUserDto, UpdateUserDto } from '../types';

const ENDPOINT = '/v1/users';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<User> {
    const response = await api.get<User>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>(ENDPOINT, data);
    return response.data;
  },

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const response = await api.patch<User>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
```

## Regras

1. **ENDPOINT com versão**: Incluir `/v1/` no endpoint
2. **Tipagem completa**: Tipar parâmetros e retornos
3. **Import type**: Usar `import type` para tipos
4. **Objeto exportado**: Usar objeto ao invés de classe
5. **Métodos async**: Todos os métodos devem ser async

## Export no index.ts

```typescript
// index.ts
export { default as api } from './api';
export * from './user.service';
export * from './hello-world.service';
```

## Uso

```typescript
import { userService } from '@/services';

const users = await userService.getAll();
```
