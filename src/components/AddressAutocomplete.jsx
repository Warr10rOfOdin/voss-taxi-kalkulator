import { useEffect, useRef, useState } from 'react';

export default function AddressAutocomplete({
  value,
  onChange,
  onKeyDown,
  onPlaceSelected,
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
        let selectedAddress = '';

        if (place && place.formatted_address) {
          selectedAddress = place.formatted_address;
        } else if (place && place.name) {
          selectedAddress = place.name;
        }

        if (selectedAddress) {
          // Update the value
          onChange({ target: { value: selectedAddress } });

          // Smart cursor positioning: place cursor after street name for easy number entry
          setTimeout(() => {
            if (internalInputRef.current) {
              // Find position after street name (usually before first comma or after street name)
              // Norwegian addresses often have format: "Street name, Postal code City"
              const commaIndex = selectedAddress.indexOf(',');

              // If there's a comma, check if there's already a street number before it
              if (commaIndex !== -1) {
                const beforeComma = selectedAddress.substring(0, commaIndex).trim();
                // Check if it ends with a number (already has street number)
                const hasNumber = /\d+\s*$/.test(beforeComma);

                if (!hasNumber) {
                  // No number yet, position cursor before comma with a space
                  const newValue = selectedAddress.substring(0, commaIndex) + ' ' + selectedAddress.substring(commaIndex);
                  onChange({ target: { value: newValue } });

                  // Set cursor position after the added space (before comma)
                  const cursorPos = commaIndex + 1;
                  internalInputRef.current.setSelectionRange(cursorPos, cursorPos);
                  internalInputRef.current.focus();
                } else {
                  // Already has a number, just position at the end of the value
                  internalInputRef.current.setSelectionRange(selectedAddress.length, selectedAddress.length);
                }
              } else {
                // No comma, just add space at the end for street number
                const newValue = selectedAddress + ' ';
                onChange({ target: { value: newValue } });
                internalInputRef.current.setSelectionRange(newValue.length, newValue.length);
                internalInputRef.current.focus();
              }
            }
          }, 0);

          // Notify parent that a place was selected (for triggering route fetch)
          if (onPlaceSelected) {
            onPlaceSelected(place);
          }
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
  }, [isLoaded, onChange, onPlaceSelected]);

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
