/**
 * Validation Utilities
 *
 * Input validation, data sanitization, and type checking.
 */

import { PATTERNS, MIN_DISTANCE_KM, MAX_DISTANCE_KM, MIN_DURATION_MIN, MAX_DURATION_MIN, VEHICLE_GROUPS, LANGUAGES } from './constants';
import { ValidationError } from './errors';

/**
 * Validate a Norwegian phone number
 */
export function validatePhone(phone) {
  if (!phone) return true; // Optional field
  return PATTERNS.NORWEGIAN_PHONE.test(phone.replace(/\s/g, ''));
}

/**
 * Validate an email address
 */
export function validateEmail(email) {
  if (!email) return true; // Optional field
  return PATTERNS.EMAIL.test(email);
}

/**
 * Validate a time string (HH:mm format)
 */
export function validateTime(time) {
  if (!time) return false;
  return PATTERNS.TIME_24H.test(time);
}

/**
 * Validate a date string (YYYY-MM-DD format)
 */
export function validateDate(date) {
  if (!date) return false;
  if (!PATTERNS.DATE_ISO.test(date)) return false;

  // Check if it's a valid date
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

/**
 * Validate distance value
 */
export function validateDistance(distanceKm) {
  const num = parseFloat(distanceKm);
  if (isNaN(num)) return false;
  return num >= MIN_DISTANCE_KM && num <= MAX_DISTANCE_KM;
}

/**
 * Validate duration value
 */
export function validateDuration(durationMin) {
  const num = parseInt(durationMin, 10);
  if (isNaN(num)) return false;
  return num >= MIN_DURATION_MIN && num <= MAX_DURATION_MIN;
}

/**
 * Validate vehicle group
 */
export function validateVehicleGroup(group) {
  return VEHICLE_GROUPS.includes(group);
}

/**
 * Validate language code
 */
export function validateLanguage(lang) {
  return LANGUAGES.includes(lang);
}

/**
 * Validate tariff object structure
 */
export function validateTariff(tariff) {
  if (!tariff || typeof tariff !== 'object') return false;

  const requiredFields = ['start', 'km0_10', 'kmOver10', 'min'];
  const allFieldsPresent = requiredFields.every(field =>
    field in tariff && typeof tariff[field] === 'number'
  );

  if (!allFieldsPresent) return false;

  // All values must be positive
  return requiredFields.every(field => tariff[field] > 0);
}

/**
 * Validate tenant configuration structure
 */
export function validateTenantConfig(config) {
  if (!config || typeof config !== 'object') return false;

  // Required fields
  if (!config.id || typeof config.id !== 'string') return false;

  // Optional but structured fields
  if (config.branding && typeof config.branding !== 'object') return false;
  if (config.theme && typeof config.theme !== 'object') return false;
  if (config.defaults && typeof config.defaults !== 'object') return false;
  if (config.features && typeof config.features !== 'object') return false;

  return true;
}

/**
 * Sanitize a number input (remove non-numeric characters)
 */
export function sanitizeNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '';

  // Convert to string and remove non-numeric chars (except . and -)
  const str = String(value).replace(/[^\d.-]/g, '');

  // Parse as float
  const num = parseFloat(str);
  if (isNaN(num)) return '';

  // Round to specified decimals
  return Number(num.toFixed(decimals));
}

/**
 * Sanitize a string (trim and limit length)
 */
export function sanitizeString(value, maxLength = 255) {
  if (!value) return '';
  return String(value).trim().slice(0, maxLength);
}

/**
 * Validate and sanitize an address string
 */
export function sanitizeAddress(address) {
  if (!address) return '';

  // Trim whitespace
  let cleaned = address.trim();

  // Remove excessive spaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Limit length
  cleaned = cleaned.slice(0, 500);

  return cleaned;
}

/**
 * Validate a complete trip input
 * Throws ValidationError if invalid
 */
export function validateTripInput({ distanceKm, durationMin, vehicleGroup, tripDate, tripTime }) {
  if (!validateDistance(distanceKm)) {
    throw new ValidationError(
      `Distance must be between ${MIN_DISTANCE_KM} and ${MAX_DISTANCE_KM} km`,
      'distanceKm'
    );
  }

  if (!validateDuration(durationMin)) {
    throw new ValidationError(
      `Duration must be between ${MIN_DURATION_MIN} and ${MAX_DURATION_MIN} minutes`,
      'durationMin'
    );
  }

  if (!validateVehicleGroup(vehicleGroup)) {
    throw new ValidationError(
      `Vehicle group must be one of: ${VEHICLE_GROUPS.join(', ')}`,
      'vehicleGroup'
    );
  }

  if (tripDate && !validateDate(tripDate)) {
    throw new ValidationError('Invalid date format (expected YYYY-MM-DD)', 'tripDate');
  }

  if (tripTime && !validateTime(tripTime)) {
    throw new ValidationError('Invalid time format (expected HH:mm)', 'tripTime');
  }

  return true;
}

/**
 * Type guards for runtime type checking
 */
export const is = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && !isNaN(value),
  boolean: (value) => typeof value === 'boolean',
  object: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  array: (value) => Array.isArray(value),
  function: (value) => typeof value === 'function',
  null: (value) => value === null,
  undefined: (value) => value === undefined,
  defined: (value) => value !== null && value !== undefined
};
