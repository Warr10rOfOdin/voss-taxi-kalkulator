import { 
  calculateTimelineEstimate, 
  getTariffTypeAt,
  deriveAllTariffs
} from '../utils/tariffCalculator';

export default function EstimatedPriceCard({
  distanceKm: rawKm,
  durationMin: rawMin,
  tripDate,
  tripTime,
  vehicleGroup,
  baseTariff14,
  holidays = [],
  translations,
  onPrint,
  showPrintButton = true
}) {
  const distanceKm = Math.max(0, Number(rawKm) || 0);
  const durationMin = Math.max(0, Number(rawMin) || 0);

  let estimatedPrice = translations.enterKmTime;
  let segments = [];
  let periodLabel = '';

  if (tripDate && tripTime) {
    const startDateTime = new Date(`${tripDate}T${tripTime}`);
    const periodType = getTariffTypeAt(startDateTime, holidays);
    periodLabel = translations.periodLabels[periodType];

    if (distanceKm > 0 && durationMin > 0) {
      const result = calculateTimelineEstimate({
        km: distanceKm,
        minutes: durationMin,
        baseTariff14,
        groupKey: vehicleGroup,
        startDateTime,
        holidays,
        enableDebugLog: false
      });
      estimatedPrice = `kr ${result.total.toLocaleString('nb-NO')}`;
      segments = result.segments;
    }
  }
  
  const totalMinutes = segments.reduce((sum, s) => sum + s.minutes, 0);
  const totalKm = segments.reduce((sum, s) => sum + s.km, 0);
  const totalPrice = segments.reduce((sum, s) => sum + s.price, 0);
  
  return (
    <div className="card" id="estimateCard">
      <div className="card-title">{translations.estimatedPriceTitle}</div>
      <div className="estimate-content">
        <div className="estimate-details">
          <div className="estimate-row">
            <span className="estimate-label">{translations.gruppe}</span>
            <span className="estimate-value">{translations.groupLabels[vehicleGroup]}</span>
          </div>
          <div className="estimate-row">
            <span className="estimate-label">{translations.periodeVedStart}</span>
            <span className="estimate-value">{periodLabel}</span>
          </div>
          <div className="estimate-row">
            <span className="estimate-label">{translations.avstand}</span>
            <span className="estimate-value">{distanceKm.toFixed(1)} km</span>
          </div>
          <div className="estimate-row">
            <span className="estimate-label">{translations.tid}</span>
            <span className="estimate-value">{durationMin} min</span>
          </div>
        </div>
        <div className="estimate-price-box">
          <div className="estimate-price-label">{translations.estimertPris}</div>
          <div className="estimate-price-value">{estimatedPrice}</div>
        </div>
      </div>

      {segments.length > 0 && (
        <div className="tariff-breakdown">
          <div className="breakdown-title">{translations.breakdownTitle}</div>
          <table className="breakdown-table">
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

      <div className="estimate-disclaimer">
        {translations.disclaimer}
      </div>

      {showPrintButton && onPrint && (
        <button className="btn btn-secondary" onClick={onPrint} style={{ marginTop: '12px', width: '100%' }}>
          {translations.printPdf}
        </button>
      )}
    </div>
  );
}
