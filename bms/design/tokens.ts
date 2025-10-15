// BMS Design Tokens (shared for Web & Mobile)
// Usage:
// - Web (Next.js): import { colors, radii, shadows, spacing, typography } from "../design/tokens"
// - Mobile (React Native): same imports; map to React Native Paper/NativeWind theme

export const colors = {
  // Brand
  brand: {
    green: {
      950: "#052726",
      900: "#064E3B", // very dark teal
      800: "#0F3D3A", // sidebar bg
      700: "#134E4A",
      600: "#0F766E",
      500: "#0D9488",
      400: "#14B8A6",
    },
    yellow: {
      900: "#8C6C00",
      800: "#A87E00",
      700: "#C49100",
      600: "#D9A800",
      500: "#F3C316", // menu item selected / accent
      400: "#FFD54F",
      300: "#FFE082",
    },
  },
  // Functional
  semantic: {
    success: {
      600: "#16A34A",
      500: "#22C55E",
      100: "#DCFCE7",
    },
    warning: {
      600: "#D97706",
      500: "#F59E0B",
      100: "#FEF3C7",
    },
    danger: {
      600: "#DC2626",
      500: "#EF4444",
      100: "#FEE2E2",
    },
    info: {
      600: "#2563EB",
      500: "#3B82F6",
      100: "#DBEAFE",
    },
  },
  // Neutrals
  gray: {
    950: "#0B1115",
    900: "#0F172A",
    800: "#1F2937",
    700: "#374151",
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
    300: "#D1D5DB",
    200: "#E5E7EB",
    100: "#F1F5F9",
    50: "#F8FAFC",
  },
  // Surfaces
  surface: {
    app: "#0F3D3A", // sidebar/topbar base
    header: "linear-gradient(90deg, #0F3D3A 0%, #0B2D2B 100%)",
    background: "#F8FAFC",
    card: "#FFFFFF",
    muted: "#F1F5F9",
    border: "#E5E7EB",
    overlay: "rgba(2, 6, 23, 0.5)",
  },
  text: {
    onDark: "#F8FAFC",
    onLight: "#0F172A",
    subtle: "#475569",
    inverse: "#0F172A",
  },
  // Component aliases
  component: {
    sidebarBg: "#0F3D3A",
    sidebarActive: "#F3C316",
    sidebarHover: "#134E4A",
    topbarBg: "#0F3D3A",
    primaryBtnBg: "#0D9488",
    primaryBtnText: "#FFFFFF",
    secondaryBtnBg: "#FFFFFF",
    secondaryBtnBorder: "#E5E7EB",
    secondaryBtnText: "#0F172A",
    link: "#0D9488",
    linkHover: "#0F766E",
    badgeSuccessBg: "#DCFCE7",
    badgeSuccessText: "#166534",
    badgeWarningBg: "#FEF3C7",
    badgeWarningText: "#92400E",
    badgeDangerBg: "#FEE2E2",
    badgeDangerText: "#991B1B",
  },
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const shadows = {
  xs: "0 1px 2px rgba(2, 6, 23, 0.06)",
  sm: "0 1px 3px rgba(2, 6, 23, 0.08), 0 1px 2px rgba(2, 6, 23, 0.04)",
  md: "0 4px 6px rgba(2, 6, 23, 0.08), 0 2px 4px rgba(2, 6, 23, 0.06)",
  lg: "0 10px 15px rgba(2, 6, 23, 0.08), 0 4px 6px rgba(2, 6, 23, 0.05)",
} as const;

export const typography = {
  fontFamily: {
    sans: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New'",
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const layout = {
  sidebar: {
    width: 264,
  },
  contentMaxWidth: 1280,
} as const;

export type Tokens = {
  colors: typeof colors;
  radii: typeof radii;
  spacing: typeof spacing;
  shadows: typeof shadows;
  typography: typeof typography;
  layout: typeof layout;
};

export const tokens: Tokens = { colors, radii, spacing, shadows, typography, layout };
