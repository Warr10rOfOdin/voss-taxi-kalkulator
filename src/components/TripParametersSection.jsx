import { useRef } from 'react';
import { InfoTooltip } from './common';
import { useFormValidation } from '../hooks';

/**
 * Trip Parameters Section Component
 *
 * Renders inputs for distance, duration, date, time, and vehicle group with
 * real-time validation and enhanced help tooltips
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
  // Form validation
  const { errors, touched, validateField, markAsTouched } = useFormValidation();
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
            <label htmlFor="distanceKm">{translations.kilometer}</label>
            <InfoTooltip
              content={translations.helpKilometer}
              position="top"
              ariaLabel="Help for distance input"
            />
          </div>
          <input
            type="number"
            id="distanceKm"
            ref={distanceKmRef}
            value={distanceKm}
            onChange={e => {
              setDistanceKm(e.target.value);
              if (touched.distanceKm) validateField('distanceKm', e.target.value);
            }}
            onBlur={e => {
              markAsTouched('distanceKm');
              validateField('distanceKm', e.target.value);
            }}
            onKeyDown={keyHandlers.handleDistanceKeydown}
            placeholder="100"
            min="0"
            step="0.1"
            aria-label={translations.kilometer}
            aria-invalid={touched.distanceKm && errors.distanceKm ? 'true' : 'false'}
            aria-describedby={touched.distanceKm && errors.distanceKm ? 'distanceKm-error' : undefined}
            className={touched.distanceKm && errors.distanceKm ? 'input-error' : ''}
          />
          {touched.distanceKm && errors.distanceKm && (
            <span id="distanceKm-error" className="error-message" role="alert">
              {errors.distanceKm}
            </span>
          )}
        </div>

        <div className="form-group flex-1">
          <div className="label-with-help">
            <label htmlFor="durationMin">{translations.minutter}</label>
            <InfoTooltip
              content={translations.helpMinutter}
              position="top"
              ariaLabel="Help for duration input"
            />
          </div>
          <input
            type="number"
            id="durationMin"
            ref={durationMinRef}
            value={durationMin}
            onChange={e => {
              setDurationMin(e.target.value);
              if (touched.durationMin) validateField('durationMin', e.target.value);
            }}
            onBlur={e => {
              markAsTouched('durationMin');
              validateField('durationMin', e.target.value);
            }}
            onKeyDown={keyHandlers.handleDurationKeydown}
            placeholder="90"
            min="0"
            step="1"
            aria-label={translations.minutter}
            aria-invalid={touched.durationMin && errors.durationMin ? 'true' : 'false'}
            aria-describedby={touched.durationMin && errors.durationMin ? 'durationMin-error' : undefined}
            className={touched.durationMin && errors.durationMin ? 'input-error' : ''}
          />
          {touched.durationMin && errors.durationMin && (
            <span id="durationMin-error" className="error-message" role="alert">
              {errors.durationMin}
            </span>
          )}
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
            <label htmlFor="tripDate">{translations.dato}</label>
            <InfoTooltip
              content={translations.helpDato}
              position="top"
              ariaLabel="Help for date input"
            />
          </div>
          <input
            type="date"
            id="tripDate"
            ref={tripDateRef}
            value={tripDate}
            onChange={e => {
              setTripDate(e.target.value);
              if (touched.tripDate) validateField('tripDate', e.target.value);
            }}
            onBlur={e => {
              markAsTouched('tripDate');
              validateField('tripDate', e.target.value);
            }}
            aria-label={translations.dato}
            aria-invalid={touched.tripDate && errors.tripDate ? 'true' : 'false'}
            aria-describedby={touched.tripDate && errors.tripDate ? 'tripDate-error' : undefined}
            className={touched.tripDate && errors.tripDate ? 'input-error' : ''}
          />
          {touched.tripDate && errors.tripDate && (
            <span id="tripDate-error" className="error-message" role="alert">
              {errors.tripDate}
            </span>
          )}
        </div>

        <div className="form-group">
          <div className="label-with-help">
            <label htmlFor="tripTime">{translations.starttid}</label>
            <InfoTooltip
              content={translations.helpStarttid}
              position="top"
              ariaLabel="Help for time input"
            />
          </div>
          <input
            type="time"
            id="tripTime"
            value={tripTime}
            onChange={e => {
              setTripTime(e.target.value);
              if (touched.tripTime) validateField('tripTime', e.target.value);
            }}
            onBlur={e => {
              markAsTouched('tripTime');
              validateField('tripTime', e.target.value);
            }}
            aria-label={translations.starttid}
            aria-invalid={touched.tripTime && errors.tripTime ? 'true' : 'false'}
            aria-describedby={touched.tripTime && errors.tripTime ? 'tripTime-error' : undefined}
            className={touched.tripTime && errors.tripTime ? 'input-error' : ''}
          />
          {touched.tripTime && errors.tripTime && (
            <span id="tripTime-error" className="error-message" role="alert">
              {errors.tripTime}
            </span>
          )}
        </div>

        <div className="form-group">
          <div className="label-with-help">
            <label htmlFor="vehicleGroup">{translations.kjoretoy}</label>
            <InfoTooltip
              content={translations.helpKjoretoy}
              position="top"
              ariaLabel="Help for vehicle selection"
            />
          </div>
          <select
            id="vehicleGroup"
            value={vehicleGroup}
            onChange={e => setVehicleGroup(e.target.value)}
            aria-label={translations.kjoretoy}
          >
            <option value="1-4">{translations.group14}</option>
            <option value="5-6">{translations.group56}</option>
            <option value="7-8">{translations.group78}</option>
            <option value="9-16">{translations.group916}</option>
          </select>
        </div>

        <button className="btn btn-secondary empty-btn" onClick={onReset}>
          {translations.emptyAll}
        </button>
      </div>
    </>
  );
}
