import {parseTranslationsFile} from '../../parseTranslationsFile';

import {log} from '../../shared';
import {throughDirs} from '../../utils';
import {Dirent} from 'fs';
import {generateTranslationsFile} from '../../generateTranslationsFile';
import {MessageWithPlacementMeta} from '../../types';
import {lstatSync} from 'node:fs';

import {isLocalI18nImport, parseTsFile} from '../../parsing';
import {Commands} from '../constants';
import {createCommand} from '../utils';
import {Command} from '../types';

type TranslationsFileInfoValue = {customerList: Dirent[]; mess: MessageWithPlacementMeta};
type TranslationsFileInfo = Record<string, TranslationsFileInfoValue>;

const job = async (filePath: string) => {
    const {i18nImportSet, i18nImportToIds} = await parseTsFile(filePath);
    const localI18nImport = [...i18nImportSet].find(isLocalI18nImport);

    if (localI18nImport === undefined) {
        // No need to check cause no local i18n imports
        return;
    }

    const localI18nUsedIds = i18nImportToIds[localI18nImport];

    return localI18nUsedIds;
};

type Options = {
    path: string;
    recursively: boolean;
    delete: boolean;
};

const runFindUnused = async (argv: Options) => {
    const isFilePathDir = lstatSync(argv.path).isDirectory();
    const dirPath = isFilePathDir ? argv.path : argv.path.split('/').slice(0, -1).join('/');

    return throughDirs(dirPath, argv.recursively, async (i18nDirent, getTsFiles) => {
        if (i18nDirent === undefined) return;

        const localI18nFilePath = `${i18nDirent.parentPath}/${i18nDirent.name}`;

        const translationsFile = await parseTranslationsFile({
            filePath: localI18nFilePath,
        });

        const translationsFileInfo = translationsFile.messages.reduce<TranslationsFileInfo>(
            (acc, mess) => {
                acc[mess.meta.objectKey] = {customerList: [], mess};
                return acc;
            },
            {},
        );

        if (Object.keys(translationsFileInfo).length === 0) return;

        const tsFileList = getTsFiles();

        const pList = tsFileList.map((tsFile) => {
            return job(`${tsFile.parentPath}/${tsFile.name}`).then((localI18nUsedIds) => {
                localI18nUsedIds?.forEach((keyName) => {
                    if (!translationsFileInfo[keyName]) return;
                    translationsFileInfo[keyName].customerList.push(tsFile);
                });
            });
        });

        await Promise.all(pList);

        let hasUnusedKeys = false;
        Object.keys(translationsFileInfo).forEach((key) => {
            const keyInfo = translationsFileInfo[key];

            if (keyInfo === undefined || keyInfo.customerList.length === 0) {
                hasUnusedKeys = true;
                log(`unused key: "${key}" from ${localI18nFilePath}`);

                if (argv.delete) {
                    delete translationsFileInfo[key];
                }
            }
        });

        if (hasUnusedKeys && argv.delete) {
            const messages = Object.values(translationsFileInfo).map(({mess}) => mess);
            await generateTranslationsFile({
                outputPath: localI18nFilePath,
                messages,
                exportAliases: translationsFile.exportAliases,
            });
            log(`${localI18nFilePath} modified`);
        }
    });
};

const DESCRIPTION = `Находит неиспользуемые локальные ключи i18n (shared и common i18n файлы пока не берутся по внимание) в переданной директории.
Позволяет удалить неиспользуемые локальные ключи из проекта.`;

export const findUnused: Command<Commands.FindUnused, Options> = createCommand(() => ({
    command: `${Commands.FindUnused} [path]`,
    description: DESCRIPTION,
    options(yargs) {
        yargs
            .positional('path', {
                describe: 'Директория, в которой нужно провести анализ вызовов ключей i18n',
                default: 'src',
                type: 'string',
                demandOption: false,
            })
            .option('recursively', {
                alias: 'r',
                describe: 'Рекурсивное прохождение директорий',
                default: true,
                type: 'boolean',
            })
            .option('delete', {
                alias: 'd',
                default: false,
                type: 'boolean',
                description: 'Удалить неиспользуемые ключи',
            });
    },
    action(args) {
        return runFindUnused(args);
    },
}));
