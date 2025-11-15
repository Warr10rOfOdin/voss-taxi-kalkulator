import { 
  deriveAllTariffs, 
  buildPriceMatrix,
  GROUP_KEYS,
  PERIOD_KEYS
} from '../utils/tariffCalculator';

export default function TariffTable({
  km,
  minutes,
  baseTariff14,
  lastUpdatedDate = '26/04-2024',
  translations
}) {
  const tariffs = deriveAllTariffs(baseTariff14);
  const matrix = buildPriceMatrix({ km, minutes, tariffs });
  
  return (
    <div className="card" id="tariffTableCard">
      <div className="card-title">{translations.tariffTableTitle}</div>
      <div className="tariff-grid">
        <table className="tariff-table">
          <thead>
            <tr>
              <th></th>
              <th>{translations.periodDag}</th>
              <th>{translations.periodKveld}</th>
              <th>{translations.periodLaurdag}</th>
              <th>{translations.periodHelgNatt}</th>
              <th>{translations.periodHoytid}</th>
            </tr>
          </thead>
          <tbody>
            {GROUP_KEYS.map(group => (
              <tr key={group}>
                <td>{translations.groupLabels[group]}</td>
                {PERIOD_KEYS.map(period => (
                  <td key={period}>
                    kr {matrix[group][period].toLocaleString('nb-NO')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tariff-notes">
        <p>{translations.notesPeriod}</p>
        <p>{translations.notesGroup}</p>
        <p>{translations.updated}</p>
      </div>
    </div>
  );
}
