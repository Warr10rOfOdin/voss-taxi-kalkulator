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
   * Also reports warnings to CTRL BOARD as incidents
   */
  warn(prefix, ...args) {
    if (this.level <= LogLevel.WARN) {
      console.warn(...this.format('WARN', prefix), ...args);
    }

    // Report to CTRL BOARD if available
    this._reportToCtrlBoard(prefix, args, 'warning');
  }

  /**
   * Log at ERROR level
   * Also reports errors to CTRL BOARD as incidents
   */
  error(prefix, ...args) {
    if (this.level <= LogLevel.ERROR) {
      console.error(...this.format('ERROR', prefix), ...args);
    }

    // Report to CTRL BOARD if available (dynamic import to avoid circular dependency)
    this._reportToCtrlBoard(prefix, args, 'error');
  }

  /**
   * Report error to CTRL BOARD
   * @private
   */
  _reportToCtrlBoard(prefix, args, severity) {
    // Only report in production or when explicitly enabled
    if (!import.meta.env.PROD && !import.meta.env.VITE_CTRL_BOARD_DEBUG) {
      return;
    }

    try {
      // Dynamic import to avoid circular dependency
      // ctrlboard.js imports logger.js, so we can't import it at the top level
      import('./ctrlboard.js').then(({ default: ctrlboard, getCurrentTenantId }) => {
        if (!ctrlboard) {
          return;
        }

        // Extract error message and details from args
        const firstArg = args[0];
        let title = prefix;
        let description = args.join(' ');
        let metadata = {};

        // If first arg is an Error object
        if (firstArg instanceof Error) {
          title = `${prefix}: ${firstArg.message}`;
          description = firstArg.stack || firstArg.toString();
          metadata = {
            errorName: firstArg.name,
            errorMessage: firstArg.message
          };
        }

        // Report incident
        ctrlboard.reportIncident({
          severity,
          title: title.substring(0, 100), // Limit title length
          description: description.substring(0, 500), // Limit description
          source: prefix.replace(/[\[\]]/g, ''), // Remove brackets from prefix
          metadata: {
            tenantId: getCurrentTenantId(),
            url: window.location.href,
            timestamp: new Date().toISOString(),
            ...metadata
          }
        });
      }).catch((err) => {
        // Silently fail if CTRL BOARD is not available
        // Don't log to avoid infinite loop
      });
    } catch (error) {
      // Silently fail to avoid breaking the app
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
