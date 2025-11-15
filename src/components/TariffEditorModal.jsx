import { useState, useEffect } from 'react';
import { 
  normaliseBaseTariff14, 
  deriveAllTariffs, 
  buildPriceMatrix,
  GROUP_KEYS,
  PERIOD_KEYS
} from '../utils/tariffCalculator';

const DEFAULT_PASSWORD = 'Hestavangen11';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isOpen && initialBaseTariff14) {
      const normalized = normaliseBaseTariff14(initialBaseTariff14);
      setStart(normalized.start);
      setKm0_10(normalized.km0_10);
      setKmOver10(normalized.kmOver10);
      setMinRate(normalized.min);
    }
    // Reset authentication when modal is closed
    if (!isOpen) {
      setIsAuthenticated(false);
      setPassword('');
      setPasswordError('');
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
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === DEFAULT_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError(translations.passwordError || 'Feil passord');
    }
  };

  const handleSave = () => {
    const cleaned = normaliseBaseTariff14(currentBase);
    onSave(cleaned);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{translations.modalTitle}</div>

        {!isAuthenticated ? (
          <div className="password-form">
            <p style={{ marginBottom: '16px', color: '#a0a0a0' }}>
              {translations.passwordPrompt || 'Skriv inn passord for å redigere takster:'}
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={translations.passwordPlaceholder || 'Passord'}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1a1a2e',
                    border: '1px solid #3a3a5c',
                    borderRadius: '6px',
                    color: '#e0e0e0',
                    fontSize: '0.95rem'
                  }}
                />
                {passwordError && (
                  <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '8px' }}>
                    {passwordError}
                  </div>
                )}
              </div>
              <div className="modal-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  {translations.cancel || 'Avbryt'}
                </button>
                <button type="submit" className="btn btn-primary">
                  {translations.unlock || 'Lås opp'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="modal-title" style={{ display: 'none' }}>{translations.modalTitle}</div>
        
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
          </>
        )}
      </div>
    </div>
  );
}
