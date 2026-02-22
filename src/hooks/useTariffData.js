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
 * @param {string} tenantId - Optional tenant ID for multi-tenancy
 * @returns {Object} { baseTariff, setBaseTariff }
 */
export function useTariffData(tenantId) {
  const [baseTariff, setBaseTariff] = useState(DEFAULT_BASE_TARIFF_14);

  // Tenant-scoped localStorage key
  const storageKey = tenantId ? `taxiTariffs_${tenantId}` : 'vossTaxiTariffs';

  useEffect(() => {
    console.log(`[useTariffData] Loading tariffs for tenant: ${tenantId || 'default'}...`);

    const loadTariffs = async () => {
      try {
        // Try Firebase first (tenant-scoped)
        const firebaseTariff = await getTariffFromFirebase(tenantId);
        if (firebaseTariff) {
          console.log('[useTariffData] Loaded from Firebase');
          setBaseTariff(firebaseTariff);
          return;
        }
      } catch (error) {
        console.error('[useTariffData] Firebase load failed:', error);
      }

      // Fallback to localStorage (tenant-scoped key)
      try {
        const saved = localStorage.getItem(storageKey);
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

    // Subscribe to real-time Firebase updates (tenant-scoped)
    const unsubscribe = subscribeTariffChanges((newTariff) => {
      console.log('[useTariffData] Real-time update from Firebase');
      setBaseTariff(newTariff);

      // Backup to localStorage (tenant-scoped)
      try {
        localStorage.setItem(storageKey, JSON.stringify(newTariff));
      } catch (error) {
        console.error('[useTariffData] Failed to update localStorage:', error);
      }
    }, tenantId);

    return () => {
      console.log('[useTariffData] Cleaning up Firebase subscription');
      unsubscribe();
    };
  }, [tenantId, storageKey]);

  return { baseTariff, setBaseTariff };
}
