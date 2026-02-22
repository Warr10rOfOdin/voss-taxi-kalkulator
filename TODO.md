# TODO

Tracked tasks, known issues, and planned improvements for the Voss Taxi Kalkulator.

---

## Critical — Must Fix Before Merge

### Security

- [ ] **Remove exposed credentials from git history**
  Old Firebase credentials are still visible in commit `4aa2dc0` (`src/config/firebase.config.js`). Anyone cloning the repo can read them.
  - Use `git filter-repo` or BFG Repo-Cleaner to strip the secret from history
  - Force-push the cleaned history
  - See `SECURITY_FIX_GUIDE.md` for step-by-step instructions

- [ ] **Restrict Firebase write permissions**
  The Realtime Database currently allows public writes (`.write: true`). Anyone can modify tariff data.
  - Add Firebase Authentication for admin users
  - Set security rules to require auth for writes:
    ```json
    { "rules": { "tariffs": { ".read": true, "base14": { ".write": "auth != null" } } } }
    ```

- [ ] **Enable GitHub push protection**
  Prevents future commits containing secrets from being pushed.
  - Repository Settings → Security → Code security and analysis → Enable "Push protection"

### Deployment

- [ ] **Add Firebase environment variables to Vercel**
  Production is broken — Vercel is missing all `VITE_FIREBASE_*` variables. Add these 8 variables:
  `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`,
  `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_FIREBASE_DATABASE_URL`
  - Copy values from local `.env` file
  - Redeploy after adding

- [ ] **Verify Google Maps API key on Vercel**
  Confirm that `VITE_GOOGLE_MAPS_API_KEY` in Vercel matches the correct key.

---

## High Priority

### Configuration

- [ ] **Fix ESLint configuration**
  `npm run lint` fails because the project has no `eslint.config.js` file (required since ESLint v9).
  - Create `eslint.config.js` with React and React Hooks plugins
  - Run lint and fix any reported issues

- [ ] **Delete duplicate Vercel env var**
  Vercel has both `VITE_GOOGLE_MAPS_KEY` (old) and `VITE_GOOGLE_MAPS_API_KEY` (correct). Delete the old one.

### Testing

- [ ] **Set up test infrastructure**
  The project has zero tests. Install and configure:
  - `vitest` (Vite-native test runner)
  - `@testing-library/react` and `@testing-library/jest-dom`
  - Add `"test": "vitest"` script to `package.json`

- [ ] **Write unit tests for tariffCalculator.js** (Priority: HIGH)
  Core pricing engine — any bug here means wrong prices for customers.
  - Test `deriveAllTariffs` — verify group/period multipliers
  - Test distance charge at 10 km boundary
  - Test that time rate does NOT scale by vehicle group
  - Test `calculateTimelineEstimate` for multi-period trips
  - Test `getTariffTypeAt` for all period transitions

- [ ] **Write unit tests for helligdager.js** (Priority: HIGH)
  Holiday detection — wrong holidays mean wrong tariff periods.
  - Test all 12 Norwegian holidays for multiple years
  - Test Easter calculation (Computus algorithm)
  - Test Christmas Eve / New Year's Eve after 15:00 detection

### Bug Fixes

- [ ] **Directions API 46% error rate**
  Google Cloud Console shows 2,719 Directions API calls with 46% errors.
  - Investigate common failure scenarios (invalid addresses, missing waypoints)
  - Add proper error handling and user-facing error messages in MapDisplay
  - Consider adding retry logic for transient failures

- [ ] **Geocoding API 100% error rate**
  24 Geocoding API calls with 100% errors. This API might not be enabled or configured correctly.
  - Check if Geocoding API is actually needed (app uses Places + Directions)
  - If not needed, disable it in Google Cloud Console to avoid unnecessary calls
  - If needed, enable it and check API key restrictions

---

## Medium Priority

### Code Quality

- [ ] **Remove debug console.log statements for production**
  Multiple files have debug logging that should be conditional:
  - `src/components/AddressAutocomplete.jsx` — initialization count tracking
  - `src/components/MapDisplay.jsx` — route calculation logging
  - `src/firebase.js` — tariff load/save logging
  - `src/hooks/useTariffData.js` — loading state logging
  - Wrap in `if (import.meta.env.DEV)` or remove entirely

- [ ] **Delete `src/App.old.jsx`**
  Backup of pre-refactoring App.jsx. Can be removed once the refactored version is confirmed stable in production.

- [ ] **Clean up documentation files**
  The project root has accumulated many markdown files. Consider consolidating:
  - `API_FIX_SUMMARY.md` — can be merged into CHANGELOG
  - `REFACTORING_SUMMARY.md` — can be merged into CHANGELOG
  - `INTEGRATION_READY.md` — can be merged into INTEGRATION_GUIDE
  - `SECURITY_INCIDENT_STATUS.md` — can be archived after incident is resolved
  - `FIREBASE_SETUP.md` — verify it's still accurate after env var migration

### Features

- [ ] **Add address autocomplete debouncing**
  Google Places Autocomplete fires on every keystroke. Adding a 300ms debounce would further reduce API calls.

- [ ] **Add session tokens for Places API**
  Google offers session-based pricing for autocomplete — groups all keystrokes into one billable session.
  - Use `AutocompleteSessionToken` from Google Maps API
  - Reduces Places API cost by bundling requests

- [ ] **Cache route calculation results**
  Same start/destination pair recalculates every time. A simple in-memory cache would avoid redundant Directions API calls.
  - Key: `${start}|${dest}|${viaPoints.join('|')}`
  - Invalidate when addresses change

- [ ] **Persist user inputs to localStorage**
  Currently, refreshing the page loses all entered addresses and settings. The custom hooks make it easy to add persistence:
  - Save last-used addresses on route calculation
  - Restore on page load
  - Add a "clear saved" option

- [ ] **Improve error handling and user feedback**
  - Show user-facing error messages when Google Maps/Firebase fails
  - Add loading indicators during route calculation
  - Show offline indicator when Firebase is unreachable
  - Handle Google Maps API quota exceeded gracefully

### Integration

- [ ] **Integrate calculator into voss-taxi-local-app**
  The calculator is prepared for integration (modular exports, shared Firebase config, examples).
  Pending access to the `voss-taxi-local-app` repository to proceed.
  - Clone or submodule the calculator into the app
  - Match styling to the app's design system
  - Share Firebase configuration for tariff sync
  - See `INTEGRATION_GUIDE.md` for details

---

## Low Priority

### Code Improvements

- [ ] **Add TypeScript**
  The project is pure JavaScript. Adding TypeScript would improve:
  - IDE autocomplete and error detection
  - Component prop validation (replace runtime checks)
  - Hook return type safety
  - Refactoring confidence
  - Start with utility files (`tariffCalculator.ts`, `helligdager.ts`), then components

- [ ] **Extract CSS into modules or components**
  `App.css` is a single 1,322-line monolithic file. Consider:
  - CSS Modules (`.module.css`) for component-scoped styles
  - Or a utility framework like Tailwind CSS
  - At minimum, split into per-component CSS files

- [ ] **Add PropTypes or runtime validation**
  No prop validation on any component. Until TypeScript is added:
  - Add `PropTypes` to all components
  - Validate critical props (tariff data, translations)

### Performance

- [ ] **Add React.memo to child components**
  Components like `TariffTable`, `EstimatedPriceCard`, and `HelpTooltip` could benefit from memoization to skip unnecessary re-renders.

- [ ] **Lazy-load the TariffEditorModal**
  The modal is rarely used (admin only). Use `React.lazy` + `Suspense` to defer loading until opened.

- [ ] **Optimize helligdager.js**
  The file is 956 lines. The holiday calculation runs on every render via `useState(() => getNorwegianHolidays())`. Consider:
  - Memoizing the result (holidays don't change during a session)
  - Reducing the year range calculated
  - Moving to a Web Worker if calculation time becomes noticeable

### Documentation

- [ ] **Create .env.example with all required variables**
  Current `.env.example` exists but should be verified to match the latest configuration requirements.

- [ ] **Update CLAUDE.md**
  The guide was written before the refactoring. Update to reflect:
  - New hooks architecture (`src/hooks/`)
  - New sectional components
  - Firebase environment variable setup
  - Security best practices

### DevOps

- [ ] **Add pre-commit hook for secret scanning**
  Prevent future credential leaks:
  - Install `husky` for git hooks
  - Add `git-secrets` or `trufflehog` as pre-commit check
  - Block commits containing API key patterns

- [ ] **Add GitHub Actions CI pipeline**
  Automate quality checks on every push/PR:
  - Run ESLint
  - Run tests (once they exist)
  - Run build
  - Check for secrets (GitGuardian already does this)

- [ ] **Set up Dependabot**
  Automated dependency updates:
  - Enable via GitHub Settings → Security → Dependabot
  - Monitor for vulnerable dependencies
  - Auto-create PRs for updates

---

## Completed

- [x] Fix excessive Google Places API calls (104k/month → ~1k/month) — `27f5051`
- [x] Add holiday tariff for Christmas Eve and New Year's Eve after 15:00 — `736fc2e`
- [x] Move tariff edit button to hamburger menu (bottom-right) — `736fc2e`
- [x] Add tariff persistence (localStorage + Firebase) — `58cea68`, `8b8b876`
- [x] Add percentage adjuster to tariff editor — `58cea68`
- [x] Fix autocomplete selection not triggering route calculation — `58cea68`
- [x] Fix arrow key navigation in autocomplete dropdown — `6716011`
- [x] Set default time to current time — `065ccfa`
- [x] Integrate Firebase Realtime Database — `8b8b876`
- [x] Refactor App.jsx (460 → 240 lines) — `bb91f3f`
- [x] Extract custom hooks — `bb91f3f`
- [x] Remove hardcoded Firebase credentials from code — `59ca635`
- [x] Create modular export structure — `4aa2dca`
- [x] Prepare integration documentation and examples — `4aa2dca`
