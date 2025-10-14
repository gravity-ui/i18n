"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLocale = void 0;
const intl_1 = require("@formatjs/intl");
const fallbacks_1 = require("./fallbacks");
const i18n_types_1 = require("@gravity-ui/i18n-types");
const validateLocale = (locale, config) => {
    const { allowedLocales, onError, onWarn } = config;
    if (locale === i18n_types_1.TECH_LOCALE) {
        return true;
    }
    try {
        if (!Intl.NumberFormat.supportedLocalesOf(locale).length) {
            onError?.(new intl_1.MissingDataError(`Missing locale data for locale: "${locale}" in Intl.DateTimeFormat.`));
            return false;
        }
    }
    catch {
        onError?.(new intl_1.MissingDataError(`Missing locale data for locale: "${locale}" in Intl.DateTimeFormat.`));
        return false;
    }
    if (!allowedLocales.includes(locale)) {
        const fallbackLocalesForLocale = (0, fallbacks_1.getFallbackLocalesList)(locale, config);
        if (fallbackLocalesForLocale.length === 0) {
            onError?.(new intl_1.MissingDataError(`Missing locale data for locale: "${locale}" in config.allowedLocales and in config.fallbackLocales.`));
            return false;
        }
        onWarn?.(`Missing locale data for locale: "${locale}" in config.`); // Using [${fallbackLocalesForLocale}] locales as fallback.
    }
    return true;
};
exports.validateLocale = validateLocale;
//# sourceMappingURL=locale.js.map