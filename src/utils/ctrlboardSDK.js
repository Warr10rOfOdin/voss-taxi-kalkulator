/**
 * CTRL BOARD SDK - Local Implementation
 *
 * This is a local implementation of the CTRL BOARD SDK interface.
 * Replace with actual @ctrlboard/sdk package when available.
 *
 * @module ctrlboardSDK
 */

/**
 * CtrlBoard SDK Client
 * Handles heartbeats, event buffering, incident reporting, and metrics tracking
 */
export class CtrlBoard {
  constructor(config) {
    const { apiKey, baseUrl, appId, heartbeat = false, heartbeatInterval = 60000, debug = false } = config;

    if (!apiKey) {
      throw new Error('CTRL BOARD SDK: apiKey is required');
    }
    if (!baseUrl) {
      throw new Error('CTRL BOARD SDK: baseUrl is required');
    }
    if (!appId) {
      throw new Error('CTRL BOARD SDK: appId is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.appId = appId;
    this.debug = debug;

    // Event buffering
    this.eventBuffer = [];
    this.bufferSize = 50; // Send after 50 events
    this.bufferTimeout = 5000; // Or after 5 seconds
    this.bufferTimer = null;

    // Heartbeat
    this.heartbeatEnabled = heartbeat;
    this.heartbeatInterval = heartbeatInterval;
    this.heartbeatTimer = null;

    // State
    this.initialized = false;

    this._initialize();
  }

  /**
   * Initialize SDK
   * @private
   */
  _initialize() {
    if (this.debug) {
      console.log('[CTRL BOARD] Initializing SDK', {
        appId: this.appId,
        baseUrl: this.baseUrl,
        heartbeat: this.heartbeatEnabled
      });
    }

    // Start heartbeat if enabled
    if (this.heartbeatEnabled) {
      this._startHeartbeat();
    }

    this.initialized = true;

    if (this.debug) {
      console.log('[CTRL BOARD] SDK initialized successfully');
    }
  }

  /**
   * Start automatic heartbeats
   * @private
   */
  _startHeartbeat() {
    // Send initial heartbeat immediately
    this._sendHeartbeat();

    // Then send periodically
    this.heartbeatTimer = setInterval(() => {
      this._sendHeartbeat();
    }, this.heartbeatInterval);

    if (this.debug) {
      console.log(`[CTRL BOARD] Heartbeat started (${this.heartbeatInterval}ms interval)`);
    }
  }

  /**
   * Send a heartbeat
   * @private
   */
  async _sendHeartbeat() {
    const payload = {
      appId: this.appId,
      timestamp: new Date().toISOString(),
      status: 'online',
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        environment: import.meta.env.MODE
      }
    };

    try {
      await this._post('/api/heartbeat', payload);

      if (this.debug) {
        console.log('[CTRL BOARD] Heartbeat sent', payload);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CTRL BOARD] Failed to send heartbeat:', error.message);
      }
    }
  }

  /**
   * Buffer an event (API usage, metrics, etc.)
   * Events are batched and sent in groups to reduce network overhead
   *
   * @param {Object} event - The event to track
   * @param {string} event.provider - Provider name (e.g., 'google_maps')
   * @param {string} event.api - API name (e.g., 'directions')
   * @param {number} event.latency - Request latency in ms
   * @param {boolean} event.success - Whether the request succeeded
   * @param {Object} event.metadata - Additional metadata
   */
  bufferEvent(event) {
    const enrichedEvent = {
      ...event,
      appId: this.appId,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE
    };

    this.eventBuffer.push(enrichedEvent);

    if (this.debug) {
      console.log('[CTRL BOARD] Event buffered:', enrichedEvent);
    }

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.bufferSize) {
      this._flushEvents();
    } else {
      // Reset timer
      if (this.bufferTimer) {
        clearTimeout(this.bufferTimer);
      }

      // Set new timer to flush after timeout
      this.bufferTimer = setTimeout(() => {
        this._flushEvents();
      }, this.bufferTimeout);
    }
  }

  /**
   * Flush buffered events to CTRL BOARD
   * @private
   */
  async _flushEvents() {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    // Clear timer
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }

    try {
      await this._post('/api/events', { events });

      if (this.debug) {
        console.log(`[CTRL BOARD] Flushed ${events.length} events`);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CTRL BOARD] Failed to flush events:', error.message);
      }

      // Re-buffer events on failure (with limit to prevent memory leak)
      if (this.eventBuffer.length < 200) {
        this.eventBuffer.unshift(...events);
      }
    }
  }

  /**
   * Report an incident (error, warning, info)
   * Incidents are sent immediately, not buffered
   *
   * @param {Object} incident - The incident to report
   * @param {string} incident.severity - 'critical' | 'error' | 'warning' | 'info'
   * @param {string} incident.title - Short description
   * @param {string} incident.description - Detailed description
   * @param {string} incident.source - Source file/component
   * @param {Object} incident.metadata - Additional context
   */
  async reportIncident(incident) {
    const payload = {
      ...incident,
      appId: this.appId,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE
    };

    try {
      await this._post('/api/incidents', payload);

      if (this.debug) {
        console.log('[CTRL BOARD] Incident reported:', payload);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CTRL BOARD] Failed to report incident:', error.message);
      }
    }
  }

  /**
   * Track user traffic metrics
   * Used for daily aggregation (DAU, calculations, etc.)
   *
   * @param {Object} metrics - User traffic metrics
   * @param {string} metrics.date - Date in YYYY-MM-DD format
   * @param {number} metrics.dau - Daily active users
   * @param {number} metrics.calculations - Calculations performed
   * @param {number} metrics.prints - PDF prints generated
   * @param {Object} metrics.metadata - Additional metrics
   */
  async trackUserTraffic(metrics) {
    const payload = {
      ...metrics,
      appId: this.appId,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE
    };

    try {
      await this._post('/api/traffic', payload);

      if (this.debug) {
        console.log('[CTRL BOARD] User traffic tracked:', payload);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CTRL BOARD] Failed to track user traffic:', error.message);
      }
    }
  }

  /**
   * Graceful shutdown - flush remaining events and stop heartbeat
   */
  async shutdown() {
    if (this.debug) {
      console.log('[CTRL BOARD] Shutting down SDK...');
    }

    // Stop heartbeat
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // Flush remaining events
    await this._flushEvents();

    // Send final offline status
    try {
      await this._post('/api/heartbeat', {
        appId: this.appId,
        timestamp: new Date().toISOString(),
        status: 'offline'
      });
    } catch (error) {
      // Ignore errors during shutdown
    }

    if (this.debug) {
      console.log('[CTRL BOARD] SDK shutdown complete');
    }
  }

  /**
   * Make a POST request to CTRL BOARD API
   * @private
   */
  async _post(endpoint, payload) {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      throw new Error(`CTRL BOARD API error (${response.status}): ${error}`);
    }

    return response.json().catch(() => ({}));
  }
}

/**
 * Helper function to get current tenant ID
 * Uses domain-based resolution matching the app's multi-tenant system
 */
export function getCurrentTenantId() {
  // Get hostname (e.g., 'voss-taxi.example.com')
  const hostname = window.location.hostname;

  // Extract tenant ID from subdomain
  // Example: 'tenant1.example.com' → 'tenant1'
  if (hostname.includes('.')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0];
    }
  }

  // Fallback to 'default' or hostname itself
  return hostname === 'localhost' ? 'development' : hostname.split('.')[0] || 'default';
}
