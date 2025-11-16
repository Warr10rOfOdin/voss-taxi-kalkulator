# CLAUDE.md - AI Assistant Development Guide

> **Purpose**: This document provides comprehensive guidance for AI assistants working on the Voss Taxi Kalkulator codebase. It covers architecture, conventions, workflows, and best practices.

**Last Updated**: 2025-11-16
**Project**: Voss Taxi Kalkulator
**Type**: React SPA (Single Page Application)
**Framework**: React 18.3 + Vite 5.4

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Code Conventions](#code-conventions)
6. [Development Workflows](#development-workflows)
7. [Key Business Logic](#key-business-logic)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Common Tasks & Pitfalls](#common-tasks--pitfalls)
11. [Security Considerations](#security-considerations)

---

## Project Overview

### What This Application Does

A professional web calculator for estimating taxi fares for Voss Taxi in Norway. The application:

- Calculates taxi prices based on official Norwegian tariff regulations
- Integrates with Google Maps for route planning and distance/duration calculation
- Supports multiple vehicle groups (1-4, 5-6, 7-8, 9-16 seats)
- Handles complex tariff periods (Day, Evening, Saturday, Weekend/Night, Holidays)
- Automatically detects 12 Norwegian public holidays
- Generates print-friendly PDF price estimates
- Provides bilingual interface (Norwegian/English)

### Target Users

- Taxi customers planning trips in the Voss region
- Voss Taxi staff for quick price estimates
- Business clients requesting price quotes

### Key Features

- Real-time price calculation with tariff breakdown
- Google Maps route visualization with via points
- Address autocomplete with smart cursor positioning
- Timeline-based pricing (handles tariff changes mid-trip)
- Professional PDF export for quotes
- Password-protected tariff editor
- Fully responsive mobile design

---

## Technology Stack

### Core Dependencies

```json
{
  "react": "^18.3.1",              // UI framework
  "react-dom": "^18.3.1",          // DOM rendering
  "@googlemaps/js-api-loader": "^1.16.6"  // Google Maps integration
}
```

### Build Tools

- **Vite 5.4.10**: Lightning-fast build tool with HMR (Hot Module Replacement)
- **ESLint 9.13.0**: Code linting with React plugins
- **No TypeScript**: Pure JavaScript project

### External APIs

- **Google Maps JavaScript API**: Map rendering and directions
- **Google Places API**: Address autocomplete
- **Google Directions API**: Route calculation

### Deployment

- **Vercel**: Serverless static hosting with automatic deployments
- **Framework**: Vite (auto-detected)
- **Output**: `dist/` directory

---

## Project Structure

```
voss-taxi-kalkulator/
├── public/
│   └── taxi-icon.svg              # Favicon
├── src/
│   ├── components/                # React components (7 files)
│   │   ├── AddressAutocomplete.jsx    # Google Places autocomplete
│   │   ├── EstimatedPriceCard.jsx     # Price display with breakdown
│   │   ├── HelpTooltip.jsx            # Reusable tooltip component
│   │   ├── MapDisplay.jsx             # Google Maps integration
│   │   ├── PrintOffer.jsx             # PDF/Print layout (hidden on screen)
│   │   ├── TariffEditorModal.jsx      # Password-protected tariff editor
│   │   └── TariffTable.jsx            # 4x5 pricing grid display
│   ├── locales/
│   │   └── translations.js        # Manual i18n (NO/EN)
│   ├── utils/
│   │   ├── tariffCalculator.js    # Core pricing engine (257 lines)
│   │   └── helligdager.js         # Norwegian holidays calculator (956 lines)
│   ├── App.css                    # All styles (1,322 lines)
│   ├── App.jsx                    # Main application (460 lines)
│   └── main.jsx                   # React entry point
├── index.html                     # HTML shell
├── package.json                   # Dependencies & scripts
├── vite.config.js                 # Vite configuration
├── vercel.json                    # Vercel deployment config
├── .gitignore                     # Git ignore rules
└── README.md                      # User-facing documentation
```

### File Counts

- **Total React components**: 7 files
- **Total utilities**: 2 files
- **Total CSS**: 1 monolithic file (1,322 lines)
- **Total code**: ~3,000 lines

---

## Architecture & Design Patterns

### State Management

**Pattern**: Centralized local state in `App.jsx` (no state management library)

**State Categories**:

```javascript
// Language
const [lang, setLang] = useState('no');

// Addresses
const [startAddress, setStartAddress] = useState('');
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
```

**Data Flow**:
- **Unidirectional**: Top-down from `App.jsx` to children
- **Props drilling**: State passed as props to child components
- **Callback props**: Child → parent communication via callback functions
- **Refs**: Used for DOM manipulation and keyboard navigation

### Component Architecture

**Pattern**: Functional components with React Hooks

**Component Hierarchy**:

```
App.jsx (root)
├── AddressAutocomplete (start address)
├── AddressAutocomplete (via addresses - dynamic list)
├── AddressAutocomplete (destination address)
├── MapDisplay (Google Maps + routing)
├── EstimatedPriceCard (price breakdown)
├── TariffTable (pricing grid)
├── TariffEditorModal (password-protected editor)
└── PrintOffer (hidden on screen, visible on print)
```

### Business Logic Separation

**Critical Rule**: All price calculations MUST use `tariffCalculator.js`

**Rationale**:
- Single source of truth for pricing logic
- Pure functions (testable, predictable)
- No side effects
- Reusable across components

**Example**:
```javascript
import { calculateTimelineEstimate, deriveAllTariffs } from './utils/tariffCalculator';

// ✅ CORRECT: Use the shared calculator
const estimate = calculateTimelineEstimate(startTime, distanceKm, durationMin, vehicleGroup, baseTariff14, holidays);

// ❌ WRONG: Never duplicate pricing logic in components
// const price = startPrice + (distanceKm * rate); // Don't do this!
```

### Styling Architecture

**Pattern**: Pure CSS with no framework

**Approach**:
- **Single monolithic file**: `App.css` (1,322 lines)
- **No CSS modules**: Global class names
- **No preprocessor**: Pure CSS (no SASS/LESS)
- **Design system**: Custom glassmorphism theme

**CSS Techniques**:
- CSS Grid for layouts
- Flexbox for alignment
- CSS animations for transitions
- Media queries for responsive design
- `@media print` for PDF output

**Responsive Breakpoints**:
```css
/* Desktop: default */
/* Tablet: ≤1024px */
/* Mobile: ≤768px */
/* Small mobile: ≤480px */
```

### Internationalization (i18n)

**Pattern**: Manual implementation (no library)

**Structure**:
```javascript
// src/locales/translations.js
export const translations = {
  no: {
    title: "Voss Taxi Kalkulator",
    // ... 70+ keys
  },
  en: {
    title: "Voss Taxi Calculator",
    // ... 70+ keys
  }
};

// Usage in components:
const t = translations[lang];
return <h1>{t.title}</h1>;
```

**Supported Languages**:
- Norwegian (`no`) - Default
- English (`en`)

---

## Code Conventions

### JavaScript Style

**ES6+ Features**:
- Arrow functions
- Template literals
- Destructuring
- Spread operator
- Optional chaining (`?.`)
- Nullish coalescing (`??`)

**Example Component Pattern**:
```javascript
import { useState, useEffect, useRef } from 'react';

export default function ComponentName({ propName, onCallback }) {
  const [localState, setLocalState] = useState(initialValue);
  const elementRef = useRef(null);

  useEffect(() => {
    // Side effects here
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  const handleEvent = (e) => {
    // Event handler logic
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Naming Conventions

**Variables & Functions**:
- `camelCase` for variables, functions, and methods
- `PascalCase` for React components
- `SCREAMING_SNAKE_CASE` for constants

**Examples**:
```javascript
// ✅ Good
const vehicleGroup = '1-4';
const calculatePrice = () => {};
const DEFAULT_BASE_TARIFF_14 = {...};

function EstimatedPriceCard() {}

// ❌ Bad
const VehicleGroup = '1-4';
const CalculatePrice = () => {};
const defaultBaseTariff14 = {...};
```

**File Naming**:
- Components: `PascalCase.jsx` (e.g., `AddressAutocomplete.jsx`)
- Utilities: `camelCase.js` (e.g., `tariffCalculator.js`)
- Styles: `camelCase.css` (e.g., `App.css`)

### Component Props

**Pattern**: Destructure props in function signature

```javascript
// ✅ Good
export default function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  apiKey
}) {
  // ...
}

// ❌ Avoid
export default function AddressAutocomplete(props) {
  const value = props.value;
  // ...
}
```

### Event Handlers

**Naming**: Prefix with `handle` + event name

```javascript
const handleStartAddressKeydown = (e) => {
  if (e.key === 'Enter') {
    // ...
  }
};

const handleViaAddressChange = (index, newValue) => {
  // ...
};
```

### Refs Usage

**Pattern**: Use refs for DOM manipulation and imperative actions

```javascript
// Keyboard navigation
const destAddressRef = useRef(null);

const handleEnterKey = (e) => {
  if (e.key === 'Enter') {
    destAddressRef.current?.focus(); // Safe navigation
  }
};
```

### Comments

**When to Comment**:
- Complex business logic (tariff calculations)
- Non-obvious workarounds
- Norwegian-specific logic (holidays, addresses)
- Algorithm explanations (Computus for Easter)

**Example**:
```javascript
// Smart cursor positioning: place cursor after street name for easy number entry
// Norwegian addresses often have format: "Street name, Postal code City"
const commaIndex = selectedAddress.indexOf(',');
```

### Error Handling

**Pattern**: Try-catch for external API calls

```javascript
try {
  autocompleteRef.current = new window.google.maps.places.Autocomplete(
    internalInputRef.current,
    { componentRestrictions: { country: 'no' } }
  );
} catch (error) {
  console.error('Failed to initialize Google Places Autocomplete:', error);
}
```

---

## Development Workflows

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/voss-taxi-kalkulator.git
cd voss-taxi-kalkulator

# 2. Install dependencies
npm install

# 3. Create environment file
# Note: .env.example doesn't exist yet, create .env manually
touch .env

# 4. Add required environment variables
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
# VITE_TARIFF_PASSWORD=Hestavangen11  # Optional, defaults to this
```

### Environment Variables

**Required**:
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key
  - Get from: https://console.cloud.google.com/google/maps-apis
  - Required APIs: Maps JavaScript API, Places API, Directions API

**Optional**:
- `VITE_TARIFF_PASSWORD`: Tariff editor password (default: `Hestavangen11`)

**Security**:
- `.env` is gitignored
- Never commit API keys
- Use Vercel dashboard for production environment variables

### Development Commands

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Git Workflow

**Branching Strategy**:
```bash
# Feature development
git checkout -b feature/description

# Bug fixes
git checkout -b fix/description

# Create commits
git add .
git commit -m "Clear, descriptive message"

# Push changes
git push -u origin branch-name
```

**Commit Message Guidelines**:
- Use imperative mood: "Add feature" not "Added feature"
- Be specific: "Fix tariff calculation for holiday periods" not "Fix bug"
- Reference issues when applicable: "Fix #123: Handle midnight crossings"

### Code Review Checklist

Before committing changes:
- [ ] Run `npm run lint` (no errors)
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test on mobile viewport
- [ ] Verify print/PDF output
- [ ] Check both Norwegian and English languages
- [ ] Verify Google Maps integration still works
- [ ] Ensure tariff calculations are correct
- [ ] No console errors or warnings

---

## Key Business Logic

### Tariff Calculation System

**File**: `src/utils/tariffCalculator.js`

**Core Concepts**:

1. **Base Tariff (1-4 seats, Day period)**:
```javascript
DEFAULT_BASE_TARIFF_14 = {
  start: 97,           // NOK start price
  km0_10: 11.14,       // NOK per km (first 10 km)
  kmOver10: 21.23,     // NOK per km (over 10 km)
  min: 8.42            // NOK per minute
}
```

2. **Vehicle Group Multipliers**:
```javascript
GROUP_FACTORS = {
  "1-4": 1.0,    // Base vehicle (1-4 seats)
  "5-6": 1.3,    // 30% more
  "7-8": 1.6,    // 60% more
  "9-16": 2.0    // 100% more (double)
}
```

3. **Period Multipliers**:
```javascript
PERIOD_FACTORS = {
  dag: 1.0,       // Day (Mon-Fri 06:00-18:00)
  kveld: 1.21,    // Evening (Mon-Fri 18:00-24:00)
  laurdag: 1.3,   // Saturday (Sat 06:00-15:00)
  helgNatt: 1.35, // Weekend/Night (Sat 15:00-Mon 06:00)
  hoytid: 1.45    // Holidays (12 Norwegian public holidays)
}
```

4. **Price Calculation Formula**:
```javascript
// Per tariff period:
Price = StartPrice + (Distance × DistanceRate) + (Time × TimeRate)

// Where rates are scaled by:
// - StartPrice, DistanceRate: groupFactor × periodFactor
// - TimeRate: periodFactor only (NOT scaled by group!)
```

**Critical Rules**:

1. **Time rate does NOT scale by vehicle group** (only by period):
```javascript
// ✅ Correct implementation in tariffCalculator.js:
tariffs[group][period] = {
  start: base14.start * groupFactor * periodFactor,
  km0_10: base14.km0_10 * groupFactor * periodFactor,
  kmOver10: base14.kmOver10 * groupFactor * periodFactor,
  min: base14.min * periodFactor  // NO groupFactor here!
};
```

2. **Distance rate changes at 10 km boundary**:
```javascript
// First 10 km: use km0_10 rate
// Over 10 km: use kmOver10 rate
const distanceCharge = Math.min(distanceKm, 10) * t.km0_10
                     + Math.max(0, distanceKm - 10) * t.kmOver10;
```

3. **Timeline-based pricing** (handles tariff changes mid-trip):
```javascript
// Function: calculateTimelineEstimate()
// Breaks trip into minute-by-minute chunks
// Applies correct tariff for each minute
// Returns total + breakdown by period
```

### Norwegian Holidays System

**File**: `src/utils/helligdager.js`

**Fixed Holidays** (same date every year):
```javascript
{
  name: "Nyttårsdag",              // New Year's Day
  month: 1, day: 1
},
{
  name: "Arbeidernes dag",         // Labour Day
  month: 5, day: 1
},
{
  name: "Grunnlovsdag",            // Constitution Day
  month: 5, day: 17
},
{
  name: "1. juledag",              // Christmas Day
  month: 12, day: 25
},
{
  name: "2. juledag",              // Boxing Day
  month: 12, day: 26
}
```

**Moveable Holidays** (calculated from Easter):
- Skjærtorsdag (Maundy Thursday): Easter - 3 days
- Langfredag (Good Friday): Easter - 2 days
- Påskedag (Easter Sunday): Easter
- 2. påskedag (Easter Monday): Easter + 1 day
- Kristi himmelfartsdag (Ascension): Easter + 39 days
- Pinsedag (Whit Sunday): Easter + 49 days
- 2. pinsedag (Whit Monday): Easter + 50 days

**Easter Calculation**: Uses Computus algorithm (Gauss method)

**Usage**:
```javascript
import { getNorwegianHolidays } from './utils/helligdager';

const holidays = getNorwegianHolidays(); // Returns Set of 'YYYY-MM-DD' strings
const isHoliday = holidays.has('2025-05-17'); // true (Constitution Day)
```

### Google Maps Integration

**Key Components**:

1. **API Loading** (`MapDisplay.jsx`):
```javascript
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: apiKey,
  version: "weekly",
  libraries: ["places", "geometry"]
});
```

2. **Address Autocomplete** (`AddressAutocomplete.jsx`):
```javascript
// Initialize autocomplete
autocompleteRef.current = new window.google.maps.places.Autocomplete(
  inputElement,
  {
    componentRestrictions: { country: 'no' },  // Norway only
    fields: ['formatted_address', 'geometry', 'name'],
    types: ['geocode', 'establishment']
  }
);
```

3. **Route Calculation** (`MapDisplay.jsx`):
```javascript
// DirectionsService for routing
const directionsService = new window.google.maps.DirectionsService();
directionsService.route(
  {
    origin: startAddress,
    destination: destAddress,
    waypoints: viaAddresses.map(addr => ({ location: addr })),
    travelMode: 'DRIVING'
  },
  (result, status) => {
    if (status === 'OK') {
      const route = result.routes[0].legs[0];
      onRouteCalculated(route.distance.value / 1000, route.duration.value / 60);
    }
  }
);
```

**Smart Cursor Positioning**:

When user selects an address from autocomplete, the cursor is positioned after the street name for easy house number entry:

```javascript
// Example: User selects "Hestavangen"
// Auto-completes to: "Hestavangen , 5700 Voss"
// Cursor positioned after "Hestavangen " (before comma)
// User can type "11" → "Hestavangen 11, 5700 Voss"
```

### Keyboard Navigation

**Pattern**: Enter key advances through form fields

```javascript
// Start address → Destination address
handleStartAddressKeydown = (e) => {
  if (e.key === 'Enter') {
    destAddressRef.current?.focus();
  }
};

// Distance → Duration
handleDistanceKeydown = (e) => {
  if (e.key === 'Enter') {
    durationMinRef.current?.focus();
  }
};

// Duration → Date
handleDurationKeydown = (e) => {
  if (e.key === 'Enter') {
    tripDateRef.current?.focus();
  }
};
```

---

## Testing Strategy

### Current State

**No testing infrastructure** currently exists:
- No test files (*.test.js, *.spec.js)
- No testing libraries (Jest, React Testing Library)
- No test scripts in package.json

### Recommended Testing Approach

**Unit Tests** (priority: HIGH):
```javascript
// Test tariffCalculator.js
describe('tariffCalculator', () => {
  test('calculates day tariff correctly', () => {
    const result = deriveAllTariffs(DEFAULT_BASE_TARIFF_14);
    expect(result['1-4']['dag'].start).toBe(97);
  });

  test('time rate does not scale by vehicle group', () => {
    const result = deriveAllTariffs(DEFAULT_BASE_TARIFF_14);
    expect(result['1-4']['dag'].min).toBe(8.42);
    expect(result['9-16']['dag'].min).toBe(8.42); // Same!
  });

  test('handles distance rate change at 10km', () => {
    // Test distance charge calculation
  });
});

// Test helligdager.js
describe('Norwegian holidays', () => {
  test('includes all 12 holidays', () => {
    const holidays = getNorwegianHolidays();
    expect(holidays.size).toBeGreaterThanOrEqual(12 * 4); // 4 years
  });

  test('includes fixed holidays', () => {
    const holidays = getNorwegianHolidays();
    expect(holidays.has('2025-01-01')).toBe(true); // New Year
    expect(holidays.has('2025-05-17')).toBe(true); // Constitution Day
  });
});
```

**Component Tests** (priority: MEDIUM):
```javascript
// Test AddressAutocomplete.jsx
describe('AddressAutocomplete', () => {
  test('calls onChange when place is selected', () => {
    // Mock Google Places API
  });

  test('positions cursor after street name', () => {
    // Test smart cursor logic
  });
});
```

**Integration Tests** (priority: LOW):
```javascript
// Test full price calculation flow
describe('Price calculation integration', () => {
  test('calculates correct price for multi-period trip', () => {
    // Test crossing midnight, holiday detection, etc.
  });
});
```

### Manual Testing Checklist

For significant changes, manually test:

- [ ] **Address autocomplete**: Suggestions appear, selection works
- [ ] **Route calculation**: Distance/duration populate correctly
- [ ] **Via points**: Add, remove, reorder work correctly
- [ ] **Price calculation**: Verify against known examples
- [ ] **Tariff periods**: Day, evening, Saturday, weekend/night, holiday
- [ ] **Vehicle groups**: All 4 groups calculate correctly
- [ ] **Language toggle**: All text translates properly
- [ ] **Print/PDF**: Layout looks professional
- [ ] **Mobile responsive**: Works on phone viewport
- [ ] **Keyboard navigation**: Enter key advances fields

---

## Deployment

### Vercel Deployment

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Deployment Methods**:

1. **Automatic (GitHub Integration)**:
   - Push to main branch → auto-deploys
   - Pull request → preview deployment
   - Vercel detects changes and rebuilds

2. **Manual (Vercel CLI)**:
```bash
npm i -g vercel
vercel --prod
```

### Environment Variables on Vercel

**Setup**:
1. Go to Vercel dashboard
2. Select project
3. Settings → Environment Variables
4. Add:
   - `VITE_GOOGLE_MAPS_API_KEY` = `your_api_key`
   - `VITE_TARIFF_PASSWORD` = `your_password` (optional)

**Important**: Environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

### Build Process

```bash
# Vite build process
npm run build

# Output:
# dist/
#   ├── index.html
#   ├── assets/
#   │   ├── index-[hash].js
#   │   └── index-[hash].css
#   └── taxi-icon.svg
```

**Optimizations**:
- Code minification
- Tree shaking
- Asset hashing for cache busting
- No source maps in production (configured)

---

## Common Tasks & Pitfalls

### Adding a New Component

```bash
# 1. Create component file
touch src/components/NewComponent.jsx

# 2. Follow component pattern
import { useState } from 'react';

export default function NewComponent({ prop1, onCallback }) {
  const [state, setState] = useState(null);

  return (
    <div>
      {/* JSX */}
    </div>
  );
}

# 3. Import in App.jsx
import NewComponent from './components/NewComponent';

# 4. Add styles to App.css
.new-component {
  /* styles */
}
```

### Modifying Tariff Calculations

**⚠️ CRITICAL**: Always modify `tariffCalculator.js`, never duplicate logic in components.

```javascript
// ✅ Good: Modify tariffCalculator.js
export function newCalculation(params) {
  // Pure function logic here
}

// ❌ Bad: Don't add calculations to components
function EstimatedPriceCard() {
  const price = distanceKm * rate; // WRONG!
}
```

### Adding a New Translation

```javascript
// 1. Edit src/locales/translations.js
export const translations = {
  no: {
    existing: "Eksisterende",
    newKey: "Ny norsk tekst"  // Add here
  },
  en: {
    existing: "Existing",
    newKey: "New English text"  // And here
  }
};

// 2. Use in component
const t = translations[lang];
return <div>{t.newKey}</div>;
```

### Common Pitfalls

**1. Forgetting to handle both languages**:
```javascript
// ❌ Bad: Hardcoded Norwegian text
<button>Beregn pris</button>

// ✅ Good: Use translations
<button>{t.calculatePrice}</button>
```

**2. Mutating state directly**:
```javascript
// ❌ Bad: Direct mutation
viaAddresses[0] = newValue;
setViaAddresses(viaAddresses);

// ✅ Good: Immutable update
const updated = [...viaAddresses];
updated[0] = newValue;
setViaAddresses(updated);
```

**3. Not cleaning up Google Maps listeners**:
```javascript
// ✅ Always cleanup in useEffect
useEffect(() => {
  // Setup Google Maps listener
  const listener = map.addListener('click', handleClick);

  return () => {
    // Cleanup
    window.google.maps.event.removeListener(listener);
  };
}, []);
```

**4. Breaking print styles**:
```css
/* When adding new elements, always consider print styles */
.new-element {
  /* screen styles */
}

@media print {
  .new-element {
    display: none; /* or appropriate print style */
  }
}
```

**5. Assuming 10km is always in one tariff period**:
```javascript
// ❌ Bad: Assumes entire trip in one period
const price = 10 * rate1 + (distanceKm - 10) * rate2;

// ✅ Good: Use timeline calculator for multi-period trips
const estimate = calculateTimelineEstimate(...);
```

### Debugging Google Maps Issues

**Common Issues**:

1. **Maps not loading**:
   - Check `VITE_GOOGLE_MAPS_API_KEY` is set
   - Check browser console for API errors
   - Verify API key restrictions in Google Cloud Console

2. **Autocomplete not working**:
   - Ensure Places API is enabled
   - Check `componentRestrictions` is set to Norway
   - Verify input element exists before initialization

3. **Directions failing**:
   - Check addresses are valid Norwegian addresses
   - Verify both start and destination are set
   - Handle ZERO_RESULTS status gracefully

**Debugging Steps**:
```javascript
// Add console logs
console.log('Google API loaded:', window.google);
console.log('Places available:', window.google?.maps?.places);
console.log('Route result:', result);
```

---

## Security Considerations

### Client-Side Security

**⚠️ Important Limitations**:

1. **Tariff password is client-side only**:
   - Stored in `VITE_TARIFF_PASSWORD` (exposed to client)
   - Can be bypassed via browser dev tools
   - Provides minimal security (social barrier only)

   **Solution for production**: Implement backend API with server-side auth.

2. **API key exposure**:
   - Google Maps API key is visible in client code
   - Mitigate by:
     - Setting HTTP referrer restrictions in Google Cloud Console
     - Enabling only required APIs (Maps, Places, Directions)
     - Monitoring usage in Google Cloud Console
     - Setting usage quotas to prevent abuse

### Best Practices

**Environment Variables**:
```bash
# ✅ Good: Store in .env (gitignored)
VITE_GOOGLE_MAPS_API_KEY=your_key

# ❌ Bad: Hardcode in source
const API_KEY = "AIza..."; // Never do this!
```

**Google Cloud Console Security**:
1. **Application restrictions**:
   - HTTP referrers: `https://yourdomain.com/*`
   - Restrict to production domain only

2. **API restrictions**:
   - Enable only: Maps JavaScript API, Places API, Directions API
   - Disable all others

3. **Quotas**:
   - Set daily quota limits
   - Enable billing alerts

**Git Security**:
- Never commit `.env` files
- Use `.env.example` for documentation (without actual keys)
- Check `.gitignore` includes `.env*`

---

## Appendix: Quick Reference

### Key Files to Know

| File | Purpose | Lines | Modify Frequency |
|------|---------|-------|------------------|
| `App.jsx` | Main application logic | 460 | High |
| `tariffCalculator.js` | Price calculation engine | 257 | Medium |
| `helligdager.js` | Norwegian holidays | 956 | Yearly |
| `translations.js` | NO/EN text | ~8,700 | Medium |
| `App.css` | All styles | 1,322 | High |
| `MapDisplay.jsx` | Google Maps integration | 159 | Low |
| `AddressAutocomplete.jsx` | Address autocomplete | 141 | Low |

### NPM Scripts

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Key Directories

```bash
src/components/   # React components
src/utils/        # Pure business logic
src/locales/      # Translations
public/           # Static assets
dist/             # Build output (gitignored)
```

### Environment Variables

```bash
VITE_GOOGLE_MAPS_API_KEY  # Required: Google Maps API key
VITE_TARIFF_PASSWORD      # Optional: Tariff editor password (default: Hestavangen11)
```

### Important Constants

```javascript
// Vehicle groups
["1-4", "5-6", "7-8", "9-16"]

// Tariff periods
["dag", "kveld", "laurdag", "helgNatt", "hoytid"]

// Languages
["no", "en"]

// Default address
"Hestavangen 11, Voss"
```

### External Dependencies

- **Google Maps JavaScript API**: Map rendering
- **Google Places API**: Address autocomplete
- **Google Directions API**: Route calculation
- **Vercel**: Hosting & deployment

---

## Getting Help

### Resources

- **README.md**: User-facing documentation
- **Google Maps API Docs**: https://developers.google.com/maps/documentation
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

### Contact

- **Project Creator**: Toni Kolve / Kolve ST
- **License**: MIT

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
**Maintained by**: AI assistants working on this codebase
