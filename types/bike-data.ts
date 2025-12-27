/**
 * Type definitions for bike data and real-time metrics
 */

export interface BikeData {
  speed: number; // km/h
  cadence: number; // RPM
  torque: number; // Nm
  power: number; // Watts
  batteryLevel: number; // percentage 0-100
  assistanceMode: 'off' | 'automatic' | 'hillClimb';
  motorActive: boolean;
  temperature?: number; // from weather API
}

export interface RealtimeMetrics {
  currentSpeed: number;
  distance: number;
  duration: number; // seconds
  calories: number;
  assistanceTime: number;
}
