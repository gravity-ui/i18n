import { type WebpackPluginInstance, type Compiler } from 'webpack';
export declare class LanguageRuntimePlugin implements WebpackPluginInstance {
    languageVariableName: string;
    constructor(languageVariableName: string);
    apply(compiler: Compiler): void;
}
