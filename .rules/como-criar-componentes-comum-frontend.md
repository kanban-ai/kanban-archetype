# [Como criar componentes comuns no Frontend?]()

> Guia para criar componentes reutilizáveis em React + TypeScript + Tailwind CSS.

## [Princípios de Componentes Comuns]()

Componentes comuns devem ser:
- **Reutilizáveis**: Funcionam em diferentes contextos
- **Configuráveis**: Props para customização
- **Tipados**: TypeScript para type-safety
- **Autocontidos**: Não dependem de contexto específico
- **Documentados**: Props bem descritas

## [Localização]()

Esta seção define onde os componentes comuns devem ser armazenados na estrutura do projeto React.

```
src/components/common/
 Button.tsx
 Modal.tsx
 Card.tsx
 Input.tsx
 ...
```

## [Exemplos Práticos]()

Esta seção apresenta implementações completas de componentes comuns do projeto, incluindo tipagem TypeScript, estilos Tailwind e boas práticas de React.

### [1. Button Component]()

```typescript
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded font-medium transition-colors';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
}

// Uso
<Button variant="primary" size="md" onClick={handleClick}>
  Salvar
</Button>
```

### [2. Modal Component]()

```typescript
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Uso
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar Ação"
  footer={
    <div className="flex gap-2">
      <Button onClick={() => setIsOpen(false)}>Cancelar</Button>
      <Button variant="primary">Confirmar</Button>
    </div>
  }
>
  <p>Tem certeza que deseja continuar?</p>
</Modal>
```

### [3. Card Component]()

```typescript
import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function Card({ title, children, className = '', footer }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-4 pt-4 border-t">
          {footer}
        </div>
      )}
    </div>
  );
}

// Uso
<Card title="Estatísticas" footer={<Button>Ver mais</Button>}>
  <p>Conteúdo do card</p>
</Card>
```

### [4. Input Component]()

```typescript
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium mb-1">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

// Uso
<Input
  label="Nome"
  placeholder="Digite seu nome"
  error={errors.name}
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

### [5. Select Component]()

```typescript
import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}

      <select
        className={`
          w-full px-3 py-2 border rounded
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

// Uso
<Select
  label="Status"
  options={[
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
  ]}
  value={status}
  onChange={(e) => setStatus(e.target.value)}
/>
```

### [6. Loading Spinner]()

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]}`} />
  );
}

// Uso
<Spinner size="lg" />
```

### [7. Alert Component]()

```typescript
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export function Alert({ type, message, onClose }: AlertProps) {
  const colors = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div className={`p-4 rounded border ${colors[type]} flex items-center justify-between`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold">
          
        </button>
      )}
    </div>
  );
}

// Uso
<Alert type="success" message="Operação realizada com sucesso!" />
```

### [8. Badge Component]()

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const colors = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-200 text-green-800',
    danger: 'bg-red-200 text-red-800',
    warning: 'bg-yellow-200 text-yellow-800',
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs rounded ${colors[variant]}`}>
      {children}
    </span>
  );
}

// Uso
<Badge variant="success">Ativo</Badge>
```

## [Padrões de Composição]()

Esta seção demonstra padrões avançados de composição de componentes para criar APIs flexíveis e expressivas.

### [Compound Components]()

```typescript
// Card.tsx
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-lg shadow p-4">{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b pb-2 mb-2">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t pt-2 mt-2">{children}</div>;
};

// Uso
<Card>
  <Card.Header>
    <h3>Título</h3>
  </Card.Header>
  <Card.Body>
    <p>Conteúdo</p>
  </Card.Body>
  <Card.Footer>
    <Button>Ação</Button>
  </Card.Footer>
</Card>
```

## [Boas Práticas]()

Esta seção lista as principais práticas recomendadas para criação de componentes robustos, reutilizáveis e manuteníveis.

### [1. Props com valores padrão]()

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary', // Valor padrão
  size = 'md',          // Valor padrão
  ...props
}: ButtonProps) {
  // ...
}
```

### [2. Spread de props nativas]()

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant, ...props }: ButtonProps) {
  return <button {...props} />; // Repassa onClick, disabled, etc
}
```

### [3. forwardRef para refs]()

```typescript
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);
```

### [4. Tipagem estrita]()

```typescript
// L Ruim
interface ButtonProps {
  variant?: string;
}

//  Bom
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
}
```

### [5. Documentação inline]()

```typescript
interface ButtonProps {
  /**
   * Variante visual do botão
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';

  /**
   * Mostra indicador de carregamento
   */
  loading?: boolean;
}
```

## [Organização]()

Esta seção explica como organizar os arquivos de componentes comuns e criar um ponto de importação centralizado.

```
src/components/common/
 Button.tsx
 Input.tsx
 Modal.tsx
 Card.tsx
 Alert.tsx
 Badge.tsx
 Spinner.tsx
 Select.tsx
 index.ts  # Re-export tudo
```

**index.ts**:
```typescript
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { Card } from './Card';
// ...
```

**Uso**:
```typescript
import { Button, Input, Modal } from '@/components/common';
```

## [Checklist]()

- [ ] Componente aceita className para customização
- [ ] Props tipadas com TypeScript
- [ ] Valores padrão definidos
- [ ] Spread de props nativas quando aplicável
- [ ] forwardRef quando precisa expor ref
- [ ] Estilos consistentes com Tailwind
- [ ] Responsivo (mobile-first)
- [ ] Acessível (ARIA quando necessário)

## [Referências]()

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Components](https://tailwindui.com/components)
