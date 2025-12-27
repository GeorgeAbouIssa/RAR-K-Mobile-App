/**
 * Assistance mode selector component - Three-state toggle for bike assistance modes
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BikeData } from '@/types/bike-data';

interface AssistanceModeSelectorProps {
  mode: BikeData['assistanceMode'];
  onModeChange: (mode: BikeData['assistanceMode']) => void;
}

const modes: { value: BikeData['assistanceMode']; label: string; icon: string }[] = [
  { value: 'off', label: 'OFF', icon: '⭕' },
  { value: 'automatic', label: 'AUTO', icon: '⚡' },
  { value: 'hillClimb', label: 'CLIMB', icon: '⛰️' },
];

export function AssistanceModeSelector({ mode, onModeChange }: AssistanceModeSelectorProps) {
  const modeOff = useThemeColor({}, 'modeOff' as any);
  const modeAutomatic = useThemeColor({}, 'modeAutomatic' as any);
  const modeHillClimb = useThemeColor({}, 'modeHillClimb' as any);
  const cardBackground = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);
  const selectedTextColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'text');

  const getModeColor = (modeValue: BikeData['assistanceMode']) => {
    switch (modeValue) {
      case 'off':
        return modeOff;
      case 'automatic':
        return modeAutomatic;
      case 'hillClimb':
        return modeHillClimb;
      default:
        return modeOff;
    }
  };

  const handleModePress = (newMode: BikeData['assistanceMode']) => {
    if (newMode !== mode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onModeChange(newMode);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Assistance Mode</ThemedText>
      <View style={styles.modesContainer}>
        {modes.map((modeOption) => {
          const isSelected = mode === modeOption.value;
          const modeColor = getModeColor(modeOption.value);

          return (
            <Pressable
              key={modeOption.value}
              onPress={() => handleModePress(modeOption.value)}
              style={({ pressed }) => [
                styles.modeButton,
                {
                  backgroundColor: isSelected ? modeColor : cardBackground,
                  borderColor: isSelected ? modeColor : borderColor,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <ThemedText style={[styles.modeIcon, { opacity: isSelected ? 1 : 0.5 }]}>
                {modeOption.icon}
              </ThemedText>
              <ThemedText
                style={[
                  styles.modeLabel,
                  {
                    color: isSelected ? selectedTextColor : undefined,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {modeOption.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modesContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  modeLabel: {
    fontSize: 12,
  },
});
