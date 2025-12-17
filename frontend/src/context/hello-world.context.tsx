import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { HelloWorld, CreateHelloWorldDto, UpdateHelloWorldDto } from '../types';
import { helloWorldService } from '../services';

interface HelloWorldContextData {
  items: HelloWorld[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  createItem: (data: CreateHelloWorldDto) => Promise<void>;
  updateItem: (id: number, data: UpdateHelloWorldDto) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  clearError: () => void;
}

const HelloWorldContext = createContext<HelloWorldContextData>({} as HelloWorldContextData);

interface HelloWorldProviderProps {
  children: ReactNode;
}

export function HelloWorldProvider({ children }: HelloWorldProviderProps) {
  const [items, setItems] = useState<HelloWorld[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await helloWorldService.getAll();
      setItems(data);
    } catch {
      setError('Falha ao carregar items.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createItem = useCallback(async (data: CreateHelloWorldDto) => {
    setError(null);
    try {
      const newItem = await helloWorldService.create(data);
      setItems((prev) => [newItem, ...prev]);
    } catch {
      setError('Falha ao criar item.');
    }
  }, []);

  const updateItem = useCallback(async (id: number, data: UpdateHelloWorldDto) => {
    setError(null);
    try {
      const updated = await helloWorldService.update(id, data);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      setError('Falha ao atualizar item.');
    }
  }, []);

  const deleteItem = useCallback(async (id: number) => {
    setError(null);
    try {
      await helloWorldService.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError('Falha ao excluir item.');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <HelloWorldContext.Provider
      value={{
        items,
        isLoading,
        error,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
        clearError,
      }}
    >
      {children}
    </HelloWorldContext.Provider>
  );
}

export function useHelloWorld(): HelloWorldContextData {
  const context = useContext(HelloWorldContext);

  if (!context) {
    throw new Error('useHelloWorld must be used within a HelloWorldProvider');
  }

  return context;
}
