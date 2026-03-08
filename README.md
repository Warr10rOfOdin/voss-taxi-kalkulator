# Voss Taxi Kalkulator

A white-label, multi-tenant web application for calculating and displaying taxi prices. Originally built for Voss Taxi in Norway, now configurable for any taxi company with custom branding, theming, and regional settings.

![Voss Taxi Calculator](https://img.shields.io/badge/React-18.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple) ![License](https://img.shields.io/badge/License-MIT-green) ![Multi--Tenant](https://img.shields.io/badge/Multi--Tenant-SaaS-orange)

## Features

### Core Calculator Features
- 🗺️ **Google Maps Integration** - Automatic route calculation with distance and duration
- 🔍 **Address Autocomplete** - Dropdown suggestions for addresses powered by Google Places API
- 📍 **Via Points** - Add multiple intermediate stops to your route
- 💰 **Real-time Price Calculation** - Based on Norwegian taxi tariff regulations
- 📊 **Tariff Breakdown** - See how price is distributed across different tariff periods
- 🌐 **Bilingual Support** - Norwegian and English interface
- 🖨️ **Professional PDF Export** - Generate official-looking price estimates
- ⏰ **Time-based Tariffs** - Automatic switching between Day, Evening, Saturday, Weekend/Night, and Holiday rates
- 🎉 **Norwegian Holidays** - Automatic detection of 12 public holidays with høytid (holiday) tariff applied
- 👥 **Vehicle Groups** - Support for 1-4, 5-6, 7-8, and 9-16 seat vehicles
- ✏️ **Editable Tariffs** - Password-protected tariff editor
- 📱 **Mobile Optimized** - Responsive design for all screen sizes

### Multi-Tenant SaaS Features
- 🏢 **White-Label Branding** - Custom logo, company name, colors, and page metadata per tenant
- 🎨 **Themeable UI** - 60+ CSS variables for complete visual customization
- 🌍 **Regional Configuration** - Tenant-specific map center, country, language, and default addresses
- 🔐 **Data Isolation** - Tenant-scoped Firebase paths and localStorage keys
- 🌐 **Custom Domains** - Support for custom domains and subdomains per tenant
- 🛡️ **Embed Protection** - Domain validation and iframe security headers
- 🚦 **Feature Flags** - Enable/disable features per tenant (language switcher, print, tariff editor, map, etc.)
- 📊 **Multi-Tenant Analytics** - Separate data tracking per tenant

**📖 See [TENANTS.md](./TENANTS.md) for complete multi-tenant configuration guide**

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/voss-taxi-kalkulator.git
cd voss-taxi-kalkulator

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your Google Maps API key

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite and configure the build settings
6. Click "Deploy"

The app will be live at `https://your-project.vercel.app`

## Project Structure

```
voss-taxi-kalkulator/
├── public/
│   ├── tenants/                     # Tenant-specific assets
│   │   └── voss-taxi/
│   │       ├── logo.png             # Tenant logo
│   │       └── favicon.png          # Tenant favicon
│   └── taxi-icon.svg
├── src/
│   ├── components/                  # React components
│   │   ├── AddressAutocomplete.jsx
│   │   ├── AddressInputSection.jsx
│   │   ├── EstimatedPriceCard.jsx   # Price estimate with breakdown
│   │   ├── HelpTooltip.jsx          # Help icons with tooltips
│   │   ├── MapDisplay.jsx           # Google Maps integration
│   │   ├── PrintOffer.jsx           # PDF/Print document
│   │   ├── TariffEditorModal.jsx    # Edit base tariffs
│   │   ├── TariffTable.jsx          # 4x5 price grid
│   │   └── TripParametersSection.jsx
│   ├── config/                      # Multi-tenant configuration
│   │   ├── firebase.config.js       # Firebase with tenant paths
│   │   ├── tenantResolver.js        # Tenant detection logic
│   │   └── tenantSchema.js          # Tenant config schema
│   ├── context/
│   │   └── TenantContext.jsx        # Tenant state provider
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAddressInputs.js
│   │   ├── useRouteCalculation.js
│   │   ├── useTariffData.js         # Tenant-scoped tariff storage
│   │   ├── useTripParameters.js
│   │   └── index.js
│   ├── locales/
│   │   └── translations.js          # NO/EN with template resolution
│   ├── themes/                      # Theme system
│   │   ├── themeDefaults.js         # 60+ CSS variables
│   │   ├── vossTaxi.js              # Default dark theme
│   │   ├── lightClean.js            # Light theme alternative
│   │   └── index.js
│   ├── utils/
│   │   ├── helligdager.js           # Norwegian holidays calculator
│   │   └── tariffCalculator.js      # Core pricing logic
│   ├── App.css                      # CSS with variable references
│   ├── App.jsx                      # Main application
│   └── main.jsx                     # React entry point
├── CLAUDE.md                        # AI assistant development guide
├── TENANTS.md                       # Multi-tenant configuration guide
├── index.html
├── package.json
├── vercel.json                      # Vercel config with security headers
├── vite.config.js
└── README.md
```

## Tariff Calculation

The pricing follows official Norwegian taxi tariff regulations:

### Base Tariffs (1-4 seats, Day)
- Start price: 97 NOK
- Per km (0-10 km): 11.14 NOK
- Per km (>10 km): 21.23 NOK
- Per minute: 8.42 NOK

### Period Multipliers
- Day (Mon-Fri 06:00-18:00): 1.0x
- Evening (Mon-Fri 18:00-24:00): 1.21x
- Saturday (Sat 06:00-15:00): 1.3x
- Weekend/Night (Sat 15:00-Mon 06:00): 1.35x
- Holidays: 1.45x

### Norwegian Public Holidays (Høytid Tariff)

The system automatically applies the høytid (holiday) tariff on these 12 Norwegian public holidays:

**Fixed Holidays:**
- Nyttårsdag (New Year's Day) - January 1
- Arbeidernes dag (Labour Day) - May 1
- Grunnlovsdag (Constitution Day) - May 17
- 1. juledag (Christmas Day) - December 25
- 2. juledag (Boxing Day) - December 26

**Moveable Holidays (calculated from Easter):**
- Skjærtorsdag (Maundy Thursday) - 3 days before Easter
- Langfredag (Good Friday) - 2 days before Easter
- Påskedag (Easter Sunday)
- 2. påskedag (Easter Monday) - 1 day after Easter
- Kristi himmelfartsdag (Ascension Day) - 39 days after Easter
- Pinsedag (Whit Sunday) - 49 days after Easter
- 2. pinsedag (Whit Monday) - 50 days after Easter

Holidays are automatically calculated using the Computus algorithm for years 2024-2027.

### Vehicle Group Multipliers
- 1-4 seats: 1.0x
- 5-6 seats: 1.3x
- 7-8 seats: 1.6x
- 9-16 seats: 2.0x

**Note:** The minute rate only scales by period, not by vehicle group.

## Multi-Tenant Setup

This application supports serving multiple taxi companies from a single codebase. Each tenant gets custom branding, theming, and regional configuration.

### Quick Start for New Tenants

1. **Add tenant configuration** in `src/config/tenantResolver.js`
2. **Upload tenant assets** to `public/tenants/{tenant-id}/`
3. **Configure domain mapping** (optional for custom domains)
4. **Test with** `?tenant={tenant-id}` query parameter

**📖 Complete Guide:** See [TENANTS.md](./TENANTS.md) for detailed instructions on adding tenants, theme customization, feature flags, domain setup, and deployment.

### Example: Access Different Tenants

```bash
# Default tenant (Voss Taxi)
https://yourdomain.com

# Via query parameter
https://yourdomain.com/?tenant=bergen-taxi

# Via subdomain
https://bergen-taxi.yourdomain.com

# Via custom domain
https://bergentaxi.no
```

## Configuration

### Google Maps API Key

The Google Maps API key is configured via environment variables for security. To set it up:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. Get your API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)

4. **Important:** Restrict your API key in Google Cloud Console:
   - Set HTTP referrer restrictions for your domain
   - Enable only the required APIs: Maps JavaScript API and Places API

**Note:** The `.env` file is git-ignored for security. Never commit API keys to version control.

### Tariff Editor Password

The tariff editor is password-protected. The default password is `Hestavangen11`.

**⚠️ Security Note**: This is client-side authentication only and provides minimal security. Anyone with browser dev tools can bypass it. For production use with sensitive pricing data, consider implementing a proper backend API with server-side authentication.

To change the password, edit the `VITE_TARIFF_PASSWORD` in your `.env` file:
```
VITE_TARIFF_PASSWORD=your_custom_password
```

## Usage

1. **Enter Route** - Type start address and destination
2. **Add Via Points** (optional) - Click "Add via point" for intermediate stops
3. **Set Parameters** - Adjust km, minutes, date, time, and vehicle group
4. **View Results** - See estimated price and tariff table
5. **Print/PDF** - Click "Print/Save as PDF" for official estimate document

### Keyboard Shortcuts

- Press **Enter** in address fields to move to the next field
- Press **Enter** in km field to move to minutes
- Press **Enter** in minutes field to move to date

## Print Output

The PDF/Print feature generates a professional document including:

- Company logo and header
- Route information (from/via/to)
- Trip details (group, period, distance, time)
- Highlighted estimated price
- Detailed tariff breakdown
- **Important disclaimer** stating it's an estimate only

## CTRL BOARD Integration

**New!** Voss Taxi Kalkulator includes built-in monitoring and analytics via [CTRL BOARD](https://github.com/yourusername/ctrl-board).

### What Gets Tracked

- ✅ **Health Monitoring** - Automatic heartbeats every 60 seconds
- ✅ **API Cost Tracking** - Google Maps API usage (Directions + Places) with cost data
- ✅ **Error Reporting** - Automatic incident reporting for all errors
- ✅ **Multi-Tenant Analytics** - Per-tenant usage and cost breakdown
- ✅ **Performance Metrics** - API latency and route calculation times

### Features

| Feature | Description | Dashboard View |
|---------|-------------|----------------|
| **Heartbeats** | Real-time uptime monitoring | Green/Red status indicator |
| **API Costs** | Google Maps API cost tracking | Cost per tenant, daily trends |
| **Incidents** | Error and warning reporting | Severity levels, stack traces |
| **User Metrics** | Calculations performed, prints | DAU, engagement metrics |

### Setup

1. **Deploy CTRL BOARD** (or use existing instance)
2. **Register app** in CTRL BOARD dashboard
3. **Add environment variables**:

```env
# CTRL BOARD Integration
VITE_CTRL_BOARD_URL=https://your-ctrl-board.vercel.app
VITE_CTRL_BOARD_API_KEY=drivas_live_your_api_key
VITE_CTRL_BOARD_APP_ID=voss-taxi-kalkulator-prod
VITE_CTRL_BOARD_ENABLED=true  # Set to false to disable
```

4. **Deploy and monitor!**

### Cost Tracking Example

After 100 calculations:

| API | Requests | Cost/Request | Total |
|-----|----------|--------------|-------|
| Google Directions | 100 | $0.005 | $0.50 |
| Google Places Autocomplete | 400 | $0.00283 | $1.13 |
| **Total** | **500** | | **$1.63** |

### Documentation

- 📖 **[Integration Guide](docs/CTRL_BOARD_INTEGRATION.md)** - Complete technical documentation
- 🧪 **[Testing Guide](docs/TESTING_GUIDE.md)** - Comprehensive testing procedures
- 🚀 **[Setup Guide](integration/SETUP_GUIDE.md)** - Step-by-step setup instructions
- 📊 **[App Profile](integration/VOSS_TAXI_PROFILE.md)** - Application overview and specs

### Privacy & GDPR

CTRL BOARD integration is **privacy-safe** and **GDPR compliant**:

- ❌ **No PII tracked** - No user addresses, names, or identifiers
- ✅ **Aggregate metrics only** - Distance, duration, calculation counts
- ✅ **IP anonymization** - Server-side IP masking
- ✅ **90-day retention** - Automatic data cleanup
- ✅ **Opt-out available** - Feature flag to disable tracking

### Disabling Tracking

To disable CTRL BOARD integration:

```env
# In .env or Vercel environment variables
VITE_CTRL_BOARD_ENABLED=false
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the client (Vite requirement).

### Required Variables

```env
# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
# Get from: https://console.cloud.google.com/google/maps-apis
# Required APIs: Maps JavaScript API, Places API, Directions API

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_DATABASE_URL=https://your-project.firebasedatabase.app
```

### Optional Variables

```env
# Tariff Editor Password (optional, defaults to 'Hestavangen11')
VITE_TARIFF_PASSWORD=your_admin_password_here

# CTRL BOARD Integration (optional)
VITE_CTRL_BOARD_URL=https://your-ctrl-board.vercel.app
VITE_CTRL_BOARD_API_KEY=drivas_live_your_api_key
VITE_CTRL_BOARD_APP_ID=your-app-id
VITE_CTRL_BOARD_ENABLED=true  # Set to false to disable tracking
```

### Setting Environment Variables in Vercel

1. Go to **Vercel Dashboard** → **Your Project**
2. Click **Settings** → **Environment Variables**
3. Add each variable for **Production** environment
4. Optionally add for **Preview** and **Development** environments
5. Trigger a redeploy for changes to take effect

**Security:** Never commit `.env` files to git. The `.env.example` file documents required variables without exposing secrets.

## Development

```bash
# Run development server with hot reload
npm run dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file

## Credits

Created by Toni Kolve / Kolve ST

© 2025 Voss Taxi Kalkulator
