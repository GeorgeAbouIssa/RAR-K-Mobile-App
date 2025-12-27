/**
 * Battery indicator component - Visual battery/capacitor charge display
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BikeConfig } from '@/constants/bike-config';

interface BatteryIndicatorProps {
  level: number; // 0-100
  showPercentage?: boolean;
}

export function BatteryIndicator({ level, showPercentage = true }: BatteryIndicatorProps) {
  const batteryHigh = useThemeColor({}, 'batteryHigh' as any);
  const batteryMedium = useThemeColor({}, 'batteryMedium' as any);
  const batteryLow = useThemeColor({}, 'batteryLow' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  // Determine color based on battery level
  const getBatteryColor = () => {
    if (level > BikeConfig.battery.highThreshold) return batteryHigh;
    if (level > BikeConfig.battery.lowThreshold) return batteryMedium;
    return batteryLow;
  };

  const batteryColor = getBatteryColor();
  const clampedLevel = Math.max(0, Math.min(100, level));

  return (
    <ThemedView style={styles.container}>
      <View style={styles.batteryContainer}>
        {/* Battery outline */}
        <View style={[styles.batteryBody, { borderColor: borderColor }]}>
          {/* Battery fill */}
          <View
            style={[
              styles.batteryFill,
              {
                width: `${clampedLevel}%`,
                backgroundColor: batteryColor,
              },
            ]}
          />
        </View>
        {/* Battery tip */}
        <View style={[styles.batteryTip, { backgroundColor: borderColor }]} />
      </View>
      {showPercentage && (
        <ThemedText style={styles.percentageText}>
          {Math.round(clampedLevel)}%
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 80,
    height: 40,
    borderWidth: 2,
    borderRadius: 6,
    padding: 3,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
  batteryTip: {
    width: 6,
    height: 20,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    marginLeft: -1,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
