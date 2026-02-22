/**
 * Theme Defaults
 *
 * Defines all CSS custom property names and their default values.
 * Every color, font, radius, and shadow used in App.css is defined here
 * as a CSS variable so themes can override any value.
 *
 * Naming convention: --{category}-{element}-{variant}
 */

export const themeVariables = {
  // === Brand Colors ===
  '--brand-primary': '#6366f1',        // Indigo (accent)
  '--brand-secondary': '#8b5cf6',      // Purple
  '--brand-tertiary': '#3b82f6',       // Blue
  '--brand-success': '#10b981',        // Green (prices)
  '--brand-success-light': '#6ee7b7',  // Light green
  '--brand-danger': '#e74c3c',         // Red (remove buttons)
  '--brand-danger-hover': '#c0392b',
  '--brand-warning': '#f59e0b',        // Orange (theme-color)
  '--brand-via-green': '#27ae60',      // Via point add button
  '--brand-via-green-hover': '#229954',

  // === Background Colors ===
  '--bg-body-1': '#0f1419',
  '--bg-body-2': '#1a1f2e',
  '--bg-body-3': '#0d1b2a',
  '--bg-body-4': '#162032',
  '--bg-body-5': '#0a1628',

  '--bg-card': 'rgba(20, 25, 40, 0.95)',
  '--bg-card-end': 'rgba(15, 20, 35, 0.92)',
  '--bg-card-top': 'rgba(24, 30, 45, 0.97)',
  '--bg-card-top-end': 'rgba(18, 24, 38, 0.95)',

  '--bg-input': 'rgba(15, 20, 35, 0.7)',
  '--bg-input-focus': 'rgba(20, 30, 50, 0.8)',
  '--bg-input-option': '#0d1117',

  '--bg-lang-switcher': 'rgba(15, 20, 35, 0.8)',
  '--bg-btn-secondary': 'rgba(30, 40, 55, 0.7)',
  '--bg-btn-secondary-hover': 'rgba(40, 50, 65, 0.8)',
  '--bg-btn-outline': 'rgba(20, 30, 45, 0.5)',
  '--bg-btn-outline-hover': 'rgba(30, 45, 65, 0.6)',

  '--bg-breakdown-row': 'rgba(20, 25, 40, 0.6)',
  '--bg-breakdown-row-end': 'rgba(15, 20, 35, 0.5)',
  '--bg-breakdown-row-hover': 'rgba(30, 40, 60, 0.7)',
  '--bg-breakdown-row-hover-end': 'rgba(25, 35, 50, 0.6)',

  '--bg-modal': '#16213e',
  '--bg-modal-backdrop': 'rgba(0, 0, 0, 0.7)',

  '--bg-map': '#1a1a2e',

  '--bg-tooltip': '#2a2a4a',
  '--bg-help-icon': 'rgba(255, 255, 255, 0.2)',
  '--bg-help-icon-hover': '#4a90e2',

  // Tariff table backgrounds
  '--bg-tariff-header': '#0f3460',
  '--bg-tariff-header-first': '#16213e',
  '--bg-tariff-row-label': '#1a2744',
  '--bg-tariff-cell': '#1e2d4a',

  // === Text Colors ===
  '--text-primary': '#e8eaed',
  '--text-secondary': '#c9d1d9',
  '--text-muted': 'rgba(200, 210, 220, 0.95)',
  '--text-label': 'rgba(200, 210, 220, 0.95)',
  '--text-faint': 'rgba(180, 190, 200, 0.95)',
  '--text-very-faint': 'rgba(170, 180, 190, 0.85)',
  '--text-placeholder': 'rgba(150, 160, 170, 0.6)',
  '--text-footer': 'rgba(150, 160, 170, 0.8)',
  '--text-tariff-notes': 'rgba(255, 255, 255, 0.75)',
  '--text-lang-btn': 'rgba(200, 200, 200, 0.7)',
  '--text-tooltip': '#e0e0e0',
  '--text-map-placeholder': 'rgba(255, 255, 255, 0.6)',

  // === Border Colors ===
  '--border-card': 'rgba(99, 102, 241, 0.15)',
  '--border-card-hover': 'rgba(99, 102, 241, 0.25)',
  '--border-card-top': 'rgba(99, 102, 241, 0.2)',
  '--border-input': 'rgba(99, 102, 241, 0.15)',
  '--border-input-focus': 'rgba(99, 102, 241, 0.4)',
  '--border-row': 'rgba(255, 255, 255, 0.1)',
  '--border-row-faint': 'rgba(255, 255, 255, 0.05)',
  '--border-tariff': '#2a2a4a',
  '--border-map-dashed': 'rgba(255, 255, 255, 0.2)',
  '--border-map-loading': '#3a3a5c',

  // === Typography ===
  '--font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  '--font-size-h1': '1.75rem',
  '--font-size-card-title': '1.2rem',
  '--font-size-body': '1rem',
  '--font-size-small': '0.9rem',
  '--font-size-tiny': '0.85rem',
  '--font-size-price': '2.5rem',

  // === Border Radius ===
  '--radius-card': '16px',
  '--radius-btn': '14px',
  '--radius-input': '10px',
  '--radius-lang-switcher': '12px',
  '--radius-modal': '12px',
  '--radius-price-box': '12px',
  '--radius-map': '8px',

  // === Shadows ===
  '--shadow-card': '0 8px 32px rgba(0, 0, 0, 0.5)',
  '--shadow-card-hover': '0 12px 48px rgba(0, 0, 0, 0.6)',
  '--shadow-input': '0 4px 15px rgba(0, 0, 0, 0.3)',
  '--shadow-btn': '0 4px 15px rgba(0, 0, 0, 0.2)',
  '--shadow-btn-hover': '0 8px 25px rgba(0, 0, 0, 0.3)',

  // === Glassmorphism ===
  '--blur-card': '20px',
  '--blur-card-top': '25px',
  '--blur-input': '10px',

  // === Animations ===
  '--animation-gradient-duration': '15s',
  '--animation-fade-duration': '0.6s',
  '--transition-speed': '0.3s',
};

/**
 * Apply a theme object to a DOM element by setting CSS custom properties
 * @param {HTMLElement} element - The element to apply styles to (usually document.documentElement)
 * @param {Object} theme - Theme overrides (partial — only need to include changed values)
 */
export function applyTheme(element, theme) {
  // Start with defaults
  const merged = { ...themeVariables, ...theme };

  Object.entries(merged).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

/**
 * Remove all theme CSS variables from an element
 * @param {HTMLElement} element
 */
export function removeTheme(element) {
  Object.keys(themeVariables).forEach((key) => {
    element.style.removeProperty(key);
  });
}
