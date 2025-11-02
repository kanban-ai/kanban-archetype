# Como consumir a API no Frontend?

> Guia completo sobre como fazer requisições HTTP para a API usando Axios no React.

## Configuração do Axios

### 1. Criar instância configurada

**Arquivo**: `src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido/expirado - limpar dados locais
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Permitir que o componente lide com o redirecionamento
      // Não usar window.location.href aqui
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 2. Variável de ambiente

**.env**:
```env
VITE_API_URL=http://localhost:3000/api
```

## Criar Services

### Estrutura de Service

**Arquivo**: `src/services/product.service.ts`

```typescript
import api from './api';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  userId: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  stock: number;
}

export const ProductService = {
  // Listar todos
  async findAll(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  // Buscar por ID
  async findOne(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Criar
  async create(data: CreateProductDto): Promise<Product> {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  // Atualizar
  async update(id: number, data: Partial<CreateProductDto>): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  // Deletar
  async remove(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};

// NOTA: Este é apenas um exemplo de estrutura.
// Adapte conforme as necessidades específicas do seu projeto.
```

## Usar Services em Componentes

> **IMPORTANTE**: Todos os exemplos abaixo são apenas demonstrações de estrutura e padrões.
> Não contêm lógica de negócio específica. Adapte-os conforme as necessidades do seu projeto.

### Com useState e useEffect

```typescript
import { useState, useEffect } from 'react';
import { ProductService, Product } from '@/services/product.service';

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.findAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>R$ {product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Criar Item

> **Exemplo**: Demonstra apenas a estrutura. Adapte a validação e lógica conforme seu contexto.

```typescript
function ProductForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      await ProductService.create({
        name,
        price,
        stock: 0,
      });

      // Sucesso
      alert('Produto criado!');
      setName('');
      setPrice(0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
        required
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(+e.target.value)}
        placeholder="Preço"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar'}
      </button>
    </form>
  );
}
```

### Atualizar Item

> **Exemplo**: Estrutura básica de edição. Adapte conforme necessário.

```typescript
function EditProduct({ id }: { id: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const data = await ProductService.findOne(id);
    setProduct(data);
    setName(data.name);
    setPrice(data.price);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await ProductService.update(id, { name, price });
      alert('Produto atualizado!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar');
    }
  };

  if (!product) return <div>Carregando...</div>;

  return (
    <form onSubmit={handleUpdate}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(+e.target.value)}
      />

      <button type="submit">Atualizar</button>
    </form>
  );
}
```

### Deletar Item

> **Exemplo**: Padrão básico de exclusão. Adapte a confirmação conforme UX do projeto.

```typescript
const handleDelete = async (id: number) => {
  if (!confirm('Tem certeza?')) return;

  try {
    await ProductService.remove(id);
    // Recarregar lista
    await loadProducts();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Erro ao deletar');
  }
};
```

## Tratamento de Erros

### Estrutura de Erro da API

```typescript
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

### Função Helper

```typescript
export function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    const message = error.response.data.message;

    // Pode ser array de erros (validação)
    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message;
  }

  return 'Erro ao processar requisição';
}

// Uso
try {
  await ProductService.create(data);
} catch (err) {
  const message = getErrorMessage(err);
  alert(message);
}
```

## Custom Hook para API

### useApi Hook

```typescript
import { useState } from 'react';

export function useApi<T>(apiFunction: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro na requisição';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}

// Uso
function ProductList() {
  const { data: products, loading, error, execute } = useApi(
    ProductService.findAll
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {products?.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

## Paginação

```typescript
export const ProductService = {
  async findAll(page: number = 1, pageSize: number = 10) {
    const response = await api.get('/products', {
      params: { page, pageSize },
    });
    return response.data;
  },
};

// Uso
const [page, setPage] = useState(1);
const [products, setProducts] = useState([]);

const loadProducts = async () => {
  const data = await ProductService.findAll(page, 10);
  setProducts(data.data);
};

// Paginação
<button onClick={() => setPage(p => p - 1)}>Anterior</button>
<button onClick={() => setPage(p => p + 1)}>Próxima</button>
```

## Upload de Arquivos

```typescript
export const ProductService = {
  async uploadImage(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

// Uso
const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    await ProductService.uploadImage(productId, file);
    alert('Imagem enviada!');
  } catch (err) {
    alert('Erro ao enviar imagem');
  }
};
```

## Query Params

```typescript
export const ProductService = {
  async search(query: string, active?: boolean) {
    const response = await api.get('/products', {
      params: {
        search: query,
        active,
      },
    });
    return response.data;
  },
};

// Gera: /products?search=notebook&active=true
```

## React Suspense para Data Fetching

### Estrutura Básica com Suspense

```typescript
import { Suspense } from 'react';

// Resource pattern para Suspense
function wrapPromise<T>(promise: Promise<T>) {
  let status = 'pending';
  let result: T;
  let suspender = promise.then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      result = e;
    }
  );

  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw result;
      } else if (status === 'success') {
        return result;
      }
    },
  };
}

// Criar resource
function fetchProductResource(id: number) {
  return wrapPromise(ProductService.findOne(id));
}

// Componente que lê o resource
function ProductDetail({ resource }: { resource: ReturnType<typeof fetchProductResource> }) {
  const product = resource.read();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>Preço: R$ {product.price}</p>
    </div>
  );
}

// Componente pai com Suspense
function ProductPage({ productId }: { productId: number }) {
  const resource = fetchProductResource(productId);

  return (
    <Suspense fallback={<div>Carregando produto...</div>}>
      <ProductDetail resource={resource} />
    </Suspense>
  );
}
```

### Exemplo com ErrorBoundary

```typescript
import { Component, ReactNode, Suspense } from 'react';

// Error Boundary
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Uso combinado
function App() {
  return (
    <ErrorBoundary fallback={<div>Erro ao carregar dados</div>}>
      <Suspense fallback={<div>Carregando...</div>}>
        <ProductPage productId={1} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**NOTA**: Este é um exemplo educacional do padrão Suspense. Para produção, considere usar bibliotecas como React Query ou SWR que implementam este padrão de forma mais robusta.

## Cancelar Requisições

```typescript
import { useEffect, useState } from 'react';
import axios from 'axios';

function ProductList() {
  useEffect(() => {
    const source = axios.CancelToken.source();

    const loadProducts = async () => {
      try {
        const response = await api.get('/products', {
          cancelToken: source.token,
        });
        setProducts(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(err);
        }
      }
    };

    loadProducts();

    // Cleanup: cancela se componente desmontar
    return () => {
      source.cancel('Component unmounted');
    };
  }, []);
}
```

## Checklist

- [ ] Instância Axios configurada em `api.ts`
- [ ] Interceptor para token JWT
- [ ] Interceptor para erros 401
- [ ] Services organizados por domínio
- [ ] Tipos TypeScript para respostas
- [ ] Tratamento de erros em todos requests
- [ ] Loading states
- [ ] Feedback visual para usuário

## Referências

- [Axios Documentation](https://axios-http.com/docs/intro)
- [React + Axios Best Practices](https://blog.logrocket.com/how-to-make-http-requests-like-a-pro-with-axios/)
