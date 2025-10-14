import {type Configuration, DefinePlugin} from '@rspack/core';
import {I18nPlugin} from './index.js';
import type {OptimizeLocaleChunks, Options} from './types.js';
import {
    DEFAULT_RUNTIME_LANGUAGE_VARIABLE_NAME,
    LANGUAGE_VARIABLE_NAME_ENV_KEY,
} from './core/constants.js';
import {LanguageRuntimePlugin} from './webpack/runtime.js';
import {applySplitChunks, createI18nChunkExpression} from './webpack/chunks.js';
import {loadProjectConfig} from '@gravity-ui/i18n-cli';
import {RspackManifestPlugin, type ManifestPluginOptions} from 'rspack-manifest-plugin';
import {TECH_LOCALE} from '@gravity-ui/i18n-babel-plugin';
import {DEFAULT_ASSETS_MANIFEST_FILE_NAME} from './constants.js';

type Entrypoints = Record<
    string,
    {
        assets: {
            js: string[];
            css: string[];
        };
    }
>;

const createAssetsManifestGenerator = (chunkIncludeFilter: (chunkName: string) => boolean) => {
    const generate: ManifestPluginOptions['generate'] = (seed, files, entries) => {
        const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
        }, seed);

        const entrypoints = Object.keys(entries).reduce<Entrypoints>((previous, name) => {
            return {
                ...previous,
                [name]: {
                    assets: {
                        js: entries[name]!.filter((chunkName) => {
                            return chunkName.endsWith('.js') && chunkIncludeFilter(chunkName);
                        }),
                        css: entries[name]!.filter((chunkName) => {
                            return chunkName.endsWith('.css') && chunkIncludeFilter(chunkName);
                        }),
                    },
                },
            };
        }, {});

        return {
            ...manifestFiles,
            entrypoints,
        };
    };

    return generate;
};

const createAssetsManifestPlugins = (options?: OptimizeLocaleChunks) => {
    const {allowedLocales} = loadProjectConfig();

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

    return locales.map(
        (locale) =>
            new RspackManifestPlugin({
                fileName: assetsManifestFileName.replace('{locale}', locale),
                writeToFileEmit: true,
                useLegacyEmit: true,
                publicPath: '',
                generate: createAssetsManifestGenerator((chunkName) => {
                    if (hasLocale.test(chunkName)) {
                        return chunkName.includes(`i18n.${locale}.`);
                    }

                    return true;
                }),
            }),
    );
};

function applyI18nOptimizePlugin(originalConfig: Configuration, options?: Options): Configuration {
    const isProductionBuild = originalConfig.mode === 'production';
    const optimizeLocaleChunks = options?.optimizeLocaleChunks;

    const runtimeLanguageVariableName =
        typeof optimizeLocaleChunks === 'object'
            ? optimizeLocaleChunks.runtimeLanguageVariableName ||
              DEFAULT_RUNTIME_LANGUAGE_VARIABLE_NAME
            : DEFAULT_RUNTIME_LANGUAGE_VARIABLE_NAME;

    const newConfig: Configuration = {
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
            I18nPlugin.rspack(options),
        ],
    };

    if (isProductionBuild && optimizeLocaleChunks) {
        return {
            ...newConfig,
            optimization: applySplitChunks(newConfig.optimization, options),
        };
    }

    return newConfig;
}

export default applyI18nOptimizePlugin;
export { applyI18nOptimizePlugin as 'module.exports' } // eslint-disable-line
