import {exec} from 'node:child_process';
import {promisify} from 'util';
import {appRootPath, toAbsolutePath, TRANSLATIONS_FILE_POSTFIX} from './shared';
import {parseTranslationsFile} from './parseTranslationsFile';

const execAsync = promisify(exec);

const FIND_EXEC_BUFFER_SIZE = 1_048_576;
const DEFAULT_ROOT_PATHS = ['src'];

async function resolveTranslationFiles(rootPaths: string[] = DEFAULT_ROOT_PATHS) {
    const findTranslationFiles = async (rootPath: string) => {
        const {stdout} = await execAsync(
            `find ${rootPath} -type f -name "*${TRANSLATIONS_FILE_POSTFIX}" -exec grep -lE "(createMessages|declareMessages)" {} +`,
            {
                cwd: appRootPath,
                maxBuffer: FIND_EXEC_BUFFER_SIZE,
            },
        );

        return stdout.trim().split('\n').filter(Boolean).map(toAbsolutePath);
    };

    return (await Promise.all(rootPaths.map(findTranslationFiles))).flat();
}

export async function parseProjectTranslations(rootPaths?: string[]) {
    const files = await resolveTranslationFiles(rootPaths);

    // TODO: maybe use threads?
    const promises = files.map((path) =>
        parseTranslationsFile({
            filePath: path,
        }),
    );

    return Promise.all(promises);
}
