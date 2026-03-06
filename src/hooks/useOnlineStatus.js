/**
 * Online Status Hook
 *
 * Detects when the user goes offline/online and returns the current status.
 */

import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      logger.info('[Network]', 'Connection restored');
      setIsOnline(true);
    }

    function handleOffline() {
      logger.warn('[Network]', 'Connection lost');
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
