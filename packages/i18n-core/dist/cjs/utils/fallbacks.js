"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFallbackOnEmptyString = exports.getFallbackLocalesList = void 0;
// TODO Check if available to fallback on empty string
// TODO Use defaultLang/defaultFallback
const getFallbackLocalesList = (locale, config) => {
    const { allowedLocales, fallbackLocales, defaultFallback, disableUseLocaleLangAsFallback } = config;
    const result = new Set();
    const addToResult = (availableLocales) => {
        if (Array.isArray(availableLocales)) {
            availableLocales.forEach((availableLocale) => addToResult(availableLocale));
            return;
        }
        if (availableLocales === locale) {
            return;
        }
        result.add(availableLocales);
    };
    const fallbackLocale = fallbackLocales[locale];
    if (fallbackLocale) {
        addToResult(fallbackLocale);
    }
    if (!disableUseLocaleLangAsFallback) {
        const intlLocale = new Intl.Locale(locale);
        const lang = intlLocale.language;
        if (lang) {
            if (allowedLocales.includes(lang)) {
                addToResult(lang);
            }
            const fallbackLocalesForLang = (0, exports.getFallbackLocalesList)(lang, {
                ...config,
                disableUseLocaleLangAsFallback: true,
            });
            if (fallbackLocalesForLang.length > 0) {
                addToResult(fallbackLocalesForLang);
            }
        }
    }
    if (Array.isArray(defaultFallback)) {
        addToResult(defaultFallback);
    }
    else if (typeof defaultFallback === 'string') {
        if (defaultFallback !== 'empty-string' && defaultFallback !== 'key') {
            addToResult(defaultFallback);
        }
    }
    return Array.from(result);
};
exports.getFallbackLocalesList = getFallbackLocalesList;
const isFallbackOnEmptyString = (config) => {
    const { defaultFallback } = config;
    if (!defaultFallback) {
        // Default fallback is 'empty-string'
        return true;
    }
    return !Array.isArray(defaultFallback) && defaultFallback === 'empty-string';
};
exports.isFallbackOnEmptyString = isFallbackOnEmptyString;
//# sourceMappingURL=fallbacks.js.map