import type { CustomFormats as CoreCustomFormats, Formatters as CoreFormatters, IntlFormatters as CoreIntlFormatters, ResolvedIntlConfig as CoreResolvedIntlConfig } from '@formatjs/intl';
import type { DefaultFallback, FallbackLocales } from '@gravity-ui/i18n-types';
export type CustomFormats = Pick<CoreCustomFormats, 'number'>;
export interface ResolvedIntlConfig<TBase, AvailableLocale extends string> {
    defaultRichTextElements?: CoreResolvedIntlConfig<TBase>['defaultRichTextElements'];
    onError: CoreResolvedIntlConfig<TBase>['onError'];
    onWarn?: CoreResolvedIntlConfig<TBase>['onWarn'];
    formats: CustomFormats;
    defaultFormats: CustomFormats;
    allowedLocales: AvailableLocale[];
    fallbackLocales: FallbackLocales<AvailableLocale>;
    defaultFallback: DefaultFallback<AvailableLocale>;
    disableUseLocaleLangAsFallback: boolean;
}
export interface ResolvedIntlConfigWithLocale<TBase, AvailableLocale extends string> extends ResolvedIntlConfig<TBase, AvailableLocale> {
    getLocale: () => AvailableLocale | string;
    getCurrentFallbackLocales: () => AvailableLocale[];
}
export type IntlFormattersFull<TBase> = CoreIntlFormatters<TBase>;
export type IntlFormatters<TBase> = Pick<IntlFormattersFull<TBase>, 'formatNumber' | 'formatNumberToParts' | 'formatDisplayName' | 'formatList' | 'formatListToParts'>;
export type Formatters = Pick<CoreFormatters, 'getNumberFormat' | 'getMessageFormat' | 'getPluralRules' | 'getListFormat' | 'getDisplayNames'>;
