# Changelog

All notable changes to the Voss Taxi Kalkulator project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - claude/hide-tariff-edit-button branch

### Security
- **CRITICAL**: Removed hardcoded Firebase credentials from `src/config/firebase.config.js` — now uses `import.meta.env.VITE_*` environment variables (`59ca635`)
- Removed leaked credentials from documentation files (`371eddc`)
- Created `.env.example` template with placeholder values
- Created `SECURITY_FIX_GUIDE.md` and `SECURITY_INCIDENT_STATUS.md` for incident response

### Added
- **Custom hooks** for reusable state management (`bb91f3f`):
  - `useTariffData` — Firebase loading, localStorage fallback, real-time sync
  - `useAddressInputs` — start/destination/via address management
  - `useTripParameters` — distance, duration, date, time, vehicle group
  - `useRouteCalculation` — explicit route trigger management
- **Sectional components** extracted from App.jsx:
  - `AddressInputSection` — all address inputs with autocomplete
  - `TripParametersSection` — trip parameter inputs and controls
- **Integration support**:
  - `src/index.js` — modular exports for embedding in other apps
  - `src/config/firebase.config.js` — shared Firebase configuration
  - `examples/` directory with 3 integration examples
  - `INTEGRATION_GUIDE.md` — comprehensive integration manual
  - Added `main` and `exports` fields to `package.json`
- **Debug logging** in AddressAutocomplete and MapDisplay to track API usage
- Initialization counter per autocomplete instance to detect re-init bugs

### Fixed
- **CRITICAL**: Fixed excessive Google Places API calls — 104,856/month reduced to ~300-1,500/month (`27f5051`)
  - Root cause: `useEffect` in AddressAutocomplete depended on `onChange` and `onPlaceSelected` props, which were recreated every render
  - Fix: Changed dependency array to `[isLoaded]` only — autocomplete initializes once
- Wrapped event handlers in `useCallback` to prevent unnecessary child re-renders

### Changed
- **Refactored App.jsx** from 460 lines to ~240 lines (48% reduction) (`bb91f3f`)
  - Replaced 20+ `useState` declarations with 4 custom hook calls
  - Extracted address and trip parameter sections into components
  - All event handlers now use `useCallback`
- Firebase config now imported from shared `src/config/firebase.config.js` instead of being inline in `src/firebase.js`

---

## [1.5.0] - 2026-02-11

### Added
- **Firebase Realtime Database** integration for cross-device tariff synchronization (`8b8b876`)
  - Tariffs sync instantly across all devices
  - Loading priority: Firebase → localStorage → code defaults
  - Real-time `onValue` listener for live updates
- **Percentage adjuster** in tariff editor — adjust all tariffs by a single percentage value (`58cea68`)
- **"Copy Code" button** in tariff editor for hardcoding tariff values
- **localStorage persistence** for tariff changes (offline fallback)
- Firebase-related translations (Norwegian and English)
- `src/firebase.js` — Firebase helper functions (save, load, subscribe)

### Fixed
- Tariff changes now persist across sessions (previously lost on reload) (`58cea68`)
- Address autocomplete selection now triggers route calculation (`58cea68`)
- Route calculation only triggers on explicit user actions, not on every keystroke
- Arrow key navigation in autocomplete dropdown — Enter now selects highlighted address (`6716011`)
  - Added `e.stopPropagation()` to prevent parent handler interference

### Changed
- Default time input now initializes to current time instead of hardcoded `10:00` (`065ccfa`)

---

## [1.4.0] - 2026-02-10

### Added
- **Holiday tariff (hoytid)** after 15:00 on Christmas Eve (24.12) and New Year's Eve (31.12) (`736fc2e`)
- **Hamburger menu button** (bottom-right corner) for tariff editor access — replaces visible edit button
- **Web App Manifest** (`public/manifest.json`) for mobile installation (`fe34868`)
- Proper favicon links for various browsers and devices

### Changed
- Tariff edit button moved from main controls to a discreet floating hamburger button (admin-only feature)

---

## [1.3.0] - 2025-11-16

### Added
- Comprehensive `CLAUDE.md` documentation for AI assistants (`76116bc`)

---

## [1.2.0] - 2025-11-15

### Added
- **Address autocomplete UX improvements** (`0c59cf0`):
  - Smart cursor positioning after street name selection
  - Keyboard navigation (Enter key advances through form fields)

### Changed
- Enhanced design with vibrant accents and depth (`56bab50`)
- Applied darker, more professional color scheme (`c9d75fd`)

### Fixed
- UI display issues across multiple components (`c813979`)

---

## [1.1.0] - 2025-11-14

### Added
- **Norwegian public holidays (helligdager)** for hoytid tariff detection (`1b5b889`)
  - 12 holidays calculated per year including Easter-based moveable holidays
  - Computus (Gauss) algorithm for Easter calculation
- **PDF/Print export** — professional single-page A4 layout (`90ba734`)
- Orange logo added to main app and print output (`f051264`)

### Changed
- **Glassmorphism UI redesign** — modern dark theme with translucent cards (`9977cf5`)
- Professional dark blue design with enhanced PDF output (`3e5b241`)
- Improved text contrast for better readability (`e1a10b1`)

### Fixed
- Mobile layout and map visibility optimized (`b1cd746`)
- Address button functionality and UI improvements (`7e1cacf`)
- Default start address restored, tooltip position fixed, buttons aligned (`d0a989f`)
- Logo rendering fixed by moving to public folder (`5d5e57a`)

---

## [1.0.0] - 2025-08-08

### Added
- Initial release of Voss Taxi Kalkulator
- **Core tariff calculation engine** (`src/utils/tariffCalculator.js`):
  - 4 vehicle groups with multipliers (1-4, 5-6, 7-8, 9-16 seats)
  - 5 tariff periods (dag, kveld, laurdag, helgNatt, hoytid)
  - Distance rate change at 10 km boundary
  - Timeline-based pricing for multi-period trips
  - Time rate scales by period only (not vehicle group)
- **Google Maps integration**:
  - Route visualization with via points
  - Address autocomplete (Norway-restricted)
  - Directions API for distance/duration calculation
- **Bilingual interface** (Norwegian/English)
- **Tariff table** — 4x5 pricing grid display
- **Tariff editor** — password-protected modal for admin adjustments
- **Responsive design** — mobile, tablet, and desktop support
- **Vercel deployment** configuration
- **Tariff password** moved to environment variable (`aca14b5`)

---

## Technical Notes

### Tariff Calculation Rules
- **Start price, km rates**: Scale by both `groupFactor` and `periodFactor`
- **Time rate (per minute)**: Scales by `periodFactor` only — NOT by vehicle group
- **Distance**: First 10 km at `km0_10` rate, remaining at `kmOver10` rate
- **Timeline pricing**: Trips crossing tariff period boundaries are calculated minute-by-minute

### Vehicle Group Multipliers
| Group | Factor |
|-------|--------|
| 1-4 seats | 1.0 (base) |
| 5-6 seats | 1.3 |
| 7-8 seats | 1.6 |
| 9-16 seats | 2.0 |

### Period Multipliers
| Period | Factor | Hours |
|--------|--------|-------|
| Dag (Day) | 1.0 | Mon-Fri 06:00-18:00 |
| Kveld (Evening) | 1.21 | Mon-Fri 18:00-24:00 |
| Laurdag (Saturday) | 1.3 | Sat 06:00-15:00 |
| HelgNatt (Weekend/Night) | 1.35 | Sat 15:00-Mon 06:00 |
| Hoytid (Holiday) | 1.45 | Public holidays + 24.12/31.12 after 15:00 |
