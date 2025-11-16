# How routing works in Frontend

> Complete guide on routing with React Router DOM in the project, including route configuration, navigation patterns, and authentication guards.

**Page Naming**: All pages must follow the `Page` suffix (ex: `LoginPage.tsx`, `AssetListPage.tsx`). For complete naming conventions, see: `.rules/react-component-naming-pattern-frontend.md`

## [Overview]()

The project uses **React Router DOM v7** with:
- Centralized route configuration
- Public routes (login, signup)
- Private routes (protected by authentication)
- Shared layout
- Dynamic parameters

## [File Structure]()

This section presents the organization of files related to the React project routing system.

```
src/
  App.tsx                      # Configure routes
  config/
    routes.config.tsx        # Centralized route definition
  components/
    Layout.tsx               # Layout with navigation
    PrivateRoute.tsx         # Authentication guard
  pages/                       # Page components
    auth/
      Login.tsx
      Signup.tsx
    views/
      OverviewPage.tsx
      ...
    assets/
      AssetListPage.tsx
      ...
```

## [Centralized Configuration]()

**`src/config/routes.config.tsx`**:

```typescript
export interface RouteConfig {
  path: string;
  element: JSX.Element;
  name: string;
  icon?: JSX.Element;
  showInMenu?: boolean;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    element: <Login />,
    name: 'Login',
  },
  {
    path: '/signup',
    element: <Signup />,
    name: 'Sign Up',
  },
];

export const privateRoutes: RouteConfig[] = [
  {
    path: '/overview',
    element: <OverviewPage />,
    name: 'Overview',
    icon: <DashboardIcon />,
    showInMenu: true,
  },
  {
    path: '/assets',
    element: <AssetListPage />,
    name: 'Assets',
    icon: <AssetsIcon />,
    showInMenu: true,
  },
  {
    path: '/assets/:id',
    element: <AssetProfilePage />,
    name: 'Asset Profile',
    showInMenu: false, // Doesn't appear in menu
  },
  // ...
];
```

## [App.tsx - Main Configuration]()

This section shows how to configure React Router DOM in the application root component, including public and private routes.

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { publicRoutes, privateRoutes } from './config/routes.config';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}

          {/* Private Routes with Layout */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            {privateRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/overview" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## [PrivateRoute - Authentication Guard]()

This section presents the component responsible for protecting routes that require authentication, redirecting unauthenticated users.

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

## [Layout - Shared Structure]()

This section demonstrates how to create a shared layout that wraps all authenticated pages, including header, sidebar and outlet for content.

```typescript
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto p-6">
          <Outlet /> {/* Renders current route */}
        </main>
      </div>
    </div>
  );
}
```

## [Navigation]()

This section explains how to implement programmatic and link-based navigation using React Router hooks and components.

### [useNavigate Hook]()

```typescript
import { useNavigate } from 'react-router-dom';

function ProductList() {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate('/products/new');
  };

  const handleEdit = (id: number) => {
    navigate(`/products/${id}/edit`);
  };

  const handleBack = () => {
    navigate(-1); // Go back one page
  };

  return (
    <div>
      <button onClick={handleCreate}>New Product</button>
      <button onClick={handleBack}>Back</button>
    </div>
  );
}
```

### [Link Component]()

```typescript
import { Link } from 'react-router-dom';

function ProductList() {
  return (
    <div>
      <Link to="/products/new" className="btn">
        New Product
      </Link>

      {products.map(p => (
        <Link to={`/products/${p.id}`} key={p.id}>
          {p.name}
        </Link>
      ))}
    </div>
  );
}
```

### [NavLink (with active state)]()

```typescript
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <nav>
      <NavLink
        to="/overview"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Overview
      </NavLink>

      <NavLink
        to="/assets"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Assets
      </NavLink>
    </nav>
  );
}
```

## [Route Parameters]()

This section demonstrates how to work with dynamic URL parameters using the useParams hook.

### [useParams Hook]()

```typescript
import { useParams } from 'react-router-dom';

function AssetProfile() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    loadAsset(Number(id));
  }, [id]);

  return <div>Asset {id}</div>;
}
```

### [Multiple Parameters]()

```typescript
// Route: /wallets/:walletId/assets/:assetId

function WalletAssetDetail() {
  const { walletId, assetId } = useParams<{
    walletId: string;
    assetId: string;
  }>();

  return <div>Wallet {walletId}, Asset {assetId}</div>;
}
```

## [Query Parameters]()

This section shows how to read and manipulate query parameters (search parameters) in the URL using useSearchParams.

### [useSearchParams Hook]()

```typescript
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), search });
  };

  const handleSearch = (term: string) => {
    setSearchParams({ page: '1', search: term });
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      {/* URL: /products?page=2&search=notebook */}
    </div>
  );
}
```

## [Nested Routes]()

This section presents how to create nested routes to structure complex pages with sub-navigation.

```typescript
// Configuration
{
  path: '/assets',
  element: <AssetLayout />,
  children: [
    {
      path: '',                    // /assets
      element: <AssetListPage />,
    },
    {
      path: 'new',                 // /assets/new
      element: <AssetFormPage />,
    },
    {
      path: ':id',                 // /assets/123
      element: <AssetProfilePage />,
    },
    {
      path: ':id/edit',            // /assets/123/edit
      element: <AssetEditPage />,
    },
  ],
}

// AssetLayout.tsx
function AssetLayout() {
  return (
    <div>
      <h1>Assets</h1>
      <Outlet /> {/* Renders child route */}
    </div>
  );
}
```

## [Redirects]()

This section demonstrates how to implement automatic redirects using the Navigate component.

### [Navigate Component]()

```typescript
import { Navigate } from 'react-router-dom';

function OldProductPage() {
  return <Navigate to="/products" replace />;
}
```

### [Conditional Redirect]()

```typescript
function Dashboard() {
  const { user } = useAuth();

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return <div>Dashboard</div>;
}
```

## [useLocation Hook]()

This section explains how to access current location information (pathname, search, state) using the useLocation hook.

```typescript
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  // location.pathname: "/assets/123"
  // location.search: "?page=2"
  // location.hash: "#section"

  return (
    <div>
      You are at: {location.pathname}
    </div>
  );
}
```

## [Passing State Between Routes]()

This section shows how to pass data between routes without query parameters using React Router state.

```typescript
// Origin
navigate('/products/new', {
  state: { from: 'dashboard', category: 'electronics' }
});

// Destination
function ProductForm() {
  const location = useLocation();
  const state = location.state as { from: string; category: string };

  console.log(state.from); // 'dashboard'
  console.log(state.category); // 'electronics'
}
```

## [Dynamic Menu]()

This section presents how to generate a navigation menu automatically from the route configuration.

```typescript
import { NavLink } from 'react-router-dom';
import { privateRoutes } from '@/config/routes.config';

function Sidebar() {
  const menuItems = privateRoutes.filter(route => route.showInMenu);

  return (
    <nav>
      {menuItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

## [Lazy Loading Routes]()

This section demonstrates how to implement lazy loading of page components to optimize performance.

```typescript
import { lazy, Suspense } from 'react';

// Lazy load
const AssetListPage = lazy(() => import('@/pages/assets/AssetListPage'));
const AssetProfilePage = lazy(() => import('@/pages/assets/AssetProfilePage'));

// Usage
<Route
  path="/assets"
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <AssetListPage />
    </Suspense>
  }
/>
```

## [404 - Page Not Found]()

This section shows how to implement a custom page for not found routes (404).

```typescript
// App.tsx
<Routes>
  {/* Normal routes */}
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />

  {/* 404 - must be last */}
  <Route path="*" element={<NotFound />} />
</Routes>

// NotFound.tsx
function NotFound() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>404 - Page not found</h1>
      <button onClick={() => navigate('/')}>
        Go to home
      </button>
    </div>
  );
}
```

## [Breadcrumbs]()

This section presents how to implement breadcrumbs (trail navigation) to improve user navigation experience.

```typescript
import { useLocation, Link } from 'react-router-dom';

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav>
      <Link to="/">Home</Link>
      {pathnames.map((name, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <span key={path}> / {name}</span>
        ) : (
          <span key={path}>
            {' / '}
            <Link to={path}>{name}</Link>
          </span>
        );
      })}
    </nav>
  );
}
```

## [Best Practices]()

1. **Centralize routes**: Use configuration file
2. **Lazy loading**: For heavy routes
3. **Guards**: Protect private routes
4. **Shared layout**: Use Outlet for nested routes
5. **404**: Always have catch-all route
6. **TypeScript**: Type parameters with useParams
7. **Replace**: Use when you don't want history (`navigate('/login', { replace: true })`)

## [Checklist]()

- [ ] Public and private routes separated
- [ ] PrivateRoute implemented
- [ ] Layout with Outlet for nested routes
- [ ] 404 page configured
- [ ] Root redirect to initial page
- [ ] useParams typed
- [ ] Navigation via useNavigate or Link
- [ ] Dynamic menu from config

## [References]()

- [React Router Documentation](https://reactrouter.com/en/main)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
