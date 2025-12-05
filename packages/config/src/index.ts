import { Country, Language } from '@company-search/types'

// API Configuration
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const

// Search Configuration
export const SEARCH_CONFIG = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // milliseconds
} as const

// Email Configuration
export const EMAIL_CONFIG = {
  BATCH_SIZE: 10,
  SEND_INTERVAL: 2000, // milliseconds between emails
  MAX_RETRIES: 3,
} as const

// Validation Rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_LETTER: true,
    REQUIRE_NUMBER: true,
  },
  COMPANY_NAME: {
    MAX_LENGTH: 255,
  },
  KEYWORDS: {
    MAX_LENGTH: 255,
  },
} as const

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  LIMIT_OPTIONS: [10, 20, 50, 100],
} as const

// Supported Countries
export const SUPPORTED_COUNTRIES: Country[] = ['singapore', 'malaysia']

// Supported Languages
export const SUPPORTED_LANGUAGES: Language[] = ['zh-CN', 'en-US']

// Default Language
export const DEFAULT_LANGUAGE: Language = 'zh-CN'

// JWT Configuration
export const JWT_CONFIG = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
} as const

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
} as const

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
} as const

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 3600, // 1 hour in seconds
  MAX_SIZE: 1000,
} as const

