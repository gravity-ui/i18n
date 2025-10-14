import { DefinePlugin } from 'webpack';
import { I18nPlugin } from './index.js';
import { DEFAULT_RUNTIME_LANGUAGE_VARIABLE_NAME, LANGUAGE_VARIABLE_NAME_ENV_KEY, } from './core/constants.js';
import { LanguageRuntimePlugin } from './webpack/runtime.js';
import { applySplitChunks, createI18nChunkExpression } from './webpack/chunks.js';
import { loadProjectConfig } from '@gravity-ui/i18n-cli';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import { TECH_LOCALE } from '@gravity-ui/i18n-babel-plugin';
import { DEFAULT_ASSETS_MANIFEST_FILE_NAME } from './constants.js';
const createAssetsManifestPlugins = (options) => {
    const { allowedLocales } = loadProjectConfig();
    let assetsManifestFileName = DEFAULT_ASSETS_MANIFEST_FILE_NAME;
    let locales = allowedLocales;
    if (typeof options === 'object') {
        if (options.assetsManifestFileName) {
            assetsManifestFileName = options.assetsManifestFileName;
        }
        if ('generateTechLocale' in options) {
            locales = [...allowedLocales, TECH_LOCALE];
        }
    }
    const hasLocale = createI18nChunkExpression(locales);
    return locales.map((locale) => new WebpackAssetsManifest({
        entrypoints: true,
        output: assetsManifestFileName.replace('{locale}', locale),
        transform: (assets) => {
            const entrypoints = assets.entrypoints;
            Object.keys(entrypoints).forEach((entrypoint) => {
                const jsAssets = entrypoints[entrypoint].assets.js;
                entrypoints[entrypoint].assets.js = jsAssets.filter((chunkName) => {
                    if (hasLocale.test(chunkName)) {
                        return chunkName.includes(`i18n.${locale}.`);
                    }
                    return true;
                });
            });
        },
    }));
};
function applyI18nOptimizePlugin(originalConfig, options) {
    const isProductionBuild = originalConfig.mode === 'production';
    const optimizeLocaleChunks = options?.optimizeLocaleChunks;
    const runtimeLanguageVariableName = typeof optimizeLocaleChunks === 'object'
        ? optimizeLocaleChunks.runtimeLanguageVariableName || DEFAULT_RUNTIME_LANGUAGE_VARIABLE_NAME
        : DEFAULT_RUNTIME_LANGUAGE_VARIABLE_NAME;
    const newConfig = {
        ...originalConfig,
        plugins: [
            ...(originalConfig.plugins || []),
            ...(isProductionBuild && optimizeLocaleChunks
                ? [
                    new DefinePlugin({
                        [LANGUAGE_VARIABLE_NAME_ENV_KEY]: runtimeLanguageVariableName,
                    }),
                    new LanguageRuntimePlugin(runtimeLanguageVariableName),
                    ...createAssetsManifestPlugins(optimizeLocaleChunks),
                ]
                : []),
            I18nPlugin.webpack(options),
        ],
    };
    if (isProductionBuild && optimizeLocaleChunks) {
        return {
            ...newConfig,
            // @ts-ignore Не совпадает тип optimization с rspack
            optimization: applySplitChunks(newConfig.optimization, options),
        };
    }
    return newConfig;
}
export default applyI18nOptimizePlugin;
export { applyI18nOptimizePlugin as 'module.exports' }; // eslint-disable-line
//# sourceMappingURL=webpack.js.map