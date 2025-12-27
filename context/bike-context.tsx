/**
 * Bike context - Global state management for e-bike system
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BikeData, RealtimeMetrics } from '@/types/bike-data';
import { bikeConnection } from '@/services/bike-connection';

interface BikeContextType {
  bikeData: BikeData;
  realtimeMetrics: RealtimeMetrics;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  setAssistanceMode: (mode: BikeData['assistanceMode']) => Promise<void>;
  startRide: () => void;
  endRide: () => void;
  isRideActive: boolean;
}

const BikeContext = createContext<BikeContextType | undefined>(undefined);

interface BikeProviderProps {
  children: ReactNode;
}

export function BikeProvider({ children }: BikeProviderProps) {
  const [bikeData, setBikeData] = useState<BikeData>({
    speed: 0,
    cadence: 0,
    torque: 0,
    power: 0,
    batteryLevel: 0,
    assistanceMode: 'off',
    motorActive: false,
  });

  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics>({
    currentSpeed: 0,
    distance: 0,
    duration: 0,
    calories: 0,
    assistanceTime: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isRideActive, setIsRideActive] = useState(false);
  const [rideStartTime, setRideStartTime] = useState<number>(0);

  // Subscribe to bike data updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = bikeConnection.subscribe((data) => {
      setBikeData(data);
      
      // Update realtime metrics if ride is active
      if (isRideActive) {
        const now = Date.now();
        const duration = Math.floor((now - rideStartTime) / 1000);
        
        setRealtimeMetrics((prev) => ({
          currentSpeed: data.speed,
          distance: prev.distance + (data.speed / 3600) * 0.5, // Approximate
          duration,
          calories: prev.calories, // Updated by calories service
          assistanceTime: data.motorActive 
            ? prev.assistanceTime + 0.5 
            : prev.assistanceTime,
        }));
      }
    });

    return unsubscribe;
  }, [isConnected, isRideActive, rideStartTime]);

  const connect = async () => {
    const success = await bikeConnection.connect();
    setIsConnected(success);
  };

  const disconnect = () => {
    bikeConnection.disconnect();
    setIsConnected(false);
  };

  const setAssistanceMode = async (mode: BikeData['assistanceMode']) => {
    await bikeConnection.setAssistanceMode(mode);
  };

  const startRide = () => {
    setIsRideActive(true);
    setRideStartTime(Date.now());
    setRealtimeMetrics({
      currentSpeed: 0,
      distance: 0,
      duration: 0,
      calories: 0,
      assistanceTime: 0,
    });
  };

  const endRide = () => {
    setIsRideActive(false);
  };

  const value: BikeContextType = {
    bikeData,
    realtimeMetrics,
    isConnected,
    connect,
    disconnect,
    setAssistanceMode,
    startRide,
    endRide,
    isRideActive,
  };

  return <BikeContext.Provider value={value}>{children}</BikeContext.Provider>;
}

export function useBikeContext() {
  const context = useContext(BikeContext);
  if (context === undefined) {
    throw new Error('useBikeContext must be used within a BikeProvider');
  }
  return context;
}
