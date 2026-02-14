import { useRef } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import HelpTooltip from './HelpTooltip';

/**
 * Address Input Section Component
 *
 * Renders start address, destination address, and via points with autocomplete
 *
 * @param {Object} props
 * @param {Object} props.addresses - Address state from useAddressInputs hook
 * @param {Function} props.onPlaceSelected - Handler for place selection
 * @param {Function} props.onTriggerRoute - Handler for manual route calculation
 * @param {Object} props.keyHandlers - Keyboard navigation handlers
 * @param {Object} props.translations - Translation object
 * @param {string} props.lang - Current language
 * @param {string} props.apiKey - Google Maps API key
 */
export default function AddressInputSection({
  addresses,
  onPlaceSelected,
  onTriggerRoute,
  keyHandlers,
  translations,
  lang,
  apiKey
}) {
  const {
    startAddress,
    setStartAddress,
    destAddress,
    setDestAddress,
    viaAddresses,
    addViaPoint,
    removeViaPoint,
    updateViaPoint
  } = addresses;

  // Refs for keyboard navigation
  const destAddressRef = useRef(null);
  const viaInputRefs = useRef([]);

  return (
    <>
      {/* Row 1: Start and Destination Addresses */}
      <div className="control-row">
        <div className="form-group flex-1">
          <div className="label-with-help">
            <label htmlFor="startAddress">{translations.startAddress}</label>
            <HelpTooltip text={translations.helpStartAddress} />
          </div>
          <AddressAutocomplete
            id="startAddress"
            value={startAddress}
            onChange={e => setStartAddress(e.target.value)}
            onKeyDown={keyHandlers.handleStartAddressKeydown}
            onPlaceSelected={onPlaceSelected}
            placeholder="Hestavangen 11, Voss"
            apiKey={apiKey}
          />
        </div>

        <div className="form-group flex-1">
          <div className="label-with-help">
            <label htmlFor="destAddress">{translations.destAddress}</label>
            <HelpTooltip text={translations.helpDestAddress} />
          </div>
          <AddressAutocomplete
            id="destAddress"
            inputRef={destAddressRef}
            value={destAddress}
            onChange={e => setDestAddress(e.target.value)}
            onKeyDown={keyHandlers.handleDestAddressKeydown}
            onPlaceSelected={onPlaceSelected}
            placeholder={lang === 'no' ? 'Adresse eller sted' : 'Address or place'}
            apiKey={apiKey}
          />
        </div>

        <button
          className="btn btn-primary top-fetch-btn"
          onClick={onTriggerRoute}
        >
          {translations.fetchGoogle}
        </button>
      </div>

      {/* Via Points Section */}
      <div className="via-section">
        <div className="via-points-container">
          {viaAddresses.map((via, index) => (
            <div className="via-point" key={index}>
              <div className="form-group flex-1">
                <div className="label-with-help">
                  <label>{translations.viaPoint} {index + 1}</label>
                  <HelpTooltip text={translations.helpVia} />
                </div>
                <AddressAutocomplete
                  inputRef={el => viaInputRefs.current[index] = el}
                  value={via}
                  onChange={e => updateViaPoint(index, e.target.value)}
                  onKeyDown={e => keyHandlers.handleViaKeydown(e, index)}
                  onPlaceSelected={onPlaceSelected}
                  placeholder={lang === 'no' ? 'Adresse eller sted' : 'Address or place'}
                  apiKey={apiKey}
                />
              </div>
              <button
                className="btn btn-danger remove-via-btn"
                onClick={() => removeViaPoint(index)}
                aria-label={translations.removeVia}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          className="btn btn-secondary add-via-btn"
          onClick={() => {
            const newIndex = addViaPoint();
            setTimeout(() => {
              viaInputRefs.current[newIndex]?.focus();
            }, 0);
          }}
        >
          + {translations.addVia}
        </button>
      </div>
    </>
  );
}
