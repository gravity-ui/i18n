import type React from 'react';

import type {
    IntlFormatters as CoreIntlFormatters,
    ResolvedIntlConfigWithLocale as CoreResolvedIntlConfig,
    Formatters,
} from '@gravity-ui/i18n-core';
import type {ResolvedIntlConfig as ReactResolvedIntlConfig} from 'react-intl';

import type {factoryCreateMessagesFunction} from './components/factoryCreateMessagesFunction';
import type {factoryDeclareMessagesFunction} from './components/factoryDeclareMessagesFunction';
import type {factoryUseMessagesFunction} from './components/factoryUseMessagesFunction';

export interface ResolvedIntlConfig<AvailableLocale extends string>
    extends CoreResolvedIntlConfig<React.ReactNode, AvailableLocale> {
    textComponent?: ReactResolvedIntlConfig['textComponent'];
    wrapRichTextChunksInFragment?: ReactResolvedIntlConfig['wrapRichTextChunksInFragment'];
}

export type DefaultIntlConfig<AvailableLocale extends string> = Pick<
    Omit<ResolvedIntlConfig<AvailableLocale>, 'getLocale' | 'getCurrentFallbackLocales'>,
    | 'formats'
    | 'defaultFormats'
    | 'onError'
    | 'fallbackLocales'
    | 'defaultFallback'
    | 'disableUseLocaleLangAsFallback'
    | 'escapeParameter'
>;

export type IntlConfig<AvailableLocale extends string> = Omit<
    Omit<ResolvedIntlConfig<AvailableLocale>, 'getLocale' | 'getCurrentFallbackLocales'>,
    keyof DefaultIntlConfig<AvailableLocale>
> &
    Partial<DefaultIntlConfig<AvailableLocale>> & {
        locale: AvailableLocale | string;
    };

export type IntlFormatters = CoreIntlFormatters<React.ReactNode>;

export interface IntlShape<AvailableLocale extends string>
    extends Readonly<ResolvedIntlConfig<AvailableLocale>>,
        IntlFormatters {
    formatters: Formatters;
    createMessages: ReturnType<typeof factoryCreateMessagesFunction<AvailableLocale>>;
    declareMessages: ReturnType<typeof factoryDeclareMessagesFunction<AvailableLocale>>;
    useMessages: ReturnType<typeof factoryUseMessagesFunction<AvailableLocale>>;
    setLocale: (locale: AvailableLocale | string) => void;
}
