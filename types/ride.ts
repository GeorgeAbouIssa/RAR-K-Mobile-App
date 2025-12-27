/**
 * Type definitions for ride history and data
 */

export interface Ride {
  id: string;
  startTime: Date;
  endTime: Date;
  distance: number; // km
  avgSpeed: number; // km/h
  maxSpeed: number;
  assistanceTime: number; // seconds
  energyRecovered: number; // Wh
  caloriesBurnt: number;
  route?: { lat: number; lng: number }[];
  elevationGain?: number; // meters
}
