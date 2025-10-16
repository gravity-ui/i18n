import {transformAsync, type PluginItem} from '@babel/core';
import {
    createTranslationsFileVisitor,
    type TranslationsFileVisitorOptions,
} from '@gravity-ui/i18n-babel-plugin';
import MagicString from 'magic-string';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, join, parse} from 'node:path';
import {LANGUAGE_VARIABLE_NAME_ENV_KEY, LANGUAGES_DIR_PREFIX} from './constants.js';
import type {OptimizeLocaleChunks} from '../types.js';

const CREATE_MESSAGES_FUNCTION = 'intl.createMessages';
const EXPORT_CONST_NAME = 'export const {';

async function createFile(filePath: string, content = '') {
    await mkdir(dirname(filePath), {recursive: true});
    return writeFile(filePath, content, 'utf-8');
}

function createBabelPlugin(options?: TranslationsFileVisitorOptions): PluginItem {
    return {
        visitor: createTranslationsFileVisitor(options),
    };
}

export async function transformFileWithBabel(
    code: string,
    options?: TranslationsFileVisitorOptions,
) {
    const result = await transformAsync(code, {
        sourceMaps: true,
        plugins: [createBabelPlugin(options)],
    });

    return {
        code: result?.code || '',
        map: result?.map,
    };
}

export function includeDynamicImportToTranslationsFile(
    code: string,
    languagesDirName: string = LANGUAGES_DIR_PREFIX,
) {
    const s = new MagicString(code);

    const createMessagesIndex = code.indexOf(CREATE_MESSAGES_FUNCTION);
    const exportConstIndex = code.indexOf(EXPORT_CONST_NAME);

    if (createMessagesIndex !== -1 && exportConstIndex !== -1) {
        s.prependLeft(
            exportConstIndex,
            `const langs = require.context("./${languagesDirName}/", false, /\\/.*\\.ts$/);\nconst messages = langs("./" + ${LANGUAGE_VARIABLE_NAME_ENV_KEY} + ".ts").default;\n`,
        );

        const messagesArgumentIndex = createMessagesIndex + CREATE_MESSAGES_FUNCTION.length + 1;
        s.overwrite(messagesArgumentIndex, code.length, 'messages);\n');
    }

    return {
        code: s.toString(),
        map: s.generateMap(),
    };
}

export type TransformTranslationFileOptions = Pick<
    TranslationsFileVisitorOptions,
    'typograf' | 'fallbackLocales' | 'compileMessageToAst'
> & {
    locales: string[];
    optimizeLocaleChunks?: OptimizeLocaleChunks;
};

async function transformTranslationsByLocale(
    code: string,
    filePath: string,
    options: TransformTranslationFileOptions,
) {
    const {locales, ...babelOptions} = options;

    const parsedPath = parse(filePath);
    // Учитываем название потому что в одной директории могут быть несколько *.i18n.ts
    const languagesDirName = `${LANGUAGES_DIR_PREFIX}${parsedPath.name === 'i18n' ? '' : `-${parsedPath.name}`}`;
    const targetDir = join(parsedPath.dir, languagesDirName);

    const {code: translationsContent} = await transformFileWithBabel(code, {
        ...babelOptions,
        allowedLocales: locales,
        mode: 'only-translations',
    });

    // Извлекаем объект переводов из кода
    const objectStr = translationsContent.match(/export default\s*({[\s\S]*?});/)?.[1];

    if (objectStr && locales?.length) {
        const allTranslations = eval(`(${objectStr})`);

        const translationsByLocale: Record<string, Record<string, Record<string, string>>> = {};

        Object.entries(allTranslations).forEach(([key, value]) => {
            const translations = value as Record<string, string>;

            locales.forEach((locale) => {
                if (translations && translations[locale] !== undefined) {
                    if (!translationsByLocale[locale]) {
                        translationsByLocale[locale] = {};
                    }

                    translationsByLocale[locale][key] = {[locale]: translations[locale]};
                }
            });
        });

        await Promise.all(
            locales.map(async (locale) => {
                const localeTranslations = translationsByLocale[locale] || {};
                const localeFileContent = `export default ${JSON.stringify(localeTranslations, null, 4)};`;
                await createFile(join(targetDir, `${locale}.ts`), localeFileContent);
            }),
        );

        return includeDynamicImportToTranslationsFile(code, languagesDirName);
    }

    return transformFileWithBabel(code, babelOptions);
}

export async function transformTranslationFile(
    code: string,
    filePath: string,
    options: TransformTranslationFileOptions,
) {
    const {optimizeLocaleChunks, locales, ...babelOptions} = options;

    if (options.optimizeLocaleChunks) {
        return transformTranslationsByLocale(code, filePath, options);
    }

    return transformFileWithBabel(code, babelOptions);
}
