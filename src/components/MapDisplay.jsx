import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useCtrlBoard } from '../hooks';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Global flag to ensure the Google Maps Loader is only initialized once
let mapsLoaderPromise = null;

export default function MapDisplay({
  startAddress,
  destAddress,
  viaAddresses = [],
  onRouteCalculated,
  onDistanceFromCentral, // New: callback for distance from central location
  routeTrigger,
  translations,
  lang = 'no',
  mapCenter = { lat: 60.6280, lng: 6.4118 }, // Default to Voss, Norway
  mapRegion = 'NO',
  centralAddress = 'Hestavangen 11, 5700 Voss' // Central location for distance warning
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const { trackMapApiCall, reportError } = useCtrlBoard();

  // Initialize Google Maps (only once, regardless of prop changes)
  useEffect(() => {
    const startTime = Date.now();

    // If the loader hasn't been created yet, create it with initial settings
    if (!mapsLoaderPromise) {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places'],
        language: lang, // Set once on first load
        region: mapRegion // Set once on first load
      });
      mapsLoaderPromise = loader.load();
    }

    // Use the existing loader promise (singleton pattern)
    mapsLoaderPromise.then(() => {
      const loadLatency = Date.now() - startTime;

      if (mapContainerRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
          center: mapCenter,
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#4a90e2',
            strokeWeight: 5
          }
        });

        setMapLoaded(true);

        // Track successful Maps API initialization
        trackMapApiCall('maps_js', loadLatency, { success: true });
      }
    }).catch(err => {
      const loadLatency = Date.now() - startTime;
      console.error('Google Maps failed to load:', err);
      setMapError(err.message);

      // Track Maps API initialization failure
      trackMapApiCall('maps_js', loadLatency, {
        success: false,
        error: err.message
      });

      // Report as incident
      reportError(err, {
        source: 'MapDisplay.jsx:Maps API initialization',
        severity: 'error',
        metadata: {
          apiKey: GOOGLE_MAPS_API_KEY ? 'present' : 'missing'
        }
      });
    });

    return () => {
      // Cleanup
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, []); // Empty deps — initialize only once

  // Update map center when mapCenter prop changes (e.g., control board updates tenant)
  useEffect(() => {
    if (mapInstanceRef.current && mapCenter) {
      mapInstanceRef.current.setCenter(mapCenter);
    }
  }, [mapCenter]);

  // Update route only when explicitly triggered (not on every address change)
  useEffect(() => {
    // Only proceed if routeTrigger > 0 (explicit trigger) or if it's the initial state
    if (routeTrigger === 0) {
      return;
    }

    if (!mapLoaded || !mapInstanceRef.current || !directionsRendererRef.current) {
      return;
    }

    if (!startAddress || !destAddress) {
      directionsRendererRef.current.setDirections({ routes: [] });
      return;
    }

    console.log(`[MapDisplay] Calculating route (trigger: ${routeTrigger})`);
    console.log(`[MapDisplay] From: ${startAddress} → To: ${destAddress}`);

    const directionsService = new window.google.maps.DirectionsService();

    // Build waypoints from via addresses
    const waypoints = viaAddresses
      .filter(addr => addr && addr.trim() !== '')
      .map(addr => ({
        location: addr,
        stopover: true
      }));

    if (waypoints.length > 0) {
      console.log(`[MapDisplay] Via points: ${waypoints.length}`);
    }

    const request = {
      origin: startAddress,
      destination: destAddress,
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      optimizeWaypoints: false
    };

    const requestStartTime = Date.now();

    directionsService.route(request, (result, status) => {
      const requestLatency = Date.now() - requestStartTime;

      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(result);

        // Calculate total distance and duration
        let totalDistance = 0;
        let totalDuration = 0;

        const route = result.routes[0];
        for (const leg of route.legs) {
          totalDistance += leg.distance.value; // meters
          totalDuration += leg.duration.value; // seconds
        }

        const distanceKm = totalDistance / 1000;
        const durationMin = Math.round(totalDuration / 60);

        console.log(`[MapDisplay] Route calculated: ${distanceKm.toFixed(2)} km, ${durationMin} min`);

        // Track successful Directions API call
        trackMapApiCall('directions', requestLatency, {
          success: true,
          distance: distanceKm,
          duration: durationMin,
          waypoints: waypoints.length
        });

        if (onRouteCalculated) {
          onRouteCalculated(distanceKm, durationMin);
        }
      } else {
        console.error(`[MapDisplay] Directions API request failed: ${status}`);
        directionsRendererRef.current.setDirections({ routes: [] });

        // Track failed Directions API call
        trackMapApiCall('directions', requestLatency, {
          success: false,
          error: status
        });

        // Report as incident if it's not a user input error
        if (status !== 'ZERO_RESULTS') {
          reportError(new Error(`Directions API failed: ${status}`), {
            source: 'MapDisplay.jsx:Directions API',
            severity: 'warning',
            metadata: {
              status,
              origin: startAddress,
              destination: destAddress,
              waypoints: waypoints.length
            }
          });
        }
      }
    });
  }, [mapLoaded, routeTrigger]);

  // Calculate distance from start address to central location (for pickup fee warning)
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) {
      return;
    }

    if (!startAddress || !onDistanceFromCentral) {
      return;
    }

    console.log(`[MapDisplay] Calculating distance from central: ${centralAddress} → ${startAddress}`);

    const distanceService = new window.google.maps.DistanceMatrixService();

    const request = {
      origins: [centralAddress],
      destinations: [startAddress],
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC
    };

    distanceService.getDistanceMatrix(request, (result, status) => {
      if (status === window.google.maps.DistanceMatrixStatus.OK) {
        const element = result.rows[0].elements[0];

        if (element.status === 'OK') {
          const distanceKm = element.distance.value / 1000;
          console.log(`[MapDisplay] Distance from central: ${distanceKm.toFixed(2)} km`);

          // Callback to App.jsx with the distance
          onDistanceFromCentral(distanceKm);
        } else {
          console.warn(`[MapDisplay] Distance calculation failed: ${element.status}`);
          onDistanceFromCentral(0); // Reset warning
        }
      } else {
        console.error(`[MapDisplay] DistanceMatrix API failed: ${status}`);
        onDistanceFromCentral(0); // Reset warning
      }
    });
  }, [mapLoaded, startAddress, centralAddress, onDistanceFromCentral]);

  return (
    <div className="card map-card" id="mapCard">
      <div className="card-title">{translations.mapTitle}</div>
      <div className="map-wrapper">
        {/* Map container - Google Maps will take this over completely */}
        <div
          className="map-container"
          ref={mapContainerRef}
          style={{ display: mapLoaded || mapError ? 'block' : 'none' }}
        />

        {/* Placeholder - separate from map container to avoid DOM conflicts */}
        {!mapLoaded && !mapError && (
          <div className="map-container map-loading">
            <div className="map-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              <div>{translations.mapPlaceholder}</div>
              <div style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.7 }}>
                {translations.mapSubtext}
              </div>
            </div>
          </div>
        )}

        {mapError && (
          <div className="map-container map-error">
            <div className="map-placeholder">
              <div style={{ color: '#e74c3c' }}>Map Error: {mapError}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
