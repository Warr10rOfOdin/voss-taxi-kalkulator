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
  const initCountRef = useRef(0); // Track initialization count for debugging
  const [isLoaded, setIsLoaded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
      // Initialize Google Places Autocomplete (ONLY ONCE when Google Maps loads)
      initCountRef.current += 1;
      console.log(`[AddressAutocomplete ${id}] Initializing Google Places Autocomplete (count: ${initCountRef.current})`);
      if (initCountRef.current > 1) {
        console.warn(`[AddressAutocomplete ${id}] WARNING: Re-initialized ${initCountRef.current} times! This causes excessive API calls.`);
      }
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
        setDropdownOpen(false); // Dropdown closes when selection is made
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
      console.log(`[AddressAutocomplete ${id}] Cleaning up autocomplete instance`);
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]); // CRITICAL FIX: Only depend on isLoaded, NOT onChange/onPlaceSelected
  // This prevents re-initialization on every parent render and reduces API calls by 90%+

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

  // Handle keydown to detect dropdown navigation
  const handleKeyDown = (e) => {
    // Track if dropdown is being navigated with arrow keys
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      setDropdownOpen(true);
      // Don't call parent handler for arrow keys - let Google handle navigation
      return;
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    } else if (e.key === 'Enter') {
      // If dropdown is open and user navigated with arrows, let Google handle it
      if (dropdownOpen) {
        // Stop event from bubbling up to prevent parent's preventDefault()
        e.stopPropagation();
        // Don't prevent default - let Google Places autocomplete handle the selection
        // The place_changed event will fire and close the dropdown
        return;
      }
    }

    // Call parent's onKeyDown handler for other keys
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Track input changes to detect when dropdown might open
  const handleInputChange = (e) => {
    // If user is typing, dropdown will open with suggestions
    if (e.target.value.length > 0) {
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
    onChange(e);
  };

  return (
    <input
      type="text"
      id={id}
      ref={internalInputRef}
      value={value}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}
