/**
 * Tenant Configuration Schema
 *
 * Defines the structure for tenant configuration objects.
 * Each business customer gets a tenant config that controls
 * branding, theming, defaults, and feature flags.
 */

/**
 * Default tenant configuration (Voss Taxi)
 * Used as fallback when no tenant is matched
 */
export const DEFAULT_TENANT = {
  id: 'voss-taxi',
  name: 'Voss Taxi',
  slug: 'voss-taxi',

  // Branding
  branding: {
    companyName: 'Voss Taxi',
    logo: '/tenants/voss-taxi/logo.png',
    logoAlt: 'Voss Taxi',
    favicon: '/tenants/voss-taxi/favicon.png',
    pageTitle: {
      no: 'Voss Taxi Kalkulator',
      en: 'Voss Taxi Calculator'
    },
    pageDescription: {
      no: 'Prisestimat for taxiturer i Voss-regionen. Beregn taxi-pris basert på avstand, tid og kjøretøytype.',
      en: 'Price estimate for taxi trips in the Voss region. Calculate taxi price based on distance, time and vehicle type.'
    },
    copyrightHolder: 'Voss Taxi',
    madeBy: {
      no: 'Laget av Toni Kolve.',
      en: 'Made by Toni Kolve.'
    }
  },

  // Theme (CSS variable overrides — empty means use defaults)
  theme: {},

  // Defaults for the calculator
  defaults: {
    startAddress: 'Hestavangen 11, Voss',
    lang: 'no',
    mapsCountry: 'no',
    mapsRegion: 'NO',
    mapCenter: { lat: 60.6280, lng: 6.4118 } // Voss, Norway
  },

  // Contact info (shown in PDF footer etc.)
  contact: {
    phone: '',
    email: '',
    website: ''
  },

  // Allowed domains for embed protection
  // If empty, domain validation is disabled (allow all)
  allowedDomains: [],

  // Feature flags
  features: {
    showLanguageSwitcher: true,
    showPrintButton: true,
    showTariffEditor: true,
    showMap: true,
    showTariffTable: true
  }
};

/**
 * Validate and merge a partial tenant config with defaults
 * @param {Object} partial - Partial tenant configuration
 * @returns {Object} Complete tenant configuration
 */
export function createTenantConfig(partial = {}) {
  return {
    ...DEFAULT_TENANT,
    ...partial,
    branding: {
      ...DEFAULT_TENANT.branding,
      ...(partial.branding || {}),
      pageTitle: {
        ...DEFAULT_TENANT.branding.pageTitle,
        ...(partial.branding?.pageTitle || {})
      },
      pageDescription: {
        ...DEFAULT_TENANT.branding.pageDescription,
        ...(partial.branding?.pageDescription || {})
      },
      madeBy: {
        ...DEFAULT_TENANT.branding.madeBy,
        ...(partial.branding?.madeBy || {})
      }
    },
    defaults: {
      ...DEFAULT_TENANT.defaults,
      ...(partial.defaults || {})
    },
    contact: {
      ...DEFAULT_TENANT.contact,
      ...(partial.contact || {})
    },
    features: {
      ...DEFAULT_TENANT.features,
      ...(partial.features || {})
    },
    theme: partial.theme || DEFAULT_TENANT.theme
  };
}
