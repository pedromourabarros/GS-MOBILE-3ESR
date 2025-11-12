import { DefaultTheme } from 'react-native-paper';

/**
 * Tema personalizado do WorkWell
 */
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
    accent: '#03dac4',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    onSurface: '#000000',
    disabled: '#bdbdbd',
    placeholder: '#9e9e9e',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};
