/**
 * Tenant Resolver
 *
 * Determines which tenant to load based on how the app is accessed.
 *
 * Resolution order:
 *   1. Query parameter: ?tenant=voss-taxi (for testing/development)
 *   2. Custom domain mapping via Firebase /domainMap/
 *   3. Subdomain mapping: voss-taxi.taxikalkulator.no → voss-taxi
 *   4. Fallback: default tenant (voss-taxi)
 *
 * Tenant configs are loaded from Firebase /tenantRegistry/{tenantId}/config.
 * Falls back to the local DEFAULT_TENANT if Firebase is unreachable.
 */

import { createTenantConfig, DEFAULT_TENANT } from './tenantSchema';
import { lookupTenantByDomain, getTenantConfig } from '../firebase';

/**
 * Resolve tenant ID from the current URL (synchronous — just figures out the ID)
 *
 * @returns {{ tenantId: string, method: string }}
 */
function resolveTenantId() {
  const hostname = window.location.hostname;
  const params = new URLSearchParams(window.location.search);

  // 1. Query parameter override (for testing/development)
  const tenantParam = params.get('tenant');
  if (tenantParam) {
    return { tenantId: tenantParam, method: 'query param' };
  }

  // 2 & 3 handled async (domain map + subdomain) — return hostname for async resolution
  // For subdomain: extract first part if hostname has 3+ segments
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Skip common non-tenant subdomains
    if (subdomain !== 'www' && subdomain !== 'app') {
      return { tenantId: subdomain, method: 'subdomain' };
    }
  }

  // Will be resolved via domain map in the async step
  return { tenantId: null, method: 'domain' };
}

/**
 * Resolve tenant configuration asynchronously
 *
 * Tries Firebase first, falls back to local defaults.
 * This is the main entry point used by TenantContext.
 *
 * @returns {Promise<Object>} Complete tenant configuration
 */
export async function resolveTenantAsync() {
  const hostname = window.location.hostname;
  const { tenantId: resolvedId, method } = resolveTenantId();

  let tenantId = resolvedId;

  // If no tenant ID from query param or subdomain, try domain map lookup
  if (!tenantId) {
    try {
      const domainTenantId = await lookupTenantByDomain(hostname);
      if (domainTenantId) {
        tenantId = domainTenantId;
        console.log(`[TenantResolver] Resolved via domain map: ${hostname} → ${tenantId}`);
      }
    } catch (error) {
      console.warn('[TenantResolver] Domain map lookup failed:', error);
    }
  } else {
    console.log(`[TenantResolver] Resolved via ${method}: ${tenantId}`);
  }

  // Fall back to default tenant if still nothing
  if (!tenantId) {
    tenantId = 'voss-taxi';
    console.log('[TenantResolver] Using default tenant (voss-taxi)');
  }

  // Try to load full config from Firebase
  try {
    const firebaseConfig = await getTenantConfig(tenantId);
    if (firebaseConfig) {
      // Deep merge Firebase config with defaults (Firebase takes precedence)
      const merged = createTenantConfig(firebaseConfig);
      console.log(`[TenantResolver] Loaded config from Firebase for: ${tenantId}`);
      return merged;
    }
  } catch (error) {
    console.warn(`[TenantResolver] Firebase config fetch failed for ${tenantId}:`, error);
  }

  // Fallback: use local default config if this is the default tenant
  if (tenantId === 'voss-taxi') {
    console.log('[TenantResolver] Using local default config for voss-taxi');
    return createTenantConfig(DEFAULT_TENANT);
  }

  // Unknown tenant with no Firebase config — use defaults with just the ID set
  console.warn(`[TenantResolver] No config found for tenant "${tenantId}", using defaults`);
  return createTenantConfig({ id: tenantId, name: tenantId });
}

/**
 * Synchronous tenant resolver (legacy — used only if needed)
 * Uses local defaults only. Prefer resolveTenantAsync() for Firebase integration.
 *
 * @returns {Object} Resolved tenant configuration from local defaults
 */
export function resolveTenant() {
  const { tenantId } = resolveTenantId();

  if (tenantId === 'voss-taxi' || !tenantId) {
    return createTenantConfig(DEFAULT_TENANT);
  }

  // No local registry for other tenants — return defaults with the ID
  return createTenantConfig({ id: tenantId, name: tenantId });
}

/**
 * Validate that the current domain is allowed for the resolved tenant
 * @param {Object} tenant - The resolved tenant config
 * @returns {boolean} Whether the current domain is authorized
 */
export function validateDomain(tenant) {
  // If no domain restrictions set, allow all (open access)
  if (!tenant.allowedDomains || tenant.allowedDomains.length === 0) {
    return true;
  }

  const hostname = window.location.hostname;

  // Allow localhost for development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }

  // Check against allowed domains
  const isAllowed = tenant.allowedDomains.some(domain => {
    // Exact match
    if (hostname === domain) return true;
    // Wildcard subdomain match (e.g., *.vercel.app)
    if (domain.startsWith('*.')) {
      const baseDomain = domain.slice(2);
      return hostname.endsWith('.' + baseDomain) || hostname === baseDomain;
    }
    return false;
  });

  if (!isAllowed) {
    console.warn(`[TenantResolver] Domain "${hostname}" is not authorized for tenant "${tenant.id}"`);
  }

  return isAllowed;
}

/**
 * Check if the app is being loaded in an iframe
 * @returns {boolean}
 */
export function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If accessing window.top throws (cross-origin), we're in an iframe
    return true;
  }
}

/**
 * Validate iframe embedding is authorized
 * @param {Object} tenant - The resolved tenant config
 * @returns {boolean}
 */
export function validateEmbedding(tenant) {
  if (!isInIframe()) {
    return true; // Not in iframe, always OK
  }

  // If no domain restrictions, block iframe by default for security
  if (!tenant.allowedDomains || tenant.allowedDomains.length === 0) {
    console.warn('[TenantResolver] Iframe embedding blocked: no allowed domains configured');
    return false;
  }

  // In an iframe with allowed domains → allow
  // (The server-side CSP headers provide the real protection;
  //  this is a defense-in-depth client-side check)
  return true;
}
