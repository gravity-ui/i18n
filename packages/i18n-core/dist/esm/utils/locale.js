import { MissingDataError } from '@formatjs/intl';
import { getFallbackLocalesList } from './fallbacks';
import { TECH_LOCALE } from '@gravity-ui/i18n-types';
export const validateLocale = (locale, config) => {
    const { allowedLocales, onError, onWarn } = config;
    if (locale === TECH_LOCALE) {
        return true;
    }
    try {
        if (!Intl.NumberFormat.supportedLocalesOf(locale).length) {
            onError?.(new MissingDataError(`Missing locale data for locale: "${locale}" in Intl.DateTimeFormat.`));
            return false;
        }
    }
    catch {
        onError?.(new MissingDataError(`Missing locale data for locale: "${locale}" in Intl.DateTimeFormat.`));
        return false;
    }
    if (!allowedLocales.includes(locale)) {
        const fallbackLocalesForLocale = getFallbackLocalesList(locale, config);
        if (fallbackLocalesForLocale.length === 0) {
            onError?.(new MissingDataError(`Missing locale data for locale: "${locale}" in config.allowedLocales and in config.fallbackLocales.`));
            return false;
        }
        onWarn?.(`Missing locale data for locale: "${locale}" in config.`); // Using [${fallbackLocalesForLocale}] locales as fallback.
    }
    return true;
};
//# sourceMappingURL=locale.js.map