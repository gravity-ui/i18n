import {ESLintUtils, TSESTree} from '@typescript-eslint/utils';

export const LOCAL_I18N_PATH = './i18n';
export const isLocalI18nImport = (importLine: string): boolean => {
    return importLine === LOCAL_I18N_PATH;
};

const I18N_IMPORT_REG_EXP = /i18n$/;

const LOCAL_I18N_FUNCTION_REG_EXP = /^t$/;
export const isLocalI18nFunctionCallee = (calleeName: string) => {
    return LOCAL_I18N_FUNCTION_REG_EXP.test(calleeName);
};

const LOCAL_I18N_COMPONENT_REG_EXP = /^Message$/;
export const isLocalI18nComponentCallee = (calleeName: string) => {
    return LOCAL_I18N_COMPONENT_REG_EXP.test(calleeName);
};

export const isLocalI18nCallee = (calleeName: string) => {
    return isLocalI18nFunctionCallee(calleeName) || isLocalI18nComponentCallee(calleeName);
};

const I18N_FUNCTION_REG_EXPS = [LOCAL_I18N_FUNCTION_REG_EXP, /[a-z]+T$/] as const;

const I18N_COMPONENT_REG_EXPS = [
    // LOCAL_I18N_COMPONENT_REG_EXP - нет необходимости, т к это частный случай регулярки ниже
    /Message$/,
] as const;

export type CreateSourceVisitorArgs = {
    /* Найден импорт i18n-файла с переводами */
    onImportFound?: (args: {
        node: TSESTree.ImportDeclaration;
        importedI18nCalleeList: TSESTree.Identifier[];
        importPath: string;
    }) => void;

    /**
     * Найден вызов метода t.
     * Пример: t("someId")
     */
    onCallFound?: (args: {
        node: TSESTree.CallExpression;
        idNode: TSESTree.CallExpressionArgument;
        id?: string;
        functionName: string;
    }) => void;

    /**
     * Найдено использование i18n-компонента.
     * Пример: <Message value="someId" />
     */
    onJsxCallFound?: (args: {
        node: TSESTree.JSXOpeningElement;
        idAttr: TSESTree.JSXAttribute;
        id?: string;
        componentName: string;
    }) => void;

    /** Дополнительные названия функций-аналогов t */
    additionalFunctions?: RegExp[];
    /** Дополнительные названия компонентов-аналогов <Message /> */
    additionalComponents?: RegExp[];
};

export const createSourceVisitors = ({
    onCallFound,
    onJsxCallFound,
    onImportFound,
    additionalFunctions,
    additionalComponents,
}: CreateSourceVisitorArgs): ESLintUtils.RuleListener => {
    const isI18nMethod = (methodName: string) => {
        const checkRegExp = (regExp: RegExp) => regExp.test(methodName);

        return (
            I18N_FUNCTION_REG_EXPS.some(checkRegExp) ||
            additionalFunctions?.some(checkRegExp) ||
            false
        );
    };

    const isI18nComponent = (componentName: string) => {
        const checkRegExp = (regExp: RegExp) => regExp.test(componentName);

        return (
            I18N_COMPONENT_REG_EXPS.some(checkRegExp) ||
            additionalComponents?.some(checkRegExp) ||
            false
        );
    };

    const res: ESLintUtils.RuleListener = {};

    if (onImportFound) {
        res.ImportDeclaration = (node) => {
            const importPath = node.source.value.toString();
            const isI18nImport = I18N_IMPORT_REG_EXP.test(importPath);
            if (!isI18nImport) return;

            const importedI18nCalleeList: TSESTree.Identifier[] = [];
            node.specifiers.forEach((importSpecifier) => {
                if (
                    importSpecifier.type !== 'ImportSpecifier' ||
                    importSpecifier.imported.type !== 'Identifier'
                ) {
                    return;
                }

                const importedName = importSpecifier.imported.name;
                if (isI18nMethod(importedName) || isI18nComponent(importedName)) {
                    importedI18nCalleeList.push(importSpecifier.imported);
                }
            });

            if (importedI18nCalleeList.length) {
                onImportFound({node, importedI18nCalleeList, importPath});
            }
        };
    }

    if (onCallFound) {
        res.CallExpression = (node) => {
            const callee = node.callee;
            if (callee.type !== 'Identifier') return;

            const functionName = callee.name;
            if (!isI18nMethod(functionName) || node.arguments.length === 0) return;

            const idNode = node.arguments[0]!;
            const id = idNode.type === 'Literal' ? idNode.value?.toString() : undefined;
            onCallFound({node, idNode, id, functionName});
        };
    }

    if (onJsxCallFound) {
        res.JSXOpeningElement = (node: TSESTree.JSXOpeningElement) => {
            const nameObj = node.name;
            if (nameObj.type !== 'JSXIdentifier') return;

            const componentName = nameObj.name;
            if (!isI18nComponent(componentName)) return;

            const idAttr = node.attributes.find((attr) => {
                return attr.type === 'JSXAttribute' && attr.name.name === 'id';
            }) as TSESTree.JSXAttribute | undefined;

            if (!idAttr) return;

            const id =
                idAttr.value?.type === 'Literal' && idAttr.value.value
                    ? idAttr.value.value.toString()
                    : undefined;

            onJsxCallFound({node, idAttr, id, componentName});
        };
    }

    return res;
};
