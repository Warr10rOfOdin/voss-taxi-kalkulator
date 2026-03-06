/**
 * Application Constants
 *
 * Centralized constants for magic numbers, strings, and configuration values.
 */

// === Vehicle Groups ===
export const VEHICLE_GROUPS = ['1-4', '5-6', '7-8', '9-16'];

export const VEHICLE_GROUP_LABELS = {
  '1-4': { no: '1-4 seter', en: '1-4 seats' },
  '5-6': { no: '5-6 seter', en: '5-6 seats' },
  '7-8': { no: '7-8 seter', en: '7-8 seats' },
  '9-16': { no: '9-16 seter', en: '9-16 seats' }
};

export const VEHICLE_GROUP_FACTORS = {
  '1-4': 1.0,
  '5-6': 1.3,
  '7-8': 1.6,
  '9-16': 2.0
};

// === Tariff Periods ===
export const TARIFF_PERIODS = ['dag', 'kveld', 'laurdag', 'helgNatt', 'hoytid'];

export const PERIOD_LABELS = {
  dag: { no: 'Dag', en: 'Day' },
  kveld: { no: 'Kveld', en: 'Evening' },
  laurdag: { no: 'Lørdag', en: 'Saturday' },
  helgNatt: { no: 'Helg/Natt', en: 'Weekend/Night' },
  hoytid: { no: 'Høytid', en: 'Holiday' }
};

export const PERIOD_FACTORS = {
  dag: 1.0,
  kveld: 1.21,
  laurdag: 1.3,
  helgNatt: 1.35,
  hoytid: 1.45
};

// === Languages ===
export const LANGUAGES = ['no', 'en'];
export const DEFAULT_LANGUAGE = 'no';

// === Default Values ===
export const DEFAULTS = {
  DISTANCE_KM: 100,
  DURATION_MIN: 90,
  VEHICLE_GROUP: '1-4',
  START_ADDRESS: 'Hestavangen 11, Voss',
  MAP_CENTER: { lat: 60.6280, lng: 6.4118 }, // Voss, Norway
  MAP_ZOOM: 12,
  MAPS_COUNTRY: 'no',
  MAPS_REGION: 'NO'
};

// === Distance Thresholds ===
export const DISTANCE_THRESHOLD_KM = 10; // Rate changes at 10 km

// === Time Format ===
export const TIME_FORMAT = 'HH:mm';
export const DATE_FORMAT = 'YYYY-MM-DD';

// === UI Constants ===
export const MAX_VIA_ADDRESSES = 5;
export const MIN_DISTANCE_KM = 0;
export const MAX_DISTANCE_KM = 999;
export const MIN_DURATION_MIN = 0;
export const MAX_DURATION_MIN = 999;

// === Firebase Constants ===
export const FIREBASE_RETRY_ATTEMPTS = 3;
export const FIREBASE_RETRY_DELAY = 2000;

// === Map Constants ===
export const MAP_LOAD_TIMEOUT = 10000; // 10 seconds
export const ROUTE_CALCULATION_DEBOUNCE = 500; // ms

// === Storage Keys ===
export const STORAGE_KEYS = {
  TARIFF_PREFIX: 'taxiTariffs_',
  TENANT_CACHE: 'tenantCache_',
  USER_PREFERENCES: 'userPreferences'
};

// === Theme Constants ===
export const THEME_TRANSITION_DURATION = 300; // ms

// === Accessibility ===
export const ARIA_LABELS = {
  closeModal: { no: 'Lukk', en: 'Close' },
  openMenu: { no: 'Åpne meny', en: 'Open menu' },
  removeVia: { no: 'Fjern viapunkt', en: 'Remove via point' },
  addVia: { no: 'Legg til viapunkt', en: 'Add via point' },
  calculate: { no: 'Beregn pris', en: 'Calculate price' },
  reset: { no: 'Nullstill', en: 'Reset' },
  print: { no: 'Skriv ut', en: 'Print' },
  switchLanguage: { no: 'Bytt språk', en: 'Switch language' }
};

// === Keyboard Shortcuts ===
export const KEYBOARD_SHORTCUTS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown'
};

// === Error Messages ===
export const ERROR_MESSAGES = {
  FIREBASE_INIT_FAILED: 'Failed to initialize Firebase',
  TENANT_LOAD_FAILED: 'Failed to load tenant configuration',
  MAPS_LOAD_FAILED: 'Failed to load Google Maps',
  ROUTE_CALCULATION_FAILED: 'Failed to calculate route',
  TARIFF_SAVE_FAILED: 'Failed to save tariff',
  TARIFF_LOAD_FAILED: 'Failed to load tariff',
  INVALID_ADDRESS: 'Invalid address',
  INVALID_DISTANCE: 'Invalid distance value',
  INVALID_DURATION: 'Invalid duration value',
  NETWORK_ERROR: 'Network error. Please check your connection.'
};

// === Status Codes ===
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// === Feature Flags (defaults) ===
export const DEFAULT_FEATURES = {
  showLanguageSwitcher: true,
  showPrintButton: true,
  showTariffEditor: true,
  showMap: true,
  showTariffTable: true
};

// === RegEx Patterns ===
export const PATTERNS = {
  NORWEGIAN_PHONE: /^(\+47)?[0-9]{8}$/,
  NORWEGIAN_POSTAL: /^\d{4}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TIME_24H: /^([01]\d|2[0-3]):([0-5]\d)$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/
};

// === Environment Checks ===
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_TEST = import.meta.env.MODE === 'test';

// === API Endpoints (if needed in future) ===
export const API_ENDPOINTS = {
  // Placeholder for future API integration
};
