import { useState, useEffect, useRef, useCallback } from 'react';
import { translations } from './locales/translations';
import { DEFAULT_BASE_TARIFF_14 } from './utils/tariffCalculator';
import { getNorwegianHolidays } from './utils/helligdager';
import HelpTooltip from './components/HelpTooltip';
import EstimatedPriceCard from './components/EstimatedPriceCard';
import TariffTable from './components/TariffTable';
import TariffEditorModal from './components/TariffEditorModal';
import MapDisplay from './components/MapDisplay';
import PrintOffer from './components/PrintOffer';
import AddressAutocomplete from './components/AddressAutocomplete';

function App() {
  // Language state
  const [lang, setLang] = useState('no');
  const t = translations[lang];
  
  // Address state
  const [startAddress, setStartAddress] = useState('Hestavangen 11, Voss');
  const [destAddress, setDestAddress] = useState('');
  const [viaAddresses, setViaAddresses] = useState([]);
  
  // Trip parameters
  const [distanceKm, setDistanceKm] = useState(100);
  const [durationMin, setDurationMin] = useState(90);
  const [tripDate, setTripDate] = useState('');
  const [tripTime, setTripTime] = useState('10:00');
  const [vehicleGroup, setVehicleGroup] = useState('1-4');
  
  // UI state
  const [estimateEnabled, setEstimateEnabled] = useState(true);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  
  // Tariff state
  const [baseTariff14, setBaseTariff14] = useState(DEFAULT_BASE_TARIFF_14);
  const [holidays] = useState(() => getNorwegianHolidays());
  
  // Refs for keyboard navigation
  const destAddressRef = useRef(null);
  const distanceKmRef = useRef(null);
  const durationMinRef = useRef(null);
  const tripDateRef = useRef(null);
  const viaInputRefs = useRef([]);
  const mapCardRef = useRef(null);
  
  // Initialize date to today
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setTripDate(dateStr);
  }, []);
  
  // Sync map height with left column (desktop only)
  const syncMapHeight = useCallback(() => {
    // Skip height syncing on mobile/tablet (let CSS handle it)
    if (window.innerWidth <= 1024) {
      const mapCard = document.getElementById('mapCard');
      if (mapCard) {
        mapCard.style.height = 'auto';
      }
      return;
    }

    const estimateCard = document.getElementById('estimateCard');
    const tariffCard = document.getElementById('tariffTableCard');
    const mapCard = document.getElementById('mapCard');

    if (mapCard && tariffCard) {
      let totalHeight = 0;

      if (estimateCard && estimateEnabled) {
        totalHeight += estimateCard.offsetHeight + 20;
      }

      totalHeight += tariffCard.offsetHeight;

      const minHeight = 400;
      mapCard.style.height = Math.max(totalHeight, minHeight) + 'px';
    }
  }, [estimateEnabled]);
  
  // Sync map height on changes
  useEffect(() => {
    const timer = setTimeout(syncMapHeight, 100);
    return () => clearTimeout(timer);
  }, [distanceKm, durationMin, estimateEnabled, viaAddresses, syncMapHeight]);
  
  // Resize listener
  useEffect(() => {
    window.addEventListener('resize', syncMapHeight);
    return () => window.removeEventListener('resize', syncMapHeight);
  }, [syncMapHeight]);
  
  // Keyboard navigation handlers
  const handleStartAddressKeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      destAddressRef.current?.focus();
    }
  };
  
  const handleDestAddressKeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (viaAddresses.length > 0 && viaInputRefs.current[0]) {
        viaInputRefs.current[0].focus();
      } else {
        distanceKmRef.current?.focus();
      }
    }
  };
  
  const handleViaKeydown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < viaAddresses.length - 1 && viaInputRefs.current[index + 1]) {
        viaInputRefs.current[index + 1].focus();
      } else {
        distanceKmRef.current?.focus();
      }
    }
  };
  
  const handleDistanceKeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      durationMinRef.current?.focus();
    }
  };
  
  const handleDurationKeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tripDateRef.current?.focus();
    }
  };
  
  // Via point management
  const addViaPoint = () => {
    setViaAddresses([...viaAddresses, '']);
    setTimeout(() => {
      const newIndex = viaAddresses.length;
      viaInputRefs.current[newIndex]?.focus();
    }, 0);
  };
  
  const removeViaPoint = (index) => {
    const newVias = viaAddresses.filter((_, i) => i !== index);
    setViaAddresses(newVias);
  };
  
  const updateViaPoint = (index, value) => {
    const newVias = [...viaAddresses];
    newVias[index] = value;
    setViaAddresses(newVias);
  };
  
  // Empty all fields
  const emptyAllFields = () => {
    setStartAddress('');
    setDestAddress('');
    setViaAddresses([]);
    setDistanceKm('');
    setDurationMin('');
    setVehicleGroup('1-4');
    
    const today = new Date();
    setTripDate(today.toISOString().split('T')[0]);
    setTripTime(today.toTimeString().slice(0, 5));
  };
  
  // Handle route calculation from Google Maps
  const handleRouteCalculated = useCallback((km, min) => {
    setDistanceKm(km.toFixed(2));
    setDurationMin(min);
  }, []);

  // Handle place selection from autocomplete
  const handlePlaceSelected = useCallback((place) => {
    // Place was selected from autocomplete dropdown
    // The route will automatically recalculate via MapDisplay's useEffect
    // when both start and dest addresses are set
    console.log('Place selected:', place?.formatted_address || place?.name);
  }, []);
  
  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="app">
      {/* Top Card */}
      <div className="card top-card">
        <div className="header-row">
          <div className="logo-title-group">
            <img src="/logo.png" alt="Voss Taxi" className="app-logo" onError={(e) => { e.target.src = '/taxi-icon.svg' }} />
            <h1>{t.appTitle}</h1>
          </div>
          <div className="lang-switcher">
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
          </div>
        </div>
        
        {/* Row 1: Addresses */}
        <div className="control-row">
          <div className="form-group flex-1">
            <div className="label-with-help">
              <label htmlFor="startAddress">{t.startAddress}</label>
              <HelpTooltip text={t.helpStartAddress} />
            </div>
            <AddressAutocomplete
              id="startAddress"
              value={startAddress}
              onChange={e => setStartAddress(e.target.value)}
              onKeyDown={handleStartAddressKeydown}
              onPlaceSelected={handlePlaceSelected}
              placeholder="Hestavangen 11, Voss"
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            />
          </div>
          <div className="form-group flex-1">
            <div className="label-with-help">
              <label htmlFor="destAddress">{t.destAddress}</label>
              <HelpTooltip text={t.helpDestAddress} />
            </div>
            <AddressAutocomplete
              id="destAddress"
              inputRef={destAddressRef}
              value={destAddress}
              onChange={e => setDestAddress(e.target.value)}
              onKeyDown={handleDestAddressKeydown}
              onPlaceSelected={handlePlaceSelected}
              placeholder={lang === 'no' ? 'Adresse eller sted' : 'Address or place'}
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            />
          </div>
          <button className="btn btn-primary top-fetch-btn">
            {t.fetchGoogle}
          </button>
        </div>

        {/* Via Points Section */}
        <div className="via-section">
          <div className="via-points-container">
            {viaAddresses.map((via, index) => (
              <div className="via-point" key={index}>
                <div className="form-group flex-1">
                  <div className="label-with-help">
                    <label>{t.viaPoint} {index + 1}</label>
                    <HelpTooltip text={t.helpVia} />
                  </div>
                  <AddressAutocomplete
                    inputRef={el => viaInputRefs.current[index] = el}
                    value={via}
                    onChange={e => updateViaPoint(index, e.target.value)}
                    onKeyDown={e => handleViaKeydown(e, index)}
                    onPlaceSelected={handlePlaceSelected}
                    placeholder={lang === 'no' ? 'Adresse eller sted' : 'Address or place'}
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                  />
                </div>
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => removeViaPoint(index)}
                >
                  {t.removeVia}
                </button>
              </div>
            ))}
          </div>
          <button className="btn btn-small add-via-btn" onClick={addViaPoint}>
            {t.addVia}
          </button>
        </div>
        
        {/* Row 2: Distance, Duration, Date, Time, Vehicle */}
        <div className="control-row">
          <div className="form-group">
            <div className="label-with-help">
              <label htmlFor="distanceKm">{t.kilometer}</label>
              <HelpTooltip text={t.helpKilometer} />
            </div>
            <input
              type="number"
              id="distanceKm"
              ref={distanceKmRef}
              min="0"
              step="0.01"
              value={distanceKm}
              onChange={e => setDistanceKm(e.target.value)}
              onKeyDown={handleDistanceKeydown}
            />
          </div>
          <div className="form-group">
            <div className="label-with-help">
              <label htmlFor="durationMin">{t.minutter}</label>
              <HelpTooltip text={t.helpMinutter} />
            </div>
            <input
              type="number"
              id="durationMin"
              ref={durationMinRef}
              min="0"
              step="1"
              value={durationMin}
              onChange={e => setDurationMin(e.target.value)}
              onKeyDown={handleDurationKeydown}
            />
          </div>
          <div className="spacer"></div>
          <div className="form-group">
            <div className="label-with-help">
              <label htmlFor="tripDate">{t.dato}</label>
              <HelpTooltip text={t.helpDato} />
            </div>
            <input
              type="date"
              id="tripDate"
              ref={tripDateRef}
              value={tripDate}
              onChange={e => setTripDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div className="label-with-help">
              <label htmlFor="tripTime">{t.starttid}</label>
              <HelpTooltip text={t.helpStarttid} />
            </div>
            <input
              type="time"
              id="tripTime"
              value={tripTime}
              onChange={e => setTripTime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div className="label-with-help">
              <label htmlFor="vehicleGroup">{t.kjoretoy}</label>
              <HelpTooltip text={t.helpKjoretoy} />
            </div>
            <select
              id="vehicleGroup"
              value={vehicleGroup}
              onChange={e => setVehicleGroup(e.target.value)}
            >
              <option value="1-4">{t.group14}</option>
              <option value="5-6">{t.group56}</option>
              <option value="7-8">{t.group78}</option>
              <option value="9-16">{t.group916}</option>
            </select>
          </div>
        </div>
        
        {/* Row 3: Toggle, Empty, Print, Edit */}
        <div className="control-row">
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={estimateEnabled}
              onChange={e => setEstimateEnabled(e.target.checked)}
            />
            <span>{t.showEstimate}</span>
          </label>
          <div className="spacer"></div>
          <button className="btn btn-outline" onClick={emptyAllFields}>
            {t.emptyFields}
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            {t.printPdf}
          </button>
          <button className="btn btn-outline" onClick={() => setIsTariffModalOpen(true)}>
            {t.editTariffs}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Left Column */}
        <div className="left-column">
          <EstimatedPriceCard
            enabled={estimateEnabled}
            km={distanceKm}
            minutes={durationMin}
            startDate={tripDate}
            startTime={tripTime}
            selectedGroup={vehicleGroup}
            baseTariff14={baseTariff14}
            holidays={holidays}
            translations={t}
            lang={lang}
          />
          
          <TariffTable
            km={distanceKm}
            minutes={durationMin}
            baseTariff14={baseTariff14}
            translations={t}
          />
          
          <div className="footer">
            <p>© 2025 Voss Taxi Kalkulator</p>
            <p>{t.footerDisclaimer}</p>
            <p>{t.madeBy}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <MapDisplay
            startAddress={startAddress}
            destAddress={destAddress}
            viaAddresses={viaAddresses}
            onRouteCalculated={handleRouteCalculated}
            translations={t}
          />
        </div>
      </div>

      {/* Print Offer (hidden on screen, shown on print) */}
      <PrintOffer
        startAddress={startAddress}
        destAddress={destAddress}
        viaAddresses={viaAddresses}
        distanceKm={distanceKm}
        durationMin={durationMin}
        tripDate={tripDate}
        tripTime={tripTime}
        vehicleGroup={vehicleGroup}
        baseTariff14={baseTariff14}
        holidays={holidays}
        translations={t}
        lang={lang}
      />

      {/* Tariff Editor Modal */}
      <TariffEditorModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        initialBaseTariff14={baseTariff14}
        onSave={setBaseTariff14}
        translations={t}
      />
    </div>
  );
}

export default App;
