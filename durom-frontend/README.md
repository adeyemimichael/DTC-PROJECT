# Durom Frontend

A modern, production-ready Next.js frontend application with comprehensive design system and structured project organization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
durom-frontend/
├── app/                    # Next.js App Router
├── components/             # Reusable React components
│   ├── ui/                # UI primitives
│   ├── layout/            # Layout components
│   └── common/            # Business components
├── lib/                   # Utilities and helpers
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript interfaces
│   └── constants/         # Application constants
├── hooks/                 # Custom React hooks
├── styles/                # Global styles
├── config/                # Configuration
└── public/                # Static assets
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed information.

## 🎨 Design System

### Tailwind CSS with Custom Theme

This project uses Tailwind CSS v4 with an extensive custom theme including:

- **Color Palette**: Primary, Secondary, Accent, Success, Warning, Error colors
- **Typography**: Display, Heading, Body, Label, Caption text styles
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
- **Components**: Pre-built button, card, input, badge styles
- **Utilities**: Layout, text, shadow utilities

### Quick Examples

```html
<!-- Primary Button -->
<button class="btn-primary">Click me</button>

<!-- Card Component -->
<div class="card">
  <h3 class="text-heading-md mb-md">Title</h3>
  <p class="text-body-sm text-secondary-600">Content</p>
</div>

<!-- Input Field -->
<input type="text" class="input" placeholder="Enter text..." />

<!-- Badge -->
<span class="badge-success">Active</span>
```

See [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) for comprehensive design documentation.

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run dev -- -p 3001  # Start on port 3001

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🛠️ Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_ENV=development
```

### TypeScript Paths

Clean imports using path aliases:

```typescript
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
```

## 📦 Dependencies

### Production
- **next** - React framework
- **react** - UI library
- **react-dom** - React DOM
- **tailwindcss** - Utility-first CSS

### Development
- **typescript** - Type safety
- **eslint** - Code linting
- **@tailwindcss/postcss** - Tailwind PostCSS

## 🏗️ Component Development

### Creating a New UI Component

```typescript
// components/ui/Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        className
      )}
      {...props}
    />
  );
}
```

### Using Components

```typescript
// app/page.tsx
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <Button variant="primary" size="lg">
      Get Started
    </Button>
  );
}
```

## 🎯 Design Principles

1. **Consistency** - Use predefined components and design tokens
2. **Accessibility** - Follow semantic HTML and WCAG guidelines
3. **Performance** - Optimize images, code splitting, lazy loading
4. **Maintainability** - Clear structure, reusable components
5. **Scalability** - Modular organization for future growth

## 📖 Documentation

- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) - Comprehensive design system documentation
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project structure and organization guide
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Official Tailwind documentation
- [Next.js Docs](https://nextjs.org/docs) - Official Next.js documentation

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Deploy with Vercel CLI
vercel
```

### Manual Deployment

```bash
# Build the project
npm run build

# Start the production server
npm start
```

## 📝 Best Practices

### Component Structure
```typescript
// ✅ Good - Clear, typed, reusable
function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h3 className="text-heading-sm">{title}</h3>
      {children}
    </div>
  );
}

// ❌ Avoid - Inline styles, unclear props
function Card(props) {
  return <div style={{ padding: '16px' }}>{props.children}</div>;
}
```

### Styling
```typescript
// ✅ Use Tailwind classes
<button className="btn btn-primary">Submit</button>

// ❌ Avoid inline styles
<button style={{ background: 'blue', padding: '8px' }}>Submit</button>
```

### Imports
```typescript
// ✅ Use path aliases
import { Button } from '@/components/ui';

// ❌ Relative paths
import { Button } from '../../../components/ui';
```

## 🐛 Troubleshooting

### Tailwind classes not applying
- Ensure styles are imported in globals.css
- Check tailwind.config.ts content paths
- Clear `.next` folder and rebuild

### Type errors
- Run `npm run lint` to check TypeScript
- Ensure proper types in lib/types/index.ts

### Styling issues
- Check Design Guide for proper class names
- Use `cn()` utility for conditional classes

## 📞 Support

For issues or questions:
1. Check [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) and [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
2. Review Tailwind CSS documentation
3. Check Next.js documentation
4. Open an issue in the repository

## 📄 License

This project is private and proprietary.

---

**Last Updated:** June 4, 2026
**Version:** 0.1.0

