/**
 * Application constants
 */

export const APP_NAME = 'Durom';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'Durom Frontend Application';

/**
 * API Configuration
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Feature Flags
 */
export const FEATURES = {
  DARK_MODE: true,
  ANALYTICS: false,
  BETA_FEATURES: false,
} as const;

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  LOGIN: '/login',
  SIGNUP: '/signup',
  NOT_FOUND: '/404',
} as const;

/**
 * Pagination
 */
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZES = [10, 25, 50, 100] as const;

/**
 * UI Configuration
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  BASE: 200,
  SLOW: 300,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
