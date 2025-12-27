/**
 * Calories calculator - estimates calories burned based on cycling metrics
 */

import { BikeConfig } from '@/constants/bike-config';

class CaloriesCalculator {
  private riderWeight: number = BikeConfig.defaultRiderWeight;

  /**
   * Set rider weight
   */
  setRiderWeight(weight: number): void {
    this.riderWeight = weight;
  }

  /**
   * Calculate calories burned
   * @param duration Duration in seconds
   * @param avgSpeed Average speed in km/h
   * @param cadence Average cadence in RPM
   * @param assistanceActive Whether motor assistance was active
   */
  calculateCalories(
    duration: number,
    avgSpeed: number,
    cadence: number = 0,
    assistanceActive: boolean = false
  ): number {
    // Determine MET value based on speed
    let met = this.getMETFromSpeed(avgSpeed);

    // Adjust MET based on cadence if available
    if (cadence > 0) {
      met = this.adjustMETForCadence(met, cadence);
    }

    // Reduce calories if motor assistance was active
    if (assistanceActive) {
      met *= BikeConfig.calories.assistanceFactor;
    }

    // Calculate calories: MET * weight (kg) * duration (hours)
    const durationHours = duration / 3600;
    const calories = met * this.riderWeight * durationHours;

    return Math.round(calories);
  }

  /**
   * Calculate real-time calorie burn rate (calories per hour)
   */
  calculateCalorieRate(
    speed: number,
    cadence: number = 0,
    assistanceActive: boolean = false
  ): number {
    return this.calculateCalories(3600, speed, cadence, assistanceActive);
  }

  /**
   * Get MET value based on cycling speed
   */
  private getMETFromSpeed(speed: number): number {
    if (speed < 16) {
      return BikeConfig.calories.metLow;
    } else if (speed < 19) {
      return BikeConfig.calories.metModerate;
    } else if (speed < 22) {
      return BikeConfig.calories.metHigh;
    } else {
      return BikeConfig.calories.metVeryHigh;
    }
  }

  /**
   * Adjust MET value based on cadence
   * Higher cadence at same speed indicates more effort
   */
  private adjustMETForCadence(met: number, cadence: number): number {
    // Optimal cadence is around 80-90 RPM
    // Higher or lower cadence increases effort
    const optimalCadence = 85;
    const cadenceDiff = Math.abs(cadence - optimalCadence);
    
    // Increase MET by up to 15% based on cadence deviation
    const adjustment = 1 + (cadenceDiff / 100) * 0.15;
    return met * adjustment;
  }
}

export const caloriesCalculator = new CaloriesCalculator();
