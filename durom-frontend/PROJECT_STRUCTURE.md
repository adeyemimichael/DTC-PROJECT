# Project Structure Guide

## Directory Structure

```
durom-frontend/
├── app/                           # Next.js 13+ App Router
│   ├── layout.tsx                 # Root layout component
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   └── [feature]/                 # Feature routes (dynamic routes)
│       └── page.tsx
│
├── components/                    # Reusable React components
│   ├── ui/                        # Basic UI primitives
│   │   ├── Button.tsx             # Button component
│   │   ├── Input.tsx              # Input component
│   │   ├── Card.tsx               # Card component
│   │   └── index.ts               # Barrel export
│   │
│   ├── layout/                    # Layout components
│   │   ├── Header.tsx             # Header/Navigation
│   │   ├── Footer.tsx             # Footer
│   │   ├── Sidebar.tsx            # Sidebar
│   │   └── index.ts               # Barrel export
│   │
│   └── common/                    # Business-specific components
│       ├── Hero.tsx               # Hero section
│       ├── CTA.tsx                # Call-to-action
│       └── index.ts               # Barrel export
│
├── lib/                           # Utilities and helpers
│   ├── utils/                     # Helper functions
│   │   ├── cn.ts                  # className merger utility
│   │   └── index.ts               # Barrel export
│   │
│   ├── types/                     # Shared TypeScript types
│   │   └── index.ts               # Common interfaces
│   │
│   └── constants/                 # Application constants
│       └── index.ts               # App-wide constants
│
├── hooks/                         # Custom React hooks
│   ├── useAsync.ts                # Async data fetching hook
│   ├── useLocalStorage.ts         # Local storage hook
│   └── index.ts                   # Barrel export
│
├── styles/                        # Global styles
│   ├── globals.css                # Global styles (linked from app/)
│   ├── design-tokens.css          # CSS variables and tokens
│   └── [feature].css              # Feature-specific styles
│
├── config/                        # Configuration files
│   └── index.ts                   # Config exports
│
├── public/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── eslint.config.mjs              # ESLint configuration
├── postcss.config.mjs             # PostCSS configuration
├── package.json                   # Dependencies
├── DESIGN_GUIDE.md                # Design system documentation
├── PROJECT_STRUCTURE.md           # This file
├── .env.example                   # Environment variables template
└── README.md                       # Project README
```

## Import Paths

Thanks to the `tsconfig.json` path aliases, use `@/` for cleaner imports:

```typescript
// ✅ Good
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { User } from '@/lib/types';

// ❌ Avoid
import { Button } from '../../../components/ui';
```

## Component Organization

### UI Components (`components/ui/`)
- **Purpose**: Reusable, framework-agnostic UI primitives
- **Examples**: Button, Input, Card, Badge, Modal
- **Characteristics**: No business logic, purely presentational

```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button className={`btn btn-${variant}`} {...props} />;
}
```

### Layout Components (`components/layout/`)
- **Purpose**: Page structure components
- **Examples**: Header, Footer, Sidebar, Navigation
- **Characteristics**: Controls page layout, may include navigation logic

```typescript
// components/layout/Header.tsx
export function Header() {
  return (
    <header className="bg-white shadow">
      {/* Header content */}
    </header>
  );
}
```

### Common Components (`components/common/`)
- **Purpose**: Business-specific reusable components
- **Examples**: Hero sections, CTAs, Feature cards
- **Characteristics**: Mix of UI and business logic

## Utilities and Helpers

### `lib/utils/`
For helper functions:
```typescript
// lib/utils/cn.ts - Conditional class names
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ').trim();
}

// Usage
<div className={cn('base-class', isActive && 'active-class')} />
```

### `lib/constants/`
For application-wide constants:
```typescript
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

### `lib/types/`
For shared TypeScript interfaces:
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Hooks Organization

Place custom hooks in `hooks/` directory:

```typescript
// hooks/useAsync.ts
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  // Hook logic
}

// Usage
import { useAsync } from '@/hooks';
```

## Adding New Features

When adding a new feature:

1. **Create app route** in `app/[feature]/page.tsx`
2. **Create feature components** in `components/common/` or `components/ui/`
3. **Add types** to `lib/types/index.ts`
4. **Add constants** to `lib/constants/index.ts`
5. **Create hooks** as needed in `hooks/`
6. **Add styles** to `styles/[feature].css` if needed

Example structure for a "Dashboard" feature:
```
app/dashboard/page.tsx
components/common/DashboardCard.tsx
hooks/useDashboardData.ts
lib/types/index.ts (add Dashboard types)
styles/dashboard.css
```

## Best Practices

1. **Use barrel exports** - Export all items from index.ts files
2. **Keep components small** - One responsibility per component
3. **Prop interface naming** - Use `[ComponentName]Props` pattern
4. **Type safety** - Always type props and return values
5. **Organize by feature** - Group related components together
6. **Document complex components** - Add JSDoc comments
7. **Use constants** - Define values in `lib/constants/`
8. **Reuse utilities** - Check existing utilities before creating new ones

## Environment Variables

See `.env.example` for required and optional environment variables.

```bash
# Create local env file
cp .env.example .env.local

# Add your values
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Development Workflow

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Performance Considerations

- **Code Splitting**: Next.js automatically code-splits at the route level
- **Image Optimization**: Use Next.js `Image` component for automatic optimization
- **Component Memoization**: Use `React.memo` for expensive components
- **Lazy Loading**: Use dynamic imports for heavy components

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <div>Loading...</div>,
});
```

---

For more details on component development, see [DESIGN_GUIDE.md](./DESIGN_GUIDE.md)
