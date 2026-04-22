// src/constants/theme.ts
export const COLORS = {
  primary: '#0D9E75',
  primaryDark: '#085041',
  primaryMid: '#1D9E75',
  primaryLight: '#9FE1CB',
  primarySurface: '#F0FDF8',

  secondary: '#E74C3C',   // rojo — deudas, errores
  warning: '#F39C12',     // naranja — vencimientos
  success: '#0D9E75',     // mismo verde — confirmaciones

  background: '#F0FDF8',
  white: '#FFFFFF',

  text: {
    primary: '#085041',
    secondary: '#0F6E56',
    light: '#9FE1CB',
    placeholder: '#5DCAA5',
  },
  border: '#9FE1CB',
  borderLight: '#E1F5EE',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#0D9E75',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0D9E75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0D9E75',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;