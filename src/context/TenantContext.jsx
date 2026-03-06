/**
 * Tenant Context
 *
 * Provides tenant configuration to the entire component tree.
 * Resolves tenant asynchronously from Firebase, validates domain,
 * applies theme, and subscribes to real-time config updates.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { resolveTenantAsync, validateDomain, validateEmbedding } from '../config/tenantResolver';
import { subscribeTenantConfig } from '../firebase';
import { createTenantConfig, DEFAULT_TENANT } from '../config/tenantSchema';
import { applyTheme } from '../themes/themeDefaults';

const TenantContext = createContext(null);

/**
 * Hook to access tenant configuration from any component
 * @returns {Object} { tenant, isLoading, isUnauthorized, isInactive }
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

/**
 * TenantProvider Component
 *
 * Wraps the app and provides:
 * - Async tenant config resolution from Firebase
 * - Domain validation
 * - Theme application (CSS variables)
 * - Dynamic page title/favicon/meta updates
 * - Real-time config subscription for live control board updates
 */
export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const unsubscribeRef = useRef(null);

  // Apply tenant config to the page (theme, meta, favicon)
  const applyTenantToPage = useCallback((tenantConfig) => {
    // Apply theme CSS variables to <html>
    applyTheme(document.documentElement, tenantConfig.theme);

    // Update page metadata
    updatePageMeta(tenantConfig);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initTenant() {
      try {
        // Resolve tenant from URL + Firebase
        const resolved = await resolveTenantAsync();

        if (cancelled) return;

        console.log(`[TenantProvider] Tenant resolved: ${resolved.id} (${resolved.name})`);

        // Check if tenant is deactivated
        if (resolved.active === false) {
          setIsInactive(true);
          setIsLoading(false);
          return;
        }

        // Validate domain
        const domainOk = validateDomain(resolved);
        const embedOk = validateEmbedding(resolved);

        if (!domainOk || !embedOk) {
          setIsUnauthorized(true);
          setIsLoading(false);
          return;
        }

        // Apply theme and meta
        applyTenantToPage(resolved);

        setTenant(resolved);
        setIsLoading(false);

        // Subscribe to real-time config updates from Firebase
        // This enables the control board to push changes live
        if (resolved.id) {
          unsubscribeRef.current = subscribeTenantConfig(resolved.id, (updatedConfig) => {
            if (cancelled) return;

            console.log(`[TenantProvider] Live config update for: ${resolved.id}`);

            // Check if tenant was deactivated via control board
            if (updatedConfig.active === false) {
              setIsInactive(true);
              return;
            }

            // Merge the updated config with defaults
            const merged = createTenantConfig(updatedConfig);

            // Re-apply theme (may have changed)
            applyTenantToPage(merged);

            // Re-validate domain (allowed domains may have changed)
            const stillAllowed = validateDomain(merged);
            if (!stillAllowed) {
              setIsUnauthorized(true);
              return;
            }

            setIsInactive(false);
            setIsUnauthorized(false);
            setTenant(merged);
          });
        }
      } catch (error) {
        console.error('[TenantProvider] Failed to resolve tenant:', error);
        if (!cancelled) {
          // On total failure, fall back to loading the default tenant from local config
          // This ensures the app still works if Firebase is down
          const fallback = createTenantConfig(DEFAULT_TENANT);
          applyTenantToPage(fallback);
          setTenant(fallback);
          setIsLoading(false);
        }
      }
    }

    initTenant();

    return () => {
      cancelled = true;
      if (unsubscribeRef.current) {
        console.log('[TenantProvider] Cleaning up config subscription');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [applyTenantToPage]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: '#e8eaed',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (isInactive) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: '#f59e0b',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: '#0f1419'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Service Unavailable</h1>
          <p style={{ color: '#c9d1d9', fontSize: '1rem', lineHeight: '1.5' }}>
            This calculator is currently not active.
            Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: '#e74c3c',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: '#0f1419'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Unauthorized</h1>
          <p style={{ color: '#c9d1d9', fontSize: '1rem', lineHeight: '1.5' }}>
            This domain is not authorized to access this calculator.
            Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenant, isLoading, isUnauthorized, isInactive }}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Update page title, favicon, meta description, and theme-color
 * @param {Object} tenant - Resolved tenant config
 */
function updatePageMeta(tenant) {
  const lang = tenant.defaults?.lang || 'no';

  // Page title
  const title = tenant.branding?.pageTitle?.[lang] || tenant.branding?.pageTitle?.no || 'Taxi Kalkulator';
  document.title = title;

  // Meta description
  const description = tenant.branding?.pageDescription?.[lang] || tenant.branding?.pageDescription?.no || '';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && description) {
    metaDesc.setAttribute('content', description);
  }

  // Theme color
  const themeColor = tenant.theme?.['--brand-warning'] || '#f59e0b';
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', themeColor);
  }

  // Favicon
  if (tenant.branding?.favicon) {
    updateFavicon(tenant.branding.favicon);
  }

  // HTML lang attribute
  document.documentElement.setAttribute('lang', lang);
}

/**
 * Dynamically update the favicon
 * @param {string} href - Path or URL to favicon
 */
function updateFavicon(href) {
  // Update existing favicon links
  const links = document.querySelectorAll("link[rel*='icon']");
  links.forEach(link => {
    link.href = href;
  });

  // Update apple-touch-icon
  const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
  if (appleIcon) {
    appleIcon.href = href;
  }
}

export default TenantContext;
