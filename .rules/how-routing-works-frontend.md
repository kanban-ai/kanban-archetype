# How routing works in Frontend

Complete guide on routing with React Router DOM in the project, including route configuration, navigation patterns, authentication guards, and advanced features for building scalable single-page applications.

**Page Naming**: All pages must follow the `Page` suffix (ex: `LoginPage.tsx`, `AssetListPage.tsx`). For complete naming conventions, see: `.rules/react-component-naming-pattern-frontend.md`

## [Centralized Route Configuration]()

Centralized route configuration organizes all application routes in a single configuration file, making routes manageable, type-safe, and easily accessible for navigation menus. This pattern separates public routes from private authenticated routes.

### When to use?

Use centralized route configuration when building applications with multiple routes, when you need dynamic menu generation, when managing complex routing logic with public and private routes, or when you want type-safe route definitions with metadata like icons and visibility.

### When NOT to use?

Do not use centralized configuration for very simple applications with only 2-3 routes, prototypes where routes change frequently, or when using route-based code splitting with framework-specific conventions. Start simple and centralize as complexity grows.

### Example

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

### Checklist

- [ ] Route configuration file created
- [ ] RouteConfig interface defined with TypeScript
- [ ] Public and private routes separated
- [ ] showInMenu property for menu generation
- [ ] Icons included for menu items
- [ ] All pages imported correctly
- [ ] Path parameters clearly defined

### Troubleshooting

**Routes not found**: Ensure all page components are properly imported in routes.config.tsx

**Menu not updating**: Check that showInMenu is set to true for items that should appear

**Type errors**: Verify RouteConfig interface matches all route properties

**Icons not displaying**: Ensure icon components are imported and wrapped in JSX

### Best Practices

1. Separate public and private routes clearly
2. Use TypeScript interfaces for type safety
3. Include metadata (icons, names) for UI generation
4. Keep route paths consistent with REST conventions
5. Document dynamic parameters in comments
6. Use showInMenu to control navigation visibility
7. Centralize all routes in one file for easy management

## [App Component with React Router]()

The App component configures React Router with BrowserRouter, sets up authentication context, and maps route configurations to Route components. This creates the foundation for client-side routing with authentication guards and nested layouts.

### When to use?

Use this pattern when setting up the root application component that needs to configure routing, authentication context, and distinguish between public and private routes. This is required in every React application using React Router with authentication.

### When NOT to use?

Do not use this exact pattern if you're using a different routing library (like Next.js routing), if you don't need authentication guards, or if using server-side rendering. Adapt the pattern based on your specific routing and authentication needs.

### Example

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

### Checklist

- [ ] BrowserRouter wraps entire application
- [ ] AuthProvider configured before routes
- [ ] Public routes mapped without guards
- [ ] Private routes wrapped with PrivateRoute
- [ ] Layout component wraps authenticated routes
- [ ] Root redirect configured
- [ ] 404 catch-all route added
- [ ] All routes have unique keys

### Troubleshooting

**Routes not working**: Ensure BrowserRouter is the outermost router component

**Authentication not working**: Verify AuthProvider is configured and wraps Routes

**404 not caught**: Check that catch-all route (*) is last in Routes

**Redirects looping**: Verify redirect paths exist and don't create circular redirects

### Best Practices

1. Use BrowserRouter not HashRouter for clean URLs
2. Wrap routes with appropriate providers (Auth, Theme, etc.)
3. Use key prop when mapping routes to prevent React warnings
4. Configure 404 catch-all as the last route
5. Use replace prop on redirects to prevent history clutter
6. Keep App component focused on routing structure
7. Extract complex logic to custom hooks or contexts

## [PrivateRoute Authentication Guard]()

PrivateRoute component protects routes requiring authentication by checking for valid tokens and redirecting unauthenticated users to login. This implements security-by-default pattern, ensuring sensitive routes are inaccessible without proper authentication.

### When to use?

Use PrivateRoute to protect any route or layout that requires user authentication. Wrap individual routes or parent layout components to protect multiple child routes at once. Essential for dashboards, user profiles, and any authenticated functionality.

### When NOT to use?

Do not use PrivateRoute for public pages like login, signup, landing pages, or documentation. Do not use if authentication is handled differently (API-level only). Skip for applications without authentication requirements.

### Example

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

### Checklist

- [ ] PrivateRoute component created
- [ ] useAuth hook implemented
- [ ] Loading state handled
- [ ] Redirect to login on missing token
- [ ] replace prop used on Navigate
- [ ] TypeScript props properly typed
- [ ] Loading spinner or skeleton shown

### Troubleshooting

**Infinite redirect loop**: Ensure login page is not wrapped with PrivateRoute

**Flash of content**: Add proper loading state handling before checking token

**Token not detected**: Verify useAuth hook is accessing correct context and storage

**Not redirecting**: Check that Navigate component has replace prop and correct path

### Best Practices

1. Always handle loading state before checking authentication
2. Use replace prop to avoid back button issues
3. Show loading spinner instead of blank screen
4. Consider adding return URL for post-login redirect
5. Validate token expiration not just presence
6. Log authentication failures for debugging
7. Handle expired tokens gracefully with refresh logic

## [Layout with Outlet for Nested Routes]()

Layout component provides shared structure for authenticated pages including sidebar navigation, header, and main content area. The Outlet component from React Router renders the current child route, enabling consistent layouts across multiple pages.

### When to use?

Use Layout with Outlet when you need consistent navigation, header, or footer across multiple routes. Ideal for authenticated dashboards, admin panels, or any multi-page section sharing common UI elements. Enables clean separation of layout from page content.

### When NOT to use?

Do not use shared layout for pages with completely different structures (login vs dashboard), for single-page applications without navigation, or when each page needs unique layouts. Use route-specific layouts or conditional rendering instead.

### Example

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

### Checklist

- [ ] Layout component created
- [ ] Outlet imported from react-router-dom
- [ ] Sidebar component implemented
- [ ] Header component implemented
- [ ] Responsive flexbox layout
- [ ] Overflow handling for scrollable content
- [ ] Layout wraps private routes correctly

### Troubleshooting

**Outlet not rendering**: Verify Layout is used as parent route with nested children

**Styling issues**: Check flexbox properties and ensure h-screen doesn't conflict

**Content overflowing**: Add overflow-auto to main content area

**Sidebar not showing**: Verify Sidebar component is properly imported and rendered

### Best Practices

1. Use Outlet for rendering child routes dynamically
2. Implement responsive design for mobile/tablet
3. Add overflow handling for long content
4. Keep Layout focused on structure not business logic
5. Use CSS Grid or Flexbox for reliable layouts
6. Consider sticky headers and fixed sidebars
7. Extract layout variations into separate components

## [Navigation with useNavigate and Link]()

React Router provides multiple navigation methods including programmatic navigation with useNavigate hook and declarative navigation with Link and NavLink components. Each method suits different navigation scenarios.

### When to use?

Use useNavigate for programmatic navigation after form submissions, API calls, or user actions like button clicks. Use Link for standard anchor-style navigation. Use NavLink when you need active state styling for menu items.

### When NOT to use?

Do not use useNavigate for simple anchor links (use Link instead). Do not use Link for external URLs (use regular anchor tags). Avoid Navigate component for programmatic redirects (use useNavigate instead).

### Example

**useNavigate Hook**:

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

**Link Component**:

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

**NavLink with Active State**:

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

### Checklist

- [ ] useNavigate used for programmatic navigation
- [ ] Link used for declarative anchor navigation
- [ ] NavLink used for menu items with active states
- [ ] Template literals for dynamic paths
- [ ] navigate(-1) for back navigation
- [ ] className function for conditional styling
- [ ] Key prop on mapped Links

### Troubleshooting

**Navigation not working**: Ensure routes are properly configured in App.tsx

**Active state not applying**: Check NavLink className receives function not string

**Back button issues**: Use replace option when you don't want history entries

**Link styling issues**: Apply className or use styled-components/CSS modules

### Best Practices

1. Use Link for better accessibility than onClick navigation
2. Use NavLink for navigation menus to show active routes
3. Use navigate for post-action redirects (after save, delete, etc.)
4. Template literals for cleaner dynamic path construction
5. Add loading states during navigation if needed
6. Use relative paths when possible for portability
7. Consider navigation state for passing data between routes

## [Route Parameters with useParams]()

The useParams hook extracts dynamic parameters from the current URL, enabling pages to load specific resources based on ID or other identifiers. Essential for detail pages, edit forms, and any route that displays specific entity data.

### When to use?

Use useParams when routes have dynamic segments like /products/:id or /users/:userId/posts/:postId. Required for detail pages, edit forms, or any component that needs to identify which specific resource to load or display.

### When NOT to use?

Do not use useParams for optional data (use query parameters instead). Avoid for data that doesn't identify a resource (use query params or state). Not needed for static routes without dynamic segments.

### Example

**Single Parameter**:

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

**Multiple Parameters**:

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

### Checklist

- [ ] useParams imported from react-router-dom
- [ ] TypeScript types defined for parameters
- [ ] Parameters destructured from hook
- [ ] Parameters converted to correct types (Number, etc.)
- [ ] useEffect dependencies include parameters
- [ ] Route configuration matches parameter names
- [ ] Handle undefined/invalid parameters

### Troubleshooting

**Parameters undefined**: Verify route path includes :paramName segments

**Type errors**: Add TypeScript generic with parameter names and types

**Stale data**: Include params in useEffect dependency array

**Wrong parameter names**: Match destructured names with route definition exactly

### Best Practices

1. Always type useParams with TypeScript generics
2. Convert string params to appropriate types (Number, Date, etc.)
3. Include params in useEffect dependencies
4. Validate params before using (check for undefined)
5. Handle invalid IDs gracefully (404, error message)
6. Use meaningful parameter names (:userId not :id)
7. Document expected parameter format in route config

## [Query Parameters with useSearchParams]()

The useSearchParams hook manages URL query parameters enabling filtering, pagination, search, and other optional parameters. Unlike route params, search params don't affect routing but provide flexible state management in the URL.

### When to use?

Use useSearchParams for pagination (page, limit), filtering (status, category), search terms, sorting options, or any optional parameters that should persist in URL for sharing and bookmarking. Ideal for list pages with filters.

### When NOT to use?

Do not use for required resource identifiers (use route params instead). Avoid for sensitive data that shouldn't appear in URLs. Not ideal for complex nested objects (use state instead).

### Example

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

### Checklist

- [ ] useSearchParams imported and used
- [ ] Default values provided for missing params
- [ ] setSearchParams preserves existing params when needed
- [ ] Parameters properly typed/converted
- [ ] Reset to page 1 when filters change
- [ ] URL updates reflect in component state
- [ ] Parameters validated before use

### Troubleshooting

**Params disappear on update**: Use spread operator to preserve existing params when setting

**Infinite loops**: Don't call setSearchParams in render or without dependencies

**Type issues**: Remember get() returns string | null, convert as needed

**State not syncing**: Ensure useEffect dependencies include searchParams

### Best Practices

1. Provide sensible defaults for missing parameters
2. Reset page to 1 when changing filters
3. Preserve unrelated params when updating (spread current params)
4. Validate and sanitize parameter values
5. Use meaningful parameter names
6. Document expected parameter formats
7. Consider debouncing search param updates

## [Nested Routes and Layouts]()

Nested routes enable hierarchical URL structures with parent layouts wrapping child content. This pattern creates sub-sections with shared UI elements while maintaining clean URL structures and component organization.

### When to use?

Use nested routes for sub-sections that share layout elements (admin panel, user settings tabs), for multi-level navigation hierarchies, or when building complex features with consistent sub-navigation. Ideal for settings pages, dashboards with tabs.

### When NOT to use?

Do not use nested routes when child routes don't share layout, for simple flat route structures, or when nesting adds unnecessary complexity. Start with flat routes and nest only when patterns emerge.

### Example

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

### Checklist

- [ ] Parent route has element with Outlet
- [ ] Child routes configured in children array
- [ ] Empty path ('') for index route
- [ ] Relative paths for children (no leading /)
- [ ] Outlet component in parent layout
- [ ] Proper route parameter handling
- [ ] Index route redirects if needed

### Troubleshooting

**Children not rendering**: Ensure parent element contains Outlet component

**Wrong paths**: Use relative paths without leading slash for children

**Index route not working**: Use empty string '' for path that matches parent exactly

**Styling conflicts**: Ensure parent layout doesn't interfere with child content

### Best Practices

1. Use Outlet in parent layouts for child route rendering
2. Keep child paths relative (no leading /)
3. Provide index route for default child content
4. Share navigation/tabs in parent layout
5. Limit nesting depth (2-3 levels max)
6. Use descriptive parent element components
7. Consider breadcrumbs for nested route navigation

## [Redirects and Navigate Component]()

The Navigate component provides declarative redirects, enabling automatic route changes based on conditions like authentication state, feature flags, or data availability. Essential for conditional access control and user flow management.

### When to use?

Use Navigate for conditional redirects based on authentication, permissions, or data state. Ideal for redirecting unauthenticated users, enforcing required steps (email verification), or replacing deprecated routes with new ones.

### When NOT to use?

Do not use Navigate for user-initiated navigation (use Link or useNavigate instead). Avoid for external redirects (use window.location). Not needed for simple links or buttons.

### Example

**Simple Redirect**:

```typescript
import { Navigate } from 'react-router-dom';

function OldProductPage() {
  return <Navigate to="/products" replace />;
}
```

**Conditional Redirect**:

```typescript
function Dashboard() {
  const { user } = useAuth();

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return <div>Dashboard</div>;
}
```

### Checklist

- [ ] Navigate imported from react-router-dom
- [ ] replace prop used for permanent redirects
- [ ] Conditional logic properly implemented
- [ ] Target route exists and is configured
- [ ] Loading states handled before redirect
- [ ] Redirect loops prevented
- [ ] State passed if needed for return URLs

### Troubleshooting

**Infinite redirect loops**: Ensure redirect condition eventually becomes false

**Back button issues**: Use replace prop to prevent history clutter

**Redirect not working**: Verify target route is properly configured

**Flash of content**: Add loading state before checking redirect conditions

### Best Practices

1. Always use replace prop for permanent redirects
2. Handle loading states before conditional redirects
3. Prevent redirect loops with proper conditions
4. Pass state for post-redirect navigation
5. Log redirects for debugging complex flows
6. Consider user experience during redirects
7. Document redirect logic clearly in code

## [Dynamic Menu Generation]()

Dynamic menu generation creates navigation automatically from route configuration, ensuring menus stay synchronized with routes. This DRY approach reduces maintenance overhead and prevents menu-route mismatches.

### When to use?

Use dynamic menu generation when you have centralized route configuration, when navigation structure matches route structure, or when you need consistent menu behavior across application. Ideal for applications with many routes or frequent route changes.

### When NOT to use?

Do not use when menu structure differs significantly from routes, when you need complex conditional menu logic, or for very simple static menus (2-3 items). Custom menus may be simpler for complex navigation requirements.

### Example

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

### Checklist

- [ ] Route config includes showInMenu property
- [ ] Filter applied to select menu items
- [ ] NavLink used for active state
- [ ] Icons displayed correctly
- [ ] Key prop on mapped items
- [ ] Conditional styling for active state
- [ ] Menu updates when routes change

### Troubleshooting

**Menu items missing**: Verify showInMenu is true on route config

**Icons not showing**: Ensure icon property contains valid JSX element

**Active state wrong**: Check NavLink className uses function not string

**Order incorrect**: Add order property to route config if needed

### Best Practices

1. Filter routes by showInMenu property
2. Use NavLink for automatic active state
3. Include icons and labels in route config
4. Add order property for custom menu ordering
5. Consider nested menus for grouped routes
6. Handle permissions in route config
7. Keep menu generation logic simple and readable

## [Lazy Loading Routes for Code Splitting]()

Lazy loading splits route components into separate bundles loaded on demand, reducing initial bundle size and improving application performance. Critical for large applications with many routes or heavy components.

### When to use?

Use lazy loading for heavy routes with large dependencies, for routes users rarely visit, in applications with many routes, or when initial bundle size is too large. Essential for production applications optimizing performance.

### When NOT to use?

Do not lazy load critical routes that most users visit immediately (like login or home), very small components where overhead exceeds benefits, or when you need synchronous rendering without Suspense fallback.

### Example

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

### Checklist

- [ ] lazy imported from react
- [ ] Suspense imported from react
- [ ] Dynamic import syntax used
- [ ] Suspense fallback provided
- [ ] Loading indicator styled appropriately
- [ ] Bundle sizes verified in build
- [ ] Critical routes not lazy loaded

### Troubleshooting

**Blank screen**: Ensure Suspense wrapper with fallback is present

**Loading flicker**: Add minimum delay or better loading indicator

**Failed chunk loading**: Handle network errors with error boundaries

**Build errors**: Verify import paths are correct and modules export default

### Best Practices

1. Wrap lazy components with Suspense
2. Provide meaningful loading fallbacks
3. Don't lazy load critical first routes
4. Group related components in same chunk
5. Monitor bundle sizes with tools like webpack-bundle-analyzer
6. Test lazy loading in production builds
7. Handle loading errors gracefully with error boundaries

## [References]()

- [React Router Documentation](https://reactrouter.com/en/main)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
