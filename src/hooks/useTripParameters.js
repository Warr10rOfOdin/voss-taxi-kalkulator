import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing trip parameters
 *
 * Handles:
 * - Distance and duration
 * - Trip date and time (initialized to current)
 * - Vehicle group selection
 * - Reset functionality
 *
 * @returns {Object} Trip parameters state and handlers
 */
export function useTripParameters() {
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [tripTime, setTripTime] = useState('10:00');
  const [vehicleGroup, setVehicleGroup] = useState('1-4');

  // Initialize date and time to current on mount
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5); // HH:MM format
    setTripDate(dateStr);
    setTripTime(timeStr);
    console.log('[useTripParameters] Initialized to current date/time');
  }, []);

  // Update route calculation results
  const updateRouteResults = useCallback((km, min) => {
    setDistanceKm(km.toFixed(2));
    setDurationMin(min);
    console.log(`[useTripParameters] Route results updated: ${km.toFixed(2)} km, ${min} min`);
  }, []);

  // Reset to defaults
  const resetTripParameters = useCallback(() => {
    setDistanceKm('');
    setDurationMin('');
    setVehicleGroup('1-4');

    const now = new Date();
    setTripDate(now.toISOString().split('T')[0]);
    setTripTime(now.toTimeString().slice(0, 5));
  }, []);

  return {
    distanceKm,
    setDistanceKm,
    durationMin,
    setDurationMin,
    tripDate,
    setTripDate,
    tripTime,
    setTripTime,
    vehicleGroup,
    setVehicleGroup,
    updateRouteResults,
    resetTripParameters
  };
}
