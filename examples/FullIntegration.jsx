/**
 * Full Integration Example
 *
 * This example shows how to integrate the complete Voss Taxi Calculator
 * into your React application with routing.
 *
 * Usage:
 * 1. Copy this file to your app (e.g., src/pages/CalculatorPage.jsx)
 * 2. Import and use in your routing configuration
 * 3. Ensure calculator styles are imported in your main app
 */

import { App as TaxiCalculator } from '../calculator/src/index';
import { useState, useEffect } from 'react';
import {
  getTariffFromFirebase,
  subscribeTariffChanges
} from '../calculator/src/firebase';
import { DEFAULT_BASE_TARIFF_14 } from '../calculator/src/config/firebase.config';

export default function CalculatorPage() {
  const [baseTariff, setBaseTariff] = useState(DEFAULT_BASE_TARIFF_14);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tariffs from Firebase
    const loadTariffs = async () => {
      try {
        const firebaseTariff = await getTariffFromFirebase();
        if (firebaseTariff) {
          console.log('Loaded tariffs from Firebase');
          setBaseTariff(firebaseTariff);
        } else {
          // Try localStorage as fallback
          const saved = localStorage.getItem('vossTaxiTariffs');
          if (saved) {
            console.log('Loaded tariffs from localStorage');
            setBaseTariff(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Failed to load tariffs:', error);
        // Use default tariffs
      } finally {
        setIsLoading(false);
      }
    };

    loadTariffs();

    // Subscribe to real-time tariff updates
    const unsubscribe = subscribeTariffChanges((newTariff) => {
      console.log('Tariff updated in real-time');
      setBaseTariff(newTariff);

      // Also update localStorage
      try {
        localStorage.setItem('vossTaxiTariffs', JSON.stringify(newTariff));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading calculator...</p>
      </div>
    );
  }

  return (
    <div className="calculator-page">
      {/* Optional: Add breadcrumb or navigation */}
      <nav className="breadcrumb">
        <a href="/">Home</a> / <span>Price Calculator</span>
      </nav>

      {/* Render the calculator */}
      <TaxiCalculator initialBaseTariff={baseTariff} />

      {/* Optional: Add footer or additional info */}
      <footer className="calculator-footer">
        <p>
          Prices are estimates based on official Norwegian taxi tariffs.
          Final price may vary based on actual route and conditions.
        </p>
      </footer>
    </div>
  );
}
