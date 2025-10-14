import { Visitor } from '@babel/core';
import { TypografConfig } from './types';
import type { FallbackLocales } from '@gravity-ui/i18n-types';
export type TranslationsFileVisitorOptions = {
    typograf?: TypografConfig | boolean;
    mode?: 'default' | 'only-translations';
    compileMessageToAst?: boolean;
    allowedLocales?: string[];
    fallbackLocales?: FallbackLocales<string>;
};
export declare const createTranslationsFileVisitor: (options?: TranslationsFileVisitorOptions) => Visitor;
