import {promises as fs} from 'fs';
import {parse} from '@typescript-eslint/parser';
import {TSESTree} from '@typescript-eslint/types';

export interface ParseArgs {
    /** Путь к исходному файлу. Если файл не существует, будет брошена стандартная ошибка */
    filename: string;
    /** Уже прочитанное содержимое файла. filename всё равно нужен, чтобы проверить, нужно ли включать jsx */
    content?: string;
}

export async function parseToAst({filename, content}: ParseArgs) {
    return parseToAstSync({
        filename,
        content: content ?? (await fs.readFile(filename, {encoding: 'utf-8'})),
    });
}

export function parseToAstSync({filename, content}: Required<ParseArgs>) {
    return parse(content, {
        range: true,
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: filename.endsWith('x'),
        },
    }) as unknown as TSESTree.Program;
}
