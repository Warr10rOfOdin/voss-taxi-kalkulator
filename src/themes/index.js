/**
 * Theme barrel export
 *
 * Import themes and utilities from this file:
 *   import { applyTheme, drivasDarkTheme, lightCleanTheme } from '../themes';
 */

export { themeVariables, applyTheme, removeTheme } from './themeDefaults';
export { default as drivasDarkTheme } from './drivasDark';
export { default as lightCleanTheme } from './lightClean';

/**
 * Registry of all available themes
 */
export const THEME_REGISTRY = {};

// Lazy-load to avoid circular deps
import drivasDarkTheme from './drivasDark';
import lightCleanTheme from './lightClean';

THEME_REGISTRY[drivasDarkTheme.id] = drivasDarkTheme;
THEME_REGISTRY[lightCleanTheme.id] = lightCleanTheme;

/**
 * Get a theme by its ID
 * @param {string} themeId
 * @returns {Object|null} Theme object or null
 */
export function getThemeById(themeId) {
  return THEME_REGISTRY[themeId] || null;
}
