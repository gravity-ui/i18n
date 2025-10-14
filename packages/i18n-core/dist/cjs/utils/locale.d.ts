import type { ResolvedIntlConfig } from '../types';
export declare const validateLocale: <AvailableLocale extends string>(locale: string, config: Pick<ResolvedIntlConfig<never, AvailableLocale>, "allowedLocales" | "fallbackLocales" | "onError" | "onWarn" | "disableUseLocaleLangAsFallback" | "defaultFallback">) => boolean;
