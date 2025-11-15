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
[
  {
    "år": 2019,
    "navn": "1. nyttårsdag",
    "dato": "01.01.2019",
    "dag": "tirsdag",
    "uke": 1
  },
  {
    "år": 2019,
    "navn": "Palmesøndag",
    "dato": "14.04.2019",
    "dag": "søndag",
    "uke": 15
  },
  {
    "år": 2019,
    "navn": "Skjærtorsdag",
    "dato": "18.04.2019",
    "dag": "torsdag",
    "uke": 16
  },
  {
    "år": 2019,
    "navn": "Langfredag",
    "dato": "19.04.2019",
    "dag": "fredag",
    "uke": 16
  },
  {
    "år": 2019,
    "navn": "1. påskedag",
    "dato": "21.04.2019",
    "dag": "søndag",
    "uke": 16
  },
  {
    "år": 2019,
    "navn": "2. påskedag",
    "dato": "22.04.2019",
    "dag": "mandag",
    "uke": 17
  },
  {
    "år": 2019,
    "navn": "Offentlig høytidsdag",
    "dato": "01.05.2019",
    "dag": "onsdag",
    "uke": 18
  },
  {
    "år": 2019,
    "navn": "Grunnlovsdag",
    "dato": "17.05.2019",
    "dag": "fredag",
    "uke": 20
  },
  {
    "år": 2019,
    "navn": "Kristi Himmelfartsdag",
    "dato": "30.05.2019",
    "dag": "torsdag",
    "uke": 22
  },
  {
    "år": 2019,
    "navn": "1. pinsedag",
    "dato": "09.06.2019",
    "dag": "søndag",
    "uke": 23
  },
  {
    "år": 2019,
    "navn": "2. pinsedag",
    "dato": "10.06.2019",
    "dag": "mandag",
    "uke": 24
  },
  {
    "år": 2019,
    "navn": "1. juledag",
    "dato": "25.12.2019",
    "dag": "onsdag",
    "uke": 52
  },
  {
    "år": 2019,
    "navn": "2. juledag",
    "dato": "26.12.2019",
    "dag": "torsdag",
    "uke": 52
  },
  {
    "år": 2020,
    "navn": "1. nyttårsdag",
    "dato": "01.01.2020",
    "dag": "onsdag",
    "uke": 1
  },
  {
    "år": 2020,
    "navn": "Palmesøndag",
    "dato": "05.04.2020",
    "dag": "søndag",
    "uke": 14
  },
  {
    "år": 2020,
    "navn": "Skjærtorsdag",
    "dato": "09.04.2020",
    "dag": "torsdag",
    "uke": 15
  },
  {
    "år": 2020,
    "navn": "Langfredag",
    "dato": "10.04.2020",
    "dag": "fredag",
    "uke": 15
  },
  {
    "år": 2020,
    "navn": "1. påskedag",
    "dato": "12.04.2020",
    "dag": "søndag",
    "uke": 15
  },
  {
    "år": 2020,
    "navn": "2. påskedag",
    "dato": "13.04.2020",
    "dag": "mandag",
    "uke": 16
  },
  {
    "år": 2020,
    "navn": "Offentlig høytidsdag",
    "dato": "01.05.2020",
    "dag": "fredag",
    "uke": 18
  },
  {
    "år": 2020,
    "navn": "Grunnlovsdag",
    "dato": "17.05.2020",
    "dag": "søndag",
    "uke": 20
  },
  {
    "år": 2020,
    "navn": "Kristi Himmelfartsdag",
    "dato": "21.05.2020",
    "dag": "torsdag",
    "uke": 21
  },
  {
    "år": 2020,
    "navn": "1. pinsedag",
    "dato": "31.05.2020",
    "dag": "søndag",
    "uke": 22
  },
  {
    "år": 2020,
    "navn": "2. pinsedag",
    "dato": "01.06.2020",
    "dag": "mandag",
    "uke": 23
  },
  {
    "år": 2020,
    "navn": "1. juledag",
    "dato": "25.12.2020",
    "dag": "fredag",
    "uke": 52
  },
  {
    "år": 2020,
    "navn": "2. juledag",
    "dato": "26.12.2020",
    "dag": "lørdag",
    "uke": 52
  },
  {
    "år": 2021,
    "navn": "1. nyttårsdag",
    "dato": "01.01.2021",
    "dag": "fredag",
    "uke": 53
  },
  {
    "år": 2021,
    "navn": "Palmesøndag",
    "dato": "28.03.2021",
    "dag": "søndag",
    "uke": 12
  },
  {
    "år": 2021,
    "navn": "Skjærtorsdag",
    "dato": "01.04.2021",
    "dag": "torsdag",
    "uke": 13
  },
  {
    "år": 2021,
    "navn": "Langfredag",
    "dato": "02.04.2021",
    "dag": "fredag",
    "uke": 13
  },
  {
    "år": 2021,
    "navn": "1. påskedag",
    "dato": "04.04.2021",
    "dag": "søndag",
    "uke": 13
  },
  {
    "år": 2021,
    "navn": "2. påskedag",
    "dato": "05.04.2021",
    "dag": "mandag",
    "uke": 14
  },
  {
    "år": 2021,
    "navn": "Offentlig høytidsdag",
    "dato": "01.05.2021",
    "dag": "lørdag",
    "uke": 17
  },
  {
    "år": 2021,
    "navn": "Kristi Himmelfartsdag",
    "dato": "13.05.2021",
    "dag": "torsdag",
    "uke": 19
  },
  {
    "år": 2021,
    "navn": "Grunnlovsdag",
    "dato": "17.05.2021",
    "dag": "mandag",
    "uke": 20
  },
  {
    "år": 2021,
    "navn": "1. pinsedag",
    "dato": "23.05.2021",
    "dag": "søndag",
    "uke": 20
  },
  {
    "år": 2021,
    "navn": "2. pinsedag",
    "dato": "24.05.2021",
    "dag": "mandag",
    "uke": 21
  },
  {
    "år": 2021,
    "navn": "1. juledag",
    "dato": "25.12.2021",
    "dag": "lørdag",
    "uke": 51
  },
  {
    "år": 2021,
    "navn": "2. juledag",
    "dato": "26.12.2021",
    "dag": "søndag",
    "uke": 51
  },
  {
    "år": 2022,
    "navn": "1. nyttårsdag",
    "dato": "01.01.2022",
    "dag": "lørdag",
    "uke": 52
  },
  {
    "år": 2022,
    "navn": "Palmesøndag",
    "dato": "10.04.2022",
    "dag": "søndag",
    "uke": 14
  },
  {
    "år": 2022,
    "navn": "Skjærtorsdag",
    "dato": "14.04.2022",
    "dag": "torsdag",
    "uke": 15
  },
  {
    "år": 2022,
    "navn": "Langfredag",
    "dato": "15.04.2022",
    "dag": "fredag",
    "uke": 15
  },
  {
    "år": 2022,
    "navn": "1. påskedag",
    "dato": "17.04.2022",
    "dag": "søndag",
    "uke": 15
  },
  {
    "år": 2022,
    "navn": "2. påskedag",
    "dato": "18.04.2022",
    "dag": "mandag",
    "uke": 16
  },
  {
    "år": 2022,
    "navn": "Offentlig høytidsdag",
    "dato": "01.05.2022",
    "dag": "søndag",
    "uke": 17
  },
  {
    "år": 2022,
    "navn": "Grunnlovsdag",
    "dato": "17.05.2022",
    "dag": "tirsdag",
    "uke": 20
  },
  {
    "år": 2022,
    "navn": "Kristi Himmelfartsdag",
    "dato": "26.05.2022",
    "dag": "torsdag",
    "uke": 21
  },
  {
    "år": 2022,
    "navn": "1. pinsedag",
    "dato": "05.06.2022",
    "dag": "søndag",
    "uke": 22
  },
  {
    "år": 2022,
    "navn": "2. pinsedag",
    "dato": "06.06.2022",
    "dag": "mandag",
    "uke": 23
  },
  {
    "år": 2022,
    "navn": "1. juledag",
    "dato": "25.12.2022",
    "dag": "søndag",
    "uke": 51
  },
  {
    "år": 2022,
    "navn": "2. juledag",
    "dato": "26.12.2022",
    "dag": "mandag",
    "uke": 52
  },
  {
    "år": 2023,
    "navn": "1. nyttårsdag",
    "dato": "01.01.2023",
    "dag": "søndag",
    "uke": 52
  },
  {
    "år": 2023,
    "navn": "Palmesøndag",
    "dato": "02.04.2023",
    "dag": "søndag",
    "uke": 13
  },
  {
    "år": 2023,
    "navn": "Skjærtorsdag",
    "dato": "06.04.2023",
    "dag": "torsdag",
    "uke": 14
  },
  {
    "år": 2023,
    "navn": "Langfredag",
    "dato": "07.04.2023",
    "dag": "fredag",
    "uke": 14
  },
  {
    "år": 2023,
    "navn": "1. påskedag",
    "dato": "09.04.2023",
    "dag": "søndag",
    "uke": 14
  },
  {
    "år": 2023,
    "navn": "2. påskedag",
    "dato": "10.04.2023",
    "dag": "mandag",
    "uke": 15
  },
  {
    "år": 2023,
    "navn": "Offentlig høytidsdag",
    "dato": "01.05.2023",
    "dag": "mandag",
    "uke": 18
  },
  {
    "år": 2023,
    "navn": "Grunnlovsdag",
    "dato": "17.05.2023",
    "dag": "onsdag",
    "uke": 20
  },
  {
    "år": 2023,
    "navn": "Kristi Himmelfartsdag",
    "dato": "18.05.2023",
    "dag": "torsdag",
    "uke": 20
  },
  {
    "år": 2023,
    "navn": "1. pinsedag",
    "dato": "28.05.2023",
    "dag": "søndag",
    "uke": 21
  },
  {
    "år": 2023,
    "navn": "2. pinsedag",
    "dato": "29.05.2023",
    "dag": "mandag",
    "uke": 22
  },
  {
    "år": 2023,
    "navn": "1. juledag",
    "dato": "25.12.2023",
    "dag": "mandag",
    "uke": 52
  },
  {
    "år": 2023,
    "navn": "2. juledag",
    "dato": "26.12.2023",
    "dag": "tirsdag",
    "uke": 52
  },
  {
    "år": 2024,
    "navn": "1. nyttårsdag",
    "dato": "01.01.2024",
    "dag": "mandag",
    "uke": 1
  },
  {
    "år": 2024,
    "navn": "Palmesøndag",
    "dato": "24.03.2024",
    "dag": "søndag",
    "uke": 12
  },
  {
    "år": 2024,
    "navn": "Skjærtorsdag",
    "dato": "28.03.2024",
    "dag": "torsdag",
    "uke": 13
  },
  {
    "år": 2024,
    "navn": "Langfredag",
    "dato": "29.03.2024",
    "dag": "fredag",
    "uke": 13
  },
  {
    "år": 2024,
    "navn": "1. påskedag",
    "dato": "31.03.2024",
    "dag": "søndag",
    "uke": 13
  },
  {
    "år": 2024,
    "navn": "2. påskedag",
    "dato": "01.04.2024",
    "dag": "mandag",
    "uke": 14
  },
  {
    "år": 2024,
    "navn": "Offentlig høytidsdag",
    "dato": "01.05.2024",
    "dag": "onsdag",
    "uke": 18
  },
  {
    "år": 2024,
    "navn": "Kristi Himmelfartsdag",
    "dato": "09.05.2024",
    "dag": "torsdag",
    "uke": 19
  },
  {
    "år": 2024,
    "navn": "Grunnlovsdag",
    "dato": "17.05.2024",
    "dag": "fredag",
    "uke": 20
  },
  {
    "år": 2024,
    "navn": "1. pinsedag",
    "dato": "19.05.2024",
    "dag": "søndag",
    "uke": 20
  },
  {
    "år": 2024,
    "navn": "2. pinsedag",
    "dato": "20.05.2024",
    "dag": "mandag",
    "uke": 21
  },
  {
    "år": 2024,
    "navn": "1. juledag",
    "dato": "25.12.2024",
    "dag": "onsdag",
    "uke": 52
  },
  {
    "år": 2024,
    "navn": "2. juledag",
    "dato": "26.12.2024",
    "dag": "torsdag",
    "uke": 52
  },
  {
    "år": 2025,
    "navn": "1. nyttårsdag",
    "dato": "01.01.2025",
    "dag": "onsdag",
    "uke": "01"
  },
  {
    "år": 2025,
    "navn": "Palmesøndag",
    "dato": "13.04.2025",
    "dag": "søndag",
    "uke": 15
  },
  {
    "år": 2025,
    "navn": "Skjærtorsdag",
    "dato": "17.04.2025",
    "dag": "torsdag",
    "uke": 16
  },
  {
    "år": 2025,
    "navn": "Langfredag",
    "dato": "18.04.2025",
    "dag": "fredag",
    "uke": 16
  },
  {
    "år": 2025,
    "navn": "1. påskedag",
    "dato": "20.04.2025",
    "dag": "søndag",
    "uke": 16
  },
  {
    "år": 2025,
    "navn": "2. påskedag",
    "dato": "21.04.2025",
    "dag": "mandag",
    "uke": 17
  },
  {
    "år": 2025,
    "navn": "Offentlig høytidsdag",
    "dato": "01.05.2025",
    "dag": "torsdag",
    "uke": 18
  },
  {
    "år": 2025,
    "navn": "Grunnlovsdag",
    "dato": "17.05.2025",
    "dag": "lørdag",
    "uke": 20
  },
  {
    "år": 2025,
    "navn": "Kristi Himmelfartsdag",
    "dato": "29.05.2025",
    "dag": "torsdag",
    "uke": 22
  },
  {
    "år": 2025,
    "navn": "1. pinsedag",
    "dato": "08.06.2025",
    "dag": "søndag",
    "uke": 23
  },
  {
    "år": 2025,
    "navn": "2. pinsedag",
    "dato": "09.06.2025",
    "dag": "mandag",
    "uke": 24
  },
  {
    "år": 2025,
    "navn": "1. juledag",
    "dato": "25.12.2025",
    "dag": "torsdag",
    "uke": 52
  },
  {
    "år": 2025,
    "navn": "2. juledag",
    "dato": "26.12.2025",
    "dag": "fredag",
    "uke": 52
  },
  {
    "år": 2026,
    "navn": "1. nyttårsdag",
    "dato": "01.01.2026",
    "dag": "torsdag",
    "uke": "01"
  },
  {
    "år": 2026,
    "navn": "Palmesøndag",
    "dato": "29.03.2026",
    "dag": "søndag",
    "uke": 13
  },
  {
    "år": 2026,
    "navn": "Skjærtorsdag",
    "dato": "02.04.2026",
    "dag": "torsdag",
    "uke": 14
  },
  {
    "år": 2026,
    "navn": "Langfredag",
    "dato": "03.04.2026",
    "dag": "fredag",
    "uke": 14
  },
  {
    "år": 2026,
    "navn": "1. påskedag",
    "dato": "05.04.2026",
    "dag": "søndag",
    "uke": 14
  },
  {
    "år": 2026,
    "navn": "2. påskedag",
    "dato": "06.04.2026",
    "dag": "mandag",
    "uke": 15
  },
  {
    "år": 2026,
    "navn": "Offentlig høytidsdag",
    "dato": "01.05.2026",
    "dag": "fredag",
    "uke": 18
  },
  {
    "år": 2026,
    "navn": "Kristi Himmelfartsdag",
    "dato": "14.05.2026",
    "dag": "torsdag",
    "uke": 20
  },
  {
    "år": 2026,
    "navn": "Grunnlovsdag",
    "dato": "17.05.2026",
    "dag": "søndag",
    "uke": 20
  },
  {
    "år": 2026,
    "navn": "1. pinsedag",
    "dato": "24.05.2026",
    "dag": "søndag",
    "uke": 21
  },
  {
    "år": 2026,
    "navn": "2. pinsedag",
    "dato": "25.05.2026",
    "dag": "mandag",
    "uke": 22
  },
  {
    "år": 2026,
    "navn": "1. juledag",
    "dato": "25.12.2026",
    "dag": "fredag",
    "uke": 52
  },
  {
    "år": 2026,
    "navn": "2. juledag",
    "dato": "26.12.2026",
    "dag": "lørdag",
    "uke": 52
  },
  {
    "år": 2027,
    "navn": "1. nyttårsdag",
    "dato": "01.01.2027",
    "dag": "lørdag",
    "uke": 53
  },
  {
    "år": 2027,
    "navn": "Palmesøndag",
    "dato": "21.03.2027",
    "dag": "søndag",
    "uke": 11
  },
  {
    "år": 2027,
    "navn": "Skjærtorsdag",
    "dato": "25.03.2027",
    "dag": "torsdag",
    "uke": 12
  },
  {
    "år": 2027,
    "navn": "Langfredag",
    "dato": "26.03.2027",
    "dag": "fredag",
    "uke": 12
  },
  {
    "år": 2027,
    "navn": "1. påskedag",
    "dato": "28.03.2027",
    "dag": "søndag",
    "uke": 12
  },
  {
    "år": 2027,
    "navn": "2. påskedag",
    "dato": "29.03.2027",
    "dag": "mandag",
    "uke": 13
  },
  {
    "år": 2027,
    "navn": "Offentlig høytidsdag",
    "dato": "01.05.2027",
    "dag": "søndag",
    "uke": 17
  },
  {
    "år": 2027,
    "navn": "Kristi Himmelfartsdag",
    "dato": "06.05.2027",
    "dag": "torsdag",
    "uke": 18
  },
  {
    "år": 2027,
    "navn": "1. pinsedag",
    "dato": "16.05.2027",
    "dag": "søndag",
    "uke": 19
  },
  {
    "år": 2027,
    "navn": "Grunnlovsdag og 2.pinsedag",
    "dato": "17.05.2027",
    "dag": "mandag",
    "uke": 20
  },
  {
    "år": 2027,
    "navn": "1. juledag",
    "dato": "25.12.2027",
    "dag": "lørdag",
    "uke": 51
  },
  {
    "år": 2027,
    "navn": "2. juledag",
    "dato": "26.12.2027",
    "dag": "søndag",
    "uke": 51
  }
]
