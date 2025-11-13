# [Qual tecnologia usa o Frontend?]()

> Este documento descreve todas as tecnologias, frameworks e bibliotecas utilizadas no frontend do projeto.

## [Stack Principal]()

Tecnologias core utilizadas no frontend incluindo framework React, build tool Vite e linguagem TypeScript.

### [Framework e Runtime]()

- **React**: Framework principal
  - Biblioteca JavaScript para construção de interfaces
  - Baseada em componentes reutilizáveis
  - Virtual DOM para performance
  - Hooks para gerenciamento de estado

- **TypeScript**: Linguagem de programação
  - Superset do JavaScript com tipagem estática
  - Target: ES2022
  - Strict mode habilitado
  - Type safety em toda aplicação

- **Vite**: Build tool e dev server
  - Build extremamente rápido
  - Hot Module Replacement (HMR)
  - ES modules nativos
  - Plugin React com SWC

- **SWC**: Transpilador
  - Alternativa ao Babel (muito mais rápido)
  - Escrito em Rust
  - Usado via @vitejs/plugin-react-swc

## [Estilização]()

- **Tailwind CSS v4**: Framework CSS utilitário
  - Classes utilitárias pré-definidas
  - Dark mode configurado como padrão
  - Tema customizado com cor principal azul (#3b82f6)
  - Mobile-first responsive design
  - Versão mais recente (v4.0+) lançada em janeiro/2025
  - Plugin Vite nativo (`@tailwindcss/vite`) para performance máxima
  - Configuração zero - sem necessidade de `tailwind.config.js` ou `postcss.config.js`
  - Sintaxe CSS moderna com `@import` e `@theme`

## [Roteamento]()

- **React Router DOM**: Sistema de rotas
  - Roteamento client-side
  - Navegação sem reload de página
  - Suporte a rotas dinâmicas e aninhadas
  - Guards de autenticação (PrivateRoute)
  - Configuração centralizada de rotas

## [Requisições HTTP]()

- **Axios**: Cliente HTTP
  - Requisições para API REST
  - Interceptors para autenticação
  - Tratamento de erros centralizado
  - Suporte a cancelamento de requisições

## [Visualização de Dados]()

Bibliotecas para renderização de gráficos, tooltips e formatação de datas visuais.

### [Gráficos]()

- **Chart.js**: Biblioteca de gráficos
  - Gráficos de linha, barra, rosca
  - Customizável e responsivo
  - Canvas-based para performance

- **react-chartjs-2**: Wrapper React
  - Integração Chart.js com React
  - Componentes React para gráficos
  - Tipagem TypeScript

- **chartjs-plugin-annotation**: Plugin de anotações
  - Adiciona linhas e anotações em gráficos
  - Marcadores customizados

### [UI Components]()

- **Tippy.js**: Tooltips e popovers
  - Biblioteca leve e performática
  - Posicionamento automático inteligente
  - Customizável

- **@tippyjs/react**: Integração React
  - Componente React para Tippy.js
  - Props tipadas

### [Utilitários]()

- **timeago.js**: Formatação de datas
  - Datas relativas (ex: "há 5 minutos")
  - Suporte a internacionalização
  - Leve e sem dependências

## [Gerenciamento de Estado]()

Solução de gerenciamento de estado global utilizando Context API nativa do React sem bibliotecas externas.

### [Context API (Nativo React)]()

O projeto usa Context API nativa do React, sem bibliotecas externas:

1. **AuthContext**: Autenticação global
   - Estado: user, token, isLoading
   - Métodos: login, logout
   - Persistência em localStorage

2. **ToastContext**: Notificações
   - Sistema de toasts/snackbars
   - Auto-dismiss configurável
   - Tipos: success, error, info, warning

3. **PageInfoContext**: Informações da página
   - Metadados da página atual
   - Breadcrumbs e título

## [Ferramentas de Desenvolvimento]()

Tools para desenvolvimento TypeScript, linting e validação de código.

### [TypeScript]()

- **typescript**
- **@types/react**: Tipagens React
- **@types/react-dom**: Tipagens React DOM
- **@types/node**: Tipagens Node.js

### [Linting e Formatação]()

- **ESLint**: Linter JavaScript/TypeScript
  - Análise estática de código
  - Detecção de problemas
  - Regras customizadas

- **@eslint/js**: Configuração ESLint base

- **typescript-eslint**: Plugin TypeScript
  - Regras específicas para TypeScript
  - Parser TypeScript

- **eslint-plugin-react-hooks**: Validação de Hooks
  - Regras de Hooks do React
  - Previne bugs comuns

- **eslint-plugin-react-refresh**: Fast Refresh
  - Validação de componentes para HMR
  - Mantém estado durante hot reload

- **globals**: Definições globais
  - Variáveis globais do navegador
  - Compatibilidade ESLint

## [Estrutura de Componentes]()

Organização de componentes reutilizáveis categorizados por tipo e funcionalidade.

### [Componentes Comuns (src/components/common/)]()

- **Modals**: Modal, AlertModal, ConfirmModal, CommentModal, SelectWalletModal
- **Charts**: LineChart, BarChart, DoughnutChart, EvolutionBarChart
- **Cards**: MetricCard, StatCard
- **Dropdowns**: AlertsDropdown, AssetAlertsDropdown
- **Popovers**: AssetPopover, CommentPopover
- **Form Elements**: DatePicker
- **UI**: ActionButtonBar, AllocationBar, TreeView, MiniPerfil

### [Componentes de Autenticação]()

- **AuthBanner**: Banner de autenticação
- **PrivateRoute**: Guard de rotas privadas

### [Componentes de Layout]()

- **Layout**: Layout principal com navegação
- **ToastContainer**: Container de notificações

## [Páginas (src/pages/)]()

Lista completa de páginas da aplicação organizadas por módulo funcional.

### [Autenticação]()
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

### [Gestão de Ativos]()
- AssetListPage
- AssetFormPage
- AssetProfilePage (com tabs)

### [Rebalanceamento]()
- RebalancePage
- RebalanceDetailPage
- RebalanceAnalyzePage

### [Cadastros]()
- SectorListPage, SectorFormPage
- CurrencyListPage, CurrencyFormPage
- WalletListPage, WalletFormPage, WalletDashboardPage

### [Erros]()
- Forbidden

## [Serviços (src/services/)]()

- **api.ts**: Instância Axios configurada
- **auth.service.ts**: Serviço de autenticação
- **alert.service.ts**: Serviço de alertas
- **comment.service.ts**: Serviço de comentários
- **config.service.ts**: Serviço de configurações

## [Utilitários (src/utils/)]()

Funções auxiliares para formatação de moeda e manipulação de datas.

- **currency.utils.ts**: Formatação de moeda
- **date.utils.ts**: Manipulação de datas

## [Tipos TypeScript (src/types/)]()

Definições de tipos e interfaces TypeScript para autenticação e modelos de dados.

- **auth.ts**: Tipos de autenticação
- **models/user.ts**: Model de usuário

## [Configurações]()

Arquivos de configuração do projeto incluindo Vite, TypeScript e Tailwind.

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

## [Scripts NPM]()

Comandos disponíveis no package.json para desenvolvimento, build e verificação de código.

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## [Variáveis de Ambiente]()

Configuração de variáveis de ambiente com prefixo VITE_ para uso no código cliente.

```env
VITE_API_URL=http://localhost:3000/api
```

Acessível em código via:
```typescript
import.meta.env.VITE_API_URL
```

## [Padrões e Convenções]()

Convenções de nomenclatura, organização de código e boas práticas adotadas no projeto.

### [Nomenclatura de Componentes]()

O projeto utiliza sufixos para identificação rápida de categorias de componentes.

**Documentação completa de nomenclatura**: Ver `.rules/qual-padrao-de-nomenclatura-de-componentes-react-frontend.md`

**Exemplos principais:**
- Páginas: sufixo `Page` (ex: `AssetListPage.tsx`)
- Formulários: sufixo `Form` (ex: `LoginForm.tsx`)
- Modais: sufixo `Modal` (ex: `ConfirmModal.tsx`)
- Providers: sufixo `Provider` (ex: `AuthProvider.tsx`)
- Hooks: prefixo `use` (ex: `useAuth.ts`)
- Componentes base: sem sufixo (ex: `Button.tsx`, `Input.tsx`)

### [Estrutura de Arquivos]()
- Componentes: PascalCase (ex: MetricCard.tsx)
- Utilitários: kebab-case (ex: currency.utils.ts)
- Serviços: kebab-case com sufixo `.service.ts` (ex: auth.service.ts)

### [Organização de Imports]()
1. React e bibliotecas externas
2. Componentes locais
3. Serviços e utils
4. Tipos
5. Estilos

### [Hooks Customizados]()
- Prefixo `use` (ex: useNotifications, useAuth)
- Localizados em `src/hooks/`

### [Context API]()
- Arquivo/Componente: Sufixo `Provider` (ex: AuthProvider.tsx)
- Context interno: Sufixo `Context` (ex: AuthContext)
- Hook correspondente: `use[Nome]` (ex: useAuth)
- Localizados em `src/contexts/`

**Documentação completa**: Ver `.rules/qual-padrao-de-nomenclatura-de-componentes-react-frontend.md`

## [Características do Projeto]()

Funcionalidades e decisões de design implementadas no projeto frontend.

### [Dark Mode]()
- Tema escuro por padrão
- Background: gray-900
- Texto: gray-100
- Acentos: blue portifolio

### [Responsividade]()
- Mobile-first approach
- Breakpoints Tailwind padrão
- Componentes adaptáveis

### [Acessibilidade]()
- Semântica HTML adequada
- ARIA labels quando necessário
- Contraste adequado (dark mode)

### [Performance]()
- Code splitting automático (Vite)
- Lazy loading de rotas
- Memoização de componentes pesados
- Chart.js com Canvas (performance)

## [Layout Responsivo e Fluido]()

Padrões e práticas para criar layouts que se adaptam a diferentes tamanhos de tela e dispositivos.

### [Breakpoints Tailwind]()

O projeto utiliza os breakpoints padrão do Tailwind CSS:

| Breakpoint | Largura Mínima | Dispositivo |
|------------|---------------|-------------|
| `sm` | 640px | Celular grande (landscape) |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop pequeno |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande |

### [Mobile-First Approach]()

Todas as classes Tailwind são aplicadas mobile-first, ou seja, o estilo base é para mobile e breakpoints adicionam estilos para telas maiores.

```tsx
// ❌ Desktop-first (ERRADO)
<div className="grid-cols-3 md:grid-cols-1">

// ✅ Mobile-first (CORRETO)
<div className="grid-cols-1 md:grid-cols-3">
```

**Ordem correta:**
1. Estilo base (mobile)
2. `sm:` - celular landscape
3. `md:` - tablet
4. `lg:` - desktop
5. `xl:` - desktop grande

### [Layouts Fluidos com Grid e Flexbox]()

Use Grid e Flexbox para layouts que se adaptam automaticamente:

```tsx
// Grid responsivo que ajusta número de colunas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

// Flexbox com wrap automático
<div className="flex flex-wrap gap-4">
  <div className="flex-1 min-w-[300px]">Conteúdo 1</div>
  <div className="flex-1 min-w-[300px]">Conteúdo 2</div>
</div>

// Container centralizado com max-width
<div className="container mx-auto px-4 max-w-7xl">
  {/* Conteúdo centralizado e responsivo */}
</div>
```

### [Espaçamento Responsivo]()

Ajuste padding, margin e gaps para diferentes telas:

```tsx
// Padding que aumenta em telas maiores
<div className="p-4 md:p-6 lg:p-8">

// Gap que ajusta conforme breakpoint
<div className="flex gap-2 md:gap-4 lg:gap-6">

// Margin responsiva
<div className="my-4 md:my-6 lg:my-8">
```

### [Tipografia Responsiva]()

Use classes de texto que escalam com o viewport:

```tsx
// Títulos responsivos
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Título Principal
</h1>

// Texto de corpo
<p className="text-sm md:text-base lg:text-lg">
  Conteúdo
</p>
```

### [Visibilidade Condicional]()

Oculte ou mostre elementos baseado no tamanho da tela:

```tsx
// Menu hamburguer apenas mobile
<button className="md:hidden">
  <MenuIcon />
</button>

// Menu desktop
<nav className="hidden md:flex">
  <Link to="/">Home</Link>
</nav>

// Diferentes layouts para mobile e desktop
<div>
  {/* Mobile: lista vertical */}
  <div className="md:hidden">
    <VerticalList />
  </div>

  {/* Desktop: grid horizontal */}
  <div className="hidden md:grid md:grid-cols-3">
    <GridLayout />
  </div>
</div>
```

### [Sidebar Responsiva]()

Padrão para sidebar que se transforma em menu mobile:

```tsx
export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar mobile: overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900
        transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <Sidebar />
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        {/* Botão menu mobile */}
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

### [Cards Responsivos]()

Cards que se adaptam ao espaço disponível:

```tsx
// Card que ocupa largura total mobile e metade desktop
<div className="w-full md:w-1/2 lg:w-1/3 p-4">
  <Card>
    {/* Conteúdo interno também responsivo */}
    <div className="flex flex-col md:flex-row gap-4">
      <img className="w-full md:w-32 h-32 object-cover" />
      <div className="flex-1">
        <h3 className="text-lg md:text-xl">Título</h3>
        <p className="text-sm md:text-base">Descrição</p>
      </div>
    </div>
  </Card>
</div>
```

### [Formulários Responsivos]()

Forms que se reorganizam em diferentes telas:

```tsx
// Grid de 1 coluna mobile, 2 colunas desktop
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Nome" />
    <Input label="Email" />
  </div>

  {/* Campo full-width em todas telas */}
  <Input label="Endereço" className="col-span-full" />

  {/* Botões: empilhados mobile, lado a lado desktop */}
  <div className="flex flex-col md:flex-row gap-2 md:gap-4">
    <Button variant="primary" className="w-full md:w-auto">
      Salvar
    </Button>
    <Button variant="secondary" className="w-full md:w-auto">
      Cancelar
    </Button>
  </div>
</form>
```

### [Tabelas Responsivas]()

Estratégias para tabelas em telas pequenas:

```tsx
// Opção 1: Scroll horizontal
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Tabela normal */}
  </table>
</div>

// Opção 2: Cards em mobile
<div className="hidden md:block">
  <Table /> {/* Tabela normal desktop */}
</div>

<div className="md:hidden space-y-4">
  {items.map(item => (
    <Card key={item.id}>
      {/* Cada linha vira um card mobile */}
      <div><strong>Nome:</strong> {item.name}</div>
      <div><strong>Email:</strong> {item.email}</div>
    </Card>
  ))}
</div>
```

### [Checklist de Responsividade]()

- [ ] Mobile-first: estilo base é para mobile
- [ ] Breakpoints aplicados na ordem: `sm`, `md`, `lg`, `xl`
- [ ] Layouts fluidos com Grid ou Flexbox
- [ ] Espaçamento responsivo (padding, margin, gap)
- [ ] Tipografia que escala com viewport
- [ ] Imagens com `object-fit` e largura responsiva
- [ ] Navegação adapta entre menu mobile e desktop
- [ ] Forms reorganizam campos em telas pequenas
- [ ] Tabelas com scroll ou transformadas em cards mobile
- [ ] Testado em diferentes tamanhos: 320px, 768px, 1024px, 1920px

## [Tecnologias Principais]()

- React
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS v4
- @tailwindcss/vite (plugin Vite)
- Axios
- Chart.js
- Tippy.js
- ESLint

## [Requisitos de Sistema]()

- Node.js >= 18.x
- npm >= 9.x ou pnpm >= 8.x
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

## [Referências]()

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Chart.js Documentation](https://www.chartjs.org)
