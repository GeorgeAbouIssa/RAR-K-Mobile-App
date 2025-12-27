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
  const borderColor = useThemeColor({}, 'border' as any);

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: speed,
      useNativeDriver: false,
      friction: 8,
      tension:  40,
    }).start();
  }, [speed, animatedValue]);

  const displaySpeed = Math.round(speed);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.speedometerWrapper}>
        {/* Progress ring - now behind the circle */}
        <View style={[styles.progressRing, { borderColor: borderColor }]}>
        </View>

        {/* Main circle with speed display */}
        <View style={[styles.circle, { borderColor: borderColor }]}>
          <View style={styles.speedContainer}>
            <ThemedText style={styles.speedText}>{displaySpeed}</ThemedText>
            <ThemedText style={styles.unitText}>{unit}</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent:  'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  speedometerWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 216,
    height: 216,
    borderRadius: 108,
    borderWidth: 6,
    opacity: 0.3,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent:  'center',
    backgroundColor: 'transparent',
  },
  speedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  speedText: {
    fontSize: 80,
    fontWeight: '700',
    lineHeight: 64,
    letterSpacing: -5,
    marginBottom: 3,
    alignSelf: 'center',
  },
  unitText: {
    fontSize: 20,
    fontWeight: '500',
    opacity: 0.7,
    alignSelf: 'center',
  },
});