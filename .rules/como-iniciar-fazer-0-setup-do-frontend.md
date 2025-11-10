# [Como iniciar/fazer o setup do Frontend?]()

> Guia completo para configurar um projeto React + TypeScript + Vite + Tailwind CSS do zero.

## [Visão Geral]()

Este guia mostra como criar um projeto frontend moderno usando:
- React v19+ para UI
- TypeScript para type safety
- Vite para build rápido
- Tailwind CSS para estilização
- React Router para roteamento

## [Pré-requisitos]()

- **Node.js**: Versão 18 ou superior
- **npm**, **yarn** ou **pnpm**: Gerenciador de pacotes
- Editor de código (VS Code recomendado)

## [Passo 1: Criar Projeto com Vite]()

Criação do projeto React com TypeScript usando Vite como build tool para desenvolvimento rápido.

```bash
# Criar projeto com template React + TypeScript
npm create vite@latest frontend -- --template react-swc-ts

# Acessar pasta
cd frontend

# Instalar dependências
npm install
```

**O que foi criado:**
- Estrutura base do React
- Configuração TypeScript
- Vite configurado com SWC (transpilador rápido)
- Scripts de dev e build

## [Passo 2: Instalar Tailwind CSS v4]()

Instalação e configuração do Tailwind CSS v4 com plugin Vite nativo para performance máxima.

### [2.1. Instalar dependências]()

```bash
npm install -D tailwindcss @tailwindcss/vite
```

> **Importante**: Tailwind CSS v4 (lançado em janeiro/2025) usa um plugin Vite nativo para máxima performance e configuração zero.

### [2.2. Configurar Plugin Vite]()

**Arquivo**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

> **Nota**: O plugin `@tailwindcss/vite` deve vir ANTES do plugin React.

### [2.3. Importar Tailwind CSS]()

**Arquivo**: `src/index.css`

```css
@import "tailwindcss";
```

> **Mudança v3 → v4**: Não use mais `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`. Use apenas `@import "tailwindcss";`

### [2.4. Customização de Tema (Opcional)]()

Se precisar customizar o tema, adicione no `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --font-display: "Inter", sans-serif;
}
```

### [2.5. Importar CSS no main]()

**Arquivo**: `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## [Passo 3: Instalar React Router]()

Instalação do React Router DOM para gerenciamento de rotas client-side no aplicativo.

```bash
npm install react-router-dom
```

## [Passo 4: Instalar Axios]()

Instalação do Axios para realizar requisições HTTP ao backend de forma simplificada.

```bash
npm install axios
```

## [Passo 5: Configurar TypeScript]()

Configuração de path aliases e opções do compilador TypeScript para melhor experiência de desenvolvimento.

### [5.1. Path Aliases (opcional mas recomendado)]()

**Arquivo**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### [5.2. Configurar alias no Vite]()

**Arquivo**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),  // Plugin Tailwind v4
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

> **Importante**: O plugin `tailwindcss()` deve aparecer ANTES do `react()`.

## [Passo 6: Estrutura de Pastas]()

Criar a seguinte estrutura:

```
frontend/
 src/
    components/        # Componentes reutilizáveis
       common/        # Componentes comuns (Button, Input, etc)
    pages/             # Páginas da aplicação
    services/          # Services para API
    config/            # Configurações (routes, api)
    contexts/          # React Contexts
    hooks/             # Custom hooks
    types/             # TypeScript types/interfaces
    utils/             # Funções utilitárias
    App.tsx            # Componente principal
    main.tsx           # Entry point
    index.css          # Estilos globais
 public/                # Arquivos estáticos
 index.html             # HTML base
 package.json
 tsconfig.json
 vite.config.ts
 tailwind.config.js
```

Criar pastas:

```bash
mkdir -p src/components/common
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/config
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/utils
```

**Nota sobre estrutura**: Esta é a **estrutura mínima** recomendada para setup inicial. Conforme o projeto cresce (>20 componentes), organize componentes em subpastas especializadas como `forms/`, `layouts/`, `sections/`, `guards/`, `containers/`.

**Documentação completa**: Ver `.rules/qual-padrao-de-nomenclatura-de-componentes-react-frontend.md` seção "Estrutura de Pastas: Mínima vs Completa".

## [Passo 7: Configurar Variáveis de Ambiente]()

Setup de arquivos .env para armazenar URLs da API e outras configurações sensíveis.

### [7.1. Criar arquivo .env]()

**Arquivo**: `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

### [7.2. Criar arquivo .env.example]()

**Arquivo**: `.env.example`

```env
VITE_API_URL=http://localhost:3000/api
```

### [7.3. Adicionar ao .gitignore]()

**Arquivo**: `.gitignore`

```
# Vite
dist
dist-ssr
*.local

# Environment
.env
.env.local
.env.*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Dependencies
node_modules
```

## [Passo 8: Scripts package.json]()

**Arquivo**: `package.json`

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.4"
  },
  "devDependencies": {
    "@eslint/js": "^9.20.2",
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react-swc": "^4.1.4",
    "eslint": "^9.20.2",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.18",
    "globals": "^15.14.0",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.20.0",
    "vite": "^7.1.7"
  }
}
```

## [Passo 9: Configurar Axios]()

**Arquivo**: `src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido/expirado - limpar dados locais
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Permitir que o componente lide com o redirecionamento
    }

    return Promise.reject(error);
  }
);

export default api;
```

## [Passo 10: Configurar Rotas]()

**Arquivo**: `src/config/routes.config.tsx`

```typescript
import { RouteObject } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
];
```

**Arquivo**: `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from '@/config/routes.config';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## [Passo 11: Criar Página Inicial]()

**Arquivo**: `src/pages/HomePage.tsx`

```typescript
function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Frontend Setup Completo!
        </h1>
        <p className="text-gray-600">
          React + TypeScript + Vite + Tailwind CSS
        </p>
      </div>
    </div>
  );
}

export default HomePage;
```

## [Passo 12: Testar o Projeto]()

Comandos para executar o projeto em modo desenvolvimento, produção e verificar tipos TypeScript.

```bash
# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Verificar tipos TypeScript
npm run type-check

# Rodar linter
npm run lint
```

Acesse: `http://localhost:5173`

## [Configurações Adicionais (Opcional)]()

Ferramentas opcionais de qualidade de código e extensões VS Code para melhorar produtividade.

### [ESLint + Prettier]()

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

**Arquivo**: `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### [VS Code Extensions Recomendadas]()

**Arquivo**: `.vscode/extensions.json`

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

### [VS Code Settings]()

**Arquivo**: `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## [Checklist de Setup]()

- [ ] Projeto criado com Vite + React + TypeScript
- [ ] Tailwind CSS v4 instalado (`tailwindcss` + `@tailwindcss/vite`)
- [ ] Plugin `@tailwindcss/vite` configurado no `vite.config.ts`
- [ ] CSS com `@import "tailwindcss";` configurado
- [ ] React Router instalado
- [ ] Axios instalado e configurado
- [ ] Path aliases configurados (@/*)
- [ ] Estrutura de pastas criada
- [ ] Variáveis de ambiente (.env)
- [ ] Scripts package.json atualizados
- [ ] Service API configurado
- [ ] Rotas configuradas
- [ ] Página inicial criada
- [ ] Projeto rodando em dev
- [ ] Build de produção funcionando

## [Mudanças do Tailwind v3 para v4]()

Se você já conhece Tailwind v3, aqui estão as principais mudanças:

### [O que mudou]()

1. **Plugin Vite Nativo**: Agora usa `@tailwindcss/vite` ao invés de PostCSS
2. **Sintaxe CSS**: `@import "tailwindcss";` ao invés de `@tailwind base;` etc
3. **Sem arquivos de config**: `tailwind.config.js` e `postcss.config.js` são opcionais
4. **Customização no CSS**: Use `@theme` para customizar cores, fontes, etc
5. **Performance**: Build muito mais rápido com o plugin Vite nativo

### [Comparação]()

**v3**:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { primary: '#3b82f6' } } },
}
```

**v4**:
```bash
npm install -D tailwindcss @tailwindcss/vite
```

```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
}
```

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
})
```

## [Próximos Passos]()

Após concluir o setup inicial:

1. **Autenticação**: Implementar sistema de login/logout
   - Ver: `./como-consumir-api-frontend.md`

2. **Componentes Comuns**: Criar biblioteca de componentes reutilizáveis
   - Ver: `./como-criar-componentes-comum-frontend.md`

3. **Rotas Protegidas**: Implementar guards de autenticação
   - Ver: `./como-funciona-as-rotas-no-frontend.md`

4. **Consumir API**: Criar services e integrar com backend
   - Ver: `./como-consumir-api-frontend.md`

## [Troubleshooting]()

Soluções para problemas comuns durante a instalação e configuração do projeto frontend.

### [Erro: Cannot find module '@/*']()

**Solução**: Verifique se configurou path aliases no `tsconfig.json` e `vite.config.ts`

### [Tailwind não está funcionando]()

**Solução**:
1. Verifique se importou `./index.css` no `main.tsx`
2. Verifique se o `src/index.css` contém `@import "tailwindcss";`
3. Verifique se o plugin `@tailwindcss/vite` está no `vite.config.ts`:
   ```typescript
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [
       tailwindcss(),  // ANTES do react()
       react(),
     ],
   })
   ```
4. Verifique se instalou as dependências corretas:
   ```bash
   npm install -D tailwindcss @tailwindcss/vite
   ```
5. Reinicie o servidor: `npm run dev`

### [Erro: Cannot find module '@tailwindcss/vite']()

**Problema**: O plugin Vite do Tailwind v4 não está instalado.

**Solução**:
```bash
npm install -D tailwindcss @tailwindcss/vite
```

Depois atualize o `vite.config.ts`:
```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})
```

### [Erro: @tailwind directives are deprecated]()

**Problema**: Você está usando sintaxe antiga do Tailwind v3.

**Solução**: No `src/index.css`, substitua:

❌ **Errado (v3)**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

✅ **Correto (v4)**:
```css
@import "tailwindcss";
```

### [Erro de CORS ao fazer requests]()

**Solução**: Configure CORS no backend ou use proxy do Vite:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

## [Referências]()

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
