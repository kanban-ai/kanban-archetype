# [What technologies does the Frontend use?]()

> This document describes all technologies, frameworks and libraries used in the frontend of the project.

## [Main Stack]()

Core technologies used in the frontend including React framework, Vite build tool and TypeScript language.

### [Framework and Runtime]()

- **React**: Main framework
  - JavaScript library for building interfaces
  - Based on reusable components
  - Virtual DOM for performance
  - Hooks for state management

- **TypeScript**: Programming language
  - JavaScript superset with static typing
  - Target: ES2022
  - Strict mode enabled
  - Type safety throughout the application

- **Vite**: Build tool and dev server
  - Extremely fast build
  - Hot Module Replacement (HMR)
  - Native ES modules
  - React plugin with SWC

- **SWC**: Transpiler
  - Alternative to Babel (much faster)
  - Written in Rust
  - Used via @vitejs/plugin-react-swc

## [Styling]()

- **Tailwind CSS v4**: Utility-first CSS framework
  - Pre-defined utility classes
  - Dark mode configured as default
  - Custom theme with blue primary color (#3b82f6)
  - Mobile-first responsive design
  - Latest version (v4.0+) released January 2025
  - Native Vite plugin (`@tailwindcss/vite`) for maximum performance
  - Zero configuration - no need for `tailwind.config.js` or `postcss.config.js`
  - Modern CSS syntax with `@import` and `@theme`

## [Routing]()

- **React Router DOM**: Routing system
  - Client-side routing
  - Navigation without page reload
  - Support for dynamic and nested routes
  - Authentication guards (PrivateRoute)
  - Centralized route configuration

## [HTTP Requests]()

- **Axios**: HTTP client
  - Requests to REST API
  - Interceptors for authentication
  - Centralized error handling
  - Request cancellation support

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
