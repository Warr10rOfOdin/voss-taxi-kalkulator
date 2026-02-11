/**
 * Shared Firebase Configuration
 *
 * This configuration can be imported and used in multiple applications
 * to ensure consistent Firebase database access across all Voss Taxi apps.
 *
 * Usage:
 * import { firebaseConfig, TARIFFS_PATH } from './config/firebase.config';
 */

export const firebaseConfig = {
  apiKey: "AIzaSyAY57NLDNCXggXL7cv6FBnBTfln74Pu3Dc",
  authDomain: "voss-taxi-e788d.firebaseapp.com",
  projectId: "voss-taxi-e788d",
  storageBucket: "voss-taxi-e788d.firebasestorage.app",
  messagingSenderId: "331073037525",
  appId: "1:331073037525:web:21b25be31baec8a7f6ae5c",
  measurementId: "G-Z0MGVKCR3R",
  databaseURL: "https://voss-taxi-e788d-default-rtdb.europe-west1.firebasedatabase.app"
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
export const DEFAULT_TARIFF_PASSWORD = 'Hestavangen11';

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
