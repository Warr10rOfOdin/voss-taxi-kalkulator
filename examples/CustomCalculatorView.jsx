/**
 * Custom Calculator View Example
 *
 * This example shows how to use individual calculator components
 * to build a custom layout that matches your app's design.
 *
 * Usage:
 * 1. Import individual components as needed
 * 2. Manage state in your component
 * 3. Apply your own styling
 */

import { useState, useEffect, useRef } from 'react';
import {
  AddressAutocomplete,
  EstimatedPriceCard,
  MapDisplay,
  TariffTable,
  calculateTimelineEstimate,
  getTariffTypeAt,
  deriveAllTariffs,
  getNorwegianHolidays,
  getTariffFromFirebase,
  subscribeTariffChanges
} from '../calculator/src/index';
import { DEFAULT_BASE_TARIFF_14 } from '../calculator/src/config/firebase.config';

export default function CustomCalculatorView() {
  // State
  const [lang, setLang] = useState('no'); // 'no' or 'en'
  const [startAddress, setStartAddress] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [distanceKm, setDistanceKm] = useState(100);
  const [durationMin, setDurationMin] = useState(90);
  const [tripDate, setTripDate] = useState('');
  const [tripTime, setTripTime] = useState('10:00');
  const [vehicleGroup, setVehicleGroup] = useState('1-4');
  const [baseTariff, setBaseTariff] = useState(DEFAULT_BASE_TARIFF_14);
  const [holidays] = useState(() => getNorwegianHolidays());
  const [routeTrigger, setRouteTrigger] = useState(0);

  // Refs for keyboard navigation
  const destAddressRef = useRef(null);

  // Environment
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load tariffs
  useEffect(() => {
    const loadTariffs = async () => {
      try {
        const firebaseTariff = await getTariffFromFirebase();
        if (firebaseTariff) {
          setBaseTariff(firebaseTariff);
        }
      } catch (error) {
        console.error('Failed to load tariffs:', error);
      }
    };

    loadTariffs();

    const unsubscribe = subscribeTariffChanges((newTariff) => {
      setBaseTariff(newTariff);
    });

    return () => unsubscribe();
  }, []);

  // Initialize date and time
  useEffect(() => {
    const now = new Date();
    setTripDate(now.toISOString().split('T')[0]);
    setTripTime(now.toTimeString().slice(0, 5));
  }, []);

  // Event handlers
  const handleStartAddressKeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      destAddressRef.current?.focus();
    }
  };

  const handleRouteCalculated = (km, min) => {
    setDistanceKm(km);
    setDurationMin(min);
  };

  const handleAddressSelected = () => {
    setRouteTrigger(prev => prev + 1);
  };

  // Calculate estimate
  const startDateTime = new Date(`${tripDate}T${tripTime}`);
  const estimate = calculateTimelineEstimate(
    startDateTime,
    distanceKm,
    durationMin,
    vehicleGroup,
    baseTariff,
    holidays
  );

  const allTariffs = deriveAllTariffs(baseTariff);

  return (
    <div className="custom-calculator">
      {/* Header */}
      <header className="calculator-header">
        <h1>Voss Taxi Price Calculator</h1>
        <button onClick={() => setLang(lang === 'no' ? 'en' : 'no')}>
          {lang === 'no' ? '🇬🇧 English' : '🇳🇴 Norsk'}
        </button>
      </header>

      {/* Main Grid Layout */}
      <div className="calculator-grid">
        {/* Left Column: Inputs */}
        <div className="inputs-section">
          <div className="form-group">
            <label>Start Address</label>
            <AddressAutocomplete
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
              onKeyDown={handleStartAddressKeydown}
              onPlaceSelected={handleAddressSelected}
              placeholder="Enter start address"
              apiKey={googleApiKey}
              id="start-address"
            />
          </div>

          <div className="form-group">
            <label>Destination Address</label>
            <AddressAutocomplete
              value={destAddress}
              onChange={(e) => setDestAddress(e.target.value)}
              onPlaceSelected={handleAddressSelected}
              placeholder="Enter destination address"
              apiKey={googleApiKey}
              id="dest-address"
              inputRef={destAddressRef}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Distance (km)</label>
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Duration (min)</label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={tripTime}
                onChange={(e) => setTripTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Vehicle Group</label>
            <select
              value={vehicleGroup}
              onChange={(e) => setVehicleGroup(e.target.value)}
            >
              <option value="1-4">1-4 seats</option>
              <option value="5-6">5-6 seats</option>
              <option value="7-8">7-8 seats</option>
              <option value="9-16">9-16 seats</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setRouteTrigger(prev => prev + 1)}
          >
            Calculate Route
          </button>
        </div>

        {/* Center Column: Map */}
        <div className="map-section">
          <MapDisplay
            startAddress={startAddress}
            destAddress={destAddress}
            viaAddresses={[]}
            onRouteCalculated={handleRouteCalculated}
            routeTrigger={routeTrigger}
            apiKey={googleApiKey}
          />
        </div>

        {/* Right Column: Results */}
        <div className="results-section">
          <EstimatedPriceCard
            distanceKm={distanceKm}
            durationMin={durationMin}
            vehicleGroup={vehicleGroup}
            tariffs={allTariffs}
            estimate={estimate}
            translations={{
              estimatedPrice: 'Estimated Price',
              totalPrice: 'Total Price',
              distance: 'Distance',
              duration: 'Duration',
              // ... add more translations
            }}
          />

          <div className="tariff-info">
            <h3>Current Tariff Period</h3>
            <p>
              {getTariffTypeAt(startDateTime, Array.from(holidays).map(h => new Date(h)))}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: Tariff Table */}
      <div className="tariff-table-section">
        <TariffTable
          tariffs={allTariffs}
          vehicleGroup={vehicleGroup}
          translations={{
            tariffTitle: 'Price Overview',
            // ... add more translations
          }}
        />
      </div>
    </div>
  );
}
