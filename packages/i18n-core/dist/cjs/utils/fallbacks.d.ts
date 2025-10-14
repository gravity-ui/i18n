import type { ResolvedIntlConfig } from '../types';
export declare const getFallbackLocalesList: <AvailableLocale extends string>(locale: string, config: Pick<ResolvedIntlConfig<never, AvailableLocale>, "allowedLocales" | "fallbackLocales" | "disableUseLocaleLangAsFallback" | "defaultFallback">) => AvailableLocale[];
export declare const isFallbackOnEmptyString: <AvailableLocale extends string>(config: Partial<Pick<ResolvedIntlConfig<never, AvailableLocale>, "defaultFallback">>) => boolean;
