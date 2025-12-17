# Pages

Esta pasta contém as páginas da aplicação (rotas completas).

## Convenção de nomenclatura

```
{nome}.page.tsx
```

## Estrutura

```
pages/
├── hello-world.page.tsx
├── users.page.tsx
├── user-detail.page.tsx
├── index.ts
└── README.md
```

## Exemplo de página

```typescript
// users.page.tsx
import { useState, useEffect, useCallback } from 'react';
import type { User, CreateUserDto, UpdateUserDto } from '../types';
import { userService } from '../services';
import { UserCard, UserForm } from '../components';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError('Falha ao carregar usuários.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (data: CreateUserDto) => {
    try {
      setIsCreating(true);
      const newUser = await userService.create(data);
      setUsers((prev) => [newUser, ...prev]);
    } catch (err) {
      setError('Falha ao criar usuário.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async (id: number, data: UpdateUserDto) => {
    try {
      const updated = await userService.update(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError('Falha ao atualizar usuário.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este usuário?')) return;
    try {
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError('Falha ao excluir usuário.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 font-bold">
              X
            </button>
          </div>
        )}

        <UserForm onSubmit={handleCreate} isLoading={isCreating} />

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-600">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={(id) => handleEdit(id, {})}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Regras

1. **Função exportada**: Usar `export function`, não `export default`
2. **Sufixo Page**: Nome deve terminar com `Page`
3. **Estado local**: Gerenciar estado com `useState`
4. **Chamadas à API**: Usar services para comunicação
5. **Usar components**: Compor página com componentes reutilizáveis
6. **Tratamento de erro**: Exibir mensagens de erro ao usuário
7. **Estados de loading**: Mostrar feedback durante carregamento

## Export no index.ts

```typescript
// index.ts
export * from './users.page';
export * from './user-detail.page';
export * from './hello-world.page';
```

## Registro de rotas (App.tsx)

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UsersPage, HelloWorldPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/hello-world" element={<HelloWorldPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Diferença entre Pages e Components

| Aspecto | Pages | Components |
|---------|-------|------------|
| Propósito | Rota completa | UI reutilizável |
| Estado | Gerencia estado da página | Recebe props |
| API | Chama services | Não chama services |
| Roteamento | Registrada no Router | Não tem rota |
| Composição | Usa components | Usado por pages |
