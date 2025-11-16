# React component naming pattern in Frontend

> Naming conventions with suffixes for quick identification of React component categories, improving code organization and search capabilities.

## [Component Naming System Overview]()

This section introduces the component naming system used in the project, explaining how suffix patterns help identify component types at a glance and improve code organization through consistent naming conventions.

This document defines suffix patterns for React file and component naming, facilitating identification, search and code organization.

### When to use?

Use these naming conventions for all React components in production applications where code organization, maintainability, and team collaboration are priorities. Apply suffix patterns consistently across pages, forms, modals, cards, and other specialized component categories.

### When NOT to use?

Don't enforce strict suffix patterns for small personal projects with fewer than 10 components, quick prototypes, or learning projects where simplicity is preferred over organization. Also skip for legacy codebases where changing naming would break too many imports.

### Example

```typescript
// Good: Clear suffix-based naming
import { AssetListPage } from '@/pages/assets/AssetListPage';
import { LoginForm } from '@/components/forms/LoginForm';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { MetricCard } from '@/components/common/MetricCard';

// Bad: Ambiguous naming without suffixes
import { AssetList } from '@/pages/AssetList'; // Is this a page or component?
import { Login } from '@/components/Login'; // Is this a form or page?
```

### Checklist

- [ ] All pages have Page suffix
- [ ] All forms have Form suffix
- [ ] All modals have Modal suffix
- [ ] All specialized components use appropriate suffix
- [ ] Base generic components have no suffix
- [ ] Component files use PascalCase naming

### Troubleshooting

**Issue**: Confusion about which suffix to use
**Solution**: Refer to the suffix table and ask: Is this a complete page? Use Page. Is it a form? Use Form. Is it reusable and generic? No suffix needed.

**Issue**: Import paths become too long with suffixes
**Solution**: Use path aliases configured in tsconfig.json to shorten imports. Example: `@/components/common/ConfirmModal` instead of relative paths.

### Best Practices

- Start with suffix patterns from project inception to avoid massive refactoring later
- Use find/grep commands to locate all components of same category quickly
- Keep suffix patterns consistent across team members by documenting in project README

## [Suffix Table by Category]()

This section presents a comprehensive table mapping component categories to their corresponding suffix patterns, with examples and recommended locations in the project structure.

| Category | Suffix | Example | Location |
|-----------|--------|---------|-------------|
| **Pages** | `Page` | `AssetListPage.tsx` | `src/pages/` |
| **Layouts** | `Layout` | `MainLayout.tsx` | `src/components/layouts/` |
| **Sections** | `Section` | `HeaderSection.tsx`, `HeroSection.tsx` | `src/components/sections/` |
| **Modals** | `Modal` | `ConfirmModal.tsx` | `src/components/common/` |
| **Forms** | `Form` | `LoginForm.tsx`, `AssetForm.tsx` | `src/components/forms/` |
| **Cards** | `Card` | `MetricCard.tsx` | `src/components/common/` |
| **Charts** | `Chart` | `LineChart.tsx` | `src/components/common/` |
| **Dropdowns** | `Dropdown` | `AlertsDropdown.tsx` | `src/components/common/` |
| **Popovers** | `Popover` | `AssetPopover.tsx` | `src/components/common/` |
| **Custom Buttons** | `Button` | `SubmitButton.tsx` | `src/components/common/` |
| **Custom Inputs** | `Input` | `DateInput.tsx` | `src/components/common/` |
| **Containers** | `Container` | `DataContainer.tsx` | `src/components/containers/` |
| **Providers** | `Provider` | `AuthProvider.tsx` | `src/contexts/` |
| **Hooks** | `use[Name]` | `useAuth.ts`, `useNotifications.ts` | `src/hooks/` |
| **Guards** | `Route` | `PrivateRoute.tsx` | `src/components/guards/` |
| **Base Components** | no suffix | `Button.tsx`, `Input.tsx` | `src/components/common/` |

## [Differentiation: Section vs Common Component]()

This section clarifies the distinction between Section components (page-specific visual blocks) and Common components (reusable generic elements) to ensure proper categorization.

### Section
Component that represents a **complete visual section** of a page:
- Usually used once per page
- Contains specific structure and layout
- Examples: `HeaderSection`, `HeroSection`, `FeaturesSection`, `FooterSection`

### Common Component
**Reusable generic** component used in multiple places:
- Highly reusable
- Configurable via props
- Examples: `Button`, `Card`, `Modal`, `Input`

## [Folder Structure: Minimal vs Complete]()

This section explains the recommended folder organization evolution from a minimal structure for small projects to a complete modular structure for production applications with specialized subfolders for different component categories.

The project folder structure can start simple and evolve as complexity increases.

### When to use?

Start with minimal structure for new projects and MVPs with fewer than 10 components. Migrate to complete structure when project reaches 20+ components, requires multiple specialized folders, or has team members who need clear organization to find components quickly.

### When NOT to use?

Don't use complete structure with many subfolders for simple projects, prototypes, or single-page applications. Avoid over-organizing small codebases as it adds unnecessary complexity without benefit.

### Example

```
# Minimal structure - good for starting projects
src/
├── components/common/     # All reusable components
├── pages/                 # All pages
├── services/              # API services
└── hooks/                 # Custom hooks

# Complete structure - good for production projects
src/
├── components/
│   ├── common/           # Generic reusable components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   ├── sections/         # Section components
│   └── guards/           # Route guards
├── pages/                # Pages organized by feature
├── services/             # API services
└── hooks/                # Custom hooks
```

### Checklist

- [ ] Folder structure matches project size and complexity
- [ ] Components organized in appropriate subfolders
- [ ] Imports use consistent path aliases
- [ ] Team members can easily locate components
- [ ] Migration plan exists if structure needs to scale

### Troubleshooting

**Issue**: Too many files in components/common folder becoming hard to navigate
**Solution**: Create specialized subfolders like forms/, modals/, cards/ and move related components. Update all import statements.

**Issue**: Unsure when to create new subfolder
**Solution**: Create subfolder when you have 3+ components of same category (3+ forms, 3+ layouts, etc).

### Best Practices

- Start minimal and evolve structure as project grows rather than over-organizing from the start
- Document folder structure conventions in project README for team alignment
- Use automated tools or scripts to help migrate components when restructuring folders

### Minimal Structure (Initial Setup)

For new or small projects, start with simplified structure:

```
src/
├── components/
│   └── common/              # All reusable components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── MetricCard.tsx
├── pages/                   # Application pages
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── HomePage.tsx
├── services/                # API services
│   ├── api.ts              # Axios instance
│   └── auth.service.ts
├── contexts/                # Context providers
│   └── AuthProvider.tsx
├── hooks/                   # Custom hooks
│   └── useAuth.ts
├── types/                   # TypeScript types
└── utils/                   # Utility functions
```

**When to use:** Initial setup, small projects (<10 components), MVPs

### Complete Structure (Production Project)

As project grows, organize components in specialized subfolders:

```
src/
├── components/
│   ├── common/              # Reusable base components
│   │   ├── Button.tsx       # Base component without suffix
│   │   ├── Input.tsx        # Base component without suffix
│   │   ├── Modal.tsx        # Base component without suffix
│   │   ├── ConfirmModal.tsx # Specific modal with suffix
│   │   ├── MetricCard.tsx   # Card with suffix
│   │   ├── LineChart.tsx    # Chart with suffix
│   │   └── AlertsDropdown.tsx
│   ├── forms/               # Specific forms
│   │   ├── LoginForm.tsx
│   │   ├── AssetForm.tsx
│   │   └── SearchForm.tsx
│   ├── layouts/             # Page layouts
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── sections/            # Page sections
│   │   ├── HeaderSection.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   └── FooterSection.tsx
│   ├── containers/          # Logical containers
│   │   ├── DataContainer.tsx
│   │   └── AuthContainer.tsx
│   └── guards/              # Route protection
│       ├── PrivateRoute.tsx
│       └── AdminRoute.tsx
├── pages/                   # Complete pages
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── ChangePasswordPage.tsx
│   ├── assets/
│   │   ├── AssetListPage.tsx
│   │   ├── AssetFormPage.tsx
│   │   └── AssetProfilePage.tsx
│   └── dashboard/
│       ├── OverviewPage.tsx
│       └── PerformancePage.tsx
├── services/                # API services
│   ├── api.ts              # Axios instance
│   ├── auth.service.ts
│   ├── asset.service.ts
│   └── user.service.ts
├── contexts/                # Context providers
│   ├── AuthProvider.tsx
│   ├── ToastProvider.tsx
│   └── ThemeProvider.tsx
├── hooks/                   # Custom hooks
│   ├── useAuth.ts
│   ├── useNotifications.ts
│   └── useDebounce.ts
├── types/                   # TypeScript types/interfaces
│   ├── auth.ts
│   └── models/
│       ├── user.ts
│       └── asset.ts
├── utils/                   # Utility functions
│   ├── currency.utils.ts
│   └── date.utils.ts
└── config/                  # Configurations
    └── routes.config.tsx
```

**When to use:** Production project, >20 components, multiple modules

### Migration: Minimal → Complete

**When to migrate subfolders:**

1. **`forms/`**: When you have 3+ specific forms
2. **`layouts/`**: When you have 2+ different layouts (ex: auth + dashboard)
3. **`sections/`**: When you have large reusable sections in multiple pages
4. **`guards/`**: When implementing access control (ex: PrivateRoute, AdminRoute)
5. **`containers/`**: When you have components with complex state logic

**How to migrate:**
```bash
# Create new folders
mkdir -p src/components/{forms,layouts,sections,guards,containers}

# Move files
mv src/components/common/LoginForm.tsx src/components/forms/
mv src/components/common/MainLayout.tsx src/components/layouts/
mv src/components/common/HeaderSection.tsx src/components/sections/

# Update imports in components
```

## [Naming Rules]()

This section defines the mandatory naming conventions for components, hooks, providers and base components to maintain consistency across the codebase.

### PascalCase for Components
All React components must use PascalCase:
- ✅ `MetricCard.tsx`
- ✅ `AssetListPage.tsx`
- ✅ `LoginForm.tsx`
- ❌ `metricCard.tsx`
- ❌ `asset-list-page.tsx`

### Hooks with use Prefix
Custom hooks must always have `use` prefix:
- ✅ `useAuth.ts`
- ✅ `useNotifications.ts`
- ✅ `useDebounce.ts`
- ❌ `auth.ts`
- ❌ `notifications.ts`

### Providers with Provider Suffix
Context providers must have `Provider` suffix:
- ✅ `AuthProvider.tsx`
- ✅ `ToastProvider.tsx`
- ❌ `AuthContext.tsx` (Context is the context, not the Provider)

### Base Components without Suffix
Generic base components don't need suffix:
- ✅ `Button.tsx` (base component)
- ✅ `Input.tsx` (base component)
- ✅ `Modal.tsx` (base component)
- ✅ `SubmitButton.tsx` (specific button)
- ✅ `ConfirmModal.tsx` (specific modal)

### When to use?

Apply these naming rules consistently for all React components, custom hooks, and context providers in your project. Use PascalCase for component files, use prefix for hooks, and appropriate suffixes for specialized components.

### When NOT to use?

Don't apply React naming conventions to non-React files like utility functions (use camelCase), TypeScript types (use PascalCase for types but without component suffixes), or configuration files (use lowercase with hyphens or dots).

### Example

```typescript
// Good naming examples
// Component
export function LoginForm() { /* ... */ }  // LoginForm.tsx

// Hook
export function useAuth() { /* ... */ }    // useAuth.ts

// Provider
export function AuthProvider() { /* ... */ } // AuthProvider.tsx

// Base component
export function Button() { /* ... */ }     // Button.tsx

// Bad naming examples
export function loginForm() { /* ... */ }  // Wrong: camelCase
export function auth() { /* ... */ }       // Wrong: missing 'use' prefix
export function Auth() { /* ... */ }       // Wrong: provider missing suffix
```

### Checklist

- [ ] All component files use PascalCase
- [ ] Component name matches file name exactly
- [ ] Custom hooks have use prefix
- [ ] Context providers have Provider suffix
- [ ] Base components don't have redundant suffixes
- [ ] File extensions are .tsx for components, .ts for hooks

### Troubleshooting

**Issue**: ESLint complaining about component naming
**Solution**: Ensure component function name matches file name and uses PascalCase. Configure ESLint rules for React naming conventions.

**Issue**: Import auto-completion not working
**Solution**: Verify component is exported correctly and file name matches export name exactly. Check tsconfig paths are configured properly.

### Best Practices

- Export component with same name as file for better IDE autocomplete and refactoring support
- Use named exports instead of default exports for easier code searching and refactoring
- Keep one component per file with matching names to maintain clear file organization

## [Practical Naming Examples]()

This section provides real-world examples of naming patterns applied to common component systems like modals, cards, pages and forms.

### Example 1: Modal System
```
src/components/common/
├── Modal.tsx              # Generic base component
├── ConfirmModal.tsx       # Confirmation modal
├── AlertModal.tsx         # Alert modal
├── CommentModal.tsx       # Comment modal
└── SelectWalletModal.tsx  # Wallet selection modal
```

### Example 2: Card System
```
src/components/common/
├── Card.tsx               # Generic base component
├── MetricCard.tsx         # Metric card
├── StatCard.tsx           # Statistic card
├── AssetCard.tsx          # Asset card
└── ProfileCard.tsx        # Profile card
```

### Example 3: Asset Pages
```
src/pages/assets/
├── AssetListPage.tsx      # Asset listing
├── AssetFormPage.tsx      # Creation/editing form
├── AssetProfilePage.tsx   # Detailed profile
└── AssetDashboardPage.tsx # Asset dashboard
```

### Example 4: Forms
```
src/components/forms/
├── LoginForm.tsx          # Login form
├── SignupForm.tsx         # Signup form
├── AssetForm.tsx          # Asset form
├── SearchForm.tsx         # Search form
└── FilterForm.tsx         # Filter form
```

## [Advantages of Suffix Pattern]()

This section explains the key benefits of using suffix patterns in component naming, including quick identification, easier search, collision avoidance and self-documentation.

### Quick Visual Identification
Suffix allows immediate identification of component type when reading code:
```typescript
import { AssetListPage } from '@/pages/assets/AssetListPage';
import { MetricCard } from '@/components/common/MetricCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { LineChart } from '@/components/common/LineChart';
// Without looking at folder, I already know: Page, Card, Modal, Chart
```

### Easier Search
Search by suffix pattern finds all components of category:
```bash
# Find all pages
find src -name "*Page.tsx"

# Find all modals
find src -name "*Modal.tsx"

# Find all charts
find src -name "*Chart.tsx"
```

### Avoids Name Collision
Suffixes allow related names without conflict:
```
AssetList.tsx          # ❌ Ambiguous: is it page or component?
AssetListPage.tsx      # ✅ Clearly a page
AssetListCard.tsx      # ✅ Clearly a card
```

### Self-documentation
Code becomes self-documented by name:
```typescript
// Self-explanatory code
<AssetListPage>
  <HeaderSection />
  <SearchForm />
  <MetricCard />
  <LineChart />
  <DataContainer>
    <AssetCard />
  </DataContainer>
  <ConfirmModal />
</AssetListPage>
```

### When to use?

Use suffix patterns in all medium to large React projects where multiple developers collaborate, code needs to be maintained long-term, or component categories need to be quickly distinguishable. Apply consistently across the entire codebase for maximum benefit.

### When NOT to use?

Don't enforce suffix patterns in very small projects with fewer than 10 total components where the overhead of suffixes outweighs benefits, or in experimental prototypes where rapid iteration matters more than organization.

### Example

```bash
# Example: Finding all forms in project for audit
find src -name "*Form.tsx"
# Output:
# src/components/forms/LoginForm.tsx
# src/components/forms/SignupForm.tsx
# src/components/forms/AssetForm.tsx

# Example: Self-documenting component tree
<DashboardPage>          {/* Clearly a page */}
  <MainLayout>           {/* Clearly a layout */}
    <SearchForm />       {/* Clearly a form */}
    <MetricCard />       {/* Clearly a card */}
    <ConfirmModal />     {/* Clearly a modal */}
  </MainLayout>
</DashboardPage>
```

### Checklist

- [ ] Suffix patterns documented and shared with team
- [ ] All components follow suffix conventions
- [ ] Team members understand which suffix to use for new components
- [ ] Search scripts or tools leverage suffix patterns
- [ ] Code reviews check for suffix compliance

### Troubleshooting

**Issue**: Team members forget to use suffixes
**Solution**: Add ESLint custom rules or pre-commit hooks to enforce suffix patterns. Document patterns prominently in README.

**Issue**: Refactoring existing code to add suffixes breaks many imports
**Solution**: Use IDE refactoring tools to rename files and automatically update imports. Do it incrementally by folder or feature.

### Best Practices

- Establish suffix patterns at project start to avoid costly refactoring later
- Use tooling to enforce patterns automatically through linting or pre-commit checks
- Document suffix table in project README for easy team reference

## [When NOT to Use Suffix]()

This section defines exceptions to the suffix rule, identifying component types where suffixes are unnecessary or redundant due to highly specific or primitive nature.

### Primitive Base Components
Generic base components don't need suffix:
- `Button.tsx` (not `BaseButton.tsx`)
- `Input.tsx` (not `BaseInput.tsx`)
- `Modal.tsx` (not `BaseModal.tsx`)
- `Card.tsx` (not `BaseCard.tsx`)

### Very Specific Components
Components with already very specific names can omit suffix:
- `Sidebar.tsx` (already clear it's a section)
- `Header.tsx` (already clear it's a section)
- `Footer.tsx` (already clear it's a section)
- `Tooltip.tsx` (already clear it's a UI component)

## [Import Organization]()

This section presents the standard import order convention to maintain clean and organized code, grouping imports by type and dependency level.

Keep imports organized by category:

```typescript
// 1. React and external libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Pages
import { AssetListPage } from '@/pages/assets/AssetListPage';

// 3. Layouts and Sections
import { MainLayout } from '@/components/layouts/MainLayout';
import { HeaderSection } from '@/components/sections/HeaderSection';

// 4. Forms
import { AssetForm } from '@/components/forms/AssetForm';

// 5. Common components
import { MetricCard } from '@/components/common/MetricCard';
import { LineChart } from '@/components/common/LineChart';
import { ConfirmModal } from '@/components/common/ConfirmModal';

// 6. Hooks
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

// 7. Services and utils
import { assetService } from '@/services/asset.service';
import { formatCurrency } from '@/utils/currency.utils';

// 8. Types
import type { Asset } from '@/types/models/asset';

// 9. Styles (if using CSS modules)
import styles from './AssetListPage.module.css';
```

## [Naming Checklist]()

This section provides a quick reference checklist to verify that new components follow all naming conventions and organizational standards.

When creating a new component, check:

- [ ] Name is in PascalCase
- [ ] Correct suffix according to category
- [ ] File is in appropriate folder
- [ ] Exported component name matches file name
- [ ] Custom hooks have `use` prefix
- [ ] Providers have `Provider` suffix
- [ ] Primitive base components without suffix
- [ ] Import/export follow project convention

## [Complete Examples]()

This section presents complete implementation examples showing how naming patterns are applied in real component code with proper TypeScript typing.

### Complete Example: Modal
```typescript
// src/components/common/ConfirmModal.tsx
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </Modal>
  );
}
```

### Complete Example: Page
```typescript
// src/pages/assets/AssetListPage.tsx
import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SearchForm } from '@/components/forms/SearchForm';
import { MetricCard } from '@/components/common/MetricCard';
import { AssetCard } from '@/components/common/AssetCard';
import { useAssets } from '@/hooks/useAssets';

export function AssetListPage() {
  const { assets, loading } = useAssets();
  const [search, setSearch] = useState('');

  return (
    <MainLayout>
      <h1>My Assets</h1>
      <SearchForm onSearch={setSearch} />
      <MetricCard title="Total" value={assets.length} />
      <div className="grid">
        {assets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </MainLayout>
  );
}
```

### Complete Example: Hook
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import type { User } from '@/types/models/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authentication logic
  }, []);

  return { user, loading };
}
```

## [References]()

This section lists related documentation files and external resources for deeper understanding of React naming conventions and TypeScript best practices.

- File: `.rules/frontend-technology-stack.md` - Technology stack
- File: `.rules/how-to-create-common-components-frontend.md` - Component creation
- [React Naming Conventions](https://react.dev/learn/thinking-in-react)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
