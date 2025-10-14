import type React from 'react';

import {
    clearCacheOnPlace,
    getFallbackLocalesList,
    getFormatters,
    getIntlFormatters,
    isFallbackOnEmptyString,
    onErrorFactory,
    validateLocale,
} from '@gravity-ui/i18n-core';
import {createIntl as coreCreateIntl, createIntlCache} from 'react-intl';

import type {IntlConfig, IntlShape, ResolvedIntlConfig} from '../types';

import {factoryCreateMessagesFunction} from './factoryCreateMessagesFunction';

export function createIntl<AvailableLocale extends string>(
    config: IntlConfig<AvailableLocale>,
): IntlShape<AvailableLocale> {
    let currentLocale = config.locale;

    const cache = createIntlCache();
    const coreIntl = coreCreateIntl(
        {
            defaultLocale: currentLocale,
            fallbackOnEmptyString: isFallbackOnEmptyString(config),
            ...config,
            onError: onErrorFactory({onError: config.onError}),
        },
        cache,
    );

    const resolvedIntlConfig: ResolvedIntlConfig<AvailableLocale> = {
        defaultRichTextElements: coreIntl.defaultRichTextElements,
        onError: coreIntl.onError,
        onWarn: coreIntl.onWarn,

        getLocale: () => currentLocale,

        formats: {
            number: coreIntl.formats.number,
        },
        defaultFormats: {
            number: coreIntl.defaultFormats.number,
        },

        allowedLocales: config.allowedLocales,
        fallbackLocales:
            config.fallbackLocales ??
            ({} as ResolvedIntlConfig<AvailableLocale>['fallbackLocales']),
        defaultFallback: config.defaultFallback ?? 'empty-string',
        disableUseLocaleLangAsFallback: config.disableUseLocaleLangAsFallback ?? false,
        getCurrentFallbackLocales: function () {
            return getFallbackLocalesList(currentLocale, this);
        },

        textComponent: coreIntl.textComponent,
        wrapRichTextChunksInFragment: coreIntl.wrapRichTextChunksInFragment,
    };

    if (!validateLocale(currentLocale, resolvedIntlConfig)) {
        // TODO It crashes page, maybe other behavior
        // TODO Add message
        throw new Error('');
    }

    const createMessages = factoryCreateMessagesFunction(resolvedIntlConfig, {
        formatMessage: coreIntl.formatMessage,
    });

    const intlFormatters = getIntlFormatters<React.ReactNode>(coreIntl);
    const formatters = getFormatters(coreIntl.formatters);

    const setLocale = (locale: AvailableLocale | string) => {
        if (locale === currentLocale) {
            return;
        }

        if (!validateLocale(locale, resolvedIntlConfig)) {
            return;
        }

        clearCacheOnPlace(cache);
        currentLocale = locale;
        coreIntl.locale = locale;
        coreIntl.defaultLocale = locale;
    };

    return {
        ...resolvedIntlConfig,
        ...intlFormatters,
        formatters,
        createMessages,
        setLocale,
    };
}
