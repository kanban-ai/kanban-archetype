# [What is the React component naming pattern in Frontend?]()

> Naming conventions with suffixes for quick identification of React component categories.

## [Overview]()

This document defines suffix patterns for React file and component naming, facilitating identification, search and code organization.

## [Suffix Table by Category]()

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

### [Section]()
Component that represents a **complete visual section** of a page:
- Usually used once per page
- Contains specific structure and layout
- Examples: `HeaderSection`, `HeroSection`, `FeaturesSection`, `FooterSection`

### [Common Component]()
**Reusable generic** component used in multiple places:
- Highly reusable
- Configurable via props
- Examples: `Button`, `Card`, `Modal`, `Input`

## [Folder Structure: Minimal vs Complete]()

The project folder structure can start simple and evolve as complexity increases.

### [Minimal Structure (Initial Setup)]()

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

### [Complete Structure (Production Project)]()

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

### [Migration: Minimal → Complete]()

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

### [PascalCase for Components]()
All React components must use PascalCase:
- ✅ `MetricCard.tsx`
- ✅ `AssetListPage.tsx`
- ✅ `LoginForm.tsx`
- ❌ `metricCard.tsx`
- ❌ `asset-list-page.tsx`

### [Hooks with use Prefix]()
Custom hooks must always have `use` prefix:
- ✅ `useAuth.ts`
- ✅ `useNotifications.ts`
- ✅ `useDebounce.ts`
- ❌ `auth.ts`
- ❌ `notifications.ts`

### [Providers with Provider Suffix]()
Context providers must have `Provider` suffix:
- ✅ `AuthProvider.tsx`
- ✅ `ToastProvider.tsx`
- ❌ `AuthContext.tsx` (Context is the context, not the Provider)

### [Base Components without Suffix]()
Generic base components don't need suffix:
- ✅ `Button.tsx` (base component)
- ✅ `Input.tsx` (base component)
- ✅ `Modal.tsx` (base component)
- ✅ `SubmitButton.tsx` (specific button)
- ✅ `ConfirmModal.tsx` (specific modal)

## [Practical Naming Examples]()

### [Example 1: Modal System]()
```
src/components/common/
├── Modal.tsx              # Generic base component
├── ConfirmModal.tsx       # Confirmation modal
├── AlertModal.tsx         # Alert modal
├── CommentModal.tsx       # Comment modal
└── SelectWalletModal.tsx  # Wallet selection modal
```

### [Example 2: Card System]()
```
src/components/common/
├── Card.tsx               # Generic base component
├── MetricCard.tsx         # Metric card
├── StatCard.tsx           # Statistic card
├── AssetCard.tsx          # Asset card
└── ProfileCard.tsx        # Profile card
```

### [Example 3: Asset Pages]()
```
src/pages/assets/
├── AssetListPage.tsx      # Asset listing
├── AssetFormPage.tsx      # Creation/editing form
├── AssetProfilePage.tsx   # Detailed profile
└── AssetDashboardPage.tsx # Asset dashboard
```

### [Example 4: Forms]()
```
src/components/forms/
├── LoginForm.tsx          # Login form
├── SignupForm.tsx         # Signup form
├── AssetForm.tsx          # Asset form
├── SearchForm.tsx         # Search form
└── FilterForm.tsx         # Filter form
```

## [Advantages of Suffix Pattern]()

### [Quick Visual Identification]()
Suffix allows immediate identification of component type when reading code:
```typescript
import { AssetListPage } from '@/pages/assets/AssetListPage';
import { MetricCard } from '@/components/common/MetricCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { LineChart } from '@/components/common/LineChart';
// Without looking at folder, I already know: Page, Card, Modal, Chart
```

### [Easier Search]()
Search by suffix pattern finds all components of category:
```bash
# Find all pages
find src -name "*Page.tsx"

# Find all modals
find src -name "*Modal.tsx"

# Find all charts
find src -name "*Chart.tsx"
```

### [Avoids Name Collision]()
Suffixes allow related names without conflict:
```
AssetList.tsx          # ❌ Ambiguous: is it page or component?
AssetListPage.tsx      # ✅ Clearly a page
AssetListCard.tsx      # ✅ Clearly a card
```

### [Self-documentation]()
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

## [When NOT to Use Suffix]()

### [Primitive Base Components]()
Generic base components don't need suffix:
- `Button.tsx` (not `BaseButton.tsx`)
- `Input.tsx` (not `BaseInput.tsx`)
- `Modal.tsx` (not `BaseModal.tsx`)
- `Card.tsx` (not `BaseCard.tsx`)

### [Very Specific Components]()
Components with already very specific names can omit suffix:
- `Sidebar.tsx` (already clear it's a section)
- `Header.tsx` (already clear it's a section)
- `Footer.tsx` (already clear it's a section)
- `Tooltip.tsx` (already clear it's a UI component)

## [Import Organization]()

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

### [Complete Example: Modal]()
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

### [Complete Example: Page]()
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

### [Complete Example: Hook]()
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

- File: `.rules/frontend-technology-stack.md` - Technology stack
- File: `.rules/how-to-create-common-components-frontend.md` - Component creation
- [React Naming Conventions](https://react.dev/learn/thinking-in-react)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
