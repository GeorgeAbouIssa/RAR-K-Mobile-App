/**
 * Speedometer component - Displays current speed in a circular gauge
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SpeedometerProps {
  speed: number;
  maxSpeed?: number;
  unit?: 'km/h' | 'mph';
}

export function Speedometer({ speed, maxSpeed = 50, unit = 'km/h' }: SpeedometerProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const primaryColor = useThemeColor({}, 'primary' as any);
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border' as any);

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: speed,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [speed]);

  const displaySpeed = Math.round(speed);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.circle, { borderColor: borderColor }]}>
        {/* Speed value */}
        <ThemedText style={styles.speedText}>{displaySpeed}</ThemedText>
        <ThemedText style={styles.unitText}>{unit}</ThemedText>
        
        {/* Optional: Add a circular progress indicator */}
        <View style={[styles.progressRing, { borderColor: borderColor }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                borderColor: primaryColor,
                transform: [
                  { 
                    rotate: `${Math.min((speed / maxSpeed) * 360, 360)}deg` 
                  }
                ]
              }
            ]} 
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  speedText: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 18,
    marginTop: 4,
    opacity: 0.7,
  },
  progressRing: {
    position: 'absolute',
    width: 184,
    height: 184,
    borderRadius: 92,
    borderWidth: 4,
  },
  progressFill: {
    position: 'absolute',
    width: 184,
    height: 184,
    borderRadius: 92,
    borderWidth: 4,
    borderColor: 'transparent',
  },
});
