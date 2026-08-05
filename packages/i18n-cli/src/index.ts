export type {MessagePlacementMeta, MessageWithPlacementMeta, DeclarationType} from './types';

export {parseTranslationsFile} from './parseTranslationsFile';
export type {ParseTranslationsFileArgs, ParseTranslationsFileResult} from './parseTranslationsFile';

export {
    generateTranslationsFile,
    generateTranslationsFileContent,
} from './generateTranslationsFile';
export type {GenerateTranslationsFileParams} from './generateTranslationsFile';

export {parseProjectTranslations} from './parseProjectTranslations';

export {defineConfig} from './config/defineConfig';
export type {ProjectConfig} from './config/types';
export type {LoadProjectConfigOptions, NormalizedProjectConfig} from './config/loadProjectConfig';
export {loadProjectConfig, normalizeProjectConfig} from './config/loadProjectConfig';

export {createSourceVisitors} from './parsing';

export {TECH_LOCALE} from '@gravity-ui/i18n-types';
