import { useRef } from 'react';
import HelpTooltip from './HelpTooltip';

/**
 * Trip Parameters Section Component
 *
 * Renders inputs for distance, duration, date, time, and vehicle group
 *
 * @param {Object} props
 * @param {Object} props.tripParams - Trip parameters state
 * @param {Function} props.onTriggerRoute - Handler for manual route calculation
 * @param {Function} props.onReset - Handler for resetting all fields
 * @param {Object} props.keyHandlers - Keyboard navigation handlers
 * @param {Object} props.translations - Translation object
 */
export default function TripParametersSection({
  tripParams,
  onTriggerRoute,
  onReset,
  keyHandlers,
  translations
}) {
  const {
    distanceKm,
    setDistanceKm,
    durationMin,
    setDurationMin,
    tripDate,
    setTripDate,
    tripTime,
    setTripTime,
    vehicleGroup,
    setVehicleGroup
  } = tripParams;

  // Refs for keyboard navigation
  const distanceKmRef = useRef(null);
  const durationMinRef = useRef(null);
  const tripDateRef = useRef(null);

  return (
    <>
      {/* Row 2: Distance and Duration */}
      <div className="control-row">
        <div className="form-group flex-1">
          <div className="label-with-help">
            <label htmlFor="distanceKm">{translations.distanceKm}</label>
            <HelpTooltip text={translations.helpDistance} />
          </div>
          <input
            type="number"
            id="distanceKm"
            ref={distanceKmRef}
            value={distanceKm}
            onChange={e => setDistanceKm(e.target.value)}
            onKeyDown={keyHandlers.handleDistanceKeydown}
            placeholder="100"
            min="0"
            step="0.1"
          />
        </div>

        <div className="form-group flex-1">
          <div className="label-with-help">
            <label htmlFor="durationMin">{translations.durationMin}</label>
            <HelpTooltip text={translations.helpDuration} />
          </div>
          <input
            type="number"
            id="durationMin"
            ref={durationMinRef}
            value={durationMin}
            onChange={e => setDurationMin(e.target.value)}
            onKeyDown={keyHandlers.handleDurationKeydown}
            placeholder="90"
            min="0"
            step="1"
          />
        </div>

        <button
          className="btn btn-primary top-fetch-btn"
          onClick={onTriggerRoute}
        >
          {translations.fetchGoogle}
        </button>
      </div>

      {/* Row 3: Date, Time, Vehicle Group */}
      <div className="control-row">
        <div className="form-group">
          <div className="label-with-help">
            <label htmlFor="tripDate">{translations.tripDate}</label>
            <HelpTooltip text={translations.helpDate} />
          </div>
          <input
            type="date"
            id="tripDate"
            ref={tripDateRef}
            value={tripDate}
            onChange={e => setTripDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="label-with-help">
            <label htmlFor="tripTime">{translations.tripTime}</label>
            <HelpTooltip text={translations.helpTime} />
          </div>
          <input
            type="time"
            id="tripTime"
            value={tripTime}
            onChange={e => setTripTime(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="label-with-help">
            <label htmlFor="vehicleGroup">{translations.vehicleGroup}</label>
            <HelpTooltip text={translations.helpVehicleGroup} />
          </div>
          <select
            id="vehicleGroup"
            value={vehicleGroup}
            onChange={e => setVehicleGroup(e.target.value)}
          >
            <option value="1-4">1-4 {translations.seats}</option>
            <option value="5-6">5-6 {translations.seats}</option>
            <option value="7-8">7-8 {translations.seats}</option>
            <option value="9-16">9-16 {translations.seats}</option>
          </select>
        </div>

        <button className="btn btn-secondary empty-btn" onClick={onReset}>
          {translations.emptyAll}
        </button>
      </div>
    </>
  );
}
