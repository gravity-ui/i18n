import {PluginPass} from '@babel/core';
import type {FallbackLocales} from '@gravity-ui/i18n-types';

export interface TypografConfig {
    enabled: string[];
    disabled: string[];
}

export type FilenameMatcher =
    | string
    | RegExp
    | {
          type: 'regexp';
          pattern: string;
          flags?: string;
      };

export interface PluginOptions {
    root?: string;
    /**
     * Позволяет обрабатывать файлы с переводами с кастомными названиями.
     *
     * Default: `'i18n.ts'`
     */
    filenameMatcher?: FilenameMatcher | FilenameMatcher[];
    mode?: 'default' | 'only-translations';
    compileMessageToAst?: boolean;
    typograf?: TypografConfig | boolean;
    fallbackLocales?: FallbackLocales<string>;
    allowedLocales?: string[];
}

export interface PluginContext extends PluginPass {
    root: string;
}
