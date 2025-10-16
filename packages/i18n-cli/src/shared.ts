import {relative, resolve, parse} from 'node:path';
import {execSync} from 'node:child_process';
import type {ExecSyncOptions} from 'child_process';

let prettier: typeof import('prettier') | undefined;

export const MODULE_NAME = 'i18n-cli';

export const log = (...mess: unknown[]) => console.log(`[${MODULE_NAME}]`, ...mess);

export const TRANSLATIONS_FILE_POSTFIX = 'i18n.ts';

export function isMessageLikeMultilineICU(message: string) {
    return message.includes('\n  ') && message.includes('{') && message.includes('}');
}

export function removeStartNewLineFromICU(message: string) {
    if (isMessageLikeMultilineICU(message)) {
        return message.trimStart();
    }

    return message;
}

export function shell(command: string, options?: ExecSyncOptions) {
    return execSync(command, {
        stdio: 'pipe',
        ...options,
        encoding: 'buffer',
    });
}

export const appRootPath = process.cwd();
const appRootExpression = new RegExp(`^${appRootPath}/`);

export const toAbsolutePath = (path: string) => resolve(appRootPath, toRelativePath(path));
export const toRelativePath = (path: string) =>
    path.startsWith(appRootPath) ? path.replace(appRootExpression, '') : path;

const removeExtension = (path: string) => {
    return path.replace(/\.\w+$/, '');
};

/**
 * Генерирует относительный путь для импорта модуля из fromPath в модуль по пути toPath.
 * Импортирует через fromAlias, если fromPath и toPath - разные директории.
 *
 * @example
 * // Returns '../utils/i18n'
 * createRelativeImport('server/utils/i18n.ts', 'server/controllers/main.ts')
 * // Returns './i18n'
 * createRelativeImport('server/utils/i18n.ts', 'server/utils/main.ts')
 * // Returns './i18n'
 * createRelativeImport('server/utils/i18n.ts', 'server/utils/main.ts', '@utils/i18n')
 * // Returns '@utils/i18n'
 * createRelativeImport('server/utils/i18n.ts', 'server/views/index.ts', '@utils/i18n')
 *
 * @param fromPath string
 * @param toPath string
 * @param fromAlias string
 * @returns string
 */
export const createRelativeImport = (fromPath: string, toPath: string, fromAlias?: string) => {
    const toAbsPath = toAbsolutePath(toPath);
    const fromAbsPath = toAbsolutePath(fromPath);
    const parsedToAbsPath = parse(toPath);

    if (fromAlias && parse(toAbsPath).dir !== parse(fromAbsPath).dir) {
        return fromAlias;
    }

    let result = relative(parsedToAbsPath.ext ? parsedToAbsPath.dir : toAbsPath, fromAbsPath);

    // из-за особенностей работы path.relative нужно делать такой костыль
    if (!result.startsWith('../')) {
        result = `./${result}`;
    }

    return removeExtension(result);
};

/**
 * Форматирует код, используя Prettier, если он настроен в проекте.
 * Если Prettier не найден, возвращает исходный код без изменений.
 *
 * @param code string
 * @param outputFilePath string
 * @returns string
 */
export const formatCode = async (code: string, outputFilePath: string) => {
    if (!prettier) {
        try {
            prettier = await import('prettier');
        } catch (_err) {
            prettier = undefined;
        }
    }

    if (prettier) {
        try {
            const prettierOptions = await prettier.resolveConfig(outputFilePath);
            if (prettierOptions) {
                const formattedCode = await prettier.format(code, prettierOptions);
                return prettier.format(formattedCode, prettierOptions);
            }
        } catch (_prettierError) {
            // отдаем исходный код
        }
    }

    return code;
};
