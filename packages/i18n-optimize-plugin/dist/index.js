import { createUnplugin } from 'unplugin';
import { transformTranslationFile } from './core/transformTranslationFile.js';
import { loadProjectConfig } from '@gravity-ui/i18n-cli';
import { TECH_LOCALE } from '@gravity-ui/i18n-babel-plugin';
const MESSAGE_FORMAT_PARSER_ALIAS = {
    '@formatjs/icu-messageformat-parser': '@formatjs/icu-messageformat-parser/no-parser',
};
function isTranslationsFile(filePath) {
    return filePath.endsWith('i18n.ts');
}
function hasCodeCreateMessagesCall(code) {
    return code.includes('createMessages');
}
export const unpluginFactory = (options, meta) => {
    const { allowedLocales, fallbackLocales } = loadProjectConfig();
    let optimizeLocaleChunks = options?.optimizeLocaleChunks;
    if (optimizeLocaleChunks) {
        if (meta.framework === 'rspack') {
            if (meta.rspack.compiler.options.mode !== 'production') {
                optimizeLocaleChunks = false;
            }
        }
        else if (meta.framework === 'webpack') {
            if (meta.webpack.compiler.options.mode !== 'production') {
                optimizeLocaleChunks = false;
            }
        }
        else {
            optimizeLocaleChunks = false;
            console.log('\n[i18n-optimize-plugin] optimizeLocaleChunks is working only with rspack and webpack! Disable it.\n');
        }
    }
    const locales = typeof optimizeLocaleChunks === 'object' && 'generateTechLocale' in optimizeLocaleChunks
        ? [...allowedLocales, TECH_LOCALE]
        : allowedLocales;
    return {
        name: 'i18n-optimize-plugin',
        // Применяем заранее перед минификаторами и транспайлерами
        enforce: 'pre',
        transformInclude(id) {
            return isTranslationsFile(id);
        },
        transform(code, id) {
            // Исключаем случайно попавшие файлы, в которых нет вызова createMessages
            if (!hasCodeCreateMessagesCall(code)) {
                return code;
            }
            return transformTranslationFile(code, id, {
                typograf: options?.typograph,
                locales,
                fallbackLocales,
                optimizeLocaleChunks,
                compileMessageToAst: options?.compileMessageToAst,
            });
        },
        webpack(compiler) {
            if (options?.compileMessageToAst) {
                compiler.options.resolve = compiler.options.resolve ?? {};
                compiler.options.resolve.alias = {
                    ...MESSAGE_FORMAT_PARSER_ALIAS,
                    ...compiler.options.resolve.alias,
                };
            }
        },
        rspack(compiler) {
            if (options?.compileMessageToAst) {
                compiler.options.resolve = compiler.options.resolve ?? {};
                compiler.options.resolve.alias = {
                    ...MESSAGE_FORMAT_PARSER_ALIAS,
                    ...compiler.options.resolve.alias,
                };
            }
        },
        vite: {
            config: (viteConfig) => {
                if (options?.compileMessageToAst) {
                    viteConfig.resolve = viteConfig.resolve ?? {};
                    viteConfig.resolve.alias = {
                        ...MESSAGE_FORMAT_PARSER_ALIAS,
                        ...viteConfig.resolve.alias,
                    };
                }
                return viteConfig;
            },
        },
    };
};
export const I18nPlugin = createUnplugin(unpluginFactory);
export default I18nPlugin;
//# sourceMappingURL=index.js.map