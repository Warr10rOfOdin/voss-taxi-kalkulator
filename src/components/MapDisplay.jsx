import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function MapDisplay({
  startAddress,
  destAddress,
  viaAddresses = [],
  onRouteCalculated,
  routeTrigger,
  translations
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  
  // Initialize Google Maps
  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
      language: 'no'
    });
    
    loader.load().then(() => {
      if (mapContainerRef.current && !mapInstanceRef.current) {
        // Default center on Voss, Norway
        const vossCenter = { lat: 60.6280, lng: 6.4118 };
        
        mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
          center: vossCenter,
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
      }
    }).catch(err => {
      console.error('Google Maps failed to load:', err);
      setMapError(err.message);
    });
    
    return () => {
      // Cleanup
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, []);
  
  // Update route when addresses change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !directionsRendererRef.current) {
      return;
    }
    
    if (!startAddress || !destAddress) {
      directionsRendererRef.current.setDirections({ routes: [] });
      return;
    }
    
    const directionsService = new window.google.maps.DirectionsService();
    
    // Build waypoints from via addresses
    const waypoints = viaAddresses
      .filter(addr => addr && addr.trim() !== '')
      .map(addr => ({
        location: addr,
        stopover: true
      }));
    
    const request = {
      origin: startAddress,
      destination: destAddress,
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      optimizeWaypoints: false
    };
    
    directionsService.route(request, (result, status) => {
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
        
        if (onRouteCalculated) {
          onRouteCalculated(distanceKm, durationMin);
        }
      } else {
        console.error('Directions request failed:', status);
        directionsRendererRef.current.setDirections({ routes: [] });
      }
    });
  }, [mapLoaded, startAddress, destAddress, viaAddresses, onRouteCalculated, routeTrigger]);
  
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
