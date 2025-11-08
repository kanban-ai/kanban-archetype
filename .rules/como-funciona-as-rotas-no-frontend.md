# [Como funcionam as rotas no Frontend?]()

> Guia completo sobre roteamento com React Router DOM no projeto.

## [Visão Geral]()

O projeto usa **React Router DOM v7** com:
- Configuração centralizada de rotas
- Rotas públicas (login, signup)
- Rotas privadas (protegidas por autenticação)
- Layout compartilhado
- Parâmetros dinâmicos

## [Estrutura de Arquivos]()

```
src/
 App.tsx                      # Configura rotas
 config/
    routes.config.tsx        # Definição centralizada de rotas
 components/
    Layout.tsx               # Layout com navegação
    PrivateRoute.tsx         # Guard de autenticação
 pages/                       # Componentes de página
     auth/
        Login.tsx
        Signup.tsx
     views/
        OverviewPage.tsx
        ...
     assets/
         AssetListPage.tsx
         ...
```

## [Configuração Centralizada]()

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
    name: 'Cadastro',
  },
];

export const privateRoutes: RouteConfig[] = [
  {
    path: '/overview',
    element: <OverviewPage />,
    name: 'Visão Geral',
    icon: <DashboardIcon />,
    showInMenu: true,
  },
  {
    path: '/assets',
    element: <AssetListPage />,
    name: 'Ativos',
    icon: <AssetsIcon />,
    showInMenu: true,
  },
  {
    path: '/assets/:id',
    element: <AssetProfilePage />,
    name: 'Perfil do Ativo',
    showInMenu: false, // Não aparece no menu
  },
  // ...
];
```

## [App.tsx - Configuração Principal]()

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
          {/* Rotas Públicas */}
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}

          {/* Rotas Privadas com Layout */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            {privateRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>

          {/* Redirect raiz */}
          <Route path="/" element={<Navigate to="/overview" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## [PrivateRoute - Guard de Autenticação]()

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

## [Layout - Estrutura Compartilhada]()

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
          <Outlet /> {/* Renderiza a rota atual */}
        </main>
      </div>
    </div>
  );
}
```

## [Navegação]()

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
    navigate(-1); // Volta uma página
  };

  return (
    <div>
      <button onClick={handleCreate}>Novo Produto</button>
      <button onClick={handleBack}>Voltar</button>
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
        Novo Produto
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

### [NavLink (com active state)]()

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
        Ativos
      </NavLink>
    </nav>
  );
}
```

## [Parâmetros de Rota]()

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

### [Múltiplos Parâmetros]()

```typescript
// Rota: /wallets/:walletId/assets/:assetId

function WalletAssetDetail() {
  const { walletId, assetId } = useParams<{
    walletId: string;
    assetId: string;
  }>();

  return <div>Wallet {walletId}, Asset {assetId}</div>;
}
```

## [Query Parameters]()

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
        placeholder="Buscar..."
      />
      {/* URL: /products?page=2&search=notebook */}
    </div>
  );
}
```

## [Rotas Aninhadas]()

```typescript
// Configuração
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
      <h1>Ativos</h1>
      <Outlet /> {/* Renderiza a rota filha */}
    </div>
  );
}
```

## [Redirecionamentos]()

### [Navigate Component]()

```typescript
import { Navigate } from 'react-router-dom';

function OldProductPage() {
  return <Navigate to="/products" replace />;
}
```

### [Redirect Condicional]()

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

```typescript
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  // location.pathname: "/assets/123"
  // location.search: "?page=2"
  // location.hash: "#section"

  return (
    <div>
      Você está em: {location.pathname}
    </div>
  );
}
```

## [Passar Estado Entre Rotas]()

```typescript
// Origem
navigate('/products/new', {
  state: { from: 'dashboard', category: 'electronics' }
});

// Destino
function ProductForm() {
  const location = useLocation();
  const state = location.state as { from: string; category: string };

  console.log(state.from); // 'dashboard'
  console.log(state.category); // 'electronics'
}
```

## [Menu Dinâmico]()

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

## [Lazy Loading de Rotas]()

```typescript
import { lazy, Suspense } from 'react';

// Lazy load
const AssetListPage = lazy(() => import('@/pages/assets/AssetListPage'));
const AssetProfilePage = lazy(() => import('@/pages/assets/AssetProfilePage'));

// Uso
<Route
  path="/assets"
  element={
    <Suspense fallback={<div>Carregando...</div>}>
      <AssetListPage />
    </Suspense>
  }
/>
```

## [404 - Página Não Encontrada]()

```typescript
// App.tsx
<Routes>
  {/* Rotas normais */}
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />

  {/* 404 - deve ser a última */}
  <Route path="*" element={<NotFound />} />
</Routes>

// NotFound.tsx
function NotFound() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>404 - Página não encontrada</h1>
      <button onClick={() => navigate('/')}>
        Ir para home
      </button>
    </div>
  );
}
```

## [Breadcrumbs]()

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

## [Boas Práticas]()

1. **Centralize rotas**: Use arquivo de configuração
2. **Lazy loading**: Para rotas pesadas
3. **Guards**: Proteja rotas privadas
4. **Layout compartilhado**: Use Outlet para rotas aninhadas
5. **404**: Sempre tenha rota catch-all
6. **TypeScript**: Tipo os parâmetros com useParams
7. **Replace**: Use quando não quer histórico (`navigate('/login', { replace: true })`)

## [Checklist]()

- [ ] Rotas públicas e privadas separadas
- [ ] PrivateRoute implementado
- [ ] Layout com Outlet para rotas aninhadas
- [ ] 404 página configurada
- [ ] Redirect de raiz para página inicial
- [ ] useParams tipado
- [ ] Navegação via useNavigate ou Link
- [ ] Menu dinâmico a partir de config

## [Referências]()

- [React Router Documentation](https://reactrouter.com/en/main)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
