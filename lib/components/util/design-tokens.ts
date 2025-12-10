/**
 * Open Data Hub Design System Tokens
 * Based on: https://opendatahub.com/community/design-guidelines/
 */

/**
 * Color Palette
 * Following Open Data Hub design guidelines
 */
export const colors = {
  // Primary Colors
  primary: '#FFFFFF', // White - Primary background color
  secondary: '#000000', // Black - Primary foreground/contrast color
  tertiary: '#f3f3f3', // Light gray - Subtle backgrounds
  quaternary: '#565e64', // Medium gray - Secondary text, borders

  // Text Colors
  text: {
    primary: '#212529', // Default font color
    secondary: '#565e64', // Secondary text
    inverse: '#FFFFFF', // Text on dark backgrounds
    muted: '#6c757d', // Muted/disabled text
  },

  // Functional Colors (using grayscale)
  success: '#000000',
  warning: '#565e64',
  error: '#000000',
  info: '#565e64',

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#f3f3f3',
    tertiary: '#e9ecef',
    inverse: '#000000',
  },

  // Border Colors
  border: {
    light: '#e9ecef',
    medium: '#dee2e6',
    dark: '#565e64',
  },

  // Shadow Colors (black with opacity)
  shadow: {
    sm: 'rgba(0, 0, 0, 0.1)',
    md: 'rgba(0, 0, 0, 0.15)',
    lg: 'rgba(0, 0, 0, 0.2)',
    xl: 'rgba(0, 0, 0, 0.25)',
  },
} as const

/**
 * Typography
 */
export const typography = {
  fontFamily: {
    primary: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"Source Code Pro", "Courier New", monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px', // Default body text size per guidelines
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  fontWeight: {
    regular: 400,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

/**
 * Spacing
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const

/**
 * Border Radius
 */
export const borderRadius = {
  none: '0',
  sm: '3px',
  md: '5px',
  lg: '10px',
  full: '9999px',
} as const

/**
 * Shadows
 */
export const shadows = {
  sm: `0 1px 2px 0 ${colors.shadow.sm}`,
  md: `0 2px 4px 0 ${colors.shadow.md}`,
  lg: `0 4px 8px 0 ${colors.shadow.lg}`,
  xl: `0 8px 16px 0 ${colors.shadow.xl}`,
  // Custom shadows for specific use cases
  card: `2px 2px 5px 1px ${colors.shadow.md}`,
  button: `0 2px 4px ${colors.shadow.sm}`,
  dropdown: `0 4px 12px ${colors.shadow.lg}`,
} as const

/**
 * Transitions
 */
export const transitions = {
  fast: '150ms ease-out',
  base: '250ms ease-out',
  slow: '350ms ease-out',
} as const

/**
 * Z-Index Scale
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

/**
 * Breakpoints (for reference)
 */
export const breakpoints = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
} as const
