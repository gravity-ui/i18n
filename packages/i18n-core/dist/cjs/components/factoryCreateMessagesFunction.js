"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factoryCreateMessagesFunction = factoryCreateMessagesFunction;
const fast_memoize_1 = require("@formatjs/fast-memoize");
const intl_1 = require("@formatjs/intl");
const fallbacks_1 = require("../utils/fallbacks");
const i18n_types_1 = require("@gravity-ui/i18n-types");
const isMessageDefined = (message) => {
    return message !== null && typeof message !== 'undefined';
};
function factoryCreateMessagesFunction(config) {
    return function createMessages(msgs) {
        // TODO Optimize?
        const getMessageDescriptor = (0, fast_memoize_1.memoize)(({ key, message, currentLocale, }) => {
            const messages = message;
            let defaultMessage = messages?.[currentLocale];
            if (!isMessageDefined(defaultMessage)) {
                // TODO make cache
                const fallbackLocales = (0, fallbacks_1.getFallbackLocalesList)(currentLocale, config);
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
                    throw new intl_1.MissingTranslationError({
                        id: String(key),
                    }, config.getLocale());
                }
            }
            if (!defaultMessage) {
                defaultMessage = '';
            }
            if ((0, i18n_types_1.isLegacyPlural)(defaultMessage)) {
                defaultMessage = (0, i18n_types_1.convertLegacyPluralToICU)(defaultMessage);
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