import { useState, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { getTranslations } from './locales/translations';
import { getNorwegianHolidays } from './utils/helligdager';
import { useTenant } from './context/TenantContext';
import { LoadingSpinner } from './components/common';
import { Footer, InfoTooltip, KeyboardShortcutsPanel } from './components/common';

// Custom hooks
import {
  useTariffData,
  useAddressInputs,
  useTripParameters,
  useRouteCalculation,
  useOnlineStatus
} from './hooks';

// Core components (loaded immediately)
import EstimatedPriceCard from './components/EstimatedPriceCard';
import TariffTable from './components/TariffTable';
import MapDisplay from './components/MapDisplay';
import AddressInputSection from './components/AddressInputSection';
import TripParametersSection from './components/TripParametersSection';

// Lazy-loaded components (not needed immediately)
const TariffEditorModal = lazy(() => import('./components/TariffEditorModal'));
const PrintOffer = lazy(() => import('./components/PrintOffer'));

function App() {
  // Tenant context
  const { tenant } = useTenant();

  // Network status
  const isOnline = useOnlineStatus();

  // Language state (initialized from tenant defaults)
  const [lang, setLang] = useState(tenant?.defaults?.lang || 'no');

  // Resolve translations with tenant branding (replaces {{companyName}} etc.)
  const t = useMemo(
    () => getTranslations(lang, tenant?.branding),
    [lang, tenant?.branding]
  );

  // Custom hooks for state management
  const { baseTariff, setBaseTariff } = useTariffData(tenant?.id);
  const addresses = useAddressInputs(tenant?.defaults?.startAddress || 'Hestavangen 11, Voss');
  const tripParams = useTripParameters();
  const { routeTrigger, triggerRouteCalculation, handlePlaceSelected } = useRouteCalculation();

  // UI state
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [holidays] = useState(() => getNorwegianHolidays());

  // Refs for keyboard navigation
  const destAddressRef = useRef(null);
  const distanceKmRef = useRef(null);
  const durationMinRef = useRef(null);
  const tripDateRef = useRef(null);

  // Map height synchronization (desktop only)
  const syncMapHeight = useCallback(() => {
    // Skip on mobile/tablet
    if (window.innerWidth <= 1024) {
      const mapCard = document.getElementById('mapCard');
      if (mapCard) mapCard.style.height = 'auto';
      return;
    }

    const estimateCard = document.getElementById('estimateCard');
    const tariffCard = document.getElementById('tariffTableCard');
    const mapCard = document.getElementById('mapCard');

    if (mapCard && tariffCard) {
      let totalHeight = 0;
      if (estimateCard) totalHeight += estimateCard.offsetHeight + 20;
      totalHeight += tariffCard.offsetHeight;

      const minHeight = 400;
      mapCard.style.height = Math.max(totalHeight, minHeight) + 'px';
    }
  }, []);

  // Keyboard navigation handlers (wrapped in useCallback to prevent re-renders)
  const handleStartAddressKeydown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerRouteCalculation();
      destAddressRef.current?.focus();
    }
  }, [triggerRouteCalculation]);

  const handleDestAddressKeydown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerRouteCalculation();
      distanceKmRef.current?.focus();
    }
  }, [triggerRouteCalculation]);

  const handleViaKeydown = useCallback((e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerRouteCalculation();
      distanceKmRef.current?.focus();
    }
  }, [triggerRouteCalculation]);

  const handleDistanceKeydown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      durationMinRef.current?.focus();
    }
  }, []);

  const handleDurationKeydown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tripDateRef.current?.focus();
    }
  }, []);

  // Reset all fields
  const handleResetAll = useCallback(() => {
    addresses.resetAddresses();
    tripParams.resetTripParameters();
  }, [addresses, tripParams]);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(231, 76, 60, 0.95)',
          color: 'white',
          padding: '12px',
          textAlign: 'center',
          zIndex: 10001,
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          ⚠ {t.offlineMessage || 'No internet connection. Some features may not work.'}
        </div>
      )}

      <div className="app">
        {/* Top Card */}
        <div className="card top-card">
          <div className="header-row">
            <div className="logo-title-group">
              <img src={tenant?.branding?.logo || '/drivas-fleet-logo.svg'} alt={tenant?.branding?.logoAlt || 'Taxi'} className="app-logo" />
              <h1>{t.appTitle}</h1>
            </div>
            {tenant?.features?.showLanguageSwitcher !== false && <div className="lang-switcher">
              <button
                className={`lang-btn ${lang === 'no' ? 'active' : ''}`}
                onClick={() => setLang('no')}
              >
                NO
              </button>
              <button
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>}
          </div>

          {/* Address Inputs */}
          <AddressInputSection
            addresses={addresses}
            onPlaceSelected={handlePlaceSelected}
            onTriggerRoute={triggerRouteCalculation}
            keyHandlers={{
              handleStartAddressKeydown,
              handleDestAddressKeydown,
              handleViaKeydown
            }}
            translations={t}
            lang={lang}
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            mapsCountry={tenant?.defaults?.mapsCountry || 'no'}
            startPlaceholder={tenant?.defaults?.startAddress || 'Hestavangen 11, Voss'}
          />

          {/* Trip Parameters */}
          <TripParametersSection
            tripParams={tripParams}
            onTriggerRoute={triggerRouteCalculation}
            onReset={handleResetAll}
            keyHandlers={{
              handleDistanceKeydown,
              handleDurationKeydown
            }}
            translations={t}
          />
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column: Estimate and Tariff Table */}
          <div className="left-column">
            <EstimatedPriceCard
              distanceKm={parseFloat(tripParams.distanceKm) || 0}
              durationMin={parseInt(tripParams.durationMin) || 0}
              vehicleGroup={tripParams.vehicleGroup}
              baseTariff14={baseTariff}
              tripDate={tripParams.tripDate}
              tripTime={tripParams.tripTime}
              holidays={holidays}
              translations={t}
              onPrint={handlePrint}
              showPrintButton={tenant?.features?.showPrintButton !== false}
            />

            {tenant?.features?.showTariffTable !== false && (
              <TariffTable
                km={parseFloat(tripParams.distanceKm) || 0}
                minutes={parseInt(tripParams.durationMin) || 0}
                baseTariff14={baseTariff}
                vehicleGroup={tripParams.vehicleGroup}
                translations={t}
              />
            )}
          </div>

          {/* Right Column: Map */}
          {tenant?.features?.showMap !== false && (
            <div className="right-column">
              <MapDisplay
                startAddress={addresses.startAddress}
                destAddress={addresses.destAddress}
                viaAddresses={addresses.viaAddresses}
                onRouteCalculated={tripParams.updateRouteResults}
                routeTrigger={routeTrigger}
                translations={t}
                lang={lang}
                mapCenter={tenant?.defaults?.mapCenter || { lat: 60.6280, lng: 6.4118 }}
                mapRegion={tenant?.defaults?.mapsRegion || 'NO'}
              />
            </div>
          )}
        </div>

        {/* Print-only Offer */}
        <Suspense fallback={null}>
          <PrintOffer
            startAddress={addresses.startAddress}
            destAddress={addresses.destAddress}
            viaAddresses={addresses.viaAddresses}
            distanceKm={parseFloat(tripParams.distanceKm) || 0}
            durationMin={parseInt(tripParams.durationMin) || 0}
            vehicleGroup={tripParams.vehicleGroup}
            tripDate={tripParams.tripDate}
            tripTime={tripParams.tripTime}
            baseTariff14={baseTariff}
            holidays={holidays}
            translations={t}
            lang={lang}
            tenant={tenant}
          />
        </Suspense>

        {/* Floating Hamburger Menu Button */}
        {tenant?.features?.showTariffEditor !== false && (
          <button
            className="hamburger-menu-btn"
            onClick={() => setIsTariffModalOpen(true)}
            aria-label={t.editTariffs}
            title={t.editTariffs}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}

        {/* Tariff Editor Modal */}
        <Suspense fallback={<LoadingSpinner size="large" fullScreen />}>
          <TariffEditorModal
            isOpen={isTariffModalOpen}
            onClose={() => setIsTariffModalOpen(false)}
            initialBaseTariff14={baseTariff}
            onSave={setBaseTariff}
            translations={t}
            tenantId={tenant?.id}
          />
        </Suspense>
        {/* Footer */}
        <Footer tenant={tenant} translations={{ lang }} />
        {/* Keyboard Shortcuts Panel */}
        <KeyboardShortcutsPanel translations={t} />
      </div>
    </>
  );
}

export default App;
