import { Message } from '@gravity-ui/i18n-types';
export { TECH_LOCALE } from '@gravity-ui/i18n-types';
import { ProjectConfig } from './config/index.js';
export { defineConfig } from './config/index.js';
import { TSESTree, ESLintUtils } from '@typescript-eslint/utils';

type MessagePlacementMeta = {
    objectKey: string;
};
type MessageWithPlacementMeta = {
    message: Message;
    meta: MessagePlacementMeta;
};
type TranslationFunction = 't' | 'Message';
type ExportAliases = Partial<Record<TranslationFunction, string>>;

type ParseTranslationsFileArgs = {
    filePath: string;
    content?: string;
};
type ParseTranslationsFileResult = {
    messages: MessageWithPlacementMeta[];
    filePath: string;
    exportAliases: ExportAliases;
};
declare function parseTranslationsFile(args: ParseTranslationsFileArgs): Promise<ParseTranslationsFileResult>;

type GenerateTranslationsFileParams = {
    outputPath: string;
    messages: MessageWithPlacementMeta[];
    exportAliases?: ExportAliases;
};
declare function generateTranslationsFileContent(params: GenerateTranslationsFileParams): string;
declare function generateTranslationsFile(params: GenerateTranslationsFileParams): Promise<void>;

declare function parseProjectTranslations(rootPaths?: string[]): Promise<ParseTranslationsFileResult[]>;

type RequiredConfigOption = 'clientIntlModule' | 'serverIntlModule';
type NormalizedProjectConfig = Omit<ProjectConfig, RequiredConfigOption> & Required<Pick<ProjectConfig, RequiredConfigOption>>;
declare const loadProjectConfig: (searchPlaces?: string[]) => NormalizedProjectConfig;

type CreateSourceVisitorArgs = {
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
declare const createSourceVisitors: ({ onCallFound, onJsxCallFound, onImportFound, additionalFunctions, additionalComponents, }: CreateSourceVisitorArgs) => ESLintUtils.RuleListener;

export { type MessagePlacementMeta, type MessageWithPlacementMeta, type NormalizedProjectConfig, type ParseTranslationsFileArgs, type ParseTranslationsFileResult, ProjectConfig, createSourceVisitors, generateTranslationsFile, generateTranslationsFileContent, loadProjectConfig, parseProjectTranslations, parseTranslationsFile };
