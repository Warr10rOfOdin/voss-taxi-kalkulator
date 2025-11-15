# Voss Taxi Kalkulator

A web application for calculating and displaying taxi prices for Voss Taxi in Norway. Features include Google Maps route integration, multi-language support (Norwegian/English), and professional PDF price estimate generation.

![Voss Taxi Calculator](https://img.shields.io/badge/React-18.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

- 🗺️ **Google Maps Integration** - Automatic route calculation with distance and duration
- 🔍 **Address Autocomplete** - Dropdown suggestions for addresses powered by Google Places API
- 📍 **Via Points** - Add multiple intermediate stops to your route
- 💰 **Real-time Price Calculation** - Based on official Voss Taxi tariffs
- 📊 **Tariff Breakdown** - See how price is distributed across different tariff periods
- 🌐 **Bilingual Support** - Norwegian and English interface
- 🖨️ **Professional PDF Export** - Generate official-looking price estimates
- ⏰ **Time-based Tariffs** - Automatic switching between Day, Evening, Saturday, Weekend/Night, and Holiday rates
- 👥 **Vehicle Groups** - Support for 1-4, 5-6, 7-8, and 9-16 seat vehicles
- ✏️ **Editable Tariffs** - Password-protected tariff editor
- 📱 **Mobile Optimized** - Responsive design for all screen sizes

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
│   └── taxi-icon.svg          # Favicon
├── src/
│   ├── components/
│   │   ├── EstimatedPriceCard.jsx   # Price estimate with breakdown
│   │   ├── HelpTooltip.jsx          # Help icons with tooltips
│   │   ├── MapDisplay.jsx           # Google Maps integration
│   │   ├── PrintOffer.jsx           # PDF/Print document
│   │   ├── TariffEditorModal.jsx    # Edit base tariffs
│   │   └── TariffTable.jsx          # 4x5 price grid
│   ├── locales/
│   │   └── translations.js          # NO/EN translations
│   ├── utils/
│   │   └── tariffCalculator.js      # Core pricing logic
│   ├── App.css                      # All styles
│   ├── App.jsx                      # Main application
│   └── main.jsx                     # React entry point
├── index.html
├── package.json
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

### Vehicle Group Multipliers
- 1-4 seats: 1.0x
- 5-6 seats: 1.3x
- 7-8 seats: 1.6x
- 9-16 seats: 2.0x

**Note:** The minute rate only scales by period, not by vehicle group.

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
