import {MissingDataError} from '@formatjs/intl';

import type {ResolvedIntlConfig} from '../types';

import {getFallbackLocalesList} from './fallbacks';
import {TECH_LOCALE} from '@gravity-ui/i18n-types';

export const validateLocale = <AvailableLocale extends string>(
    locale: string,
    config: Pick<
        ResolvedIntlConfig<never, AvailableLocale>,
        | 'allowedLocales'
        | 'fallbackLocales'
        | 'onError'
        | 'onWarn'
        | 'disableUseLocaleLangAsFallback'
        | 'defaultFallback'
    >,
) => {
    const {allowedLocales, onError, onWarn} = config;

    if (locale === TECH_LOCALE) {
        return true;
    }

    try {
        if (!Intl.NumberFormat.supportedLocalesOf(locale).length) {
            onError?.(
                new MissingDataError(
                    `Missing locale data for locale: "${locale}" in Intl.DateTimeFormat.`, // Using previous locale as fallback.
                ),
            );
            return false;
        }
    } catch {
        onError?.(
            new MissingDataError(
                `Missing locale data for locale: "${locale}" in Intl.DateTimeFormat.`, // Using previous locale as fallback.
            ),
        );
        return false;
    }

    if (!allowedLocales.includes(locale as AvailableLocale)) {
        const fallbackLocalesForLocale = getFallbackLocalesList(locale, config);

        if (fallbackLocalesForLocale.length === 0) {
            onError?.(
                new MissingDataError(
                    `Missing locale data for locale: "${locale}" in config.allowedLocales and in config.fallbackLocales.`, // Using previous locale as fallback.
                ),
            );
            return false;
        }

        onWarn?.(`Missing locale data for locale: "${locale}" in config.`); // Using [${fallbackLocalesForLocale}] locales as fallback.
    }

    return true;
};
