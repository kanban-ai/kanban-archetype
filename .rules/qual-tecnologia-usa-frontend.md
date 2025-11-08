# [Qual tecnologia usa o Frontend?]()

> Este documento descreve todas as tecnologias, frameworks e bibliotecas utilizadas no frontend do projeto.

## [Stack Principal]()

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

- **currency.utils.ts**: Formatação de moeda
- **date.utils.ts**: Manipulação de datas

## [Tipos TypeScript (src/types/)]()

- **auth.ts**: Tipos de autenticação
- **models/user.ts**: Model de usuário

## [Configurações]()

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

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## [Variáveis de Ambiente]()

```env
VITE_API_URL=http://localhost:3000/api
```

Acessível em código via:
```typescript
import.meta.env.VITE_API_URL
```

## [Padrões e Convenções]()

### [Estrutura de Arquivos]()
- Componentes: PascalCase (ex: MetricCard.tsx)
- Utilitários: kebab-case (ex: currency.utils.ts)
- Serviços: kebab-case (ex: auth.service.ts)

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
- Sufixo `Context` (ex: AuthContext)
- Hook correspondente: `use[Nome]` (ex: useAuth)
- Localizados em `src/contexts/`

## [Características do Projeto]()

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
