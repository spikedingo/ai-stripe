/**
 * UI Design System Guide - ChatGPT Style
 * 
 * This file defines the design tokens and guidelines for the entire project.
 * All components and pages should follow these specifications to maintain
 * a consistent ChatGPT-like visual style.
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colors = {
  // Background colors
  background: {
    primary: '#212121',      // Main content area
    secondary: '#171717',    // Sidebar, secondary panels
    tertiary: '#2f2f2f',     // Cards, elevated surfaces
    input: '#303030',        // Input fields background
    hover: '#3a3a3a',        // Hover state for interactive elements
    active: '#424242',       // Active/pressed state
  },

  // Text colors
  text: {
    primary: '#ececec',      // Main text
    secondary: '#b4b4b4',    // Secondary/muted text
    tertiary: '#8e8e8e',     // Placeholder, disabled text
    inverse: '#171717',      // Text on light backgrounds
  },

  // Border colors
  border: {
    default: '#424242',      // Default borders
    subtle: '#2f2f2f',       // Subtle dividers
    focus: '#10a37f',        // Focus ring
  },

  // Accent colors (OpenAI Green)
  accent: {
    primary: '#10a37f',      // Primary action color
    hover: '#0d8c6d',        // Hover state
    active: '#0a7a5c',       // Active/pressed state
    light: '#1a7f64',        // Light variant
  },

  // Semantic colors
  semantic: {
    success: '#10a37f',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Message colors
  message: {
    user: '#212121',         // User message background
    assistant: '#212121',    // Assistant message background (same in new ChatGPT)
    system: '#2f2f2f',       // System message background
  },
} as const;

// Light mode colors (optional, ChatGPT style is primarily dark)
export const lightColors = {
  background: {
    primary: '#ffffff',
    secondary: '#f7f7f8',
    tertiary: '#ececec',
    input: '#ffffff',
    hover: '#f0f0f0',
    active: '#e5e5e5',
  },
  text: {
    primary: '#171717',
    secondary: '#6b6b6b',
    tertiary: '#9b9b9b',
    inverse: '#ffffff',
  },
  border: {
    default: '#e5e5e5',
    subtle: '#f0f0f0',
    focus: '#10a37f',
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: '"Söhne", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
    mono: '"Söhne Mono", Monaco, "Andale Mono", "Ubuntu Mono", monospace',
  },

  // Font sizes (rem based)
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '1.75',
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',     // 4px - Small elements
  default: '0.5rem', // 8px - Buttons, inputs
  md: '0.75rem',     // 12px - Cards
  lg: '1rem',        // 16px - Large cards, modals
  xl: '1.5rem',      // 24px - Chat bubbles, large containers
  '2xl': '2rem',     // 32px - Extra large elements
  full: '9999px',    // Pills, avatars
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
  // Special shadows for dark mode
  glow: '0 0 20px rgba(16, 163, 127, 0.3)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
} as const;

// =============================================================================
// TRANSITIONS
// =============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    default: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// LAYOUT
// =============================================================================

export const layout = {
  sidebar: {
    width: '260px',
    collapsedWidth: '0px',
  },
  content: {
    maxWidth: '48rem', // 768px - Chat message max width
    padding: '1.5rem',
  },
  header: {
    height: '56px',
  },
  inputArea: {
    maxWidth: '48rem',
    padding: '1rem',
  },
} as const;

// =============================================================================
// COMPONENT STYLES
// =============================================================================

export const components = {
  // Button variants
  button: {
    primary: {
      background: colors.accent.primary,
      color: colors.text.inverse,
      hoverBackground: colors.accent.hover,
      activeBackground: colors.accent.active,
      borderRadius: borderRadius.default,
      padding: `${spacing[2.5]} ${spacing[4]}`,
    },
    secondary: {
      background: colors.background.tertiary,
      color: colors.text.primary,
      hoverBackground: colors.background.hover,
      activeBackground: colors.background.active,
      border: `1px solid ${colors.border.default}`,
      borderRadius: borderRadius.default,
      padding: `${spacing[2.5]} ${spacing[4]}`,
    },
    ghost: {
      background: 'transparent',
      color: colors.text.secondary,
      hoverBackground: colors.background.hover,
      activeBackground: colors.background.active,
      borderRadius: borderRadius.default,
      padding: `${spacing[2]} ${spacing[3]}`,
    },
    icon: {
      background: 'transparent',
      color: colors.text.secondary,
      hoverBackground: colors.background.hover,
      borderRadius: borderRadius.default,
      padding: spacing[2],
    },
  },

  // Input styles
  input: {
    background: colors.background.input,
    color: colors.text.primary,
    placeholderColor: colors.text.tertiary,
    border: `1px solid ${colors.border.default}`,
    focusBorder: colors.border.focus,
    borderRadius: borderRadius.xl,
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.fontSize.base,
  },

  // Card styles
  card: {
    background: colors.background.tertiary,
    border: `1px solid ${colors.border.subtle}`,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    shadow: shadows.md,
  },

  // Message bubble styles
  messageBubble: {
    maxWidth: layout.content.maxWidth,
    padding: `${spacing[4]} ${spacing[6]}`,
    borderRadius: borderRadius.lg,
    user: {
      background: colors.message.user,
    },
    assistant: {
      background: colors.message.assistant,
    },
  },

  // Sidebar styles
  sidebar: {
    background: colors.background.secondary,
    width: layout.sidebar.width,
    itemPadding: `${spacing[2.5]} ${spacing[3]}`,
    itemBorderRadius: borderRadius.default,
    itemHoverBackground: colors.background.hover,
    itemActiveBackground: colors.background.active,
  },

  // Modal styles
  modal: {
    background: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    shadow: shadows.xl,
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  // Tooltip styles
  tooltip: {
    background: colors.background.active,
    color: colors.text.primary,
    borderRadius: borderRadius.sm,
    padding: `${spacing[1]} ${spacing[2]}`,
    fontSize: typography.fontSize.sm,
  },
} as const;

// =============================================================================
// CSS CUSTOM PROPERTIES (for use in globals.css)
// =============================================================================

export const cssVariables = `
  /* Background colors */
  --bg-primary: ${colors.background.primary};
  --bg-secondary: ${colors.background.secondary};
  --bg-tertiary: ${colors.background.tertiary};
  --bg-input: ${colors.background.input};
  --bg-hover: ${colors.background.hover};
  --bg-active: ${colors.background.active};

  /* Text colors */
  --text-primary: ${colors.text.primary};
  --text-secondary: ${colors.text.secondary};
  --text-tertiary: ${colors.text.tertiary};
  --text-inverse: ${colors.text.inverse};

  /* Border colors */
  --border-default: ${colors.border.default};
  --border-subtle: ${colors.border.subtle};
  --border-focus: ${colors.border.focus};

  /* Accent colors */
  --accent-primary: ${colors.accent.primary};
  --accent-hover: ${colors.accent.hover};
  --accent-active: ${colors.accent.active};

  /* Semantic colors */
  --color-success: ${colors.semantic.success};
  --color-warning: ${colors.semantic.warning};
  --color-error: ${colors.semantic.error};
  --color-info: ${colors.semantic.info};

  /* Typography */
  --font-sans: ${typography.fontFamily.sans};
  --font-mono: ${typography.fontFamily.mono};

  /* Layout */
  --sidebar-width: ${layout.sidebar.width};
  --content-max-width: ${layout.content.maxWidth};
  --header-height: ${layout.header.height};

  /* Transitions */
  --transition-fast: ${transitions.duration.fast};
  --transition-default: ${transitions.duration.default};
  --transition-slow: ${transitions.duration.slow};
`;

// =============================================================================
// TAILWIND CSS UTILITY CLASSES (Common patterns)
// =============================================================================

/**
 * Common Tailwind CSS class patterns for ChatGPT-style components
 * Use these as references when building components
 */
export const tailwindPatterns = {
  // Layout patterns
  layout: {
    page: 'min-h-screen bg-bg-primary text-text-primary',
    sidebar: 'w-[260px] bg-bg-secondary h-screen flex flex-col',
    mainContent: 'flex-1 flex flex-col',
    chatContainer: 'flex-1 overflow-y-auto',
    inputArea: 'border-t border-border-subtle p-4',
  },

  // Button patterns
  button: {
    primary: 'bg-accent-primary hover:bg-accent-hover active:bg-accent-active text-text-inverse rounded-lg px-4 py-2.5 font-medium transition-colors duration-200',
    secondary: 'bg-bg-tertiary hover:bg-bg-hover active:bg-bg-active text-text-primary border border-border-default rounded-lg px-4 py-2.5 transition-colors duration-200',
    ghost: 'hover:bg-bg-hover active:bg-bg-active text-text-secondary rounded-lg px-3 py-2 transition-colors duration-200',
    icon: 'hover:bg-bg-hover text-text-secondary rounded-lg p-2 transition-colors duration-200',
  },

  // Input patterns
  input: {
    default: 'bg-bg-input text-text-primary placeholder:text-text-tertiary border border-border-default focus:border-border-focus focus:outline-none rounded-xl px-4 py-3 transition-colors duration-200',
    textarea: 'bg-bg-input text-text-primary placeholder:text-text-tertiary border border-border-default focus:border-border-focus focus:outline-none rounded-xl px-4 py-3 resize-none transition-colors duration-200',
  },

  // Card patterns
  card: {
    default: 'bg-bg-tertiary border border-border-subtle rounded-lg p-4',
    elevated: 'bg-bg-tertiary border border-border-subtle rounded-lg p-4 shadow-md',
  },

  // Message patterns
  message: {
    container: 'max-w-3xl mx-auto px-6 py-4',
    user: 'flex justify-end',
    assistant: 'flex justify-start',
    bubble: 'rounded-lg px-4 py-3 max-w-[85%]',
  },

  // Sidebar patterns
  sidebarItem: {
    default: 'flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors duration-200 cursor-pointer',
    active: 'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-active',
  },

  // Typography patterns
  text: {
    heading1: 'text-4xl font-semibold text-text-primary',
    heading2: 'text-2xl font-semibold text-text-primary',
    heading3: 'text-xl font-medium text-text-primary',
    body: 'text-base text-text-primary leading-relaxed',
    small: 'text-sm text-text-secondary',
    muted: 'text-text-tertiary',
  },
} as const;

// Export default design system
const designSystem = {
  colors,
  lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  layout,
  components,
  cssVariables,
  tailwindPatterns,
};

export default designSystem;






