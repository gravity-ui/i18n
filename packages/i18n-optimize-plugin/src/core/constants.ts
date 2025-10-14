import {escapeRegExp} from 'lodash-es';

export const LANGUAGES_DIR_PREFIX = '.compiled-locales';
export const LANGUAGES_DIR_EXPRESSION = new RegExp(
    `[\\/]${escapeRegExp(LANGUAGES_DIR_PREFIX)}(?:.+)?[\\/](.+)\\.ts$`,
);

export const DEFAULT_RUNTIME_LANGUAGE_VARIABLE_NAME = 'window.I18N_LANG';
export const LANGUAGE_VARIABLE_NAME_ENV_KEY = 'process.env.I18N_LANGUAGE';

export const ROOT_PROJECT_PATH = process.cwd();
export const ROOT_PROJECT_EXPRESSION = new RegExp(`^${ROOT_PROJECT_PATH}/`);
