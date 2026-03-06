/**
 * Error Handling Utilities
 *
 * Centralized error handling, custom error classes, and retry logic.
 */

import { logger } from './logger';

/**
 * Custom error classes for specific error types
 */
export class FirebaseError extends Error {
  constructor(message, operation, originalError) {
    super(message);
    this.name = 'FirebaseError';
    this.operation = operation;
    this.originalError = originalError;
  }
}

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class NetworkError extends Error {
  constructor(message, url, originalError) {
    super(message);
    this.name = 'NetworkError';
    this.url = url;
    this.originalError = originalError;
  }
}

export class TenantConfigError extends Error {
  constructor(message, tenantId) {
    super(message);
    this.name = 'TenantConfigError';
    this.tenantId = tenantId;
  }
}

/**
 * Retry an async operation with exponential backoff
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of the function
 */
export async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry = null,
    shouldRetry = (error) => true
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if shouldRetry returns false
      if (!shouldRetry(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt);
      }

      logger.warn(
        '[Retry]',
        `Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`,
        error.message
      );

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));

      // Exponential backoff
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  logger.error('[Retry]', `All ${maxAttempts} attempts failed`, lastError);
  throw lastError;
}

/**
 * Wrap an async function with error handling and logging
 *
 * @param {Function} fn - Async function to wrap
 * @param {string} operation - Operation name for logging
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, operation) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`[${operation}]`, 'Operation failed:', error);
      throw error;
    }
  };
}

/**
 * Create a user-friendly error message from an error object
 *
 * @param {Error} error - The error object
 * @param {Object} translations - Translation object for user messages
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyMessage(error, translations) {
  // Firebase-specific errors
  if (error.code?.startsWith('auth/')) {
    return translations?.errors?.auth || 'Authentication error. Please try again.';
  }

  if (error.code?.startsWith('permission-denied')) {
    return translations?.errors?.permission || 'Permission denied. Please contact support.';
  }

  // Network errors
  if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
    return translations?.errors?.network || 'Network error. Please check your connection.';
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return translations?.errors?.validation || `Invalid ${error.field}. Please check your input.`;
  }

  // Generic fallback
  return translations?.errors?.generic || 'An error occurred. Please try again.';
}

/**
 * Report an error to an external service (e.g., Sentry)
 * Placeholder for future integration
 *
 * @param {Error} error - The error to report
 * @param {Object} context - Additional context
 */
export function reportError(error, context = {}) {
  // In production, this would send to Sentry/similar
  // For now, just log to console
  logger.error('[ErrorReporting]', 'Error:', error, 'Context:', context);

  // Future: integrate with Sentry
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context });
  // }
}
