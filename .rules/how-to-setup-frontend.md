# How to setup the Frontend

> Complete guide to configure a React + TypeScript + Vite + Tailwind CSS project from scratch with all dependencies and folder structure.

## [Overview]()

This section presents a complete setup guide for creating a modern frontend project using React v19+, TypeScript, Vite, Tailwind CSS v4, React Router and Axios.

This guide shows how to create a modern frontend project using:
- React v19+ for UI
- TypeScript for type safety
- Vite for fast build
- Tailwind CSS for styling
- React Router for routing

## [Prerequisites]()

This section lists the minimum system requirements and tools needed before starting the frontend project setup process.

- **Node.js**: Version 18 or higher
- **npm**, **yarn** or **pnpm**: Package manager
- Code editor (VS Code recommended)

## [Step 1: Create Project with Vite]()

This section explains how to bootstrap a new React project using Vite's official scaffolding tool with the SWC-powered TypeScript template for optimal build performance.

Creating React project with TypeScript using Vite as build tool for fast development.

```bash
# Create project with React + TypeScript template
npm create vite@latest frontend -- --template react-swc-ts

# Access folder
cd frontend

# Install dependencies
npm install
```

**What was created:**
- React base structure
- TypeScript configuration
- Vite configured with SWC (fast transpiler)
- Dev and build scripts

## [Step 2: Install Tailwind CSS v4]()

This section covers the complete installation and configuration process for Tailwind CSS v4 using the native Vite plugin, replacing the traditional PostCSS approach.

Installation and configuration of Tailwind CSS v4 with native Vite plugin for maximum performance.

### 2.1. Install dependencies

```bash
npm install -D tailwindcss @tailwindcss/vite
```

> **Important**: Tailwind CSS v4 (released January/2025) uses a native Vite plugin for maximum performance and zero configuration.

### 2.2. Configure Vite Plugin

**File**: `vite.config.ts`

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

> **Note**: The `@tailwindcss/vite` plugin must come BEFORE the React plugin.

### 2.3. Import Tailwind CSS

**File**: `src/index.css`

```css
@import "tailwindcss";
```

> **Change v3 → v4**: Don't use `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;` anymore. Use only `@import "tailwindcss";`

### 2.4. Theme Customization (Optional)

If you need to customize theme, add to `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --font-display: "Inter", sans-serif;
}
```

### 2.5. Import CSS in main

**File**: `src/main.tsx`

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

## [Step 3: Install React Router]()

This section shows how to install React Router DOM v7, the official routing library for React applications with client-side navigation capabilities.

Installation of React Router DOM for client-side route management in the application.

```bash
npm install react-router-dom
```

## [Step 4: Install Axios]()

This section explains how to add Axios, a promise-based HTTP client for making API requests to the backend with automatic JSON transformation.

Installation of Axios to make HTTP requests to backend in a simplified way.

```bash
npm install axios
```

## [Step 5: Configure TypeScript]()

This section details TypeScript configuration including compiler options and path aliases to improve import statements and development experience.

Configuration of path aliases and TypeScript compiler options for better development experience.

### 5.1. Path Aliases (optional but recommended)

**File**: `tsconfig.json`

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

### 5.2. Configure alias in Vite

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),  // Tailwind v4 Plugin
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

> **Important**: The `tailwindcss()` plugin must appear BEFORE `react()`.

## [Step 6: Folder Structure]()

This section presents the recommended project folder structure, organizing components, pages, services, and utilities for maintainable and scalable code.

Create the following structure:

```
frontend/
  src/
    components/        # Reusable components
      common/        # Common components (Button, Input, etc)
    pages/             # Application pages
    services/          # API services
    config/            # Configurations (routes, api)
    contexts/          # React Contexts
    hooks/             # Custom hooks
    types/             # TypeScript types/interfaces
    utils/             # Utility functions
    App.tsx            # Main component
    main.tsx           # Entry point
    index.css          # Global styles
  public/                # Static files
  index.html             # Base HTML
  package.json
  tsconfig.json
  vite.config.ts
  tailwind.config.js
```

Create folders:

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

**Note on structure**: This is the **minimum structure** recommended for initial setup. As the project grows (>20 components), organize components in specialized subfolders like `forms/`, `layouts/`, `sections/`, `guards/`, `containers/`.

**Complete documentation**: See `.rules/react-component-naming-pattern-frontend.md` section "Folder Structure: Minimal vs Complete".

## [Step 7: Configure Environment Variables]()

This section shows how to configure environment variables using .env files to store API URLs and environment-specific settings securely.

Setup of .env files to store API URLs and other sensitive configurations.

### 7.1. Create .env file

**File**: `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

### 7.2. Create .env.example file

**File**: `.env.example`

```env
VITE_API_URL=http://localhost:3000/api
```

### 7.3. Add to .gitignore

**File**: `.gitignore`

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

## [Step 8: package.json Scripts]()

This section lists all available npm scripts for development, production build, preview, linting and type checking with updated dependencies.

**File**: `package.json`

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

## [Step 9: Configure Axios]()

This section demonstrates how to create an Axios instance with base URL configuration, request interceptors for authentication, and response error handling.

**File**: `src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Invalid/expired token - clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Allow component to handle redirection
    }

    return Promise.reject(error);
  }
);

export default api;
```

## [Step 10: Configure Routes]()

This section shows how to set up centralized route configuration and integrate React Router in the main App component for clean navigation management.

**File**: `src/config/routes.config.tsx`

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

**File**: `src/App.tsx`

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

## [Step 11: Create Home Page]()

This section provides a sample HomePage component using Tailwind CSS to verify that the entire setup is working correctly.

**File**: `src/pages/HomePage.tsx`

```typescript
function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Frontend Setup Complete!
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

## [Step 12: Test Project]()

This section lists essential commands to run the development server, create production builds, and validate code quality through type checking and linting.

Commands to run project in development mode, production and verify TypeScript types.

```bash
# Run in development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Check TypeScript types
npm run type-check

# Run linter
npm run lint
```

Access: `http://localhost:5173`

## [Additional Configurations (Optional)]()

This section presents optional but recommended configurations for code quality tools like Prettier and useful VS Code extensions to enhance development workflow.

Optional code quality tools and VS Code extensions to improve productivity.

### ESLint + Prettier

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

**File**: `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Recommended VS Code Extensions

**File**: `.vscode/extensions.json`

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

### VS Code Settings

**File**: `.vscode/settings.json`

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

## [Setup Checklist]()

This section provides a comprehensive checklist to verify that all setup steps have been completed successfully before starting development.

- [ ] Project created with Vite + React + TypeScript
- [ ] Tailwind CSS v4 installed (`tailwindcss` + `@tailwindcss/vite`)
- [ ] `@tailwindcss/vite` plugin configured in `vite.config.ts`
- [ ] CSS with `@import "tailwindcss";` configured
- [ ] React Router installed
- [ ] Axios installed and configured
- [ ] Path aliases configured (@/*)
- [ ] Folder structure created
- [ ] Environment variables (.env)
- [ ] package.json scripts updated
- [ ] API service configured
- [ ] Routes configured
- [ ] Home page created
- [ ] Project running in dev
- [ ] Production build working

## [Changes from Tailwind v3 to v4]()

This section highlights the key differences between Tailwind CSS v3 and v4 for developers migrating from the previous version, focusing on installation and configuration changes.

If you already know Tailwind v3, here are the main changes:

### What changed

1. **Native Vite Plugin**: Now uses `@tailwindcss/vite` instead of PostCSS
2. **CSS Syntax**: `@import "tailwindcss";` instead of `@tailwind base;` etc
3. **No config files**: `tailwind.config.js` and `postcss.config.js` are optional
4. **Customization in CSS**: Use `@theme` to customize colors, fonts, etc
5. **Performance**: Much faster build with native Vite plugin

### Comparison

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

## [Next Steps]()

This section suggests the recommended next steps after completing the basic frontend setup, including authentication, component library, and API integration.

After completing initial setup:

1. **Authentication**: Implement login/logout system
   - See: `./how-to-consume-api-frontend.md`

2. **Common Components**: Create reusable component library
   - See: `./how-to-create-common-components-frontend.md`

3. **Protected Routes**: Implement authentication guards
   - See: `./how-routing-works-frontend.md`

4. **Consume API**: Create services and integrate with backend
   - See: `./how-to-consume-api-frontend.md`

## [Troubleshooting]()

This section provides solutions to common errors encountered during frontend setup, including module resolution, Tailwind configuration, and CORS issues.

Solutions for common problems during frontend project installation and configuration.

### Error: Cannot find module '@/*'

**Solution**: Check if you configured path aliases in `tsconfig.json` and `vite.config.ts`

### Tailwind not working

**Solution**:
1. Check if you imported `./index.css` in `main.tsx`
2. Check if `src/index.css` contains `@import "tailwindcss";`
3. Check if `@tailwindcss/vite` plugin is in `vite.config.ts`:
   ```typescript
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [
       tailwindcss(),  // BEFORE react()
       react(),
     ],
   })
   ```
4. Check if you installed correct dependencies:
   ```bash
   npm install -D tailwindcss @tailwindcss/vite
   ```
5. Restart server: `npm run dev`

### Error: Cannot find module '@tailwindcss/vite'

**Problem**: Tailwind v4 Vite plugin is not installed.

**Solution**:
```bash
npm install -D tailwindcss @tailwindcss/vite
```

Then update `vite.config.ts`:
```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})
```

### Error: @tailwind directives are deprecated

**Problem**: You're using old Tailwind v3 syntax.

**Solution**: In `src/index.css`, replace:

❌ **Wrong (v3)**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

✅ **Correct (v4)**:
```css
@import "tailwindcss";
```

### CORS error when making requests

**Solution**: Configure CORS in backend or use Vite proxy:

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

## [References]()

This section lists official documentation links for all technologies used in the frontend setup for further reading and advanced configurations.

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
