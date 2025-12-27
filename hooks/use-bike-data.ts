/**
 * Hook for accessing real-time bike data
 */

import { useEffect, useState } from 'react';
import { BikeData } from '@/types/bike-data';
import { bikeConnection } from '@/services/bike-connection';

export function useBikeData() {
  const [bikeData, setBikeData] = useState<BikeData>(bikeConnection.getCurrentData());
  const [isConnected, setIsConnected] = useState(bikeConnection.isConnected());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-connect if not connected
    if (!isConnected) {
      bikeConnection
        .connect()
        .then((success) => {
          setIsConnected(success);
          if (!success) {
            setError('Failed to connect to bike');
          }
        })
        .catch((err) => {
          setError(err.message);
        });
    }

    // Subscribe to data updates
    const unsubscribe = bikeConnection.subscribe((data) => {
      setBikeData(data);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  const setAssistanceMode = async (mode: BikeData['assistanceMode']) => {
    try {
      await bikeConnection.setAssistanceMode(mode);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    bikeData,
    isConnected,
    error,
    setAssistanceMode,
  };
}
