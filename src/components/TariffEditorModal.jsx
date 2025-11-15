import { useState, useEffect } from 'react';
import { 
  normaliseBaseTariff14, 
  deriveAllTariffs, 
  buildPriceMatrix,
  GROUP_KEYS,
  PERIOD_KEYS
} from '../utils/tariffCalculator';

export default function TariffEditorModal({
  isOpen,
  onClose,
  initialBaseTariff14,
  onSave,
  translations
}) {
  const [start, setStart] = useState(97);
  const [km0_10, setKm0_10] = useState(11.14);
  const [kmOver10, setKmOver10] = useState(21.23);
  const [minRate, setMinRate] = useState(8.42);
  
  useEffect(() => {
    if (isOpen && initialBaseTariff14) {
      const normalized = normaliseBaseTariff14(initialBaseTariff14);
      setStart(normalized.start);
      setKm0_10(normalized.km0_10);
      setKmOver10(normalized.kmOver10);
      setMinRate(normalized.min);
    }
  }, [isOpen, initialBaseTariff14]);
  
  if (!isOpen) {
    return null;
  }
  
  const currentBase = {
    start: parseFloat(start) || 0,
    km0_10: parseFloat(km0_10) || 0,
    kmOver10: parseFloat(kmOver10) || 0,
    min: parseFloat(minRate) || 0,
  };
  
  const tariffs = deriveAllTariffs(currentBase);
  const previewMatrix = buildPriceMatrix({ km: 15.04, minutes: 22, tariffs });
  
  const handleSave = () => {
    const cleaned = normaliseBaseTariff14(currentBase);
    onSave(cleaned);
    onClose();
  };
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{translations.modalTitle}</div>
        
        <div className="modal-inputs">
          <div className="form-group">
            <label htmlFor="modalStart">{translations.modalStart}</label>
            <input 
              type="number" 
              id="modalStart" 
              min="0" 
              step="0.01" 
              value={start}
              onChange={e => setStart(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="modalKm0_10">{translations.modalKm010}</label>
            <input 
              type="number" 
              id="modalKm0_10" 
              min="0" 
              step="0.01" 
              value={km0_10}
              onChange={e => setKm0_10(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="modalKmOver10">{translations.modalKmOver10}</label>
            <input 
              type="number" 
              id="modalKmOver10" 
              min="0" 
              step="0.01" 
              value={kmOver10}
              onChange={e => setKmOver10(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="modalMin">{translations.modalMin}</label>
            <input 
              type="number" 
              id="modalMin" 
              min="0" 
              step="0.01" 
              value={minRate}
              onChange={e => setMinRate(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-preview">
          <h3>{translations.preview}</h3>
          <div className="preview-scenario">{translations.previewScenario}</div>
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
                      kr {previewMatrix[group][period].toLocaleString('nb-NO')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            {translations.cancel}
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {translations.saveTariffs}
          </button>
        </div>
      </div>
    </div>
  );
}
