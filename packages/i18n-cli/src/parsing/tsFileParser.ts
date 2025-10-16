import {simpleTraverse} from '@typescript-eslint/typescript-estree';
import {createSourceVisitorsWithCollectKeys} from './createSourceVisitorsWithCollectKeys';
import {parseToAst} from './parseToAst';

export type I18nImportToIds = Record<string, Set<string>>;

export const parseTsFile = async (filePath: string) => {
    const {visitors, ...fileStats} = createSourceVisitorsWithCollectKeys();

    const i18nImportToIds: I18nImportToIds = {};
    const {i18nCallToImportPath, i18nCallToIds} = fileStats;

    const ast = await parseToAst({filename: filePath});
    simpleTraverse(ast, {
        visitors: visitors as never,
    });

    Object.keys(i18nCallToIds).forEach((i18nCallee) => {
        const i18nCalleeIds = i18nCallToIds[i18nCallee]!;
        const i18nImport = i18nCallToImportPath[i18nCallee];

        if (i18nImport) {
            i18nImportToIds[i18nImport] = i18nImportToIds[i18nImport] || new Set();
            i18nCalleeIds.forEach((id) => i18nImportToIds[i18nImport]?.add(id));
        }
    });

    return {...fileStats, i18nImportToIds};
};
