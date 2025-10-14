import { memoize } from '@formatjs/fast-memoize';
import { MissingTranslationError } from '@formatjs/intl';
import { getFallbackLocalesList } from '../utils/fallbacks';
import { isLegacyPlural, convertLegacyPluralToICU } from '@gravity-ui/i18n-types';
const isMessageDefined = (message) => {
    return message !== null && typeof message !== 'undefined';
};
export function factoryCreateMessagesFunction(config) {
    return function createMessages(msgs) {
        // TODO Optimize?
        const getMessageDescriptor = memoize(({ key, message, currentLocale, }) => {
            const messages = message;
            let defaultMessage = messages?.[currentLocale];
            if (!isMessageDefined(defaultMessage)) {
                // TODO make cache
                const fallbackLocales = getFallbackLocalesList(currentLocale, config);
                const fallbackLocale = fallbackLocales.find((locale) => isMessageDefined(messages?.[locale]));
                if (fallbackLocale) {
                    defaultMessage = messages?.[fallbackLocale];
                }
            }
            if (!isMessageDefined(defaultMessage)) {
                if (config.defaultFallback === 'key') {
                    defaultMessage = String(key);
                }
                else if (config.defaultFallback === 'empty-string') {
                    defaultMessage = '';
                }
                else {
                    throw new MissingTranslationError({
                        id: String(key),
                    }, config.getLocale());
                }
            }
            if (!defaultMessage) {
                defaultMessage = '';
            }
            if (isLegacyPlural(defaultMessage)) {
                defaultMessage = convertLegacyPluralToICU(defaultMessage);
            }
            const id = message?.meta?.id || defaultMessage || String(key);
            return {
                // TODO Think about what to put to error. Use defaultMessage as ID?
                id,
                defaultMessage,
            };
        });
        return new Proxy({}, {
            get(_target, key) {
                const baseMsg = msgs[key];
                if (typeof baseMsg === 'undefined') {
                    throw new Error(`Not found message for key ${String(key)}`);
                }
                return getMessageDescriptor({
                    key,
                    message: baseMsg,
                    currentLocale: config.getLocale(),
                });
            },
        });
    };
}
//# sourceMappingURL=factoryCreateMessagesFunction.js.map