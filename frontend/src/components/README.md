# Components

Esta pasta contém componentes reutilizáveis da aplicação.

## Convenção de nomenclatura

```
{nome}.component.tsx
```

## Estrutura

```
components/
├── hello-world.component.tsx
├── user-card.component.tsx
├── user-form.component.tsx
├── index.ts
└── README.md
```

## Exemplo de componente

```typescript
// user-card.component.tsx
import type { User } from '../types';

interface UserCardProps {
  user: User;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {user.active ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      <p className="text-gray-600 mb-3">{user.email}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(user.id)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
```

## Exemplo de componente de formulário

```typescript
// user-form.component.tsx
import { useState } from 'react';
import type { CreateUserDto } from '../types';

interface UserFormProps {
  onSubmit: (data: CreateUserDto) => void;
  isLoading?: boolean;
}

export function UserForm({ onSubmit, isLoading }: UserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name, email, password: '123456' });
    setName('');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg">
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
```

## Regras

1. **Função exportada**: Usar `export function`, não `export default`
2. **Interface de Props**: Definir interface para props do componente
3. **Import type**: Usar `import type` para tipos
4. **Sem lógica de negócio**: Componentes são apenas UI
5. **Reutilizável**: Componente deve ser genérico e reutilizável
6. **TailwindCSS**: Usar classes do Tailwind para estilização

## Export no index.ts

```typescript
// index.ts
export * from './user-card.component';
export * from './user-form.component';
export * from './hello-world.component';
```

## Uso

```typescript
import { UserCard, UserForm } from '@/components';
```
