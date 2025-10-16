import type {FallbackLocales, Messages} from '@gravity-ui/i18n-types';
import {
    createIntl as coreCreateIntl,
    createIntlCache,
    getFallbackLocalesList,
    getFormatters,
    getIntlFormatters,
    isFallbackOnEmptyString,
    memoize,
    onErrorFactory,
    validateLocale,
} from '@gravity-ui/i18n-core';

import type {
    IntlConfig,
    IntlShape,
    IntlShapeWithLocale,
    ResolvedIntlConfigWithLocale,
} from '../types';

import {factoryCreateMessagesFunction} from './factoryCreateMessagesFunction';

export function createIntl<AvailableLocale extends string>(
    config: IntlConfig<AvailableLocale>,
): IntlShape<AvailableLocale> {
    const intlShapeConfig: Omit<
        IntlShape<AvailableLocale>,
        'getLocaleInstance' | 'createMessages'
    > = {
        allowedLocales: config.allowedLocales,
        disableUseLocaleLangAsFallback: config.disableUseLocaleLangAsFallback ?? false,
        fallbackLocales: config.fallbackLocales ?? ({} as FallbackLocales<AvailableLocale>),
        defaultFallback: config.defaultFallback ?? 'empty-string',
    };

    const createMessages = <K extends string>(messages: Messages<AvailableLocale, K>) => ({
        messages,
    });

    const getLocaleInstance = memoize(
        (locale: AvailableLocale | string): IntlShapeWithLocale<AvailableLocale> => {
            const cache = createIntlCache();
            const coreIntl = coreCreateIntl(
                {
                    defaultLocale: locale,
                    fallbackOnEmptyString: isFallbackOnEmptyString(config),
                    locale,
                    ...config,
                    ...intlShapeConfig,
                    onError: onErrorFactory({onError: config.onError}),
                },
                cache,
            );

            const resolvedIntlConfig: ResolvedIntlConfigWithLocale<AvailableLocale> = {
                defaultRichTextElements: coreIntl.defaultRichTextElements,
                onError: coreIntl.onError,
                onWarn: coreIntl.onWarn,

                getLocale: () => locale,

                formats: {
                    number: coreIntl.formats.number,
                },
                defaultFormats: {
                    number: coreIntl.defaultFormats.number,
                },

                allowedLocales: config.allowedLocales,
                fallbackLocales: config.fallbackLocales ?? ({} as FallbackLocales<AvailableLocale>),
                defaultFallback: config.defaultFallback ?? 'empty-string',
                disableUseLocaleLangAsFallback: config.disableUseLocaleLangAsFallback ?? false,
                getCurrentFallbackLocales: function () {
                    return getFallbackLocalesList(locale, this);
                },
            };

            if (!validateLocale(locale, resolvedIntlConfig)) {
                // TODO It crashes page, maybe other behavior
                // TODO Add message
                throw new Error('');
            }

            const intlFormatters = getIntlFormatters(coreIntl);
            const formatters = getFormatters(coreIntl.formatters);

            const useMessages = factoryCreateMessagesFunction(resolvedIntlConfig, {
                formatMessage: coreIntl.formatMessage,
            });

            return {
                ...resolvedIntlConfig,
                ...intlFormatters,
                formatters,
                useMessages,
            };
        },
    );

    return {
        ...intlShapeConfig,
        getLocaleInstance,
        createMessages,
    };
}
