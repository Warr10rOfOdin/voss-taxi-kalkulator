// Tariff Calculator Engine
// All price calculations MUST use this shared engine

export const GROUP_KEYS = ["1-4", "5-6", "7-8", "9-16"];
export const PERIOD_KEYS = ["dag", "kveld", "laurdag", "helgNatt", "hoytid"];

export const GROUP_FACTORS = {
  "1-4": 1.0,
  "5-6": 1.3,
  "7-8": 1.6,
  "9-16": 2.0,
};

export const PERIOD_FACTORS = {
  dag: 1.0,
  kveld: 1.21,
  laurdag: 1.3,
  helgNatt: 1.35,
  hoytid: 1.45,
};

export const DEFAULT_BASE_TARIFF_14 = {
  start: 97,
  km0_10: 11.14,
  kmOver10: 21.23,
  min: 8.42,
};

export function normaliseBaseTariff14(maybe) {
  const result = {};
  for (const field of ['start', 'km0_10', 'kmOver10', 'min']) {
    const val = Number(maybe?.[field]);
    result[field] = isNaN(val) ? DEFAULT_BASE_TARIFF_14[field] : val;
  }
  return result;
}

export function deriveAllTariffs(base14Input) {
  const base14 = normaliseBaseTariff14(base14Input);
  const tariffs = {};
  
  for (const group of GROUP_KEYS) {
    tariffs[group] = {};
    for (const period of PERIOD_KEYS) {
      const groupFactor = GROUP_FACTORS[group];
      const periodFactor = PERIOD_FACTORS[period];
      
      // Time rate only scales by PERIOD, not by group!
      tariffs[group][period] = {
        start: base14.start * groupFactor * periodFactor,
        km0_10: base14.km0_10 * groupFactor * periodFactor,
        kmOver10: base14.kmOver10 * groupFactor * periodFactor,
        min: base14.min * periodFactor,
      };
    }
  }
  
  return tariffs;
}

export function getTariff(tariffs, groupKey, periodKey) {
  return tariffs?.[groupKey]?.[periodKey] || null;
}

export function roundToKr(x) {
  return Math.round(Number.isFinite(x) ? x : 0);
}

export function calculateSinglePeriodPrice({ km, minutes, tariffs, groupKey, periodKey }) {
  const distanceKm = Math.max(0, Number(km) || 0);
  const durationMin = Math.max(0, Number(minutes) || 0);
  
  const t = getTariff(tariffs, groupKey, periodKey);
  if (!t) return 0;
  
  let distanceCost;
  if (distanceKm <= 10) {
    distanceCost = distanceKm * t.km0_10;
  } else {
    const over10 = distanceKm - 10;
    distanceCost = 10 * t.km0_10 + over10 * t.kmOver10;
  }
  
  const timeCost = durationMin * t.min;
  const total = t.start + distanceCost + timeCost;
  
  return roundToKr(total);
}

export function buildPriceMatrix({ km, minutes, tariffs }) {
  const matrix = {};
  for (const group of GROUP_KEYS) {
    matrix[group] = {};
    for (const period of PERIOD_KEYS) {
      matrix[group][period] = calculateSinglePeriodPrice({
        km, minutes, tariffs, groupKey: group, periodKey: period
      });
    }
  }
  return matrix;
}

export function getTariffTypeAt(date, holidays = []) {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const hour = date.getHours();
  
  // Check if it's a holiday
  const isHoliday = holidays.some(h => 
    h.getFullYear() === date.getFullYear() &&
    h.getMonth() === date.getMonth() &&
    h.getDate() === date.getDate()
  );
  
  if (isHoliday) return "hoytid";
  
  // Night applies to all days (00:00 - 06:00)
  if (hour < 6) return "helgNatt";
  
  // Saturday 06:00 - 15:00
  if (day === 6 && hour >= 6 && hour < 15) return "laurdag";
  
  // Saturday 15:00+ or Sunday (all day)
  if ((day === 6 && hour >= 15) || day === 0) return "helgNatt";
  
  // Weekdays (Monday - Friday)
  if (day >= 1 && day <= 5) {
    if (hour >= 6 && hour < 18) return "dag";
    if (hour >= 18 && hour < 24) return "kveld";
  }
  
  return "dag";
}

export function calculateTimelineEstimate({ 
  km, 
  minutes, 
  baseTariff14, 
  groupKey, 
  startDateTime, 
  holidays = [],
  enableDebugLog = false 
}) {
  const distanceKm = Math.max(0, Number(km) || 0);
  const durationMin = Math.max(0, Number(minutes) || 0);
  
  if (durationMin === 0 || distanceKm === 0) {
    return { total: 0, segments: [] };
  }
  
  const tariffs = deriveAllTariffs(baseTariff14);
  const kmPerMin = distanceKm / durationMin;
  
  let currentTime = new Date(startDateTime);
  let total = 0;
  let cumulativeKm = 0;
  
  // Track segments for breakdown
  let segments = [];
  let currentSegmentType = null;
  let currentSegmentMinutes = 0;
  let currentSegmentKm = 0;
  let currentSegmentPrice = 0;
  
  function flushSegment() {
    if (currentSegmentType && currentSegmentMinutes > 0) {
      segments.push({
        type: currentSegmentType,
        minutes: currentSegmentMinutes,
        km: currentSegmentKm,
        price: roundToKr(currentSegmentPrice),
      });
    }
    currentSegmentMinutes = 0;
    currentSegmentKm = 0;
    currentSegmentPrice = 0;
  }
  
  // Add start price from first minute's tariff
  const startType = getTariffTypeAt(new Date(startDateTime), holidays);
  const startTariff = getTariff(tariffs, groupKey, startType);
  if (startTariff) {
    total += startTariff.start;
    currentSegmentType = startType;
    currentSegmentPrice += startTariff.start;
  }
  
  // Loop through each minute of the trip
  for (let i = 0; i < durationMin; i++) {
    const type = getTariffTypeAt(currentTime, holidays);
    const t = getTariff(tariffs, groupKey, type);
    
    let minuteCost = 0;
    
    if (t) {
      const beforeKm = cumulativeKm;
      const afterKm = cumulativeKm + kmPerMin;
      const limit = 10;
      
      let distanceCost;
      if (beforeKm >= limit) {
        distanceCost = kmPerMin * t.kmOver10;
      } else if (afterKm <= limit) {
        distanceCost = kmPerMin * t.km0_10;
      } else {
        // Crossing 10 km boundary within this minute
        const within = limit - beforeKm;
        const over = kmPerMin - within;
        distanceCost = within * t.km0_10 + over * t.kmOver10;
      }
      
      const timeCost = t.min;
      minuteCost = distanceCost + timeCost;
      total += minuteCost;
      cumulativeKm += kmPerMin;
    }
    
    // Segment tracking
    if (currentSegmentType === null) {
      currentSegmentType = type;
    }
    
    if (type !== currentSegmentType) {
      flushSegment();
      currentSegmentType = type;
    }
    
    currentSegmentMinutes += 1;
    currentSegmentKm += kmPerMin;
    currentSegmentPrice += minuteCost;
    
    // Advance time by one minute
    currentTime.setMinutes(currentTime.getMinutes() + 1);
  }
  
  // Flush remaining segment
  flushSegment();
  
  const roundedTotal = roundToKr(total);
  
  if (enableDebugLog) {
    console.groupCollapsed("[TariffTimeline] Gruppe", groupKey, "- km:", distanceKm, "min:", durationMin);
    console.log("Total:", roundedTotal, "kr");
    console.table(segments.map((s, i) => ({
      Segment: i + 1,
      Type: s.type,
      Minutter: s.minutes,
      Km: s.km.toFixed(2),
      Pris: s.price
    })));
    console.groupEnd();
  }
  
  return {
    total: roundedTotal,
    segments: segments
  };
}
