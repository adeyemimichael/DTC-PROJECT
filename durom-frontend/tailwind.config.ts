import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Color Palette
      colors: {
        // Primary Colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
          950: '#082f49',
        },
        // Secondary Colors
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Accent Colors
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f8b4d6',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        // Success
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
          950: '#052e16',
        },
        // Warning
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Error
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#4c0519',
        },
      },

      // Extended Spacing
      spacing: {
        xs: '0.25rem', // 4px
        sm: '0.5rem', // 8px
        md: '1rem', // 16px
        lg: '1.5rem', // 24px
        xl: '2rem', // 32px
        '2xl': '2.5rem', // 40px
        '3xl': '3rem', // 48px
        '4xl': '4rem', // 64px
      },

      // Typography
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-lg': ['1.875rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-md': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['0.875rem', { lineHeight: '1.25', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },

      // Border Radius
      borderRadius: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },

      // Shadow
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        none: 'none',
      },

      // Transitions
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },

      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },

  plugins: [
    // Custom component utilities
    function ({ addComponents }: { addComponents: (components: Record<string, any>) => void }) {
      addComponents({
        // Button Styles
        '.btn': {
          '@apply flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-primary': {
          '@apply btn bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700': {},
        },
        '.btn-secondary': {
          '@apply btn bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300': {},
        },
        '.btn-outline': {
          '@apply btn border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100': {},
        },
        '.btn-ghost': {
          '@apply btn bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100': {},
        },
        '.btn-danger': {
          '@apply btn bg-error-500 text-white hover:bg-error-600 active:bg-error-700': {},
        },

        // Card Styles
        '.card': {
          '@apply bg-white rounded-xl border border-secondary-200 shadow-sm p-6': {},
        },
        '.card-hover': {
          '@apply card hover:shadow-md transition-shadow duration-200 cursor-pointer': {},
        },

        // Input Styles
        '.input': {
          '@apply w-full px-3 py-2 rounded-lg border border-secondary-300 text-secondary-900 placeholder-secondary-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent': {},
        },
        '.input-error': {
          '@apply input border-error-500 focus:ring-error-500': {},
        },

        // Badge Styles
        '.badge': {
          '@apply inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium': {},
        },
        '.badge-primary': {
          '@apply badge bg-primary-100 text-primary-700': {},
        },
        '.badge-success': {
          '@apply badge bg-success-100 text-success-700': {},
        },
        '.badge-warning': {
          '@apply badge bg-warning-100 text-warning-700': {},
        },
        '.badge-error': {
          '@apply badge bg-error-100 text-error-700': {},
        },

        // Container
        '.container-md': {
          '@apply max-w-3xl mx-auto px-4': {},
        },
        '.container-lg': {
          '@apply max-w-5xl mx-auto px-4': {},
        },

        // Text Utilities
        '.text-truncate': {
          '@apply truncate': {},
        },
        '.text-clamp-2': {
          '@apply line-clamp-2': {},
        },
        '.text-clamp-3': {
          '@apply line-clamp-3': {},
        },

        // Flexbox Utilities
        '.flex-center': {
          '@apply flex items-center justify-center': {},
        },
        '.flex-between': {
          '@apply flex items-center justify-between': {},
        },

        // Grid Utilities
        '.grid-auto': {
          '@apply grid auto-cols-max': {},
        },
      });
    },
  ],
} satisfies Config;
