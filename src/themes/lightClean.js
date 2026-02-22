/**
 * Light Clean Theme
 *
 * A professional light theme alternative — demonstrates the
 * theming system works for customers who prefer a light UI.
 */

const lightCleanTheme = {
  id: 'light-clean',
  name: 'Light Clean',
  description: 'Clean light theme with blue accents',

  variables: {
    // === Brand Colors ===
    '--brand-primary': '#2563eb',
    '--brand-secondary': '#3b82f6',
    '--brand-tertiary': '#1d4ed8',
    '--brand-success': '#059669',
    '--brand-success-light': '#34d399',
    '--brand-warning': '#d97706',

    // === Backgrounds ===
    '--bg-body-1': '#f0f4f8',
    '--bg-body-2': '#e2e8f0',
    '--bg-body-3': '#f0f4f8',
    '--bg-body-4': '#e2e8f0',
    '--bg-body-5': '#f0f4f8',

    '--bg-card': 'rgba(255, 255, 255, 0.95)',
    '--bg-card-end': 'rgba(248, 250, 252, 0.92)',
    '--bg-card-top': 'rgba(255, 255, 255, 0.98)',
    '--bg-card-top-end': 'rgba(248, 250, 252, 0.96)',

    '--bg-input': 'rgba(255, 255, 255, 0.9)',
    '--bg-input-focus': 'rgba(255, 255, 255, 1)',
    '--bg-input-option': '#ffffff',

    '--bg-lang-switcher': 'rgba(241, 245, 249, 0.9)',
    '--bg-btn-secondary': 'rgba(241, 245, 249, 0.9)',
    '--bg-btn-secondary-hover': 'rgba(226, 232, 240, 0.9)',
    '--bg-btn-outline': 'rgba(255, 255, 255, 0.7)',
    '--bg-btn-outline-hover': 'rgba(241, 245, 249, 0.9)',

    '--bg-breakdown-row': 'rgba(248, 250, 252, 0.8)',
    '--bg-breakdown-row-end': 'rgba(241, 245, 249, 0.7)',
    '--bg-breakdown-row-hover': 'rgba(237, 242, 247, 0.9)',
    '--bg-breakdown-row-hover-end': 'rgba(226, 232, 240, 0.8)',

    '--bg-modal': '#ffffff',
    '--bg-modal-backdrop': 'rgba(0, 0, 0, 0.4)',

    '--bg-map': '#f8fafc',

    '--bg-tooltip': '#1e293b',
    '--bg-help-icon': 'rgba(0, 0, 0, 0.1)',
    '--bg-help-icon-hover': '#2563eb',

    '--bg-tariff-header': '#2563eb',
    '--bg-tariff-header-first': '#1e40af',
    '--bg-tariff-row-label': '#eff6ff',
    '--bg-tariff-cell': '#f8fafc',

    // === Text Colors ===
    '--text-primary': '#1e293b',
    '--text-secondary': '#334155',
    '--text-muted': 'rgba(51, 65, 85, 0.9)',
    '--text-label': 'rgba(51, 65, 85, 0.95)',
    '--text-faint': 'rgba(71, 85, 105, 0.9)',
    '--text-very-faint': 'rgba(100, 116, 139, 0.85)',
    '--text-placeholder': 'rgba(148, 163, 184, 0.8)',
    '--text-footer': 'rgba(100, 116, 139, 0.9)',
    '--text-tariff-notes': 'rgba(51, 65, 85, 0.75)',
    '--text-lang-btn': 'rgba(71, 85, 105, 0.8)',
    '--text-tooltip': '#e2e8f0',
    '--text-map-placeholder': 'rgba(100, 116, 139, 0.7)',

    // === Border Colors ===
    '--border-card': 'rgba(37, 99, 235, 0.15)',
    '--border-card-hover': 'rgba(37, 99, 235, 0.3)',
    '--border-card-top': 'rgba(37, 99, 235, 0.2)',
    '--border-input': 'rgba(203, 213, 225, 0.8)',
    '--border-input-focus': 'rgba(37, 99, 235, 0.5)',
    '--border-row': 'rgba(226, 232, 240, 0.8)',
    '--border-row-faint': 'rgba(226, 232, 240, 0.5)',
    '--border-tariff': '#cbd5e1',
    '--border-map-dashed': 'rgba(148, 163, 184, 0.4)',
    '--border-map-loading': '#cbd5e1',

    // === Shadows ===
    '--shadow-card': '0 4px 16px rgba(0, 0, 0, 0.08)',
    '--shadow-card-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
    '--shadow-input': '0 2px 8px rgba(0, 0, 0, 0.06)',
    '--shadow-btn': '0 2px 8px rgba(0, 0, 0, 0.08)',
    '--shadow-btn-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',

    // === Glassmorphism (lighter in light mode) ===
    '--blur-card': '12px',
    '--blur-card-top': '15px',
    '--blur-input': '8px',
  }
};

export default lightCleanTheme;
