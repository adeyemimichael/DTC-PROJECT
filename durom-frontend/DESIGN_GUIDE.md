# Design Guide - Durom Frontend

This guide documents the design tokens, component standards, typography systems, and styles used in the **Durom Health & Lifestyle** frontend application, aligned strictly with our brand mockup.

---

## 1. Brand Identity & Principles

* **Virtual-First Healthcare**: The layout is designed to feel clean, trustworthy, and modern.
* **Accessible & Premium**: A combination of high-contrast typography, soft background sections, and dynamic visual indicators.
* **Action-Oriented**: Clear call-to-actions (CTAs) using a high-visibility brand red, contrasted against a calm brand blue and deep navy structure.

---

## 2. Color Palette

Our brand colors are tailored to express safety, professionalism, and quick action.

### Brand Colors (Primary)

| Color Name | Hex Code | Visual Identity / Intent |
| :--- | :--- | :--- |
| **Vibrant Blue** | `#0149ff` | Core brand color, links, secondary action buttons, numeric indicators, and active states. |
| **Deep Navy** | `#041544` | Primary headers, card text, dark card text overlays, and strong brand hierarchy. |
| **Vibrant Red** | `#f80400` | Primary call-to-actions, registration buttons, checkmarks, and primary hover triggers. |
| **Black** | `#000000` | Section backgrounds (such as footer and billing cards) and footer text. |
| **Gray** | `#404245` | Paragraphs, body copy, and secondary descriptions. |
| **White** | `#ffffff` | Page background, cards, and default container color. |

### Secondary & Accents

| Color Name | Hex Code | Visual Identity / Intent |
| :--- | :--- | :--- |
| **Secondary White** | `#f8fafc` | Subtle background tinting to separate sections. |
| **Secondary Blue (Ice Blue)** | `#E7EEFF` | Background banner colors, step-indicator circles, badges, and soft highlights. |
| **Secondary Light Red** | `#FFDFDF` | Soft error/alert panels, highlight borders, and secondary badging. |

---

## 3. Typography

### Font Family
* **Primary (Sans-Serif)**: **Mont** (Primary brand typeface, used for headers, numbers, buttons, and paragraphs).
* **Fallback (System)**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
* **Monospace**: `Menlo`, `Monaco`, `Courier New`, monospace (for code, technical indicators).

### Font Sizes & Styles

| Token | Size | Weight | Line Height | Application |
| :--- | :--- | :--- | :--- | :--- |
| `text-display-lg` | `3.5rem` (56px) | Bold (`700`) | `1.1` | Hero titles |
| `text-display-md` | `2.5rem` (40px) | Bold (`700`) | `1.2` | Major section headers |
| `text-display-sm` | `2rem` (32px) | Bold (`700`) | `1.3` | Small section headers |
| `text-heading-lg` | `1.875rem` (30px) | Semibold (`600`) | `1.2` | Feature title |
| `text-heading-md` | `1.5rem` (24px) | Semibold (`600`) | `1.3` | Card titles, modal titles |
| `text-heading-sm` | `1.25rem` (20px) | Semibold (`600`) | `1.4` | Sub-items, checklist titles |
| `text-body-lg` | `1.125rem` (18px) | Regular (`400`) | `1.6` | Large body copy |
| `text-body-md` | `1.000rem` (16px) | Regular (`400`) | `1.6` | Default paragraphs |
| `text-body-sm` | `0.875rem` (14px) | Regular (`400`) | `1.5` | Small description text |
| `text-label` | `0.875rem` (14px) | Medium (`500`) | `1.25` | Form inputs, button labels |
| `text-caption` | `0.750rem` (12px) | Regular (`400`) | `1.4` | Helper notes, footers |

---

## 4. Spacing Scale

Consistent spacing creates a uniform layout flow. Use the Tailwind spacing scale:

| Name | Tailwind Token | Value |
| :--- | :--- | :--- |
| **Extra Small (xs)** | `p-xs` / `m-xs` | `0.25rem` (4px) |
| **Small (sm)** | `p-sm` / `m-sm` | `0.5rem` (8px) |
| **Medium (md)** | `p-md` / `m-md` | `1rem` (16px) |
| **Large (lg)** | `p-lg` / `m-lg` | `1.5rem` (24px) |
| **Extra Large (xl)** | `p-xl` / `m-xl` | `2rem` (32px) |
| **Double XL (2xl)** | `p-2xl` / `m-2xl` | `2.5rem` (40px) |
| **Triple XL (3xl)** | `p-3xl` / `m-3xl` | `3rem` (48px) |
| **Quad XL (4xl)** | `p-4xl` / `m-4xl` | `4rem` (64px) |

---

## 5. UI Components

### Buttons

Buttons are mapped to express the correct brand intent from the UI mockup.

#### Primary Button (Vibrant Red)
Used for critical actions like registration, postings, and checkouts.
```html
<button class="btn-primary">Register Now</button>
```

#### Secondary Button (Secondary Ice Blue background, Brand Blue text)
Used for alternative main actions.
```html
<button class="btn-secondary">Host Party</button>
```

#### Outline Button (Brand Blue border & text)
Used for less prominent actions, e.g., "Login" in the navigation bar.
```html
<button class="btn-outline">Login</button>
```

#### Ghost Button (Transparent background, Brand Blue text)
Used for subtle links or auxiliary triggers.
```html
<button class="btn-ghost">View more details</button>
```

---

### Cards

Cards use white backgrounds with subtle slate borders and rounded edges.

```html
<!-- Default Card -->
<div class="card">
  <h3 class="text-heading-sm mb-md text-primary-deepblue">Card Title</h3>
  <p class="text-body-sm text-primary-gray">Card descriptions go here.</p>
</div>

<!-- Hoverable Card -->
<div class="card-hover">
  <h3 class="text-heading-sm mb-md text-primary-deepblue">Interactive Feature</h3>
  <p class="text-body-sm text-primary-gray">Hovering over me adds shadow elevation.</p>
</div>
```

---

### Badges

Badges are used to tag state or context tags.

```html
<!-- Primary Blue Badge -->
<span class="badge-primary">NEW</span>

<!-- Success Green Badge -->
<span class="badge-success">Active</span>

<!-- Warning Badge -->
<span class="badge-warning">Pending</span>

<!-- Error/Accent Red Badge -->
<span class="badge-error">Failed</span>
```

---

## 6. Utilities & Best Practices

### Layout Utilities
```html
<!-- Centered container -->
<div class="flex-center">Centered content</div>

<!-- Flex container spacing edges -->
<div class="flex-between">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Standard Width Limits -->
<div class="container-md">Max width of 48rem (768px)</div>
<div class="container-lg">Max width of 64rem (1024px)</div>
<div class="container-brand">Brand max width of 82.5rem (1320px) with responsive gutters (px-6 md:px-12 lg:px-16)</div>
```

### Best Practices
1. **Always Use Semantic Elements**: Use `<button>` for triggers and `<a>` for redirects.
2. **Accessible Contrast**: Headings must be `#041544` (Deep Navy) or `#000000` (Black) on light backgrounds to ensure AAA accessibility. Body text should use `#404245` (Gray).
3. **Responsive Grid**:
   ```html
   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
     <!-- Items go here -->
   </div>
   ```

---

## 7. Installing and Configuring Custom Font "Mont"

Because **Mont** is a commercial font, it must be loaded locally. Follow these steps to configure it in Next.js:

1. **Place Font Files**:
   Create the directory `public/fonts/` and place the `woff2`/`woff` files there:
   * `public/fonts/Mont-Regular.woff2`
   * `public/fonts/Mont-SemiBold.woff2`
   * `public/fonts/Mont-Bold.woff2`

2. **Load Font in Layout**:
   Inside `app/layout.tsx`, use `next/font/local` to register the font family:
   ```typescript
   import localFont from 'next/font/local';
   
   const mont = localFont({
     src: [
       {
         path: '../public/fonts/Mont-Regular.woff2',
         weight: '400',
         style: 'normal',
       },
       {
         path: '../public/fonts/Mont-SemiBold.woff2',
         weight: '600',
         style: 'normal',
       },
       {
         path: '../public/fonts/Mont-Bold.woff2',
         weight: '700',
         style: 'normal',
       },
     ],
     variable: '--font-mont',
   });
   ```

3. **Pass Variable to HTML**:
   Apply the class inside layout's `html` tag:
   ```typescript
   export default function RootLayout({ children }) {
     return (
       <html lang="en" className={`${mont.variable} h-full antialiased`}>
         <body className="min-h-full flex flex-col">{children}</body>
       </html>
     );
   }
   ```
