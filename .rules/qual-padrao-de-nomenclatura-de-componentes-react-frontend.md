# [Qual o padrão de nomenclatura de componentes React no Frontend?]()

> Convenções de nomenclatura com sufixos para identificação rápida de categorias de componentes React.

## [Visão Geral]()

Este documento define padrões de sufixos para nomenclatura de arquivos e componentes React, facilitando identificação, busca e organização do código.

## [Tabela de Sufixos por Categoria]()

| Categoria | Sufixo | Exemplo | Localização |
|-----------|--------|---------|-------------|
| **Páginas** | `Page` | `AssetListPage.tsx` | `src/pages/` |
| **Layouts** | `Layout` | `MainLayout.tsx` | `src/components/layouts/` |
| **Seções** | `Section` | `HeaderSection.tsx`, `HeroSection.tsx` | `src/components/sections/` |
| **Modais** | `Modal` | `ConfirmModal.tsx` | `src/components/common/` |
| **Formulários** | `Form` | `LoginForm.tsx`, `AssetForm.tsx` | `src/components/forms/` |
| **Cards** | `Card` | `MetricCard.tsx` | `src/components/common/` |
| **Gráficos** | `Chart` | `LineChart.tsx` | `src/components/common/` |
| **Dropdowns** | `Dropdown` | `AlertsDropdown.tsx` | `src/components/common/` |
| **Popovers** | `Popover` | `AssetPopover.tsx` | `src/components/common/` |
| **Botões Customizados** | `Button` | `SubmitButton.tsx` | `src/components/common/` |
| **Inputs Customizados** | `Input` | `DateInput.tsx` | `src/components/common/` |
| **Containers** | `Container` | `DataContainer.tsx` | `src/components/containers/` |
| **Providers** | `Provider` | `AuthProvider.tsx` | `src/contexts/` |
| **Hooks** | `use[Nome]` | `useAuth.ts`, `useNotifications.ts` | `src/hooks/` |
| **Guards** | `Route` | `PrivateRoute.tsx` | `src/components/guards/` |
| **Componentes Base** | sem sufixo | `Button.tsx`, `Input.tsx` | `src/components/common/` |

## [Diferenciação: Section vs Componente Comum]()

### [Section (Seção)]()
Componente que representa uma **seção visual completa** de uma página:
- Geralmente usado uma única vez por página
- Contém estrutura e layout específico
- Exemplos: `HeaderSection`, `HeroSection`, `FeaturesSection`, `FooterSection`

### [Componente Comum]()
Componente **reutilizável genérico** usado em múltiplos lugares:
- Altamente reutilizável
- Configurável via props
- Exemplos: `Button`, `Card`, `Modal`, `Input`

## [Estrutura de Pastas: Mínima vs Completa]()

A estrutura de pastas do projeto pode começar simples e evoluir conforme a complexidade aumenta.

### [Estrutura Mínima (Setup Inicial)]()

Para projetos novos ou pequenos, comece com estrutura simplificada:

```
src/
├── components/
│   └── common/              # Todos os componentes reutilizáveis
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── MetricCard.tsx
├── pages/                   # Páginas da aplicação
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── HomePage.tsx
├── services/                # Services de API
│   ├── api.ts              # Instância Axios
│   └── auth.service.ts
├── contexts/                # Context providers
│   └── AuthProvider.tsx
├── hooks/                   # Custom hooks
│   └── useAuth.ts
├── types/                   # TypeScript types
└── utils/                   # Funções utilitárias
```

**Quando usar:** Setup inicial, projetos pequenos (<10 componentes), MVPs

### [Estrutura Completa (Projeto em Produção)]()

Conforme o projeto cresce, organize componentes em subpastas especializadas:

```
src/
├── components/
│   ├── common/              # Componentes base reutilizáveis
│   │   ├── Button.tsx       # Componente base sem sufixo
│   │   ├── Input.tsx        # Componente base sem sufixo
│   │   ├── Modal.tsx        # Componente base sem sufixo
│   │   ├── ConfirmModal.tsx # Modal específico com sufixo
│   │   ├── MetricCard.tsx   # Card com sufixo
│   │   ├── LineChart.tsx    # Gráfico com sufixo
│   │   └── AlertsDropdown.tsx
│   ├── forms/               # Formulários específicos
│   │   ├── LoginForm.tsx
│   │   ├── AssetForm.tsx
│   │   └── SearchForm.tsx
│   ├── layouts/             # Layouts de página
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── sections/            # Seções de página
│   │   ├── HeaderSection.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   └── FooterSection.tsx
│   ├── containers/          # Containers lógicos
│   │   ├── DataContainer.tsx
│   │   └── AuthContainer.tsx
│   └── guards/              # Proteção de rotas
│       ├── PrivateRoute.tsx
│       └── AdminRoute.tsx
├── pages/                   # Páginas completas
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
├── services/                # Services de API
│   ├── api.ts              # Instância Axios
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
├── utils/                   # Funções utilitárias
│   ├── currency.utils.ts
│   └── date.utils.ts
└── config/                  # Configurações
    └── routes.config.tsx
```

**Quando usar:** Projeto em produção, >20 componentes, múltiplos módulos

### [Migração: Mínima → Completa]()

**Quando migrar subpastas:**

1. **`forms/`**: Quando tiver 3+ formulários específicos
2. **`layouts/`**: Quando tiver 2+ layouts diferentes (ex: auth + dashboard)
3. **`sections/`**: Quando tiver seções grandes reutilizáveis em múltiplas páginas
4. **`guards/`**: Quando implementar controle de acesso (ex: PrivateRoute, AdminRoute)
5. **`containers/`**: Quando tiver componentes com lógica de estado complexa

**Como migrar:**
```bash
# Criar novas pastas
mkdir -p src/components/{forms,layouts,sections,guards,containers}

# Mover arquivos
mv src/components/common/LoginForm.tsx src/components/forms/
mv src/components/common/MainLayout.tsx src/components/layouts/
mv src/components/common/HeaderSection.tsx src/components/sections/

# Atualizar imports nos componentes
```

## [Regras de Nomenclatura]()

### [PascalCase para Componentes]()
Todos os componentes React devem usar PascalCase:
- ✅ `MetricCard.tsx`
- ✅ `AssetListPage.tsx`
- ✅ `LoginForm.tsx`
- ❌ `metricCard.tsx`
- ❌ `asset-list-page.tsx`

### [Hooks com Prefixo use]()
Hooks customizados devem sempre ter prefixo `use`:
- ✅ `useAuth.ts`
- ✅ `useNotifications.ts`
- ✅ `useDebounce.ts`
- ❌ `auth.ts`
- ❌ `notifications.ts`

### [Providers com Sufixo Provider]()
Context providers devem ter sufixo `Provider`:
- ✅ `AuthProvider.tsx`
- ✅ `ToastProvider.tsx`
- ❌ `AuthContext.tsx` (Context é o contexto, não o Provider)

### [Componentes Base sem Sufixo]()
Componentes base genéricos não precisam de sufixo:
- ✅ `Button.tsx` (componente base)
- ✅ `Input.tsx` (componente base)
- ✅ `Modal.tsx` (componente base)
- ✅ `SubmitButton.tsx` (botão específico)
- ✅ `ConfirmModal.tsx` (modal específico)

## [Exemplos Práticos de Nomenclatura]()

### [Exemplo 1: Sistema de Modais]()
```
src/components/common/
├── Modal.tsx              # Componente base genérico
├── ConfirmModal.tsx       # Modal de confirmação
├── AlertModal.tsx         # Modal de alerta
├── CommentModal.tsx       # Modal de comentário
└── SelectWalletModal.tsx  # Modal de seleção de carteira
```

### [Exemplo 2: Sistema de Cards]()
```
src/components/common/
├── Card.tsx               # Componente base genérico
├── MetricCard.tsx         # Card de métrica
├── StatCard.tsx           # Card de estatística
├── AssetCard.tsx          # Card de ativo
└── ProfileCard.tsx        # Card de perfil
```

### [Exemplo 3: Páginas de Ativos]()
```
src/pages/assets/
├── AssetListPage.tsx      # Listagem de ativos
├── AssetFormPage.tsx      # Formulário de criação/edição
├── AssetProfilePage.tsx   # Perfil detalhado
└── AssetDashboardPage.tsx # Dashboard de ativos
```

### [Exemplo 4: Formulários]()
```
src/components/forms/
├── LoginForm.tsx          # Formulário de login
├── SignupForm.tsx         # Formulário de cadastro
├── AssetForm.tsx          # Formulário de ativo
├── SearchForm.tsx         # Formulário de busca
└── FilterForm.tsx         # Formulário de filtros
```

## [Vantagens do Padrão com Sufixos]()

### [Identificação Visual Rápida]()
O sufixo permite identificar imediatamente o tipo de componente ao ler o código:
```typescript
import { AssetListPage } from '@/pages/assets/AssetListPage';
import { MetricCard } from '@/components/common/MetricCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { LineChart } from '@/components/common/LineChart';
// Sem olhar a pasta, já sei: Page, Card, Modal, Chart
```

### [Busca Facilitada]()
Buscar por padrão de sufixo encontra todos os componentes da categoria:
```bash
# Encontrar todas as páginas
find src -name "*Page.tsx"

# Encontrar todos os modais
find src -name "*Modal.tsx"

# Encontrar todos os gráficos
find src -name "*Chart.tsx"
```

### [Evita Colisão de Nomes]()
Sufixos permitem ter nomes relacionados sem conflito:
```
AssetList.tsx          # ❌ Ambíguo: é página ou componente?
AssetListPage.tsx      # ✅ Claramente uma página
AssetListCard.tsx      # ✅ Claramente um card
```

### [Auto-documentação]()
O código fica auto-documentado pelo nome:
```typescript
// Código auto-explicativo
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

## [Quando NÃO Usar Sufixo]()

### [Componentes Base Primitivos]()
Componentes base genéricos não precisam de sufixo:
- `Button.tsx` (não `BaseButton.tsx`)
- `Input.tsx` (não `BaseInput.tsx`)
- `Modal.tsx` (não `BaseModal.tsx`)
- `Card.tsx` (não `BaseCard.tsx`)

### [Componentes Muito Específicos]()
Componentes com nomes já muito específicos podem dispensar sufixo:
- `Sidebar.tsx` (já é claro que é uma seção)
- `Header.tsx` (já é claro que é uma seção)
- `Footer.tsx` (já é claro que é uma seção)
- `Tooltip.tsx` (já é claro que é um componente de UI)

## [Organização de Imports]()

Mantenha imports organizados por categoria:

```typescript
// 1. React e bibliotecas externas
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Páginas
import { AssetListPage } from '@/pages/assets/AssetListPage';

// 3. Layouts e Seções
import { MainLayout } from '@/components/layouts/MainLayout';
import { HeaderSection } from '@/components/sections/HeaderSection';

// 4. Formulários
import { AssetForm } from '@/components/forms/AssetForm';

// 5. Componentes comuns
import { MetricCard } from '@/components/common/MetricCard';
import { LineChart } from '@/components/common/LineChart';
import { ConfirmModal } from '@/components/common/ConfirmModal';

// 6. Hooks
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

// 7. Serviços e utils
import { assetService } from '@/services/asset.service';
import { formatCurrency } from '@/utils/currency.utils';

// 8. Tipos
import type { Asset } from '@/types/models/asset';

// 9. Estilos (se houver CSS modules)
import styles from './AssetListPage.module.css';
```

## [Checklist de Nomenclatura]()

Ao criar um novo componente, verifique:

- [ ] Nome está em PascalCase
- [ ] Sufixo correto conforme categoria
- [ ] Arquivo está na pasta apropriada
- [ ] Nome do componente exportado igual ao nome do arquivo
- [ ] Hooks customizados têm prefixo `use`
- [ ] Providers têm sufixo `Provider`
- [ ] Componentes base primitivos sem sufixo
- [ ] Import/export seguem convenção do projeto

## [Exemplos Completos]()

### [Exemplo Completo: Modal]()
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
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onCancel}>Cancelar</button>
    </Modal>
  );
}
```

### [Exemplo Completo: Página]()
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
      <h1>Meus Ativos</h1>
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

### [Exemplo Completo: Hook]()
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import type { User } from '@/types/models/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lógica de autenticação
  }, []);

  return { user, loading };
}
```

## [Referências]()

- Arquivo: `.rules/qual-tecnologia-usa-frontend.md` - Stack tecnológica
- Arquivo: `.rules/como-criar-componentes-comum-frontend.md` - Criação de componentes
- [React Naming Conventions](https://react.dev/learn/thinking-in-react)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
