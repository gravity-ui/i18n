import { type TranslationsFileVisitorOptions } from '@gravity-ui/i18n-babel-plugin';
import type { OptimizeLocaleChunks } from '../types.js';
export declare function transformFileWithBabel(code: string, options?: TranslationsFileVisitorOptions): Promise<{
    code: string;
    map: {
        version: number;
        sources: string[];
        names: string[];
        sourceRoot?: string | undefined;
        sourcesContent?: string[] | undefined;
        mappings: string;
        file: string;
    } | null | undefined;
}>;
export declare function includeDynamicImportToTranslationsFile(code: string, languagesDirName?: string): {
    code: string;
    map: import("magic-string").SourceMap;
};
export type TransformTranslationFileOptions = Pick<TranslationsFileVisitorOptions, 'typograf' | 'fallbackLocales' | 'compileMessageToAst'> & {
    locales: string[];
    optimizeLocaleChunks?: OptimizeLocaleChunks;
};
export declare function transformTranslationFile(code: string, filePath: string, options: TransformTranslationFileOptions): Promise<{
    code: string;
    map: {
        version: number;
        sources: string[];
        names: string[];
        sourceRoot?: string | undefined;
        sourcesContent?: string[] | undefined;
        mappings: string;
        file: string;
    } | null | undefined;
} | {
    code: string;
    map: import("magic-string").SourceMap;
}>;
