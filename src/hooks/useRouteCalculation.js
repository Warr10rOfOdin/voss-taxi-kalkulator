import { useState, useCallback } from 'react';

/**
 * Custom hook for managing route calculation triggers
 *
 * The routeTrigger state is incremented to trigger MapDisplay to calculate a new route.
 * This prevents API calls on every keystroke while still allowing explicit triggers.
 *
 * @returns {Object} Route calculation state and handlers
 */
export function useRouteCalculation() {
  const [routeTrigger, setRouteTrigger] = useState(0);

  // Trigger a new route calculation
  const triggerRouteCalculation = useCallback(() => {
    setRouteTrigger(prev => {
      const newValue = prev + 1;
      console.log(`[useRouteCalculation] Triggered route calculation #${newValue}`);
      return newValue;
    });
  }, []);

  // Handle place selection from autocomplete (triggers route calculation)
  const handlePlaceSelected = useCallback((place) => {
    console.log('[useRouteCalculation] Place selected:', place?.formatted_address || place?.name);
    // Delay to ensure state updates
    setTimeout(() => {
      setRouteTrigger(prev => prev + 1);
    }, 100);
  }, []);

  return {
    routeTrigger,
    triggerRouteCalculation,
    handlePlaceSelected
  };
}
