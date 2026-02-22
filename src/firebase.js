// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';
import { firebaseConfig, DATABASE_PATHS, getTenantPaths } from './config/firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Default tariff database reference (backward compatible)
const TARIFFS_PATH = DATABASE_PATHS.TARIFFS_BASE14;

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
