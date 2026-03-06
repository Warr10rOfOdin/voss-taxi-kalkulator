// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';
import { firebaseConfig, DATABASE_PATHS, getTenantPaths } from './config/firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Default tariff database reference (backward compatible)
const TARIFFS_PATH = DATABASE_PATHS.TARIFFS_BASE14;

// ─── Tenant Registry Functions ────────────────────────────────────────────

/**
 * Encode a domain name for use as a Firebase key
 * Firebase keys cannot contain '.', so we replace with '_dot_'
 * @param {string} domain - e.g. "vosstaksi.no"
 * @returns {string} - e.g. "vosstaksi_dot_no"
 */
function encodeDomainKey(domain) {
  return domain.replace(/\./g, '_dot_');
}

/**
 * Fetch the full domain-to-tenantId mapping from Firebase
 * @returns {Promise<Object|null>} - Map of encoded-domain → tenantId, or null
 */
export async function getDomainMap() {
  try {
    const domainMapRef = ref(database, DATABASE_PATHS.DOMAIN_MAP);
    const snapshot = await get(domainMapRef);
    if (snapshot.exists()) {
      return snapshot.val(); // { "vosstaksi_dot_no": "voss-taxi", ... }
    }
    return null;
  } catch (error) {
    console.error('[Firebase] Error fetching domain map:', error);
    return null;
  }
}

/**
 * Look up a tenant ID by hostname
 * @param {string} hostname - e.g. "vosstaksi.no"
 * @returns {Promise<string|null>} - Tenant ID or null
 */
export async function lookupTenantByDomain(hostname) {
  try {
    const encoded = encodeDomainKey(hostname);
    const domainRef = ref(database, `${DATABASE_PATHS.DOMAIN_MAP}/${encoded}`);
    const snapshot = await get(domainRef);
    if (snapshot.exists()) {
      return snapshot.val(); // tenantId string
    }
    return null;
  } catch (error) {
    console.error(`[Firebase] Error looking up domain ${hostname}:`, error);
    return null;
  }
}

/**
 * Fetch a single tenant config from Firebase
 * @param {string} tenantId - e.g. "voss-taxi"
 * @returns {Promise<Object|null>} - Tenant config or null
 */
export async function getTenantConfig(tenantId) {
  try {
    const configRef = ref(database, `${DATABASE_PATHS.TENANT_REGISTRY}/${tenantId}/config`);
    const snapshot = await get(configRef);
    if (snapshot.exists()) {
      console.log(`[Firebase] Tenant config loaded: ${tenantId}`);
      return snapshot.val();
    }
    console.log(`[Firebase] No config found for tenant: ${tenantId}`);
    return null;
  } catch (error) {
    console.error(`[Firebase] Error fetching tenant config for ${tenantId}:`, error);
    return null;
  }
}

/**
 * Subscribe to real-time changes on a tenant's config
 * @param {string} tenantId - e.g. "voss-taxi"
 * @param {Function} callback - Called with the updated config object
 * @returns {Function} - Unsubscribe function
 */
export function subscribeTenantConfig(tenantId, callback) {
  const configRef = ref(database, `${DATABASE_PATHS.TENANT_REGISTRY}/${tenantId}/config`);

  const unsubscribe = onValue(configRef, (snapshot) => {
    if (snapshot.exists()) {
      console.log(`[Firebase] Tenant config updated: ${tenantId}`);
      callback(snapshot.val());
    }
  }, (error) => {
    console.error(`[Firebase] Error subscribing to tenant config for ${tenantId}:`, error);
  });

  return unsubscribe;
}

/**
 * Get the tariff path for a given tenant
 * @param {string} tenantId - Tenant ID (optional, defaults to voss-taxi)
 * @returns {string} Database path for tariffs
 */
function getTariffPath(tenantId) {
  return getTenantPaths(tenantId).TARIFFS_BASE14;
}

/**
 * Save tariff to Firebase
 * @param {Object} tariffData - The tariff data to save
 * @param {string} tenantId - Optional tenant ID
 * @returns {Promise<void>}
 */
export async function saveTariffToFirebase(tariffData, tenantId) {
  try {
    const path = tenantId ? getTariffPath(tenantId) : TARIFFS_PATH;
    const tariffRef = ref(database, path);
    await set(tariffRef, {
      ...tariffData,
      lastUpdated: Date.now(),
      version: 1
    });
    console.log(`Tariff saved to Firebase (path: ${path})`);
  } catch (error) {
    console.error('Error saving tariff to Firebase:', error);
    throw error;
  }
}

/**
 * Get tariff from Firebase (one-time read)
 * @param {string} tenantId - Optional tenant ID
 * @returns {Promise<Object|null>} - The tariff data or null if not found
 */
export async function getTariffFromFirebase(tenantId) {
  try {
    const path = tenantId ? getTariffPath(tenantId) : TARIFFS_PATH;
    const tariffRef = ref(database, path);
    const snapshot = await get(tariffRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(`Tariff loaded from Firebase (path: ${path}):`, data);
      return {
        start: data.start,
        km0_10: data.km0_10,
        kmOver10: data.kmOver10,
        min: data.min
      };
    } else {
      console.log(`No tariff found in Firebase (path: ${path})`);
      return null;
    }
  } catch (error) {
    console.error('Error reading tariff from Firebase:', error);
    throw error;
  }
}

/**
 * Subscribe to tariff changes in Firebase (real-time updates)
 * @param {Function} callback - Function to call when tariff changes
 * @param {string} tenantId - Optional tenant ID
 * @returns {Function} - Unsubscribe function
 */
export function subscribeTariffChanges(callback, tenantId) {
  const path = tenantId ? getTariffPath(tenantId) : TARIFFS_PATH;
  const tariffRef = ref(database, path);

  const unsubscribe = onValue(tariffRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const tariff = {
        start: data.start,
        km0_10: data.km0_10,
        kmOver10: data.kmOver10,
        min: data.min
      };
      console.log(`Tariff updated from Firebase (path: ${path}):`, tariff);
      callback(tariff);
    }
  }, (error) => {
    console.error('Error subscribing to tariff changes:', error);
  });

  return unsubscribe;
}

export default app;
