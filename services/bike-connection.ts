/**
 * Bike connection service - handles Raspberry Pi communication
 * Currently uses mock data for development/testing
 */

import { BikeData } from '@/types/bike-data';

type BikeDataCallback = (data: BikeData) => void;

class BikeConnectionService {
  private connected: boolean = false;
  private listeners: BikeDataCallback[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private mockData: BikeData = {
    speed: 0,
    cadence: 0,
    torque: 0,
    power: 0,
    batteryLevel: 85,
    assistanceMode: 'off',
    motorActive: false,
  };

  /**
   * Connect to the Raspberry Pi
   */
  async connect(): Promise<boolean> {
    try {
      // TODO: Implement actual Bluetooth LE or WiFi connection
      // For now, simulate connection with mock data
      this.connected = true;
      this.startMockDataStream();
      return true;
    } catch (error) {
      console.error('Failed to connect to bike:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from the Raspberry Pi
   */
  disconnect(): void {
    this.connected = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Subscribe to real-time bike data
   */
  subscribe(callback: BikeDataCallback): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Set assistance mode
   */
  async setAssistanceMode(mode: BikeData['assistanceMode']): Promise<void> {
    // TODO: Send command to Raspberry Pi
    this.mockData.assistanceMode = mode;
    this.notifyListeners();
  }

  /**
   * Get current bike data
   */
  getCurrentData(): BikeData {
    return { ...this.mockData };
  }

  /**
   * Start mock data stream for development
   */
  private startMockDataStream(): void {
    let time = 0;
    this.intervalId = setInterval(() => {
      time += 0.5;
      
      // Simulate realistic cycling data
      const baseSpeed = 15 + Math.sin(time * 0.1) * 5;
      const isMoving = baseSpeed > 5;
      
      this.mockData = {
        speed: Math.max(0, baseSpeed + Math.random() * 2),
        cadence: isMoving ? 60 + Math.sin(time * 0.2) * 20 + Math.random() * 5 : 0,
        torque: isMoving ? 30 + Math.sin(time * 0.15) * 10 + Math.random() * 3 : 0,
        power: isMoving ? 120 + Math.sin(time * 0.12) * 40 + Math.random() * 10 : 0,
        batteryLevel: Math.max(0, 85 - time * 0.1),
        assistanceMode: this.mockData.assistanceMode,
        motorActive: this.mockData.assistanceMode !== 'off' && isMoving,
        temperature: this.mockData.temperature,
      };
      
      this.notifyListeners();
    }, 500); // Update every 500ms
  }

  /**
   * Notify all subscribers
   */
  private notifyListeners(): void {
    const data = { ...this.mockData };
    this.listeners.forEach((callback) => callback(data));
  }

  /**
   * Update temperature from weather API
   */
  setTemperature(temp: number): void {
    this.mockData.temperature = temp;
  }
}

// Export singleton instance
export const bikeConnection = new BikeConnectionService();
