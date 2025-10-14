import type {ResolvedIntlConfig} from '../types';

// TODO Check if available to fallback on empty string
// TODO Use defaultLang/defaultFallback
export const getFallbackLocalesList = <AvailableLocale extends string>(
    locale: string,
    config: Pick<
        ResolvedIntlConfig<never, AvailableLocale>,
        'allowedLocales' | 'fallbackLocales' | 'disableUseLocaleLangAsFallback' | 'defaultFallback'
    >,
): AvailableLocale[] => {
    const {allowedLocales, fallbackLocales, defaultFallback, disableUseLocaleLangAsFallback} =
        config;

    const result = new Set<AvailableLocale>();

    const addToResult = (availableLocales: AvailableLocale | AvailableLocale[]) => {
        if (Array.isArray(availableLocales)) {
            availableLocales.forEach((availableLocale) => addToResult(availableLocale));
            return;
        }

        if (availableLocales === locale) {
            return;
        }

        result.add(availableLocales);
    };

    const fallbackLocale = fallbackLocales[locale as AvailableLocale];

    if (fallbackLocale) {
        addToResult(fallbackLocale);
    }

    if (!disableUseLocaleLangAsFallback) {
        const intlLocale = new Intl.Locale(locale);
        const lang = intlLocale.language;

        if (lang) {
            if (allowedLocales.includes(lang as AvailableLocale)) {
                addToResult(lang as AvailableLocale);
            }

            const fallbackLocalesForLang = getFallbackLocalesList(lang, {
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
    } else if (typeof defaultFallback === 'string') {
        if (defaultFallback !== 'empty-string' && defaultFallback !== 'key') {
            addToResult(defaultFallback);
        }
    }

    return Array.from(result);
};

export const isFallbackOnEmptyString = <AvailableLocale extends string>(
    config: Partial<Pick<ResolvedIntlConfig<never, AvailableLocale>, 'defaultFallback'>>,
) => {
    const {defaultFallback} = config;

    if (!defaultFallback) {
        // Default fallback is 'empty-string'
        return true;
    }

    return !Array.isArray(defaultFallback) && defaultFallback === 'empty-string';
};
