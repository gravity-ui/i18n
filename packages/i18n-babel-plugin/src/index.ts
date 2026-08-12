import {i18nPlugin} from './plugin';

export {TECH_LOCALE} from '@gravity-ui/i18n-types';
export {createTranslationsFileVisitor} from './translations-file';
export type {TranslationsFileVisitorOptions} from './translations-file';
export type {TypografConfig, PluginOptions, FilenameMatcher} from './types';
export {createTranslationsFilePredicate, DEFAULT_FILENAME_MATCHER} from './filename-matcher';

export default i18nPlugin;
