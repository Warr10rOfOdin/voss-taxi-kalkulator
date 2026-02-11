// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';
import { firebaseConfig, DATABASE_PATHS } from './config/firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Tariff database reference
const TARIFFS_PATH = DATABASE_PATHS.TARIFFS_BASE14;

/**
 * Save tariff to Firebase
 * @param {Object} tariffData - The tariff data to save
 * @returns {Promise<void>}
 */
export async function saveTariffToFirebase(tariffData) {
  try {
    const tariffRef = ref(database, TARIFFS_PATH);
    await set(tariffRef, {
      ...tariffData,
      lastUpdated: Date.now(),
      version: 1
    });
    console.log('Tariff saved to Firebase successfully');
  } catch (error) {
    console.error('Error saving tariff to Firebase:', error);
    throw error;
  }
}

/**
 * Get tariff from Firebase (one-time read)
 * @returns {Promise<Object|null>} - The tariff data or null if not found
 */
export async function getTariffFromFirebase() {
  try {
    const tariffRef = ref(database, TARIFFS_PATH);
    const snapshot = await get(tariffRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Tariff loaded from Firebase:', data);
      return {
        start: data.start,
        km0_10: data.km0_10,
        kmOver10: data.kmOver10,
        min: data.min
      };
    } else {
      console.log('No tariff found in Firebase');
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
 * @returns {Function} - Unsubscribe function
 */
export function subscribeTariffChanges(callback) {
  const tariffRef = ref(database, TARIFFS_PATH);

  const unsubscribe = onValue(tariffRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const tariff = {
        start: data.start,
        km0_10: data.km0_10,
        kmOver10: data.kmOver10,
        min: data.min
      };
      console.log('Tariff updated from Firebase:', tariff);
      callback(tariff);
    }
  }, (error) => {
    console.error('Error subscribing to tariff changes:', error);
  });

  return unsubscribe;
}

export default app;
