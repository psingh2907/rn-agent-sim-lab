import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';

export type ThemeSetting = 'light' | 'dark' | 'system';

// "System" hands control back to the OS.
export function applyThemeSetting(setting: ThemeSetting) {
  Appearance.setColorScheme(setting === 'system' ? 'auto' : setting);
}

export function useIsDark() {
  return useColorScheme() === 'dark';
}

// useColorScheme() returns null (not 'unspecified') when there's no preference.
export function describeScheme(scheme: ColorSchemeName | null) {
  if (scheme === null) return 'Following the system';
  return scheme === 'dark' ? 'Dark' : 'Light';
}
