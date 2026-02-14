/**
 * Utility Functions Usage Example
 *
 * This example shows how to use the calculator's utility functions
 * for backend calculations, API endpoints, or custom implementations.
 *
 * No UI components required - pure calculation logic.
 */

import {
  calculateTimelineEstimate,
  deriveAllTariffs,
  getTariffTypeAt,
  buildPriceMatrix,
  normaliseBaseTariff14,
  getNorwegianHolidays,
  isNorwegianHoliday
} from '../calculator/src/index';
import { DEFAULT_BASE_TARIFF_14 } from '../calculator/src/config/firebase.config';

// ============================================
// Example 1: Calculate a simple trip price
// ============================================

function calculateSimpleTrip() {
  const baseTariff = DEFAULT_BASE_TARIFF_14;
  const holidays = getNorwegianHolidays();

  // Trip parameters
  const tripDate = new Date('2025-05-17T10:00'); // Norwegian Constitution Day
  const distanceKm = 15.5;
  const durationMin = 25;
  const vehicleGroup = '1-4';

  // Calculate estimate
  const estimate = calculateTimelineEstimate(
    tripDate,
    distanceKm,
    durationMin,
    vehicleGroup,
    baseTariff,
    holidays
  );

  console.log('=== Simple Trip Calculation ===');
  console.log(`Total Price: ${estimate.total} NOK`);
  console.log('Breakdown by period:');
  Object.entries(estimate.periodBreakdown).forEach(([period, data]) => {
    console.log(`  ${period}: ${data.price} NOK (${data.minutes} minutes)`);
  });
  console.log(`Start tariff: ${estimate.startTariff}`);
  console.log(`End tariff: ${estimate.endTariff}`);

  return estimate;
}

// ============================================
// Example 2: Check if date is a holiday
// ============================================

function checkHolidays() {
  const holidays = getNorwegianHolidays();

  const dates = [
    '2025-01-01', // New Year's Day
    '2025-05-17', // Constitution Day
    '2025-12-25', // Christmas
    '2025-06-15', // Regular day
  ];

  console.log('\n=== Holiday Check ===');
  dates.forEach(dateStr => {
    const isHoliday = isNorwegianHoliday(dateStr, holidays);
    console.log(`${dateStr}: ${isHoliday ? '🎉 Holiday' : '📅 Regular day'}`);
  });
}

// ============================================
// Example 3: Detect tariff period at specific time
// ============================================

function detectTariffPeriods() {
  const holidays = getNorwegianHolidays();
  const holidayDates = Array.from(holidays).map(h => new Date(h));

  const testTimes = [
    new Date('2025-03-10T08:00'), // Monday 08:00 - dag
    new Date('2025-03-10T19:00'), // Monday 19:00 - kveld
    new Date('2025-03-15T10:00'), // Saturday 10:00 - laurdag
    new Date('2025-03-15T16:00'), // Saturday 16:00 - helgNatt
    new Date('2025-05-17T12:00'), // Constitution Day - hoytid
    new Date('2025-12-24T16:00'), // Christmas Eve after 15:00 - hoytid
  ];

  console.log('\n=== Tariff Period Detection ===');
  testTimes.forEach(date => {
    const period = getTariffTypeAt(date, holidayDates);
    const dayName = date.toLocaleDateString('no-NO', { weekday: 'long' });
    const time = date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
    console.log(`${dayName} ${time}: ${period}`);
  });
}

// ============================================
// Example 4: Generate full tariff matrix
// ============================================

function generateTariffMatrix() {
  const baseTariff = DEFAULT_BASE_TARIFF_14;
  const allTariffs = deriveAllTariffs(baseTariff);

  // Build price matrix for a sample trip
  const priceMatrix = buildPriceMatrix({
    km: 20,
    minutes: 30,
    tariffs: allTariffs
  });

  console.log('\n=== Full Tariff Matrix (20km, 30min) ===');
  console.log('Group    | Dag    | Kveld  | Laurdag | HelgNatt | Hoytid');
  console.log('---------|--------|--------|---------|----------|-------');

  Object.entries(priceMatrix).forEach(([group, periods]) => {
    const row = [
      group.padEnd(8),
      periods.dag.toFixed(0).padStart(6),
      periods.kveld.toFixed(0).padStart(6),
      periods.laurdag.toFixed(0).padStart(7),
      periods.helgNatt.toFixed(0).padStart(8),
      periods.hoytid.toFixed(0).padStart(6)
    ];
    console.log(row.join(' | '));
  });
}

// ============================================
// Example 5: Custom tariff adjustment
// ============================================

function adjustTariffByPercentage() {
  const baseTariff = DEFAULT_BASE_TARIFF_14;

  // Apply 10% increase
  const percentage = 10;
  const multiplier = 1 + (percentage / 100);

  const adjustedTariff = {
    start: (baseTariff.start * multiplier).toFixed(2),
    km0_10: (baseTariff.km0_10 * multiplier).toFixed(2),
    kmOver10: (baseTariff.kmOver10 * multiplier).toFixed(2),
    min: (baseTariff.min * multiplier).toFixed(2)
  };

  console.log('\n=== Tariff Adjustment (+10%) ===');
  console.log('Original:', baseTariff);
  console.log('Adjusted:', adjustedTariff);

  // Normalize to ensure correct format
  const normalized = normaliseBaseTariff14(adjustedTariff);
  console.log('Normalized:', normalized);

  return normalized;
}

// ============================================
// Example 6: API endpoint usage (Express.js)
// ============================================

/**
 * Example Express.js API endpoint for calculating taxi prices
 *
 * POST /api/calculate-price
 * Body: {
 *   startDate: '2025-05-17',
 *   startTime: '10:00',
 *   distanceKm: 15.5,
 *   durationMin: 25,
 *   vehicleGroup: '1-4'
 * }
 */
function exampleAPIEndpoint() {
  return `
// In your Express.js server:
import express from 'express';
import {
  calculateTimelineEstimate,
  getNorwegianHolidays
} from './calculator/utils/tariffCalculator.js';
import {
  getTariffFromFirebase
} from './calculator/firebase.js';
import { DEFAULT_BASE_TARIFF_14 } from './calculator/config/firebase.config.js';

const app = express();
app.use(express.json());

// Cache holidays (doesn't change often)
const holidays = getNorwegianHolidays();

app.post('/api/calculate-price', async (req, res) => {
  try {
    const { startDate, startTime, distanceKm, durationMin, vehicleGroup } = req.body;

    // Load current tariffs from Firebase
    let baseTariff = DEFAULT_BASE_TARIFF_14;
    try {
      const firebaseTariff = await getTariffFromFirebase();
      if (firebaseTariff) {
        baseTariff = firebaseTariff;
      }
    } catch (error) {
      console.error('Failed to load tariffs from Firebase:', error);
      // Continue with default tariffs
    }

    // Calculate estimate
    const tripDateTime = new Date(\`\${startDate}T\${startTime}\`);
    const estimate = calculateTimelineEstimate(
      tripDateTime,
      parseFloat(distanceKm),
      parseFloat(durationMin),
      vehicleGroup,
      baseTariff,
      holidays
    );

    // Return result
    res.json({
      success: true,
      estimate: {
        total: estimate.total,
        breakdown: estimate.periodBreakdown,
        startTariff: estimate.startTariff,
        endTariff: estimate.endTariff
      },
      parameters: {
        distance: distanceKm,
        duration: durationMin,
        vehicleGroup,
        date: startDate,
        time: startTime
      }
    });
  } catch (error) {
    console.error('Price calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate price'
    });
  }
});

app.listen(3000, () => {
  console.log('API server running on port 3000');
});
`;
}

// ============================================
// Run all examples
// ============================================

export function runAllExamples() {
  calculateSimpleTrip();
  checkHolidays();
  detectTariffPeriods();
  generateTariffMatrix();
  adjustTariffByPercentage();
  console.log(exampleAPIEndpoint());
}

// Export individual examples
export {
  calculateSimpleTrip,
  checkHolidays,
  detectTariffPeriods,
  generateTariffMatrix,
  adjustTariffByPercentage,
  exampleAPIEndpoint
};
