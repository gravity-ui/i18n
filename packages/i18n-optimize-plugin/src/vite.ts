/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import {I18nPlugin} from './index.js';

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import I18nPlugin from '@gravity-ui/i18n-optimize-plugin/vite'
 *
 * export default defineConfig({
 *   plugins: [I18nPlugin()],
 * })
 * ```
 */
const vite = I18nPlugin.vite as typeof I18nPlugin.vite;
export default vite;
export { vite as 'module.exports' } // eslint-disable-line
