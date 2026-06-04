# Design Guide - Durom Frontend

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Components](#components)
5. [Utilities](#utilities)
6. [Best Practices](#best-practices)

---

## Color Palette

### Primary Colors
Used for main actions, primary buttons, and key interactions.

```
primary-50:  #f0f9ff (lightest)
primary-100: #e0f2fe
primary-200: #bae6fd
primary-300: #7dd3fc
primary-400: #38bdf8
primary-500: #0ea5e9 (main)
primary-600: #0284c7
primary-700: #0369a1
primary-800: #075985
primary-900: #0c3d66 (darkest)
```

**Usage**: Buttons, links, interactive elements
```html
<button class="bg-primary-500 hover:bg-primary-600">Click me</button>
```

### Secondary Colors
Used for backgrounds, borders, and neutral elements.

```
secondary-50:  #f8fafc (lightest)
secondary-100: #f1f5f9
secondary-200: #e2e8f0
secondary-300: #cbd5e1
secondary-400: #94a3b8
secondary-500: #64748b (main)
secondary-600: #475569
secondary-700: #334155
secondary-800: #1e293b
secondary-900: #0f172a (darkest)
```

**Usage**: Backgrounds, disabled states, text
```html
<div class="bg-secondary-50 text-secondary-900">Content</div>
```

### Accent Colors
- **Primary Accent**: `#ec4899` - Used for highlights and emphasis
- **Success**: `#22c55e` - Success states, confirmations
- **Warning**: `#f59e0b` - Alerts, caution messages
- **Error**: `#ef4444` - Errors, destructive actions

---

## Typography

### Font Families
- **Sans Serif (Default)**: System fonts (Roboto, Helvetica, Arial)
- **Monospace**: For code snippets - `Menlo`, `Monaco`, `Courier New`

### Font Sizes & Styles

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `text-display-lg` | 3.5rem | 700 | 1.1 | Page titles |
| `text-display-md` | 2.5rem | 700 | 1.2 | Section titles |
| `text-display-sm` | 2rem | 700 | 1.3 | Subsection titles |
| `text-heading-lg` | 1.875rem | 600 | 1.2 | Major headings |
| `text-heading-md` | 1.5rem | 600 | 1.3 | Section headings |
| `text-heading-sm` | 1.25rem | 600 | 1.4 | Minor headings |
| `text-body-lg` | 1.125rem | 400 | 1.6 | Large body text |
| `text-body-md` | 1rem | 400 | 1.6 | Regular body text |
| `text-body-sm` | 0.875rem | 400 | 1.5 | Small body text |
| `text-label` | 0.875rem | 500 | 1.25 | Form labels |
| `text-caption` | 0.75rem | 400 | 1.4 | Captions, hints |

### Usage Examples

```html
<!-- Page Title -->
<h1 class="text-display-lg font-bold text-secondary-900">Welcome to Durom</h1>

<!-- Section Heading -->
<h2 class="text-heading-md font-semibold text-secondary-800">Features</h2>

<!-- Body Text -->
<p class="text-body-md text-secondary-700">This is regular body text used for paragraphs and descriptions.</p>

<!-- Small Caption -->
<small class="text-caption text-secondary-500">Last updated 2 hours ago</small>
```

---

## Spacing

Consistent spacing creates visual hierarchy and improves readability.

| Name | Size | Value |
|------|------|-------|
| `xs` | `p-xs` | 0.25rem (4px) |
| `sm` | `p-sm` | 0.5rem (8px) |
| `md` | `p-md` | 1rem (16px) |
| `lg` | `p-lg` | 1.5rem (24px) |
| `xl` | `p-xl` | 2rem (32px) |
| `2xl` | `p-2xl` | 2.5rem (40px) |
| `3xl` | `p-3xl` | 3rem (48px) |
| `4xl` | `p-4xl` | 4rem (64px) |

### Spacing Rules
- **Padding**: Use for internal spacing within components
- **Margin**: Use for spacing between components
- **Gap**: Use for spacing between flex/grid items

```html
<!-- Card with internal padding -->
<div class="card p-lg">
  <h3 class="text-heading-md mb-md">Title</h3>
  <p class="text-body-md text-secondary-600">Content</p>
</div>

<!-- Grid with gaps -->
<div class="grid grid-cols-3 gap-lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## Components

### Buttons

All buttons extend the `.btn` base class for consistency.

#### Primary Button
```html
<button class="btn-primary">Primary Action</button>
<!-- Hover state: darker background -->
<!-- Active state: even darker background -->
```

#### Secondary Button
```html
<button class="btn-secondary">Secondary Action</button>
```

#### Outline Button
```html
<button class="btn-outline">Outline Action</button>
```

#### Ghost Button
```html
<button class="btn-ghost">Ghost Action</button>
```

#### Danger Button
```html
<button class="btn-danger">Delete</button>
```

#### Button States
```html
<!-- Disabled -->
<button class="btn-primary" disabled>Disabled</button>

<!-- Loading (use with spinner) -->
<button class="btn-primary" disabled>
  <span class="inline-block animate-spin">⟳</span> Loading...
</button>
```

### Cards

```html
<!-- Basic Card -->
<div class="card">
  <h3 class="text-heading-sm mb-md">Card Title</h3>
  <p class="text-body-sm text-secondary-600">Card content goes here.</p>
</div>

<!-- Hoverable Card -->
<div class="card-hover">
  Click-interactive card with hover effect
</div>
```

### Inputs

```html
<!-- Text Input -->
<input type="text" class="input" placeholder="Enter text..." />

<!-- With Label -->
<label class="text-label mb-sm block">Email</label>
<input type="email" class="input" placeholder="your@email.com" />

<!-- Error State -->
<input type="text" class="input-error" placeholder="Invalid input" />
```

### Badges

```html
<!-- Primary Badge -->
<span class="badge-primary">New</span>

<!-- Success Badge -->
<span class="badge-success">Active</span>

<!-- Warning Badge -->
<span class="badge-warning">Pending</span>

<!-- Error Badge -->
<span class="badge-error">Failed</span>
```

---

## Utilities

### Layout Utilities

```html
<!-- Centered Content -->
<div class="flex-center">Centered content</div>

<!-- Space Between -->
<div class="flex-between">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Container Max Width -->
<div class="container-md">Max width: 48rem</div>
<div class="container-lg">Max width: 64rem</div>
```

### Text Utilities

```html
<!-- Truncate Text -->
<p class="text-truncate">Long text that will be truncated...</p>

<!-- Line Clamping -->
<p class="text-clamp-2">Text limited to 2 lines...</p>
<p class="text-clamp-3">Text limited to 3 lines...</p>
```

### Shadow Utilities

```html
<!-- Shadow Sizes -->
<div class="shadow-xs">Extra small shadow</div>
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
```

---

## Best Practices

### 1. **Use Semantic HTML**
```html
<!-- ✅ Good -->
<button class="btn-primary">Submit</button>
<a href="/link" class="text-primary-500 hover:underline">Link</a>

<!-- ❌ Avoid -->
<div class="btn-primary" onclick="...">Submit</div>
```

### 2. **Maintain Consistent Spacing**
```html
<!-- ✅ Good - consistent spacing -->
<div class="flex flex-col gap-lg p-lg">
  <h2 class="text-heading-md">Title</h2>
  <p class="text-body-md">Content</p>
</div>

<!-- ❌ Avoid - inconsistent spacing -->
<div class="flex flex-col gap-sm p-2">
  <h2 class="mt-10">Title</h2>
  <p class="pt-5">Content</p>
</div>
```

### 3. **Color Contrast**
- Always ensure text has sufficient contrast against backgrounds
- Use `text-secondary-900` on light backgrounds
- Use `text-secondary-50` on dark backgrounds

### 4. **Responsive Design**
```html
<!-- ✅ Good - responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
  <!-- Items -->
</div>

<!-- Use Tailwind breakpoints -->
<!-- sm: 640px, md: 768px, lg: 1024px, xl: 1280px -->
```

### 5. **Component Composition**
```html
<!-- ✅ Create reusable components -->
<!-- Button.tsx -->
export function Button({ variant = 'primary', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
  };
  return <button className={variants[variant]} {...props} />;
}
```

### 6. **Dark Mode Consideration**
```html
<!-- ✅ Support dark mode -->
<div class="bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-50">
  Content that adapts to dark mode
</div>
```

### 7. **Accessibility**
- Use proper heading hierarchy (h1 → h2 → h3)
- Include `alt` text for images
- Use ARIA labels for interactive elements
- Ensure keyboard navigation works

```html
<!-- ✅ Accessible button -->
<button 
  class="btn-primary" 
  aria-label="Submit form"
  onClick={handleSubmit}
>
  Submit
</button>
```

---

## Project Structure

```
durom-frontend/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── ui/                # UI primitives (Button, Input, etc.)
│   ├── layout/            # Layout components (Header, Footer, etc.)
│   └── common/            # Common business components
├── lib/                   # Utilities and helpers
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript types and interfaces
│   └── constants/         # Application constants
├── styles/                # Global styles
│   ├── globals.css        # Global styles
│   └── design-tokens.css  # CSS variables
├── hooks/                 # Custom React hooks
├── config/                # Configuration files
├── public/                # Static assets
└── tailwind.config.ts     # Tailwind configuration
```

---

## Getting Started

1. **Use predefined components** - Always prefer existing components over creating new styles
2. **Follow the spacing scale** - Use `p-xs` through `p-4xl` for consistency
3. **Reference colors by intent** - Use `primary-*` for main actions, `secondary-*` for defaults
4. **Document custom components** - Add examples in component files for reusability

---

## Need Help?

Refer to:
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- This design guide for standards
- Component files in `components/` directory for examples
