/**
 * Shared Firebase Configuration
 *
 * SECURITY: This file uses environment variables to avoid exposing credentials
 *
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Fill in your Firebase credentials from Firebase Console
 * 3. Never commit .env to git (it's in .gitignore)
 *
 * Usage:
 * import { firebaseConfig, DATABASE_PATHS } from './config/firebase.config';
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

/**
 * Database paths used across all apps
 */
export const DATABASE_PATHS = {
  TARIFFS_BASE14: 'tariffs/base14',
  TARIFFS_ALL: 'tariffs'
};

/**
 * Default tariff password (can be overridden via environment variable)
 */
export const DEFAULT_TARIFF_PASSWORD = import.meta.env.VITE_TARIFF_PASSWORD || 'Hestavangen11';

/**
 * Default base tariff values (1-4 seats, day period)
 * These serve as fallback if Firebase is unavailable
 */
export const DEFAULT_BASE_TARIFF_14 = {
  start: 97,           // NOK start price
  km0_10: 11.14,       // NOK per km (first 10 km)
  kmOver10: 21.23,     // NOK per km (over 10 km)
  min: 8.42            // NOK per minute
};

/**
 * Google Maps API configuration
 * Note: Replace with your own API key via environment variable
 */
export const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  libraries: ['places', 'geometry'],
  version: 'weekly',
  region: 'NO',  // Norway
  language: 'no' // Norwegian
};
