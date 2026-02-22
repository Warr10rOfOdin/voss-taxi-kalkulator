/**
 * Theme barrel export
 *
 * Import themes and utilities from this file:
 *   import { applyTheme, vossTaxiTheme, lightCleanTheme } from '../themes';
 */

export { themeVariables, applyTheme, removeTheme } from './themeDefaults';
export { default as vossTaxiTheme } from './vossTaxi';
export { default as lightCleanTheme } from './lightClean';

/**
 * Registry of all available themes
 */
export const THEME_REGISTRY = {};

// Lazy-load to avoid circular deps
import vossTaxiTheme from './vossTaxi';
import lightCleanTheme from './lightClean';

THEME_REGISTRY[vossTaxiTheme.id] = vossTaxiTheme;
THEME_REGISTRY[lightCleanTheme.id] = lightCleanTheme;

/**
 * Get a theme by its ID
 * @param {string} themeId
 * @returns {Object|null} Theme object or null
 */
export function getThemeById(themeId) {
  return THEME_REGISTRY[themeId] || null;
}
