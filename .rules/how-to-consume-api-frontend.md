# How to consume the API in Frontend

Complete guide on how to make HTTP requests to the API using Axios in React, including configuration, service patterns, error handling, and advanced techniques for robust API integration.

## [Axios Configuration and Setup]()

Axios centralized configuration creates a reusable HTTP client instance with base URL, default headers, and interceptors for authentication and error handling. This eliminates repetition and ensures consistent API communication across the entire application.

### When to use?

Use centralized Axios configuration in every React application consuming a REST API. Essential for adding authentication tokens automatically, handling API versioning, managing base URLs across environments, and implementing global error handling with interceptors.

### When NOT to use?

Do not use centralized Axios if you only make one or two API calls (use fetch instead), if different endpoints require completely different configurations, or if using GraphQL (use Apollo Client or similar). However, most REST API projects benefit from this pattern.

### Example

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

**Environment variable** (`.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

> **IMPORTANT**: The API version (`v1`) is configured in `api.ts` and automatically applied to all requests. If the backend creates a v2, just change `API_VERSION = 'v2'` in one place. See [How to version API](./how-to-version-api-backend.md) for more details.

### Checklist

- [ ] Axios installed via npm/yarn
- [ ] api.ts file created with centralized instance
- [ ] Base URL uses environment variable
- [ ] API version centralized in constant
- [ ] Request interceptor adds JWT token
- [ ] Response interceptor handles 401 errors
- [ ] Content-Type header set to application/json
- [ ] Environment variables configured in .env

### Troubleshooting

**CORS errors**: Verify backend CORS configuration allows your frontend origin

**401 on all requests**: Check that token is stored correctly in localStorage

**Base URL incorrect**: Verify VITE_API_URL in .env matches backend URL exactly

**Interceptors not firing**: Ensure you're using the configured instance not axios directly

### Best Practices

1. Centralize API version for easy updates
2. Use environment variables for different environments
3. Add token in interceptor not per request
4. Handle 401 globally but let components decide redirect
5. Export single configured instance
6. Keep api.ts focused on configuration only
7. Document interceptor behavior clearly

## [Service Layer Pattern]()

Service layer organizes API calls into domain-specific modules with TypeScript interfaces for type safety. Each service encapsulates all HTTP operations for a specific resource, providing a clean separation between API communication and UI components.

### When to use?

Use service layer pattern for every API resource in your application (users, products, orders, etc.). Essential for organizing complex applications, enabling code reuse, providing consistent API interfaces, and facilitating testing with mock services.

### When NOT to use?

Do not create services for one-off API calls that won't be reused, for extremely simple applications with 2-3 total API calls, or when using data-fetching libraries like React Query that handle this differently. Start with services as complexity grows.

### Example

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

### Checklist

- [ ] Service file created per resource
- [ ] TypeScript interfaces for entities
- [ ] DTOs defined for create/update operations
- [ ] All CRUD operations implemented
- [ ] Async/await used consistently
- [ ] Response types specified with generics
- [ ] Service exported as object with methods
- [ ] Consistent naming convention (findAll, findOne, create, update, remove)

### Troubleshooting

**Type errors**: Ensure interfaces match backend response structure exactly

**Response undefined**: Check that you're returning response.data not response

**Method not found**: Verify service is exported and imported correctly

**Stale TypeScript types**: Regenerate types when backend changes

### Best Practices

1. One service per resource/domain
2. Define TypeScript interfaces matching backend
3. Use descriptive method names (findAll, findOne, etc.)
4. Type all parameters and return values
5. Export interfaces for use in components
6. Keep services pure - no UI logic
7. Document complex operations with comments

## [Using Services in React Components]()

Consuming services in React components involves managing loading states, data, and errors using hooks like useState and useEffect. This pattern provides consistent UX through proper state management and user feedback during API operations.

### When to use?

Use this pattern when consuming any API service in functional React components. Essential for list pages, detail views, forms, or any component that needs to fetch, create, update, or delete data from the backend.

### When NOT to use?

Do not use this basic pattern when you need advanced features like caching, automatic refetching, or optimistic updates (use React Query/SWR instead). Consider custom hooks for reusable data fetching logic.

### Example

**List View with Loading States**:

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

**Create with Form Submission**:

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

**Update Item**:

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

**Delete Item**:

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

> **IMPORTANT**: All examples above are only structure and pattern demonstrations.
> They don't contain specific business logic. Adapt them according to your project needs.

### Checklist

- [ ] useState for data, loading, and error states
- [ ] useEffect for initial data loading
- [ ] Try/catch for error handling
- [ ] Finally block to always stop loading
- [ ] Loading indicator displayed
- [ ] Error messages shown to user
- [ ] Success feedback provided
- [ ] Form validation implemented

### Troubleshooting

**Infinite loops**: Ensure useEffect has proper dependency array

**State not updating**: Check that setState is called with new values not mutations

**Memory leaks**: Clean up async operations in useEffect return function

**Stale closures**: Include all dependencies in useEffect array

### Best Practices

1. Always manage loading, data, and error states
2. Show loading indicators during async operations
3. Display clear error messages to users
4. Use try/catch/finally for consistent error handling
5. Reset form fields after successful submission
6. Disable submit buttons during loading
7. Provide visual feedback for all user actions

## [Error Handling and User Feedback]()

Consistent error handling extracts meaningful messages from API responses and provides clear user feedback. Backend validation errors may return arrays of messages that need proper formatting for display.

### When to use?

Use structured error handling in every component that makes API calls. Essential for form validation feedback, handling network errors, processing backend error responses, and providing users with actionable error information.

### When NOT to use?

Do not skip error handling even for simple operations. However, you may simplify for prototypes or internal tools where detailed error messages aren't critical. Production applications always need robust error handling.

### Example

**API Error Structure**:

```typescript
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

**Helper Function**:

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

### Checklist

- [ ] Error helper function created
- [ ] Array messages joined for display
- [ ] Default error message for unknown errors
- [ ] Error responses properly typed
- [ ] Network errors handled
- [ ] User-friendly messages shown
- [ ] Technical errors logged for debugging

### Troubleshooting

**Undefined error messages**: Check that backend returns consistent error structure

**Array not joining**: Verify Array.isArray check before calling join

**Generic errors**: Ensure backend provides descriptive error messages

**Missing validation errors**: Check that all validation errors are in message array

### Best Practices

1. Create helper function for consistent error extraction
2. Handle both string and array error messages
3. Provide user-friendly fallback messages
4. Log technical errors to console for debugging
5. Show validation errors near relevant form fields
6. Consider toast notifications for better UX
7. Handle network errors separately from API errors

## [Custom Hooks for Reusable API Logic]()

Custom hooks encapsulate reusable data fetching logic, reducing boilerplate and providing consistent patterns for loading states, error handling, and data management across components.

### When to use?

Use custom hooks when the same data fetching pattern repeats across multiple components, when you need reusable loading/error state management, or when building a data fetching abstraction layer. Ideal for reducing component code duplication.

### When NOT to use?

Do not create custom hooks for one-time use cases, when using data fetching libraries like React Query (they provide hooks), or when the abstraction adds more complexity than it removes. Start with simple patterns first.

### Example

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

### Checklist

- [ ] Custom hook created with "use" prefix
- [ ] Generic type parameter for flexibility
- [ ] Loading, data, and error states managed
- [ ] Execute function returns promise
- [ ] Error handling consistent
- [ ] TypeScript types properly defined
- [ ] Hook reused across components

### Troubleshooting

**Type errors**: Ensure generic type T matches API response

**Stale data**: Reset data state when changing API function

**Multiple executions**: Use useEffect dependencies correctly

**Memory leaks**: Clean up async operations in useEffect

### Best Practices

1. Use "use" prefix for custom hook naming
2. Make hooks generic with TypeScript
3. Provide execute function for manual triggering
4. Return consistent interface (data, loading, error, execute)
5. Handle errors within the hook
6. Document hook parameters and return values
7. Consider adding refetch and reset capabilities

## [Pagination Implementation]()

Pagination manages large datasets by loading data in chunks, improving performance and user experience. Query parameters control current page and page size, enabling navigation through result sets.

### When to use?

Use pagination for any list that can grow beyond 20-50 items, for search results, for data tables, or when backend provides paginated endpoints. Essential for performance with large datasets and providing users with navigable data.

### When NOT to use?

Do not use pagination for small fixed-size lists (under 20 items), when infinite scroll is more appropriate, or when you need to show all data at once. Consider virtual scrolling for very large lists instead.

### Example

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

// Pagination controls
<button onClick={() => setPage(p => p - 1)}>Previous</button>
<button onClick={() => setPage(p => p + 1)}>Next</button>
```

### Checklist

- [ ] Page and pageSize parameters in service
- [ ] Query params passed to backend
- [ ] Current page tracked in state
- [ ] Previous/Next navigation implemented
- [ ] Disable Previous on first page
- [ ] Disable Next on last page
- [ ] Total count displayed if available
- [ ] Page number indicator shown

### Troubleshooting

**Wrong page loaded**: Ensure page state updates trigger useEffect

**Params not sent**: Verify params object in axios request

**Off-by-one errors**: Check if backend uses 0-based or 1-based indexing

**Total pages incorrect**: Verify backend returns total count correctly

### Best Practices

1. Use query parameters not route params for pagination
2. Default to reasonable page size (10-20 items)
3. Show current page and total pages
4. Disable navigation buttons at boundaries
5. Persist pagination in URL for shareability
6. Reset to page 1 when filters change
7. Show loading state during page changes

## [File Upload Implementation]()

File uploads use FormData to send multipart form data to the backend. Axios automatically handles the correct Content-Type header when provided with FormData, enabling image and document uploads.

### When to use?

Use file upload for profile pictures, document attachments, image galleries, CSV imports, or any feature requiring users to upload files. Essential for applications handling user-generated content or document management.

### When NOT to use?

Do not implement file upload for very large files without chunking/resumable upload, when files can be provided via URL instead, or without proper backend validation. Consider cloud upload services for large-scale file handling.

### Example

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

### Checklist

- [ ] FormData created for file upload
- [ ] File appended to FormData
- [ ] Content-Type set to multipart/form-data
- [ ] File input accepts correct file types
- [ ] File size validation implemented
- [ ] Upload progress shown to user
- [ ] Success/error feedback provided
- [ ] Preview shown before upload

### Troubleshooting

**File not received**: Verify FormData field name matches backend expectation

**Type errors**: Check file type validation matches backend

**Large files failing**: Implement chunked upload or increase backend limit

**Progress not showing**: Add onUploadProgress handler to axios config

### Best Practices

1. Validate file type and size on client before upload
2. Show upload progress for better UX
3. Provide image preview before uploading
4. Handle upload errors gracefully
5. Clear file input after successful upload
6. Limit file sizes appropriately
7. Support multiple file uploads when needed

## [Query Parameters for Filtering]()

Query parameters enable flexible filtering, searching, and sorting without affecting route structure. Axios params property automatically serializes parameters and appends them to the URL.

### When to use?

Use query parameters for search terms, filters (status, category, date range), sorting options, pagination, or any optional parameters that should persist in URL. Essential for list pages with filtering capabilities.

### When NOT to use?

Do not use query params for required resource identifiers (use route params), for sensitive data that shouldn't appear in URLs, or for complex nested objects (consider POST with request body). Keep URLs clean and readable.

### Example

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

### Checklist

- [ ] Params object passed to axios request
- [ ] Optional parameters properly handled
- [ ] URL reflects current filters
- [ ] Filters persist on page refresh
- [ ] Clear filters option provided
- [ ] Query params typed correctly
- [ ] Default values set for missing params

### Troubleshooting

**Params not sent**: Ensure params object is in axios config

**Undefined params sent**: Filter out undefined values before sending

**Encoding issues**: Let axios handle encoding, don't manually encode

**Type conversion**: Backend receives strings, convert as needed

### Best Practices

1. Use descriptive parameter names
2. Filter out undefined/null values before sending
3. Provide clear filters button to reset
4. Sync URL params with component state
5. Validate parameter values before sending
6. Document expected parameter formats
7. Use consistent naming across endpoints

## [References]()

Links to official documentation of used technologies.

- [Axios Documentation](https://axios-http.com/docs/intro)
- [React + Axios Best Practices](https://blog.logrocket.com/how-to-make-http-requests-like-a-pro-with-axios/)
