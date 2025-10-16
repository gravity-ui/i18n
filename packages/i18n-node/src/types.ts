import type {
    IntlFormatters as CoreIntlFormatters,
    ResolvedIntlConfig as CoreResolvedIntlConfig,
    ResolvedIntlConfigWithLocale as CoreResolvedIntlConfigWithLocale,
    Formatters,
} from '@gravity-ui/i18n-core';
import type {Messages} from '@gravity-ui/i18n-types';

import type {factoryCreateMessagesFunction} from './components/factoryCreateMessagesFunction';

export type ResolvedIntlConfig<AvailableLocale extends string> = CoreResolvedIntlConfig<
    string,
    AvailableLocale
>;

export type ResolvedIntlConfigWithLocale<AvailableLocale extends string> =
    CoreResolvedIntlConfigWithLocale<string, AvailableLocale>;

export type DefaultIntlConfig<AvailableLocale extends string> = Pick<
    ResolvedIntlConfig<AvailableLocale>,
    | 'formats'
    | 'defaultFormats'
    | 'onError'
    | 'fallbackLocales'
    | 'defaultFallback'
    | 'disableUseLocaleLangAsFallback'
>;

export type IntlConfig<AvailableLocale extends string> = Omit<
    ResolvedIntlConfig<AvailableLocale>,
    keyof DefaultIntlConfig<AvailableLocale>
> &
    Partial<DefaultIntlConfig<AvailableLocale>>;

export type IntlFormatters = CoreIntlFormatters<string>;

export interface IntlShapeWithLocale<AvailableLocale extends string>
    extends Readonly<ResolvedIntlConfigWithLocale<AvailableLocale>>,
        IntlFormatters {
    formatters: Formatters;
    useMessages: ReturnType<typeof factoryCreateMessagesFunction<AvailableLocale>>;
}

export interface IntlShape<AvailableLocale extends string>
    extends Readonly<
        Pick<
            ResolvedIntlConfig<AvailableLocale>,
            | 'allowedLocales'
            | 'disableUseLocaleLangAsFallback'
            | 'fallbackLocales'
            | 'defaultFallback'
        >
    > {
    createMessages: <K extends string>(
        messages: Messages<AvailableLocale, K>,
    ) => {
        messages: Messages<AvailableLocale, K>;
    };
    getLocaleInstance: (locale: AvailableLocale | string) => IntlShapeWithLocale<AvailableLocale>;
}
