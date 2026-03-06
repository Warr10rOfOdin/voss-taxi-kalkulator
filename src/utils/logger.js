/**
 * Logger Utility
 *
 * Centralized logging with levels, prefixes, and production safety.
 * Replaces scattered console.log calls throughout the app.
 */

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

class Logger {
  constructor() {
    // Set log level based on environment
    // Production: only show WARN and ERROR
    // Development: show all
    this.level = import.meta.env.PROD ? LogLevel.WARN : LogLevel.DEBUG;
    this.enableTimestamps = !import.meta.env.PROD;
  }

  /**
   * Format a log message with prefix and timestamp
   */
  format(level, prefix, ...args) {
    const parts = [];

    if (this.enableTimestamps) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      parts.push(`[${timestamp}]`);
    }

    parts.push(prefix);

    return parts;
  }

  /**
   * Log at DEBUG level (development only)
   */
  debug(prefix, ...args) {
    if (this.level <= LogLevel.DEBUG) {
      console.log(...this.format('DEBUG', prefix), ...args);
    }
  }

  /**
   * Log at INFO level
   */
  info(prefix, ...args) {
    if (this.level <= LogLevel.INFO) {
      console.info(...this.format('INFO', prefix), ...args);
    }
  }

  /**
   * Log at WARN level
   */
  warn(prefix, ...args) {
    if (this.level <= LogLevel.WARN) {
      console.warn(...this.format('WARN', prefix), ...args);
    }
  }

  /**
   * Log at ERROR level
   */
  error(prefix, ...args) {
    if (this.level <= LogLevel.ERROR) {
      console.error(...this.format('ERROR', prefix), ...args);
    }
  }

  /**
   * Create a scoped logger for a specific module
   */
  scope(moduleName) {
    return {
      debug: (...args) => this.debug(`[${moduleName}]`, ...args),
      info: (...args) => this.info(`[${moduleName}]`, ...args),
      warn: (...args) => this.warn(`[${moduleName}]`, ...args),
      error: (...args) => this.error(`[${moduleName}]`, ...args)
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience: create scoped loggers
export const createLogger = (moduleName) => logger.scope(moduleName);

// Named scoped loggers for common modules
export const firebaseLogger = logger.scope('Firebase');
export const tenantLogger = logger.scope('TenantResolver');
export const mapLogger = logger.scope('MapDisplay');
export const tariffLogger = logger.scope('Tariff');
