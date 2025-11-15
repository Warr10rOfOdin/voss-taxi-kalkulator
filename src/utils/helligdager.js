// Norwegian Public Holidays (Helligdager)
// These dates use the "høytid" (holiday) tariff

/**
 * Calculate Easter Sunday using Computus algorithm (Anonymous Gregorian)
 * @param {number} year - The year to calculate Easter for
 * @returns {Date} - Easter Sunday date
 */
function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Generate all Norwegian public holidays for a given year
 * @param {number} year - The year to generate holidays for
 * @returns {Array<Date>} - Array of holiday dates
 */
function generateHolidaysForYear(year) {
  const holidays = [];

  // Fixed holidays
  holidays.push(new Date(year, 0, 1));   // Nyttårsdag (New Year's Day)
  holidays.push(new Date(year, 4, 1));   // Arbeidernes dag (Labour Day)
  holidays.push(new Date(year, 4, 17));  // Grunnlovsdag (Constitution Day)
  holidays.push(new Date(year, 11, 25)); // 1. juledag (Christmas Day)
  holidays.push(new Date(year, 11, 26)); // 2. juledag (Boxing Day)

  // Moveable holidays (based on Easter)
  const easter = calculateEaster(year);

  // Skjærtorsdag (Maundy Thursday) - 3 days before Easter
  const maundyThursday = new Date(easter);
  maundyThursday.setDate(easter.getDate() - 3);
  holidays.push(maundyThursday);

  // Langfredag (Good Friday) - 2 days before Easter
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  holidays.push(goodFriday);

  // Påskedag (Easter Sunday)
  holidays.push(new Date(easter));

  // 2. påskedag (Easter Monday) - 1 day after Easter
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  holidays.push(easterMonday);

  // Kristi himmelfartsdag (Ascension Day) - 39 days after Easter
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);
  holidays.push(ascension);

  // Pinsedag (Whit Sunday) - 49 days after Easter
  const whitSunday = new Date(easter);
  whitSunday.setDate(easter.getDate() + 49);
  holidays.push(whitSunday);

  // 2. pinsedag (Whit Monday) - 50 days after Easter
  const whitMonday = new Date(easter);
  whitMonday.setDate(easter.getDate() + 50);
  holidays.push(whitMonday);

  return holidays;
}

/**
 * Generate holidays for multiple years (current year and next 2 years)
 * @returns {Array<Date>} - Array of all holiday dates
 */
export function getNorwegianHolidays() {
  const currentYear = new Date().getFullYear();
  const holidays = [];

  // Generate for previous year, current year, and next 2 years
  // This ensures we have coverage for dates selected in the past or future
  for (let year = currentYear - 1; year <= currentYear + 2; year++) {
    holidays.push(...generateHolidaysForYear(year));
  }

  return holidays;
}

/**
 * Check if a specific date is a Norwegian public holiday
 * @param {Date} date - The date to check
 * @returns {boolean} - True if the date is a public holiday
 */
export function isNorwegianHoliday(date) {
  const holidays = getNorwegianHolidays();
  return holidays.some(h =>
    h.getFullYear() === date.getFullYear() &&
    h.getMonth() === date.getMonth() &&
    h.getDate() === date.getDate()
  );
}

/**
 * Get a formatted list of all holidays for a given year (for display/debugging)
 * @param {number} year - The year to get holidays for
 * @returns {Array<Object>} - Array of {date, name} objects
 */
export function getHolidayListForYear(year) {
  const easter = calculateEaster(year);

  const holidays = [
    { date: new Date(year, 0, 1), name: 'Nyttårsdag' },
    { date: new Date(easter.getTime() - 3 * 24 * 60 * 60 * 1000), name: 'Skjærtorsdag' },
    { date: new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000), name: 'Langfredag' },
    { date: new Date(easter), name: 'Påskedag' },
    { date: new Date(easter.getTime() + 1 * 24 * 60 * 60 * 1000), name: '2. påskedag' },
    { date: new Date(year, 4, 1), name: 'Arbeidernes dag' },
    { date: new Date(year, 4, 17), name: 'Grunnlovsdag' },
    { date: new Date(easter.getTime() + 39 * 24 * 60 * 60 * 1000), name: 'Kristi himmelfartsdag' },
    { date: new Date(easter.getTime() + 49 * 24 * 60 * 60 * 1000), name: 'Pinsedag' },
    { date: new Date(easter.getTime() + 50 * 24 * 60 * 60 * 1000), name: '2. pinsedag' },
    { date: new Date(year, 11, 25), name: '1. juledag' },
    { date: new Date(year, 11, 26), name: '2. juledag' },
  ];

  // Sort by date
  holidays.sort((a, b) => a.date - b.date);

  return holidays;
}

export default getNorwegianHolidays;
