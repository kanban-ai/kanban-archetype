# Context

Esta pasta contém os React Contexts para gerenciamento de estado global.

## Convenção de nomenclatura

```
{nome}.context.tsx
```

## Estrutura

```
context/
├── hello-world.context.tsx
├── index.ts
└── README.md
```

## Estrutura de um Context

Cada arquivo de context deve conter:

1. **Interface de dados**: Define o formato do estado e ações
2. **createContext**: Cria o contexto
3. **Provider**: Componente que fornece o estado
4. **Hook personalizado**: Função para consumir o contexto

## Exemplo: HelloWorldContext

```typescript
// hello-world.context.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { HelloWorld, CreateHelloWorldDto } from '../types';
import { helloWorldService } from '../services';

// 1. Interface de dados
interface HelloWorldContextData {
  items: HelloWorld[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  createItem: (data: CreateHelloWorldDto) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  clearError: () => void;
}

// 2. Criar contexto
const HelloWorldContext = createContext<HelloWorldContextData>({} as HelloWorldContextData);

// 3. Provider
interface HelloWorldProviderProps {
  children: ReactNode;
}

export function HelloWorldProvider({ children }: HelloWorldProviderProps) {
  const [items, setItems] = useState<HelloWorld[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await helloWorldService.getAll();
      setItems(data);
    } catch {
      setError('Falha ao carregar.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createItem = useCallback(async (data: CreateHelloWorldDto) => {
    const newItem = await helloWorldService.create(data);
    setItems((prev) => [newItem, ...prev]);
  }, []);

  const deleteItem = useCallback(async (id: number) => {
    await helloWorldService.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <HelloWorldContext.Provider
      value={{ items, isLoading, error, fetchItems, createItem, deleteItem, clearError }}
    >
      {children}
    </HelloWorldContext.Provider>
  );
}

// 4. Hook personalizado
export function useHelloWorld(): HelloWorldContextData {
  const context = useContext(HelloWorldContext);

  if (!context) {
    throw new Error('useHelloWorld must be used within a HelloWorldProvider');
  }

  return context;
}
```

## Regras

1. **Um contexto por arquivo**: Separar responsabilidades
2. **Hook com validação**: Verificar se está dentro do Provider
3. **Funções com useCallback**: Evitar re-renders desnecessários
4. **Interface tipada**: Definir tipos para o estado e ações
5. **Exportar Provider e Hook**: Nunca exportar o Context diretamente

## Export no index.ts

```typescript
// index.ts
export * from './hello-world.context';
```

## Configuração no App.tsx

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelloWorldProvider } from './context';
import { HelloWorldPage } from './pages';

function App() {
  return (
    <HelloWorldProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/hello-world" element={<HelloWorldPage />} />
        </Routes>
      </BrowserRouter>
    </HelloWorldProvider>
  );
}
```

## Uso em Pages/Components

```typescript
// hello-world.page.tsx
import { useHelloWorld } from '../context';
import { HelloWorldCard, HelloWorldForm } from '../components';

export function HelloWorldPage() {
  const { items, isLoading, error, createItem, updateItem, deleteItem, clearError } = useHelloWorld();

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}

      <HelloWorldForm onSubmit={createItem} />

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        items.map((item) => (
          <HelloWorldCard
            key={item.id}
            item={item}
            onEdit={updateItem}
            onDelete={deleteItem}
          />
        ))
      )}
    </div>
  );
}
```

## Quando usar Context

| Cenário | Usar Context? |
|---------|---------------|
| Estado compartilhado entre páginas | ✅ Sim |
| CRUD com lista global | ✅ Sim |
| Autenticação | ✅ Sim |
| Tema (dark/light) | ✅ Sim |
| Estado de um único componente | ❌ Não (usar useState) |
| Dados de uma única página isolada | ❌ Não (usar useState) |
