import {generateTranslationsFile} from '../../generateTranslationsFile';
import {parseTranslationsFile} from '../../parseTranslationsFile';
import {
    isLocalI18nComponentCallee,
    isLocalI18nFunctionCallee,
    isLocalI18nImport,
    I18nCallToIds,
    parseTsFile,
    LOCAL_I18N_PATH,
} from '../../parsing';

import {join} from 'path';

import {writeFile, readFile} from 'node:fs/promises';

import {MessageWithPlacementMeta} from '../../types';
import {log} from '../../shared';
import type {NormalizedProjectConfig} from '../../config/loadProjectConfig';
import {lstatSync, readdirSync} from 'node:fs';
import {isI18nFile, isTsFile} from '../../utils';
import {Commands} from '../constants';
import {createCommand} from '../utils';
import {Command} from '../types';
import type {FallbackLocales} from '@gravity-ui/i18n-types';

interface Options {
    path: string;
    locales?: string;
}

const addImportLine = async (filePath: string, i18nCalleeUsed: string[], i18nPath: string) => {
    const code = await readFile(filePath, 'utf-8');
    const importLine = `import { ${i18nCalleeUsed.join(', ')} } from '${i18nPath}'`;

    await writeFile(filePath, `${importLine}\n${code}`);
};

const getLocalI18nCallToIds = (i18nCallsUsed: I18nCallToIds) => {
    const localI18nCallUsed: I18nCallToIds = {};

    const localI18nFunctionCallee = Object.keys(i18nCallsUsed).find(isLocalI18nFunctionCallee);
    if (localI18nFunctionCallee && i18nCallsUsed[localI18nFunctionCallee]) {
        localI18nCallUsed[localI18nFunctionCallee] = i18nCallsUsed[localI18nFunctionCallee];
    }

    const localI18nComponentCallee = Object.keys(i18nCallsUsed).find(isLocalI18nComponentCallee);
    if (localI18nComponentCallee && i18nCallsUsed[localI18nComponentCallee]) {
        localI18nCallUsed[localI18nComponentCallee] = i18nCallsUsed[localI18nComponentCallee];
    }

    return localI18nCallUsed;
};

const generateDafaultMessages = (
    keyList: string[],
    locales: string[],
    fallbackLocales?: FallbackLocales<string>,
): MessageWithPlacementMeta[] => {
    const message = locales.reduce<Record<string, string | null>>((acc, locale) => {
        // Если для локали установлен fallback, то выставляем null, иначе - пустую строку
        acc[locale] = fallbackLocales?.[locale] ? null : '';
        return acc;
    }, {});

    // TODO add integration with i18n-eslint-plugin/auto-generate-translation-message-id
    return keyList.map((objectKey) => ({message, meta: {objectKey}}));
};

const job = async (
    filePath: string,
    localesList: string[],
    fallbackLocales?: FallbackLocales<string>,
) => {
    const {i18nCallToIds, i18nImportSet, i18nImportToIds} = await parseTsFile(filePath);

    if (Object.keys(i18nCallToIds).length === 0) {
        log(`there is no i18n calls in file ${filePath}`);
        return;
    }

    const normalizedI18nImportToIds = i18nImportToIds;

    const localI18nImport = [...i18nImportSet].find(isLocalI18nImport);
    if (localI18nImport === undefined) {
        const localI18nCallToIds = getLocalI18nCallToIds(i18nCallToIds);
        const i18nCalleeUsed = Object.keys(localI18nCallToIds);

        if (i18nCalleeUsed.length) {
            const localI18nIdsSet = new Set<string>();
            Object.values(localI18nCallToIds).forEach((idsSet) => {
                idsSet.forEach((id) => localI18nIdsSet.add(id));
            });

            normalizedI18nImportToIds[LOCAL_I18N_PATH] = localI18nIdsSet;

            log(`trying add i18n local import line to ${filePath}`);

            try {
                await addImportLine(filePath, i18nCalleeUsed, LOCAL_I18N_PATH);
                log(`import line for local i18n added to ${filePath}`);
            } catch (err) {
                log(err);
            }
        }
    }

    const getI18nSourcePath = (i18nImport: string) => {
        const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));

        if (i18nImport.startsWith('./') || i18nImport.startsWith('../')) {
            return `${join(dirPath, i18nImport)}.ts`;
        }

        // TODO если это ts alias import то перевести его в абсолютный путь
        return undefined;
    };

    const pList = Object.keys(normalizedI18nImportToIds).map((i18nImport) => {
        const i18nImportIdsSet = normalizedI18nImportToIds[i18nImport];
        if (!i18nImportIdsSet) return;

        const i18nImportIds = [...i18nImportIdsSet];

        const i18nFilePath = getI18nSourcePath(i18nImport);
        if (!i18nFilePath) {
            return;
        }

        return createKeysJob(i18nFilePath, localesList, [...i18nImportIds], fallbackLocales);
    });

    await Promise.all(pList);
};

const createKeysJob = async (
    i18nPath: string,
    localesList: string[],
    keyList: string[],
    fallbackLocales?: FallbackLocales<string>,
) => {
    const translationsFile = await parseTranslationsFile({
        filePath: i18nPath,
    }).catch(() => {
        log(`there is no i18n file ${i18nPath}`);
        return null;
    });

    if (translationsFile === null) {
        log(`trying create ${i18nPath}`);

        const messages = generateDafaultMessages(keyList, localesList, fallbackLocales);
        await generateTranslationsFile({
            outputPath: i18nPath,
            messages,
        });

        log(`${i18nPath} created`);
    } else {
        const fileMessages = translationsFile?.messages || [];
        const fileExportAliases = translationsFile?.exportAliases || {};

        const alreadyCreatedKeySet = new Set(fileMessages.map(({meta}) => meta.objectKey));

        const messages = generateDafaultMessages(
            keyList.filter((key) => !alreadyCreatedKeySet.has(key)),
            localesList,
            fallbackLocales,
        );

        if (messages.length !== 0) {
            log(`trying modify ${i18nPath}`);

            await generateTranslationsFile({
                outputPath: i18nPath,
                messages: [...fileMessages, ...messages],
                exportAliases: fileExportAliases,
            });

            log(`${i18nPath} modified`);
        }
    }
};

const runCreateKeys = async (argv: Options, projectConfig: NormalizedProjectConfig) => {
    const FILE_PATH = argv.path;
    const localesList = argv.locales?.split(',') || projectConfig.allowedLocales;
    const FALLBACKS = projectConfig.fallbackLocales;

    const isFilePathDir = lstatSync(FILE_PATH).isDirectory();

    if (isFilePathDir) {
        const filePathList = readdirSync(FILE_PATH, {withFileTypes: true}).reduce<string[]>(
            (acc, file) => {
                if (isI18nFile(file) === false && isTsFile(file)) {
                    acc.push(`${FILE_PATH}/${file.name}`);
                }

                return acc;
            },
            [],
        );

        await Promise.all(
            filePathList.map((filePath) => {
                return job(filePath, localesList, FALLBACKS);
            }),
        );
    } else {
        await job(FILE_PATH, localesList, FALLBACKS);
    }
};

export const createKeys: Command<Commands.CreateKeys, Options> = createCommand(
    ({projectConfig}) => ({
        command: `${Commands.CreateKeys} <path>`,
        description: `
Проверяет вызовы i18n-функций в переданном файле или директории.
Добавляет отсутствующие ключи в файл с переводами (i18n.ts).
В случае, если функции i18n не импортированы, будет добавлена строка импорта.
    `.trim(),
        options(yargs) {
            yargs
                .positional('path', {
                    describe: 'Путь к файлу/директории',
                    type: 'string',
                    array: false,
                })
                .option('locales', {
                    alias: 'l',
                    type: 'string',
                    describe: 'Локали, для которых нужно заполнить тексты (для примера "ru,kz,en")',
                });
        },
        action(args) {
            return runCreateKeys(args, projectConfig);
        },
    }),
);
