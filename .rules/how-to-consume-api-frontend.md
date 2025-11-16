# [How to consume the API in Frontend?]()

> Complete guide on how to make HTTP requests to the API using Axios in React.

## [Axios Configuration]()

Configure a centralized Axios instance with interceptors for JWT authentication and error handling. This configuration will be reused in all application services.

### [1. Create configured instance]()

**File**: `src/services/api.ts`

```typescript
import axios from 'axios';

// API version (centralize here)
const API_VERSION = 'v1';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Invalid/expired token - clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Allow component to handle redirection
      // Don't use window.location.href here
    }

    return Promise.reject(error);
  }
);

export default api;
```

### [2. Environment variable]()

**.env**:
```env
VITE_API_URL=http://localhost:3000/api
```

> **IMPORTANT**: The API version (`v1`) is configured in `api.ts` and automatically applied to all requests. If the backend creates a v2, just change `API_VERSION = 'v2'` in one place. See [How to version API](./how-to-version-api-backend.md) for more details.

## [Create Services]()

Organize API calls in separate services by domain. Each service encapsulates communication logic with specific endpoints, including complete TypeScript typing for requests and responses.

### [Service Structure]()

**File**: `src/services/product.service.ts`

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
  // List all
  async findAll(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  // Find by ID
  async findOne(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Create
  async create(data: CreateProductDto): Promise<Product> {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  // Update
  async update(id: number, data: Partial<CreateProductDto>): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  // Delete
  async remove(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};

// NOTE: This is just a structure example.
// Adapt according to your project's specific needs.
```

## [Use Services in Components]()

Consume services in React components using hooks like useState and useEffect to manage loading states, data and errors. Implement appropriate visual feedback for each request state.

> **IMPORTANT**: All examples below are only structure and pattern demonstrations.
> They don't contain specific business logic. Adapt them according to your project needs.

### [With useState and useEffect]()

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
      setError(err.response?.data?.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>$ {product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### [Create Item]()

> **Example**: Demonstrates only the structure. Adapt validation and logic according to your context.

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

      // Success
      alert('Product created!');
      setName('');
      setPrice(0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating product');
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
        placeholder="Name"
        required
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(+e.target.value)}
        placeholder="Price"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### [Update Item]()

> **Example**: Basic edit structure. Adapt as needed.

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
      alert('Product updated!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating');
    }
  };

  if (!product) return <div>Loading...</div>;

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

      <button type="submit">Update</button>
    </form>
  );
}
```

### [Delete Item]()

> **Example**: Basic deletion pattern. Adapt confirmation according to project UX.

```typescript
const handleDelete = async (id: number) => {
  if (!confirm('Are you sure?')) return;

  try {
    await ProductService.remove(id);
    // Reload list
    await loadProducts();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error deleting');
  }
};
```

## [Error Handling]()

Implement consistent API error handling. Extract error messages from backend and present clear feedback to user, considering that validation errors may return arrays of messages.

### [API Error Structure]()

```typescript
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

### [Helper Function]()

```typescript
export function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    const message = error.response.data.message;

    // May be array of errors (validation)
    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message;
  }

  return 'Error processing request';
}

// Usage
try {
  await ProductService.create(data);
} catch (err) {
  const message = getErrorMessage(err);
  alert(message);
}
```

## [Custom Hook for API]()

Create custom hooks to reuse HTTP request logic. A generic hook centralizes loading, data and error states, simplifying component code.

### [useApi Hook]()

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
      const message = err.response?.data?.message || 'Request error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}

// Usage
function ProductList() {
  const { data: products, loading, error, execute } = useApi(
    ProductService.findAll
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products?.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

## [Pagination]()

Implement result pagination by passing page and size parameters in queries. Manage current page state in component to navigate between pages.

```typescript
export const ProductService = {
  async findAll(page: number = 1, pageSize: number = 10) {
    const response = await api.get('/products', {
      params: { page, pageSize },
    });
    return response.data;
  },
};

// Usage
const [page, setPage] = useState(1);
const [products, setProducts] = useState([]);

const loadProducts = async () => {
  const data = await ProductService.findAll(page, 10);
  setProducts(data.data);
};

// Pagination
<button onClick={() => setPage(p => p - 1)}>Previous</button>
<button onClick={() => setPage(p => p + 1)}>Next</button>
```

## [File Upload]()

For file uploads, use FormData and configure Content-Type header as multipart/form-data. Axios automatically manages the correct request format.

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

// Usage
const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    await ProductService.uploadImage(productId, file);
    alert('Image uploaded!');
  } catch (err) {
    alert('Error uploading image');
  }
};
```

## [Query Params]()

Pass query parameters using Axios params property. Parameters are automatically serialized and appended to URL.

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

// Generates: /products?search=notebook&active=true
```

## [React Suspense for Data Fetching]()

Use React Suspense for declarative data loading. This pattern allows separating loading logic from component, creating a cleaner and more composable interface.

### [Basic Structure with Suspense]()

```typescript
import { Suspense } from 'react';

// Resource pattern for Suspense
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

// Create resource
function fetchProductResource(id: number) {
  return wrapPromise(ProductService.findOne(id));
}

// Component that reads resource
function ProductDetail({ resource }: { resource: ReturnType<typeof fetchProductResource> }) {
  const product = resource.read();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: $ {product.price}</p>
    </div>
  );
}

// Parent component with Suspense
function ProductPage({ productId }: { productId: number }) {
  const resource = fetchProductResource(productId);

  return (
    <Suspense fallback={<div>Loading product...</div>}>
      <ProductDetail resource={resource} />
    </Suspense>
  );
}
```

### [Example with ErrorBoundary]()

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

// Combined usage
function App() {
  return (
    <ErrorBoundary fallback={<div>Error loading data</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductPage productId={1} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**NOTE**: This is an educational example of the Suspense pattern. For production, consider using libraries like React Query or SWR that implement this pattern more robustly.

## [Cancel Requests]()

Cancel ongoing requests when component unmounts to avoid memory leaks and state updates on unmounted components. Use Axios CancelToken in useEffect cleanup.

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

    // Cleanup: cancel if component unmounts
    return () => {
      source.cancel('Component unmounted');
    };
  }, []);
}
```

## [Checklist]()

Implementation checklist to ensure all API consumption aspects are configured correctly.

- [ ] Axios instance configured in `api.ts`
- [ ] Interceptor for JWT token
- [ ] Interceptor for 401 errors
- [ ] Services organized by domain
- [ ] TypeScript types for responses
- [ ] Error handling in all requests
- [ ] Loading states
- [ ] Visual feedback for user

## [References]()

Links to official documentation of used technologies.

- [Axios Documentation](https://axios-http.com/docs/intro)
- [React + Axios Best Practices](https://blog.logrocket.com/how-to-make-http-requests-like-a-pro-with-axios/)
