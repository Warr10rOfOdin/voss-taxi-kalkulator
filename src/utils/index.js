/**
 * Utilities Barrel Export
 *
 * Centralized export point for all utility modules.
 * Allows clean imports like: import { logger, retry, validateDistance } from '@/utils'
 */

// Logger
export { logger, createLogger, firebaseLogger, tenantLogger, mapLogger, tariffLogger } from './logger';

// Error handling
export {
  FirebaseError,
  ValidationError,
  NetworkError,
  TenantConfigError,
  retry,
  withErrorHandling,
  getUserFriendlyMessage,
  reportError
} from './errors';

// Validators
export {
  validatePhone,
  validateEmail,
  validateTime,
  validateDate,
  validateDistance,
  validateDuration,
  validateVehicleGroup,
  validateLanguage,
  validateTariff,
  validateTenantConfig,
  validateTripInput,
  sanitizeNumber,
  sanitizeString,
  sanitizeAddress,
  is
} from './validators';

// Constants
export * from './constants';

// Business logic utilities (already exist)
export * from './tariffCalculator';
export * from './helligdager';
