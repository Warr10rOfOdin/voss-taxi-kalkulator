import { useEffect, useRef, useState } from 'react';

export default function AddressAutocomplete({
  value,
  onChange,
  onKeyDown,
  placeholder,
  id,
  inputRef,
  apiKey
}) {
  const autocompleteRef = useRef(null);
  const internalInputRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for Google Maps API to be available
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
    } else {
      // Poll for Google Maps API
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !internalInputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      // Initialize Google Places Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        internalInputRef.current,
        {
          componentRestrictions: { country: 'no' }, // Restrict to Norway
          fields: ['formatted_address', 'geometry', 'name'],
          types: ['geocode', 'establishment'] // Addresses and places
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.formatted_address) {
          onChange({ target: { value: place.formatted_address } });
        } else if (place && place.name) {
          onChange({ target: { value: place.name } });
        }
      });
    } catch (error) {
      console.error('Failed to initialize Google Places Autocomplete:', error);
    }

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, onChange]);

  // Sync the external ref with internal ref
  useEffect(() => {
    if (inputRef && internalInputRef.current) {
      if (typeof inputRef === 'function') {
        inputRef(internalInputRef.current);
      } else {
        inputRef.current = internalInputRef.current;
      }
    }
  }, [inputRef]);

  return (
    <input
      type="text"
      id={id}
      ref={internalInputRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}
