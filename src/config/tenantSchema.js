/**
 * Tenant Configuration Schema
 *
 * Defines the structure for tenant configuration objects.
 * Each business customer gets a tenant config that controls
 * branding, theming, defaults, and feature flags.
 */

/**
 * Default tenant configuration (Drivas Fleet)
 * Used as fallback when no tenant is matched.
 * Generic branding that can be easily customized per tenant.
 */
export const DEFAULT_TENANT = {
  id: 'drivas-fleet',
  name: 'Drivas Fleet',
  slug: 'drivas-fleet',

  // Branding
  branding: {
    companyName: 'Taxi',
    logo: '/drivas-fleet-logo.svg',
    logoAlt: 'Drivas Fleet',
    favicon: '/favicon.svg',
    pageTitle: {
      no: 'Taxi Prisberegner',
      en: 'Taxi Price Calculator'
    },
    pageDescription: {
      no: 'Beregn estimert pris for din taxitur. Proffesjonell prisberegner for taxiselskaper.',
      en: 'Calculate estimated price for your taxi trip. Professional price calculator for taxi companies.'
    },
    copyrightHolder: 'Drivas Fleet',
    madeBy: {
      no: 'Del av Drivas Fleet-kjeden',
      en: 'Part of Drivas Fleet chain'
    },
    poweredBy: {
      no: 'Drevet av Drivas Fleet',
      en: 'Powered by Drivas Fleet'
    }
  },

  // Theme (CSS variable overrides — empty means use defaults)
  theme: {},

  // Defaults for the calculator
  defaults: {
    startAddress: '',
    lang: 'no',
    mapsCountry: 'no',
    mapsRegion: 'NO',
    mapCenter: { lat: 60.3913, lng: 5.3221 } // Bergen, Norway (central location)
  },

  // Contact info (shown in PDF footer etc.)
  contact: {
    phone: '',
    email: '',
    website: 'https://drivasfleet.no'
  },

  // Distant pickup warning (shown when pickup > threshold km from central)
  distanceWarning: {
    enabled: true,
    thresholdKm: 15, // Show warning if pickup is farther than this
    centralAddress: '', // Empty = use defaults.startAddress
    showContactButton: true
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
    showTariffTable: true,
    showHelpTooltips: true,
    showPoweredBy: true
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
      },
      poweredBy: {
        ...DEFAULT_TENANT.branding.poweredBy,
        ...(partial.branding?.poweredBy || {})
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
    distanceWarning: {
      ...DEFAULT_TENANT.distanceWarning,
      ...(partial.distanceWarning || {})
    },
    features: {
      ...DEFAULT_TENANT.features,
      ...(partial.features || {})
    },
    theme: partial.theme || DEFAULT_TENANT.theme
  };
}
