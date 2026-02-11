# Voss Taxi Calculator - Integration Guide

This guide explains how to integrate the Voss Taxi Calculator into other applications, specifically the `voss-taxi-local-app`.

## Table of Contents
1. [Overview](#overview)
2. [Integration Methods](#integration-methods)
3. [Shared Configuration](#shared-configuration)
4. [Component Usage](#component-usage)
5. [Styling Integration](#styling-integration)
6. [Firebase Synchronization](#firebase-synchronization)
7. [Complete Integration Example](#complete-integration-example)

---

## Overview

The Voss Taxi Calculator has been designed with modularity in mind. All components, utilities, and configurations can be imported and reused in other React applications.

### Key Features for Integration:
- ✅ Modular component exports
- ✅ Shared Firebase configuration
- ✅ Reusable tariff calculation utilities
- ✅ Cross-device tariff synchronization
- ✅ Bilingual support (Norwegian/English)
- ✅ Standalone CSS that can be integrated

---

## Integration Methods

### Method 1: NPM Package (Recommended for Production)

If you want to publish the calculator as a reusable package:

```bash
# In voss-taxi-kalkulator directory
npm run build
npm pack

# In voss-taxi-local-app directory
npm install ../voss-taxi-kalkulator/voss-taxi-kalkulator-1.0.0.tgz
```

Then import in your app:
```javascript
import { App as TaxiCalculator } from 'voss-taxi-kalkulator';
```

### Method 2: Git Submodule (Recommended for Active Development)

```bash
# In voss-taxi-local-app directory
git submodule add https://github.com/yourusername/voss-taxi-kalkulator.git src/calculator
git submodule update --init --recursive
```

Then import:
```javascript
import { App as TaxiCalculator } from './calculator/src/index';
```

### Method 3: Direct Component Copy (Quick Integration)

Copy the following directories to your app:
```
voss-taxi-local-app/src/
├── calculator/
│   ├── components/
│   ├── utils/
│   ├── locales/
│   ├── config/
│   └── firebase.js
```

---

## Shared Configuration

### Firebase Configuration

The Firebase configuration is centralized in `src/config/firebase.config.js`:

```javascript
import {
  firebaseConfig,
  DATABASE_PATHS,
  DEFAULT_BASE_TARIFF_14
} from './calculator/config/firebase.config';
```

**Important**: Both apps will share the same Firebase database, ensuring tariff synchronization across all platforms.

### Environment Variables

Create a `.env` file in your app with:

```env
# Required
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Optional (defaults to 'Hestavangen11')
VITE_TARIFF_PASSWORD=your_admin_password
```

---

## Component Usage

### Full Calculator Integration

To integrate the complete calculator as a standalone page/route:

```javascript
import { App as TaxiCalculator } from './calculator/src/index';
import './calculator/src/App.css';

function CalculatorPage() {
  return (
    <div className="calculator-page">
      <TaxiCalculator />
    </div>
  );
}
```

### Individual Component Usage

Import specific components for custom layouts:

```javascript
import {
  AddressAutocomplete,
  EstimatedPriceCard,
  MapDisplay,
  TariffTable,
  TariffEditorModal
} from './calculator/src/index';

function CustomCalculatorView() {
  const [startAddress, setStartAddress] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div className="custom-calculator">
      <AddressAutocomplete
        value={startAddress}
        onChange={(e) => setStartAddress(e.target.value)}
        placeholder="Start address"
        apiKey={googleApiKey}
      />

      <AddressAutocomplete
        value={destAddress}
        onChange={(e) => setDestAddress(e.target.value)}
        placeholder="Destination address"
        apiKey={googleApiKey}
      />

      <MapDisplay
        startAddress={startAddress}
        destAddress={destAddress}
        onRouteCalculated={(km, min) => {
          setDistance(km);
          setDuration(min);
        }}
        apiKey={googleApiKey}
      />

      <EstimatedPriceCard
        distanceKm={distance}
        durationMin={duration}
        // ... other props
      />
    </div>
  );
}
```

### Using Utility Functions

Import tariff calculation utilities:

```javascript
import {
  calculateTimelineEstimate,
  deriveAllTariffs,
  getTariffTypeAt,
  DEFAULT_BASE_TARIFF_14
} from './calculator/src/index';

// Calculate price for a trip
const estimate = calculateTimelineEstimate(
  startDateTime,
  distanceKm,
  durationMin,
  vehicleGroup,
  baseTariff,
  holidays
);

console.log(`Total price: ${estimate.total} NOK`);
console.log('Breakdown:', estimate.periodBreakdown);
```

---

## Styling Integration

### Option 1: Import Calculator Styles Directly

```javascript
// In your main App.jsx or layout component
import './calculator/src/App.css';
```

This will include all calculator styles. They are scoped with specific class names (`.card`, `.btn`, `.modal-backdrop`, etc.) and shouldn't conflict with most designs.

### Option 2: Customize Styles

Copy `src/App.css` to your app and modify:
- Colors to match your brand
- Font families
- Spacing and sizing
- Glassmorphism effects

Key CSS variables to customize:
```css
/* Primary colors */
--primary-color: #f59e0b;
--secondary-color: #6366f1;
--danger-color: #e74c3c;
--success-color: #27ae60;

/* Background colors */
--bg-primary: #0f1419;
--bg-secondary: #1a1f2e;
--bg-card: rgba(26, 31, 46, 0.9);

/* Text colors */
--text-primary: #e0e0e0;
--text-secondary: #a0a0a0;

/* Glassmorphism */
--glass-bg: rgba(20, 25, 40, 0.85);
--glass-border: rgba(99, 102, 241, 0.15);
```

### Option 3: Match Existing App Styles

If your app uses a design system (e.g., Tailwind, Material-UI, Chakra UI), you can:
1. Remove the calculator's CSS
2. Wrap components with your styled components
3. Apply your design tokens

Example with Tailwind:
```javascript
import { AddressAutocomplete } from './calculator/src/index';

function StyledAutocomplete() {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Start Address
      </label>
      <AddressAutocomplete
        // Add Tailwind classes via wrapper
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        // ... props
      />
    </div>
  );
}
```

---

## Firebase Synchronization

### Automatic Cross-Device Sync

The calculator automatically syncs tariff changes across all devices using Firebase Realtime Database.

#### How it Works:

1. **Admin edits tariffs** on Device A via the tariff editor modal
2. **Changes saved to Firebase** at `tariffs/base14`
3. **Real-time listener triggers** on Device B
4. **UI updates instantly** on Device B without refresh

#### Implementation in Your App:

```javascript
import {
  getTariffFromFirebase,
  subscribeTariffChanges,
  saveTariffToFirebase
} from './calculator/src/firebase';
import { DEFAULT_BASE_TARIFF_14 } from './calculator/src/config/firebase.config';

function YourApp() {
  const [baseTariff, setBaseTariff] = useState(DEFAULT_BASE_TARIFF_14);

  useEffect(() => {
    // Load initial tariffs
    const loadTariffs = async () => {
      try {
        const firebaseTariff = await getTariffFromFirebase();
        if (firebaseTariff) {
          setBaseTariff(firebaseTariff);
        }
      } catch (error) {
        console.error('Failed to load tariffs:', error);
        // Fallback to localStorage or defaults
      }
    };

    loadTariffs();

    // Subscribe to real-time updates
    const unsubscribe = subscribeTariffChanges((newTariff) => {
      console.log('Tariff updated from Firebase');
      setBaseTariff(newTariff);

      // Optional: Also save to localStorage as backup
      try {
        localStorage.setItem('vossTaxiTariffs', JSON.stringify(newTariff));
      } catch (error) {
        console.error('Failed to update localStorage:', error);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {/* Your app using baseTariff */}
    </div>
  );
}
```

### Firebase Security Rules

Ensure your Firebase Realtime Database has proper security rules:

```json
{
  "rules": {
    "tariffs": {
      ".read": true,
      "base14": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['start', 'km0_10', 'kmOver10', 'min', 'lastUpdated', 'version'])"
      }
    }
  }
}
```

**Note**: The `.write: true` rule allows client-side writes. For production, consider:
- Using Firebase Authentication
- Restricting writes to authenticated admin users
- Using Firebase Admin SDK on a backend server

---

## Complete Integration Example

Here's a complete example of integrating the calculator into a React app with routing:

### File: `voss-taxi-local-app/src/App.jsx`

```javascript
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import calculator
import { App as TaxiCalculator } from './calculator/src/index';
import {
  getTariffFromFirebase,
  subscribeTariffChanges
} from './calculator/src/firebase';
import { DEFAULT_BASE_TARIFF_14 } from './calculator/src/config/firebase.config';

// Import calculator styles
import './calculator/src/App.css';

function App() {
  const [baseTariff, setBaseTariff] = useState(DEFAULT_BASE_TARIFF_14);

  // Load and sync tariffs across all components
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

  return (
    <Router>
      <div className="app">
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/calculator">Price Calculator</Link>
          <Link to="/booking">Book a Taxi</Link>
          <Link to="/about">About</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/calculator"
            element={
              <div className="calculator-page">
                <TaxiCalculator initialBaseTariff={baseTariff} />
              </div>
            }
          />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="home">
      <h1>Welcome to Voss Taxi</h1>
      <p>Professional taxi service in Voss region</p>
      <Link to="/calculator" className="btn btn-primary">
        Calculate Trip Price
      </Link>
    </div>
  );
}

function BookingPage() {
  return <div>Booking form here...</div>;
}

function AboutPage() {
  return <div>About Voss Taxi...</div>;
}

export default App;
```

### File: `voss-taxi-local-app/src/main.jsx`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Your app's global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### File: `voss-taxi-local-app/.env`

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_TARIFF_PASSWORD=Hestavangen11
```

---

## Integration Checklist

Before deploying the integrated app, verify:

- [ ] Calculator page renders correctly
- [ ] Google Maps API key is configured
- [ ] Firebase connection is working
- [ ] Tariff changes sync across devices in real-time
- [ ] Address autocomplete works
- [ ] Route calculation works
- [ ] Price estimates calculate correctly
- [ ] Tariff editor modal opens with correct password
- [ ] Language toggle works (NO/EN)
- [ ] Print/PDF functionality works
- [ ] Mobile responsive design works
- [ ] Styles match your app's design system
- [ ] All components are accessible via navigation

---

## Troubleshooting

### Calculator not loading
- Check that all imports are correct
- Verify Firebase config is imported
- Check browser console for errors

### Google Maps not working
- Verify API key is set in `.env`
- Check that Maps JavaScript API, Places API, and Directions API are enabled
- Check API key restrictions in Google Cloud Console

### Firebase sync not working
- Check Firebase configuration in `src/config/firebase.config.js`
- Verify Firebase Realtime Database is enabled (not just Firestore)
- Check database rules allow read/write access
- Check browser console for Firebase errors

### Styles conflicting
- Use scoped CSS or CSS modules
- Rename conflicting class names
- Use a CSS naming convention (BEM, SMACSS)

---

## Support

For questions or issues:
- Check existing documentation: `README.md`, `FIREBASE_SETUP.md`, `CLAUDE.md`
- Review the integration examples above
- Check the calculator source code for component props and usage

---

**Last Updated**: 2025-02-11
**Version**: 1.0.0
**Compatible with**: React 18+, Vite 5+, Firebase 11+
