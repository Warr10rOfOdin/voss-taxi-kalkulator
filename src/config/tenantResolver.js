/**
 * Tenant Resolver
 *
 * Determines which tenant to load based on how the app is accessed.
 *
 * Resolution order:
 *   1. Query parameter: ?tenant=voss-taxi (for testing/development)
 *   2. Custom domain mapping: vosstaksi.no → voss-taxi
 *   3. Subdomain mapping: voss-taxi.taxikalkulator.no → voss-taxi
 *   4. Fallback: default tenant (voss-taxi)
 *
 * In production, tenant configs are loaded from Firebase /tenantRegistry/
 * For now, a local registry is used.
 */

import { createTenantConfig, DEFAULT_TENANT } from './tenantSchema';

/**
 * Local tenant registry
 * Maps domain/subdomain patterns to tenant configs.
 *
 * In production, this should be loaded from Firebase:
 *   /tenantRegistry/{tenantId}/config
 */
const LOCAL_TENANT_REGISTRY = {
  'voss-taxi': DEFAULT_TENANT
  // Add more tenants here:
  // 'bergen-taxi': createTenantConfig({ id: 'bergen-taxi', name: 'Bergen Taxi', ... })
};

/**
 * Custom domain → tenant ID mapping
 * When a customer uses their own domain (e.g., vosstaksi.no),
 * this maps it to the correct tenant.
 */
const DOMAIN_TO_TENANT = {
  // 'vosstaksi.no': 'voss-taxi',
  // 'www.vosstaksi.no': 'voss-taxi',
  // 'bergentaxi.no': 'bergen-taxi',
};

/**
 * Resolve tenant from current URL
 * @returns {Object} Resolved tenant configuration
 */
export function resolveTenant() {
  const hostname = window.location.hostname;
  const params = new URLSearchParams(window.location.search);

  // 1. Query parameter override (for testing)
  const tenantParam = params.get('tenant');
  if (tenantParam && LOCAL_TENANT_REGISTRY[tenantParam]) {
    console.log(`[TenantResolver] Resolved via query param: ${tenantParam}`);
    return createTenantConfig(LOCAL_TENANT_REGISTRY[tenantParam]);
  }

  // 2. Custom domain mapping
  const domainTenantId = DOMAIN_TO_TENANT[hostname];
  if (domainTenantId && LOCAL_TENANT_REGISTRY[domainTenantId]) {
    console.log(`[TenantResolver] Resolved via custom domain: ${hostname} → ${domainTenantId}`);
    return createTenantConfig(LOCAL_TENANT_REGISTRY[domainTenantId]);
  }

  // 3. Subdomain mapping (e.g., voss-taxi.taxikalkulator.no)
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (LOCAL_TENANT_REGISTRY[subdomain]) {
      console.log(`[TenantResolver] Resolved via subdomain: ${subdomain}`);
      return createTenantConfig(LOCAL_TENANT_REGISTRY[subdomain]);
    }
  }

  // 4. Fallback to default tenant
  console.log('[TenantResolver] Using default tenant (voss-taxi)');
  return createTenantConfig(DEFAULT_TENANT);
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
