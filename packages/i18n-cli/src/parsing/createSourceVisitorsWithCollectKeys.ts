import {ESLintUtils} from '@typescript-eslint/utils';
import {CreateSourceVisitorArgs, createSourceVisitors} from './createSourceVisitors';

export type I18nCallToIds = Record<string, Set<string>>;
export type I18nCallsToImportPath = Record<string, string>;
export type I18nImportToCalls = Record<string, Set<string>>;

export const createSourceVisitorsWithCollectKeys = (args?: CreateSourceVisitorArgs) => {
    const i18nCallToIds: I18nCallToIds = {};
    const i18nCallToImportPath: I18nCallsToImportPath = {};

    const i18nImportSet = new Set<string>();
    const i18nImportToCalls: I18nImportToCalls = {};

    const visitors: ESLintUtils.RuleListener = createSourceVisitors({
        ...args,
        onImportFound(params) {
            const {importedI18nCalleeList, importPath} = params;
            i18nImportSet.add(importPath);

            i18nImportToCalls[importPath] = i18nImportToCalls[importPath] || new Set();

            importedI18nCalleeList.forEach((importedI18n) => {
                i18nCallToImportPath[importedI18n.name] = importPath;
                i18nImportToCalls[importPath]?.add(importedI18n.name);
            });

            args?.onImportFound?.(params);
        },
        onCallFound(params) {
            const {id, functionName} = params;

            if (id) {
                i18nCallToIds[functionName] = i18nCallToIds[functionName] || new Set<string>();
                i18nCallToIds[functionName].add(id);
            }

            args?.onCallFound?.(params);
        },
        onJsxCallFound(params) {
            const {id, componentName} = params;

            if (id) {
                i18nCallToIds[componentName] = i18nCallToIds[componentName] || new Set<string>();
                i18nCallToIds[componentName].add(id);
            }

            args?.onJsxCallFound?.(params);
        },
    });

    return {
        i18nCallToIds,
        i18nCallToImportPath,
        i18nImportSet,
        i18nImportToCalls,
        visitors,
    };
};
