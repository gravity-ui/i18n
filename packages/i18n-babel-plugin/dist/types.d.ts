import { PluginPass } from '@babel/core';
import type { FallbackLocales } from '@gravity-ui/i18n-types';
export interface TypografConfig {
    enabled: string[];
    disabled: string[];
}
export interface PluginOptions {
    root?: string;
    mode?: 'default' | 'only-translations';
    compileMessageToAst?: boolean;
    typograf?: TypografConfig | boolean;
    fallbackLocales?: FallbackLocales<string>;
    allowedLocales?: string[];
}
export interface PluginContext extends PluginPass {
    root: string;
}
