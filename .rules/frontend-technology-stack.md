# [What technologies does the Frontend use?]()

> This document describes all technologies, frameworks and libraries used in the frontend of the project.

## [Main Stack Technologies]()

Core technologies used in the frontend including React framework, Vite build tool and TypeScript language. React provides component-based UI architecture, TypeScript ensures type safety, Vite delivers ultra-fast development experience with HMR, and SWC handles lightning-fast JavaScript/TypeScript compilation written in Rust.

### When to use?

Use this stack for building modern single-page applications (SPAs), interactive user interfaces with complex state management, projects requiring type safety and maintainability, development workflows demanding fast Hot Module Replacement, and applications needing component reusability and excellent developer experience. Ideal for dashboards, admin panels, and data-rich web applications.

### When NOT to use?

Avoid this stack for simple static websites better served by static site generators, SEO-critical content sites requiring server-side rendering (use Next.js instead), applications with no interactivity, or when team lacks JavaScript/TypeScript expertise. Not suitable for native mobile apps (use React Native) or when bundle size is extremely critical.

### Example

```typescript
// React component with TypeScript and hooks
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl">{user.name}</h1>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
}
```

### Checklist

- [ ] Node.js >= 18.x and npm/pnpm installed
- [ ] Vite project initialized with React and TypeScript template
- [ ] TypeScript strict mode enabled in tsconfig.json
- [ ] Vite config includes React plugin with SWC
- [ ] ESLint configured for React and TypeScript
- [ ] Development server running with HMR working
- [ ] Environment variables prefixed with VITE_

### Troubleshooting

**Problem**: Vite dev server not starting or showing errors
**Solution**: Check Node version is >= 18.x, delete node_modules and package-lock.json then reinstall, verify no port conflicts on default port 5173, check vite.config.ts syntax

**Problem**: Hot Module Replacement not working
**Solution**: Ensure components are exported as named exports or default exports consistently, check Fast Refresh is enabled in Vite config, avoid anonymous components, restart dev server

**Problem**: TypeScript errors in IDE but builds successfully
**Solution**: Restart TypeScript server in IDE, check tsconfig.json paths match project structure, ensure IDE is using workspace TypeScript version, run `tsc --noEmit` to verify

### Best Practices

- Enable TypeScript strict mode for maximum type safety
- Use functional components with hooks instead of class components
- Leverage Vite's fast HMR for rapid development iteration
- Configure path aliases in vite.config.ts and tsconfig.json
- Split code with React.lazy() and Suspense for better performance
- Use environment variables with VITE_ prefix for configuration
- Keep components small and focused on single responsibility

## [Styling with Tailwind CSS]()

Utility-first CSS framework providing pre-defined classes for rapid UI development. Tailwind CSS v4 integrates natively with Vite, supports dark mode by default, uses modern CSS syntax, and eliminates configuration files for zero-setup styling with maximum performance and developer productivity.

### When to use?

Use Tailwind CSS for rapid prototyping and development, consistent design systems with utility classes, responsive layouts with mobile-first approach, dark mode support without custom CSS, projects requiring minimal CSS bundle size, and teams preferring utility-first over component-based CSS. Perfect for dashboards, admin panels, and modern web applications.

### When NOT to use?

Avoid Tailwind for highly customized designs requiring extensive custom CSS, teams unfamiliar with utility-first methodology, projects with strict CSS naming conventions like BEM, legacy codebases with existing CSS frameworks, or when design requires complex animations better handled by CSS-in-JS libraries like styled-components.

### Example

```tsx
// Tailwind utility classes in React components
export function Button({ variant = 'primary', children }) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}

// Responsive design with breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  <Card />
  <Card />
  <Card />
</div>

// Dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content adapts to dark mode
</div>
```

### Checklist

- [ ] Tailwind CSS v4 and @tailwindcss/vite plugin installed
- [ ] Vite plugin configured in vite.config.ts
- [ ] Base styles imported in main CSS file
- [ ] Dark mode configured (class or media strategy)
- [ ] Custom theme colors defined if needed
- [ ] Mobile-first breakpoints understood (sm, md, lg, xl, 2xl)
- [ ] Tailwind IntelliSense extension installed in IDE

### Troubleshooting

**Problem**: Tailwind classes not applying styles
**Solution**: Verify @tailwindcss/vite plugin is added to vite.config.ts, ensure CSS file with Tailwind directives is imported in main.tsx, restart Vite dev server, check browser console for CSS errors

**Problem**: Dark mode not working
**Solution**: Verify dark mode strategy in Tailwind config (class or media), ensure 'dark' class is toggled on root element for class strategy, check system preferences for media strategy

**Problem**: Custom colors not appearing
**Solution**: Define custom colors in CSS using @theme directive, ensure proper CSS variable syntax, check color names match usage in className, restart dev server after theme changes

### Best Practices

- Use mobile-first approach with responsive breakpoints
- Combine utility classes for component variants
- Extract repeated patterns into reusable components
- Use arbitrary values sparingly (e.g., w-[37px])
- Leverage Tailwind IntelliSense for autocomplete and linting
- Keep className strings readable with proper formatting
- Use @apply in CSS files only for complex repeated patterns
- Configure purge properly to remove unused styles in production

## [Routing with React Router]()

Client-side routing system enabling navigation without page reloads, supporting dynamic and nested routes, authentication guards, and centralized route configuration. React Router DOM provides declarative routing for single-page applications with URL synchronization, browser history management, and component-based route definitions.

### When to use?

Use React Router for single-page applications requiring multiple views, client-side navigation without full page reloads, dynamic routing with URL parameters, nested route hierarchies, authentication-protected routes, and programmatic navigation. Essential for applications with complex navigation structures, user dashboards, and multi-step workflows.

### When NOT to use?

Avoid React Router for simple single-page sites without navigation, static websites where anchor tags suffice, server-side rendered applications using Next.js routing, or when all content fits in one view. Not needed for embedded widgets or components that don't control browser URL.

### Example

```typescript
// Router configuration with protected routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

// PrivateRoute component with authentication guard
function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

// Programmatic navigation
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await authService.login();
    navigate('/dashboard');
  };
}
```

### Checklist

- [ ] react-router-dom package installed
- [ ] BrowserRouter wraps application in main.tsx or App.tsx
- [ ] Routes defined with path and element props
- [ ] Private routes protected with authentication guards
- [ ] 404 catch-all route configured
- [ ] Dynamic routes use URL parameters (:id)
- [ ] Navigation uses Link or useNavigate, not anchor tags

### Troubleshooting

**Problem**: Routes not rendering or showing blank page
**Solution**: Verify BrowserRouter wraps all Routes, check path syntax matches exactly, ensure element prop receives valid React component, check for typos in route paths

**Problem**: Protected routes not redirecting to login
**Solution**: Verify authentication state is correctly checked in PrivateRoute, ensure Outlet is rendered for nested routes, check Navigate component points to correct login path

**Problem**: URL changes but component not updating
**Solution**: Ensure route paths are unique and specific, check for conflicting routes with similar patterns, verify components use useParams or useLocation to detect URL changes

### Best Practices

- Use BrowserRouter for web apps, HashRouter only for static hosting
- Define routes in centralized configuration file for maintainability
- Implement authentication guards with Outlet for nested protected routes
- Use Link component for navigation, not anchor tags
- Leverage useParams for dynamic route parameters
- Use useNavigate for programmatic navigation after actions
- Implement loading states during route transitions
- Add 404 catch-all route at the end of route definitions

## [HTTP Client with Axios]()

HTTP client for making REST API requests with interceptors for authentication, centralized error handling, and request cancellation support. Axios provides a promise-based API for HTTP operations with automatic JSON transformation, request/response interceptors, and better error handling compared to native fetch.

### When to use?

Use Axios for all API communication in React applications requiring automatic JSON parsing, request/response interceptors for authentication tokens, centralized error handling, request cancellation for cleanup, file uploads with progress tracking, and consistent API across browsers. Essential for SPA applications consuming REST APIs with authentication.

### When NOT to use?

Avoid Axios for simple GET requests where native fetch suffices, applications targeting extremely small bundle sizes (fetch is native), GraphQL clients better served by Apollo Client, or when streaming responses require fetch API. Not needed for server-side rendering where native fetch is preferred.

### Example

```typescript
// Configured Axios instance
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Usage in service
export const userService = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post<User>('/users', data),
  update: (id: number, data: UpdateUserDto) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};
```

### Checklist

- [ ] Axios installed and imported
- [ ] Axios instance configured with baseURL
- [ ] Request interceptor adds authentication token
- [ ] Response interceptor handles common errors (401, 403, 500)
- [ ] TypeScript interfaces defined for API responses
- [ ] Timeout configured to prevent hanging requests
- [ ] Error handling implemented in components

### Troubleshooting

**Problem**: Axios requests returning CORS errors
**Solution**: Verify backend CORS configuration allows frontend origin, check request headers are allowed, ensure credentials: true if sending cookies, verify preflight OPTIONS requests succeed

**Problem**: Authentication token not being sent
**Solution**: Check token exists in storage before adding to headers, verify interceptor is configured before any requests, ensure Authorization header format is correct (Bearer <token>)

**Problem**: Requests timing out frequently
**Solution**: Increase timeout value in axios config, check network connectivity, verify backend is responding, implement retry logic for transient failures

### Best Practices

- Create centralized Axios instance with base configuration
- Use interceptors for authentication token injection
- Handle authentication errors globally in response interceptor
- Define TypeScript interfaces for all API responses
- Implement request cancellation with AbortController for cleanup
- Use separate service files for different API resources
- Configure appropriate timeout values (5-10 seconds typical)
- Log errors in interceptors for debugging in development

## [Data Visualization]()

Libraries for rendering charts, tooltips and visual date formatting.

### [Charts]()

- **Chart.js**: Charting library
  - Line, bar, doughnut charts
  - Customizable and responsive
  - Canvas-based for performance

- **react-chartjs-2**: React wrapper
  - Chart.js integration with React
  - React components for charts
  - TypeScript typing

- **chartjs-plugin-annotation**: Annotation plugin
  - Adds lines and annotations to charts
  - Custom markers

### [UI Components]()

- **Tippy.js**: Tooltips and popovers
  - Lightweight and performant library
  - Smart automatic positioning
  - Customizable

- **@tippyjs/react**: React integration
  - React component for Tippy.js
  - Typed props

### [Utilities]()

- **timeago.js**: Date formatting
  - Relative dates (e.g. "5 minutes ago")
  - Internationalization support
  - Lightweight with no dependencies

## [State Management]()

Global state management solution using React's native Context API without external libraries.

### [Context API (Native React)]()

The project uses React's native Context API, without external libraries:

1. **AuthContext**: Global authentication
   - State: user, token, isLoading
   - Methods: login, logout
   - localStorage persistence

2. **ToastContext**: Notifications
   - Toast/snackbar system
   - Configurable auto-dismiss
   - Types: success, error, info, warning

3. **PageInfoContext**: Page information
   - Current page metadata
   - Breadcrumbs and title

## [Development Tools]()

Tools for TypeScript development, linting and code validation.

### [TypeScript]()

- **typescript**
- **@types/react**: React typings
- **@types/react-dom**: React DOM typings
- **@types/node**: Node.js typings

### [Linting and Formatting]()

- **ESLint**: JavaScript/TypeScript linter
  - Static code analysis
  - Problem detection
  - Custom rules

- **@eslint/js**: Base ESLint configuration

- **typescript-eslint**: TypeScript plugin
  - TypeScript-specific rules
  - TypeScript parser

- **eslint-plugin-react-hooks**: Hooks validation
  - React Hooks rules
  - Prevents common bugs

- **eslint-plugin-react-refresh**: Fast Refresh
  - Component validation for HMR
  - Maintains state during hot reload

- **globals**: Global definitions
  - Browser global variables
  - ESLint compatibility

## [Component Structure]()

Organization of reusable components categorized by type and functionality.

### [Common Components (src/components/common/)]()

- **Modals**: Modal, AlertModal, ConfirmModal, CommentModal, SelectWalletModal
- **Charts**: LineChart, BarChart, DoughnutChart, EvolutionBarChart
- **Cards**: MetricCard, StatCard
- **Dropdowns**: AlertsDropdown, AssetAlertsDropdown
- **Popovers**: AssetPopover, CommentPopover
- **Form Elements**: DatePicker
- **UI**: ActionButtonBar, AllocationBar, TreeView, MiniPerfil

### [Authentication Components]()

- **AuthBanner**: Authentication banner
- **PrivateRoute**: Private route guard

### [Layout Components]()

- **Layout**: Main layout with navigation
- **ToastContainer**: Notification container

## [Pages (src/pages/)]()

Complete list of application pages organized by functional module.

### [Authentication]()
- Login
- Signup
- ChangePassword

### [Dashboard/Views]()
- OverviewPage
- AllocationPage
- PerformancePage
- ProgressPage
- AlertsPage
- CommentsPage
- ConfigsPage
- SettingsPage
- NotificationsPage

### [Asset Management]()
- AssetListPage
- AssetFormPage
- AssetProfilePage (with tabs)

### [Rebalancing]()
- RebalancePage
- RebalanceDetailPage
- RebalanceAnalyzePage

### [Registrations]()
- SectorListPage, SectorFormPage
- CurrencyListPage, CurrencyFormPage
- WalletListPage, WalletFormPage, WalletDashboardPage

### [Errors]()
- Forbidden

## [Services (src/services/)]()

- **api.ts**: Configured Axios instance
- **auth.service.ts**: Authentication service
- **alert.service.ts**: Alert service
- **comment.service.ts**: Comment service
- **config.service.ts**: Configuration service

## [Utilities (src/utils/)]()

Helper functions for currency formatting and date manipulation.

- **currency.utils.ts**: Currency formatting
- **date.utils.ts**: Date manipulation

## [TypeScript Types (src/types/)]()

TypeScript type and interface definitions for authentication and data models.

- **auth.ts**: Authentication types
- **models/user.ts**: User model

## [Configuration]()

Project configuration files including Vite, TypeScript and Tailwind.

### [Vite (vite.config.ts)]()

```typescript
{
  plugins: [react()],
  resolve: {
    alias: {
      '@': './src'
    }
  }
}
```

### [TypeScript (tsconfig.app.json)]()

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### [Tailwind (tailwind.config.js)]()

```javascript
{
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: { portifolio: '#3b82f6' }
      }
    }
  }
}
```

## [NPM Scripts]()

Available commands in package.json for development, build and code verification.

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## [Environment Variables]()

Environment variable configuration with VITE_ prefix for use in client code.

```env
VITE_API_URL=http://localhost:3000/api
```

Accessible in code via:
```typescript
import.meta.env.VITE_API_URL
```

## [Patterns and Conventions]()

Naming conventions, code organization and best practices adopted in the project.

### [Component Naming]()

The project uses suffixes for quick identification of component categories.

**Complete naming documentation**: See `.rules/react-component-naming-pattern-frontend.md`

**Main examples:**
- Pages: suffix `Page` (e.g. `AssetListPage.tsx`)
- Forms: suffix `Form` (e.g. `LoginForm.tsx`)
- Modals: suffix `Modal` (e.g. `ConfirmModal.tsx`)
- Providers: suffix `Provider` (e.g. `AuthProvider.tsx`)
- Hooks: prefix `use` (e.g. `useAuth.ts`)
- Base components: no suffix (e.g. `Button.tsx`, `Input.tsx`)

### [File Structure]()
- Components: PascalCase (e.g. MetricCard.tsx)
- Utilities: kebab-case (e.g. currency.utils.ts)
- Services: kebab-case with `.service.ts` suffix (e.g. auth.service.ts)

### [Import Organization]()
1. React and external libraries
2. Local components
3. Services and utils
4. Types
5. Styles

### [Custom Hooks]()
- Prefix `use` (e.g. useNotifications, useAuth)
- Located in `src/hooks/`

### [Context API]()
- File/Component: Suffix `Provider` (e.g. AuthProvider.tsx)
- Internal context: Suffix `Context` (e.g. AuthContext)
- Corresponding hook: `use[Name]` (e.g. useAuth)
- Located in `src/contexts/`

**Complete documentation**: See `.rules/react-component-naming-pattern-frontend.md`

## [Project Features]()

Functionalities and design decisions implemented in the frontend project.

### [Dark Mode]()
- Dark theme by default
- Background: gray-900
- Text: gray-100
- Accents: blue portifolio

### [Responsiveness]()
- Mobile-first approach
- Default Tailwind breakpoints
- Adaptive components

### [Accessibility]()
- Proper HTML semantics
- ARIA labels when necessary
- Adequate contrast (dark mode)

### [Performance]()
- Automatic code splitting (Vite)
- Lazy loading of routes
- Heavy component memoization
- Chart.js with Canvas (performance)

## [Responsive and Fluid Layout]()

Patterns and practices for creating layouts that adapt to different screen sizes and devices.

### [Tailwind Breakpoints]()

The project uses Tailwind CSS default breakpoints:

| Breakpoint | Minimum Width | Device |
|------------|---------------|--------|
| `sm` | 640px | Large phone (landscape) |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### [Mobile-First Approach]()

All Tailwind classes are applied mobile-first, meaning the base style is for mobile and breakpoints add styles for larger screens.

```tsx
// ❌ Desktop-first (WRONG)
<div className="grid-cols-3 md:grid-cols-1">

// ✅ Mobile-first (CORRECT)
<div className="grid-cols-1 md:grid-cols-3">
```

**Correct order:**
1. Base style (mobile)
2. `sm:` - phone landscape
3. `md:` - tablet
4. `lg:` - desktop
5. `xl:` - large desktop

### [Fluid Layouts with Grid and Flexbox]()

Use Grid and Flexbox for layouts that adapt automatically:

```tsx
// Responsive grid that adjusts number of columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

// Flexbox with automatic wrap
<div className="flex flex-wrap gap-4">
  <div className="flex-1 min-w-[300px]">Content 1</div>
  <div className="flex-1 min-w-[300px]">Content 2</div>
</div>

// Centered container with max-width
<div className="container mx-auto px-4 max-w-7xl">
  {/* Centered and responsive content */}
</div>
```

### [Responsive Spacing]()

Adjust padding, margin and gaps for different screens:

```tsx
// Padding that increases on larger screens
<div className="p-4 md:p-6 lg:p-8">

// Gap that adjusts per breakpoint
<div className="flex gap-2 md:gap-4 lg:gap-6">

// Responsive margin
<div className="my-4 md:my-6 lg:my-8">
```

### [Responsive Typography]()

Use text classes that scale with viewport:

```tsx
// Responsive headings
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Main Title
</h1>

// Body text
<p className="text-sm md:text-base lg:text-lg">
  Content
</p>
```

### [Conditional Visibility]()

Hide or show elements based on screen size:

```tsx
// Hamburger menu mobile only
<button className="md:hidden">
  <MenuIcon />
</button>

// Desktop menu
<nav className="hidden md:flex">
  <Link to="/">Home</Link>
</nav>

// Different layouts for mobile and desktop
<div>
  {/* Mobile: vertical list */}
  <div className="md:hidden">
    <VerticalList />
  </div>

  {/* Desktop: horizontal grid */}
  <div className="hidden md:grid md:grid-cols-3">
    <GridLayout />
  </div>
</div>
```

### [Responsive Sidebar]()

Pattern for sidebar that transforms into mobile menu:

```tsx
export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar: overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900
        transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-4"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <MenuIcon />
        </button>

        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

### [Responsive Cards]()

Cards that adapt to available space:

```tsx
// Card that takes full width mobile and half desktop
<div className="w-full md:w-1/2 lg:w-1/3 p-4">
  <Card>
    {/* Internal content also responsive */}
    <div className="flex flex-col md:flex-row gap-4">
      <img className="w-full md:w-32 h-32 object-cover" />
      <div className="flex-1">
        <h3 className="text-lg md:text-xl">Title</h3>
        <p className="text-sm md:text-base">Description</p>
      </div>
    </div>
  </Card>
</div>
```

### [Responsive Forms]()

Forms that reorganize on different screens:

```tsx
// Grid of 1 column mobile, 2 columns desktop
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Name" />
    <Input label="Email" />
  </div>

  {/* Full-width field on all screens */}
  <Input label="Address" className="col-span-full" />

  {/* Buttons: stacked mobile, side by side desktop */}
  <div className="flex flex-col md:flex-row gap-2 md:gap-4">
    <Button variant="primary" className="w-full md:w-auto">
      Save
    </Button>
    <Button variant="secondary" className="w-full md:w-auto">
      Cancel
    </Button>
  </div>
</form>
```

### [Responsive Tables]()

Strategies for tables on small screens:

```tsx
// Option 1: Horizontal scroll
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Normal table */}
  </table>
</div>

// Option 2: Cards on mobile
<div className="hidden md:block">
  <Table /> {/* Normal table desktop */}
</div>

<div className="md:hidden space-y-4">
  {items.map(item => (
    <Card key={item.id}>
      {/* Each row becomes a card on mobile */}
      <div><strong>Name:</strong> {item.name}</div>
      <div><strong>Email:</strong> {item.email}</div>
    </Card>
  ))}
</div>
```

### [Responsiveness Checklist]()

- [ ] Mobile-first: base style is for mobile
- [ ] Breakpoints applied in order: `sm`, `md`, `lg`, `xl`
- [ ] Fluid layouts with Grid or Flexbox
- [ ] Responsive spacing (padding, margin, gap)
- [ ] Typography that scales with viewport
- [ ] Images with `object-fit` and responsive width
- [ ] Navigation adapts between mobile menu and desktop
- [ ] Forms reorganize fields on small screens
- [ ] Tables with scroll or transformed into cards on mobile
- [ ] Tested at different sizes: 320px, 768px, 1024px, 1920px

## [Main Technologies]()

- React
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS v4
- @tailwindcss/vite (Vite plugin)
- Axios
- Chart.js
- Tippy.js
- ESLint

## [System Requirements]()

- Node.js >= 18.x
- npm >= 9.x or pnpm >= 8.x
- Modern browsers (Chrome, Firefox, Safari, Edge)

## [References]()

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Chart.js Documentation](https://www.chartjs.org)
