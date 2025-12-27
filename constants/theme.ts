/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#00D9FF'; // Cyan for e-bike theme

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // E-bike specific colors
    primary: '#0a7ea4',
    secondary: '#00D9FF',
    batteryHigh: '#00C853', // Green > 50%
    batteryMedium: '#FFC107', // Yellow 20-50%
    batteryLow: '#F44336', // Red < 20%
    modeOff: '#9E9E9E',
    modeAutomatic: '#2196F3',
    modeHillClimb: '#FF9800',
    cardBackground: '#F5F5F5',
    border: '#E0E0E0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0A0E27', // Dark blue-black like reference
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // E-bike specific colors
    primary: '#00D9FF',
    secondary: '#0a7ea4',
    batteryHigh: '#00E676',
    batteryMedium: '#FFD54F',
    batteryLow: '#FF5252',
    modeOff: '#616161',
    modeAutomatic: '#42A5F5',
    modeHillClimb: '#FFB74D',
    cardBackground: '#1A1F3A',
    border: '#2C3E50',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
