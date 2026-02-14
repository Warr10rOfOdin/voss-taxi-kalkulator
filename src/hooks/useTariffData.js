import { useState, useEffect } from 'react';
import { getTariffFromFirebase, subscribeTariffChanges } from '../firebase';
import { DEFAULT_BASE_TARIFF_14 } from '../utils/tariffCalculator';

/**
 * Custom hook for managing tariff data from Firebase and localStorage
 *
 * Handles:
 * - Loading tariffs from Firebase (primary source)
 * - Fallback to localStorage
 * - Real-time sync via Firebase subscription
 * - Automatic localStorage backup
 *
 * @returns {Object} { baseTariff, setBaseTariff }
 */
export function useTariffData() {
  const [baseTariff, setBaseTariff] = useState(DEFAULT_BASE_TARIFF_14);

  useEffect(() => {
    console.log('[useTariffData] Loading tariffs...');

    const loadTariffs = async () => {
      try {
        // Try Firebase first
        const firebaseTariff = await getTariffFromFirebase();
        if (firebaseTariff) {
          console.log('[useTariffData] Loaded from Firebase');
          setBaseTariff(firebaseTariff);
          return;
        }
      } catch (error) {
        console.error('[useTariffData] Firebase load failed:', error);
      }

      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('vossTaxiTariffs');
        if (saved) {
          console.log('[useTariffData] Loaded from localStorage');
          setBaseTariff(JSON.parse(saved));
          return;
        }
      } catch (error) {
        console.error('[useTariffData] localStorage load failed:', error);
      }

      // Use default if nothing found
      console.log('[useTariffData] Using default tariffs');
    };

    loadTariffs();

    // Subscribe to real-time Firebase updates
    const unsubscribe = subscribeTariffChanges((newTariff) => {
      console.log('[useTariffData] Real-time update from Firebase');
      setBaseTariff(newTariff);

      // Backup to localStorage
      try {
        localStorage.setItem('vossTaxiTariffs', JSON.stringify(newTariff));
      } catch (error) {
        console.error('[useTariffData] Failed to update localStorage:', error);
      }
    });

    return () => {
      console.log('[useTariffData] Cleaning up Firebase subscription');
      unsubscribe();
    };
  }, []);

  return { baseTariff, setBaseTariff };
}
