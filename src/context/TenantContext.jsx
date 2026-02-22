/**
 * Tenant Context
 *
 * Provides tenant configuration to the entire component tree.
 * Resolves tenant on mount, validates domain, and applies theme.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { resolveTenant, validateDomain, validateEmbedding } from '../config/tenantResolver';
import { applyTheme } from '../themes/themeDefaults';

const TenantContext = createContext(null);

/**
 * Hook to access tenant configuration from any component
 * @returns {Object} { tenant, isLoading, isUnauthorized }
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
 * - Tenant config resolution
 * - Domain validation
 * - Theme application (CSS variables)
 * - Dynamic page title/favicon/meta updates
 */
export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    // Resolve tenant from URL
    const resolved = resolveTenant();
    console.log(`[TenantProvider] Tenant resolved: ${resolved.id} (${resolved.name})`);

    // Validate domain
    const domainOk = validateDomain(resolved);
    const embedOk = validateEmbedding(resolved);

    if (!domainOk || !embedOk) {
      setIsUnauthorized(true);
      setIsLoading(false);
      return;
    }

    // Apply theme CSS variables to <html>
    applyTheme(document.documentElement, resolved.theme);

    // Update page metadata
    updatePageMeta(resolved);

    setTenant(resolved);
    setIsLoading(false);
  }, []);

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
    <TenantContext.Provider value={{ tenant, isLoading, isUnauthorized }}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Update page title, favicon, meta description, and theme-color
 * @param {Object} tenant - Resolved tenant config
 */
function updatePageMeta(tenant) {
  const lang = tenant.defaults.lang || 'no';

  // Page title
  const title = tenant.branding.pageTitle[lang] || tenant.branding.pageTitle.no;
  document.title = title;

  // Meta description
  const description = tenant.branding.pageDescription[lang] || tenant.branding.pageDescription.no;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }

  // Theme color
  const themeColor = tenant.theme['--brand-warning'] || '#f59e0b';
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', themeColor);
  }

  // Favicon
  if (tenant.branding.favicon) {
    updateFavicon(tenant.branding.favicon);
  }

  // HTML lang attribute
  document.documentElement.setAttribute('lang', lang);
}

/**
 * Dynamically update the favicon
 * @param {string} href - Path to favicon
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
