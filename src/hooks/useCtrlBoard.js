/**
 * useCtrlBoard Hook
 *
 * Provides tracking and monitoring functionality for components.
 * Tracks Google Maps API usage, errors, and user actions.
 *
 * @module useCtrlBoard
 */

import { useCallback } from 'react';
import ctrlboard, { getCurrentTenantId, isCtrlBoardEnabled } from '../utils/ctrlboard';
import logger from '../utils/logger';

/**
 * Hook for CTRL BOARD monitoring and tracking
 * @returns {Object} Tracking functions
 */
export function useCtrlBoard() {
  /**
   * Track Google Maps API call
   *
   * @param {string} apiType - Type of API ('directions', 'places_autocomplete', 'maps_js')
   * @param {number} latency - Request latency in milliseconds
   * @param {Object} metadata - Additional metadata
   * @param {boolean} metadata.success - Whether the request succeeded
   * @param {number} [metadata.distance] - Distance in km (for Directions API)
   * @param {number} [metadata.duration] - Duration in minutes (for Directions API)
   * @param {number} [metadata.waypoints] - Number of via points (for Directions API)
   * @param {string} [metadata.vehicleGroup] - Vehicle group (for Directions API)
   * @param {string} [metadata.error] - Error message if failed
   */
  const trackMapApiCall = useCallback((apiType, latency, metadata = {}) => {
    if (!isCtrlBoardEnabled()) {
      return;
    }

    const { success = true, distance, duration, waypoints, vehicleGroup, error } = metadata;

    // Calculate cost based on API type
    let cost = 0;
    switch (apiType) {
      case 'directions':
        // $5 per 1000 requests
        cost = 0.005;
        break;
      case 'places_autocomplete':
        // $2.83 per 1000 sessions
        cost = 0.00283;
        break;
      case 'maps_js':
        // No cost for map display (included in other API calls)
        cost = 0;
        break;
      default:
        cost = 0;
    }

    const event = {
      provider: 'google_maps',
      api: apiType,
      latency,
      success,
      metadata: {
        cost,
        tenantId: getCurrentTenantId(),
        ...(distance !== undefined && { distance }),
        ...(duration !== undefined && { duration }),
        ...(waypoints !== undefined && { waypoints }),
        ...(vehicleGroup !== undefined && { vehicleGroup }),
        ...(error !== undefined && { error })
      }
    };

    try {
      ctrlboard.bufferEvent(event);

      if (import.meta.env.DEV) {
        logger.debug('CTRL BOARD', `Tracked ${apiType} API call (${latency}ms, ${success ? 'success' : 'failed'})`);
      }
    } catch (err) {
      logger.error('CTRL BOARD', 'Failed to track Maps API call:', err.message);
    }
  }, []);

  /**
   * Report an error or incident
   *
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context
   * @param {string} context.source - Source file/component
   * @param {string} [context.severity] - 'critical' | 'error' | 'warning' | 'info'
   * @param {Object} [context.metadata] - Additional metadata
   */
  const reportError = useCallback((error, context = {}) => {
    if (!isCtrlBoardEnabled()) {
      return;
    }

    const { source = 'unknown', severity = 'error', metadata = {} } = context;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const incident = {
      severity,
      title: errorMessage.substring(0, 100), // Limit title length
      description: errorMessage,
      source,
      metadata: {
        tenantId: getCurrentTenantId(),
        stack: errorStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...metadata
      }
    };

    try {
      ctrlboard.reportIncident(incident);

      if (import.meta.env.DEV) {
        logger.debug('CTRL BOARD', `Reported ${severity} incident:`, errorMessage);
      }
    } catch (err) {
      logger.error('CTRL BOARD', 'Failed to report incident:', err.message);
    }
  }, []);

  /**
   * Track a user calculation
   * Used for analytics (can be aggregated daily)
   *
   * @param {Object} calculation - Calculation details
   * @param {string} calculation.vehicleGroup - Vehicle group (1-4, 5-6, etc.)
   * @param {number} calculation.distance - Distance in km
   * @param {number} calculation.duration - Duration in minutes
   * @param {number} [calculation.viaPoints] - Number of via points
   * @param {number} [calculation.price] - Estimated price
   */
  const trackCalculation = useCallback((calculation) => {
    if (!isCtrlBoardEnabled()) {
      return;
    }

    const { vehicleGroup, distance, duration, viaPoints = 0, price } = calculation;

    const event = {
      provider: 'voss_taxi',
      api: 'calculation',
      latency: 0, // Not applicable
      success: true,
      metadata: {
        tenantId: getCurrentTenantId(),
        vehicleGroup,
        distance,
        duration,
        viaPoints,
        ...(price !== undefined && { price })
      }
    };

    try {
      ctrlboard.bufferEvent(event);

      if (import.meta.env.DEV) {
        logger.debug('CTRL BOARD', `Tracked calculation (${vehicleGroup}, ${distance}km, ${duration}min)`);
      }
    } catch (err) {
      logger.error('CTRL BOARD', 'Failed to track calculation:', err.message);
    }
  }, []);

  /**
   * Track a print/PDF export action
   *
   * @param {Object} metadata - Print details
   */
  const trackPrint = useCallback((metadata = {}) => {
    if (!isCtrlBoardEnabled()) {
      return;
    }

    const event = {
      provider: 'voss_taxi',
      api: 'print',
      latency: 0,
      success: true,
      metadata: {
        tenantId: getCurrentTenantId(),
        ...metadata
      }
    };

    try {
      ctrlboard.bufferEvent(event);

      if (import.meta.env.DEV) {
        logger.debug('CTRL BOARD', 'Tracked print action');
      }
    } catch (err) {
      logger.error('CTRL BOARD', 'Failed to track print:', err.message);
    }
  }, []);

  /**
   * Track tariff editor access
   *
   * @param {string} action - Action performed ('open', 'save', 'cancel')
   * @param {Object} metadata - Additional metadata
   */
  const trackTariffEdit = useCallback((action, metadata = {}) => {
    if (!isCtrlBoardEnabled()) {
      return;
    }

    const event = {
      provider: 'voss_taxi',
      api: 'tariff_edit',
      latency: 0,
      success: true,
      metadata: {
        action,
        tenantId: getCurrentTenantId(),
        ...metadata
      }
    };

    try {
      ctrlboard.bufferEvent(event);

      if (import.meta.env.DEV) {
        logger.debug('CTRL BOARD', `Tracked tariff edit: ${action}`);
      }
    } catch (err) {
      logger.error('CTRL BOARD', 'Failed to track tariff edit:', err.message);
    }
  }, []);

  return {
    trackMapApiCall,
    reportError,
    trackCalculation,
    trackPrint,
    trackTariffEdit,
    isEnabled: isCtrlBoardEnabled()
  };
}

export default useCtrlBoard;
