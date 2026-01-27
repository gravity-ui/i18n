export {createIntl, createIntlCache} from '@formatjs/intl';

export {memoize} from '@formatjs/fast-memoize';

export type {
    ResolvedIntlConfig,
    ResolvedIntlConfigWithLocale,
    IntlFormattersFull,
    IntlFormatters,
    CustomFormats,
    Formatters,
} from './types';

export {onErrorFactory} from './utils/onErrorFactory';
export {clearCacheOnPlace} from './utils/cache';
export {validateLocale} from './utils/locale';
export {getFallbackLocalesList, isFallbackOnEmptyString} from './utils/fallbacks';
export {getIntlFormatters, getFormatters} from './utils/baseTypes';

export {factoryCreateMessageFunctions} from './components/factoryCreateMessageFunctions';
export {factoryCreateMessagesFunction} from './components/factoryCreateMessagesFunction';
export {factoryDeclareMessagesFunction} from './components/factoryDeclareMessagesFunction';

export {TECH_LOCALE} from '@gravity-ui/i18n-types';
