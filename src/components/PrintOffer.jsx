import {
  calculateTimelineEstimate,
  getTariffTypeAt,
  deriveAllTariffs,
  buildPriceMatrix,
  GROUP_KEYS,
  PERIOD_KEYS
} from '../utils/tariffCalculator';

export default function PrintOffer({
  startAddress,
  destAddress,
  viaAddresses,
  distanceKm,
  durationMin,
  tripDate,
  tripTime,
  vehicleGroup,
  baseTariff14,
  holidays = [],
  translations,
  lang
}) {
  const km = parseFloat(distanceKm) || 0;
  const minutes = parseInt(durationMin) || 0;
  
  let segments = [];
  let totalPrice = 0;
  let periodLabel = '';
  
  if (tripDate && tripTime && km > 0 && minutes > 0) {
    const startDateTime = new Date(`${tripDate}T${tripTime}`);
    const periodType = getTariffTypeAt(startDateTime, holidays);
    periodLabel = translations.periodLabels[periodType];
    
    const result = calculateTimelineEstimate({
      km,
      minutes,
      baseTariff14,
      groupKey: vehicleGroup,
      startDateTime,
      holidays
    });
    segments = result.segments;
    totalPrice = result.total;
  }
  
  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === 'no' ? 'nb-NO' : 'en-US');
  
  const totalMinutes = segments.reduce((sum, s) => sum + s.minutes, 0);
  const totalKm = segments.reduce((sum, s) => sum + s.km, 0);

  // Generate full tariff matrix for price table
  const tariffs = deriveAllTariffs(baseTariff14);
  const priceMatrix = buildPriceMatrix({ km, minutes, tariffs });

  return (
    <div className="print-offer" id="printOffer">
      <div className="offer-header">
        <img src="/vosstaxi_logo_orange transparent.png" alt="Voss Taxi" className="offer-logo-img" />
        <div className="offer-logo">Voss Taxi</div>
        <div className="offer-date-header">
          {translations.offerDate}: {dateStr}
        </div>
      </div>

      <div className="offer-title">{translations.offerTitle}</div>

      <div className="offer-main-content">
        <div className="offer-left-section">
          <div className="offer-section">
            <div className="offer-section-title">{translations.offerRoute}</div>
            <div className="offer-route-box">
              <div className="offer-route-item">
                <span className="offer-route-label">{translations.offerFrom}:</span>
                <span>{startAddress || '-'}</span>
              </div>
              {viaAddresses.map((via, index) => (
                via && (
                  <div className="offer-route-item" key={index}>
                    <span className="offer-route-label">{translations.offerVia} {index + 1}:</span>
                    <span>{via}</span>
                  </div>
                )
              ))}
              <div className="offer-route-item">
                <span className="offer-route-label">{translations.offerTo}:</span>
                <span>{destAddress || '-'}</span>
              </div>
            </div>
          </div>

          <div className="offer-section">
            <div className="offer-section-title">{translations.offerDetails}</div>
            <div className="offer-details-grid">
              <div className="offer-detail-item">
                <div className="offer-detail-label">{translations.gruppe}</div>
                <div>{translations.groupLabels[vehicleGroup]}</div>
              </div>
              <div className="offer-detail-item">
                <div className="offer-detail-label">{translations.periodeVedStart}</div>
                <div>{periodLabel}</div>
              </div>
              <div className="offer-detail-item">
                <div className="offer-detail-label">{translations.avstand}</div>
                <div>{km.toFixed(1)} km</div>
              </div>
              <div className="offer-detail-item">
                <div className="offer-detail-label">{translations.tid}</div>
                <div>{minutes} min</div>
              </div>
            </div>
          </div>
        </div>

        <div className="offer-right-section">
          <div className="offer-price-box">
            <div className="offer-price-label">{translations.offerEstimate}</div>
            <div className="offer-price-value">kr {totalPrice.toLocaleString('nb-NO')}</div>
          </div>
        </div>
      </div>

      {segments.length > 0 && (
        <div className="offer-breakdown">
          <table>
            <thead>
              <tr>
                <th>{translations.bkPeriode}</th>
                <th>{translations.bkMinutter}</th>
                <th>{translations.bkKilometer}</th>
                <th>{translations.bkPris}</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment, index) => (
                <tr key={index}>
                  <td>{translations.periodLabels[segment.type]}</td>
                  <td>{segment.minutes}</td>
                  <td>{segment.km.toFixed(2)}</td>
                  <td>kr {segment.price.toLocaleString('nb-NO')}</td>
                </tr>
              ))}
              <tr>
                <td>{translations.totalLabel}</td>
                <td>{totalMinutes}</td>
                <td>{totalKm.toFixed(2)}</td>
                <td>kr {totalPrice.toLocaleString('nb-NO')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Full Tariff Price Table */}
      <div className="offer-section" style={{ pageBreakBefore: 'avoid', marginTop: '10px' }}>
        <div className="offer-section-title">{translations.tariffTableTitle}</div>
        <table className="offer-tariff-table">
          <thead>
            <tr>
              <th></th>
              {PERIOD_KEYS.map(period => (
                <th key={period}>{translations.periodLabels[period]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUP_KEYS.map(group => (
              <tr key={group}>
                <td>{translations.groupLabels[group]}</td>
                {PERIOD_KEYS.map(period => (
                  <td key={period}>kr {priceMatrix[group][period].toLocaleString('nb-NO')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: '7pt', marginTop: '5px', color: '#666' }}>
          {translations.notesPeriod}
        </div>
      </div>

      <div className="offer-disclaimer">
        <div className="offer-disclaimer-title">⚠️ {translations.offerImportant}</div>
        <div className="offer-disclaimer-subtitle">{translations.offerDisclaimerTitle}</div>
        <div className="offer-disclaimer-text">{translations.offerDisclaimerText}</div>
      </div>

      <div className="offer-footer">
        © 2025 Voss Taxi | {translations.madeBy}
      </div>
    </div>
  );
}
