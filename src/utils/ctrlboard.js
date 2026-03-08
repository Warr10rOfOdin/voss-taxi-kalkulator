/**
 * CTRL BOARD Client Initialization
 *
 * Singleton SDK client for monitoring and analytics.
 * Automatically sends heartbeats, buffers events, and reports incidents.
 *
 * @module ctrlboard
 */

import { CtrlBoard, getCurrentTenantId } from './ctrlboardSDK';
import logger from './logger';

// Check if CTRL BOARD is enabled
const enabled = import.meta.env.VITE_CTRL_BOARD_ENABLED === 'true';

// Check if all required environment variables are present
const hasRequiredEnvVars =
  import.meta.env.VITE_CTRL_BOARD_URL &&
  import.meta.env.VITE_CTRL_BOARD_API_KEY &&
  import.meta.env.VITE_CTRL_BOARD_APP_ID;

// Initialize SDK only if enabled and configured
let ctrlboardInstance = null;

if (enabled && hasRequiredEnvVars) {
  try {
    ctrlboardInstance = new CtrlBoard({
      apiKey: import.meta.env.VITE_CTRL_BOARD_API_KEY,
      baseUrl: import.meta.env.VITE_CTRL_BOARD_URL,
      appId: import.meta.env.VITE_CTRL_BOARD_APP_ID,
      heartbeat: true,
      heartbeatInterval: 60000, // 60 seconds
      debug: !import.meta.env.PROD // Verbose logging in development
    });

    logger.info('CTRL BOARD', 'SDK initialized successfully');
  } catch (error) {
    logger.error('CTRL BOARD', 'Failed to initialize SDK:', error.message);
  }
} else if (enabled && !hasRequiredEnvVars) {
  logger.warn(
    'CTRL BOARD',
    'Enabled but missing environment variables. Required:',
    'VITE_CTRL_BOARD_URL, VITE_CTRL_BOARD_API_KEY, VITE_CTRL_BOARD_APP_ID'
  );
} else {
  logger.info('CTRL BOARD', 'SDK is disabled (VITE_CTRL_BOARD_ENABLED not true)');
}

/**
 * Export singleton SDK instance
 * Will be null if disabled or not configured
 */
export const ctrlboard = ctrlboardInstance;

/**
 * Check if CTRL BOARD is available
 * @returns {boolean}
 */
export const isCtrlBoardEnabled = () => {
  return ctrlboard !== null;
};

/**
 * Get current tenant ID for multi-tenant tracking
 * @returns {string}
 */
export { getCurrentTenantId } from './ctrlboardSDK';

/**
 * Browser-compatible shutdown handler
 * Flushes remaining events and stops heartbeat before page unload
 */
if (ctrlboardInstance) {
  window.addEventListener('beforeunload', async () => {
    try {
      await ctrlboardInstance.shutdown();
    } catch (error) {
      // Ignore errors during shutdown
      console.error('[CTRL BOARD] Shutdown error:', error);
    }
  });

  // Also handle visibility change (tab close, browser minimize)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden' && ctrlboardInstance) {
      try {
        // Flush events when tab becomes hidden
        await ctrlboardInstance._flushEvents();
      } catch (error) {
        // Ignore errors
      }
    }
  });
}

/**
 * Default export for convenience
 */
export default ctrlboard;
