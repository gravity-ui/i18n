import {Dirent} from 'fs';
import fs from 'fs/promises';
import path from 'path';
import {TRANSLATIONS_FILE_POSTFIX} from './shared';

export const isI18nFile = (dirent: Dirent) => {
    return dirent.isFile() && dirent.name === TRANSLATIONS_FILE_POSTFIX;
};

export const isTsFile = (dirent: Dirent) => {
    return (
        dirent.isFile() &&
        (dirent.name.endsWith('.ts') ||
            dirent.name.endsWith('.tsx') ||
            dirent.name.endsWith('.js') ||
            dirent.name.endsWith('.jsx'))
    );
};

export type ThroughDirsCallback = (
    i18nDirent: Dirent | undefined,
    getTsFiles: () => Dirent[],
) => Promise<void>;

export const throughDirs = async (
    moveFrom: string,
    recursively: boolean,
    dirCallback: ThroughDirsCallback,
) => {
    const direntList = await fs.readdir(moveFrom, {withFileTypes: true});

    const getTsFiles = () => {
        return direntList.filter((dirent) => isI18nFile(dirent) === false && isTsFile(dirent));
    };

    const i18nFile = direntList.find((dirent) => isI18nFile(dirent));

    await dirCallback(i18nFile, getTsFiles);

    if (recursively === false) return;

    const pList = direntList.reduce<Promise<void>[]>((acc, dirent) => {
        const fullPath = path.resolve(moveFrom, dirent.name);

        if (dirent.isDirectory()) {
            acc.push(throughDirs(fullPath, true, dirCallback));
        }

        return acc;
    }, []);

    await Promise.all(pList);
};
