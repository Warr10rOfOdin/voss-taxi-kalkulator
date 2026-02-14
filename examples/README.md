# Integration Examples

This directory contains practical examples for integrating the Voss Taxi Calculator into your application.

## Available Examples

### 1. `FullIntegration.jsx`
**Use case**: Integrate the complete calculator as a standalone page in your app

**What it shows**:
- Loading tariffs from Firebase
- Real-time tariff synchronization
- Proper error handling and fallbacks
- Loading states
- Complete page with navigation

**Best for**:
- Adding calculator as a new route/page
- Minimal customization needed
- Want to preserve all features

---

### 2. `CustomCalculatorView.jsx`
**Use case**: Build a custom calculator layout using individual components

**What it shows**:
- Using individual components (AddressAutocomplete, MapDisplay, etc.)
- Custom state management
- Custom layout and styling
- Keyboard navigation
- Component composition

**Best for**:
- Need custom design/layout
- Want to integrate with existing design system
- Need specific component functionality

---

### 3. `UtilityUsage.js`
**Use case**: Use calculation utilities without UI components

**What it shows**:
- Pure calculation functions
- Holiday detection
- Tariff period detection
- Price matrix generation
- API endpoint example
- Backend integration

**Best for**:
- Building custom UI from scratch
- Backend/API implementation
- Non-React applications
- Server-side calculations

---

## Quick Start

### Running an Example

```bash
# Copy example to your app
cp examples/FullIntegration.jsx src/pages/CalculatorPage.jsx

# Import in your routing
import CalculatorPage from './pages/CalculatorPage';
```

### Modifying Examples

All examples are heavily commented. You can:
1. Copy the example file
2. Modify to match your needs
3. Replace placeholder text with your translations
4. Adjust styling to match your design system

---

## Common Integration Patterns

### Pattern 1: Full Calculator as a Route

```javascript
// In your App.jsx or router configuration
import { App as TaxiCalculator } from './calculator/src/index';

<Route path="/calculator" element={<TaxiCalculator />} />
```

### Pattern 2: Calculator as a Modal/Overlay

```javascript
import { App as TaxiCalculator } from './calculator/src/index';

function CalculatorModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <TaxiCalculator />
      </div>
    </div>
  );
}
```

### Pattern 3: Embedded Calculator (Inline)

```javascript
import { App as TaxiCalculator } from './calculator/src/index';

function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to Voss Taxi</h1>
      </section>

      <section className="calculator-section">
        <h2>Calculate Your Trip</h2>
        <TaxiCalculator />
      </section>

      <section className="services">
        <h2>Our Services</h2>
        {/* ... */}
      </section>
    </div>
  );
}
```

### Pattern 4: Using Only Calculation Logic

```javascript
import {
  calculateTimelineEstimate,
  getNorwegianHolidays
} from './calculator/src/index';

// Your custom UI component
function MyCustomCalculator() {
  const [price, setPrice] = useState(0);

  const handleCalculate = () => {
    const estimate = calculateTimelineEstimate(
      tripDate,
      distance,
      duration,
      vehicleGroup,
      baseTariff,
      getNorwegianHolidays()
    );
    setPrice(estimate.total);
  };

  return (
    <div>
      {/* Your custom UI */}
      <button onClick={handleCalculate}>Calculate</button>
      <p>Price: {price} NOK</p>
    </div>
  );
}
```

---

## Testing Your Integration

After integrating, test these scenarios:

- [ ] Calculator renders without errors
- [ ] Address autocomplete works
- [ ] Route calculation works
- [ ] Price calculation is accurate
- [ ] Tariff editor opens (with correct password)
- [ ] Language toggle works (if using bilingual)
- [ ] Print/PDF works
- [ ] Mobile responsive
- [ ] Firebase sync works across devices

---

## Troubleshooting

### "Cannot find module"
- Check import paths are correct
- Verify calculator is in the expected location
- Check if using correct export names

### "Google Maps not loading"
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set
- Check API key has required permissions
- Check browser console for specific errors

### "Firebase connection failed"
- Check Firebase config in `src/config/firebase.config.js`
- Verify Realtime Database is enabled
- Check database rules allow read/write

### Styling conflicts
- Use CSS modules or scoped styles
- Check for class name conflicts
- Consider using a CSS naming convention

---

## Need Help?

- Check main integration guide: `/INTEGRATION_GUIDE.md`
- Review calculator documentation: `/README.md`
- Check Firebase setup: `/FIREBASE_SETUP.md`
- Review codebase guide: `/CLAUDE.md`

---

**Last Updated**: 2025-02-11
**Examples Version**: 1.0.0
