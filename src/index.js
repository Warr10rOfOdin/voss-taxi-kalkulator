// Main calculator exports for integration into other applications
// Import this file to use the Voss Taxi Calculator in your app

// Main Calculator Component
export { default as App } from './App';

// Individual Components
export { default as AddressAutocomplete } from './components/AddressAutocomplete';
export { default as AddressInputSection } from './components/AddressInputSection';
export { default as EstimatedPriceCard } from './components/EstimatedPriceCard';
export { default as HelpTooltip } from './components/HelpTooltip';
export { default as MapDisplay } from './components/MapDisplay';
export { default as PrintOffer } from './components/PrintOffer';
export { default as TariffEditorModal } from './components/TariffEditorModal';
export { default as TariffTable } from './components/TariffTable';
export { default as TripParametersSection } from './components/TripParametersSection';

// Utilities
export {
  DEFAULT_BASE_TARIFF_14,
  normaliseBaseTariff14,
  deriveAllTariffs,
  buildPriceMatrix,
  calculateTimelineEstimate,
  getTariffTypeAt,
  GROUP_KEYS,
  PERIOD_KEYS,
  GROUP_FACTORS,
  PERIOD_FACTORS
} from './utils/tariffCalculator';

export {
  getNorwegianHolidays,
  isNorwegianHoliday
} from './utils/helligdager';

// Firebase functions
export {
  saveTariffToFirebase,
  getTariffFromFirebase,
  subscribeTariffChanges
} from './firebase';

// Translations
export { translations } from './locales/translations';

// Custom Hooks
export {
  useTariffData,
  useAddressInputs,
  useTripParameters,
  useRouteCalculation
} from './hooks';

// Styles - import this in your app to get calculator styles
export { default as CalculatorStyles } from './App.css?inline';
