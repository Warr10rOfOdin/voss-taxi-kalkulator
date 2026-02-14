import { useState, useCallback } from 'react';

/**
 * Custom hook for managing address inputs (start, destination, via points)
 *
 * @param {string} initialStart - Initial start address
 * @returns {Object} Address state and handlers
 */
export function useAddressInputs(initialStart = 'Hestavangen 11, Voss') {
  const [startAddress, setStartAddress] = useState(initialStart);
  const [destAddress, setDestAddress] = useState('');
  const [viaAddresses, setViaAddresses] = useState([]);

  // Add via point
  const addViaPoint = useCallback(() => {
    setViaAddresses(prev => [...prev, '']);
    return viaAddresses.length; // Return index of new via point
  }, [viaAddresses.length]);

  // Remove via point at index
  const removeViaPoint = useCallback((index) => {
    setViaAddresses(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update via point at index
  const updateViaPoint = useCallback((index, value) => {
    setViaAddresses(prev => {
      const newVias = [...prev];
      newVias[index] = value;
      return newVias;
    });
  }, []);

  // Reset all addresses
  const resetAddresses = useCallback(() => {
    setStartAddress(initialStart);
    setDestAddress('');
    setViaAddresses([]);
  }, [initialStart]);

  return {
    startAddress,
    setStartAddress,
    destAddress,
    setDestAddress,
    viaAddresses,
    addViaPoint,
    removeViaPoint,
    updateViaPoint,
    resetAddresses
  };
}
