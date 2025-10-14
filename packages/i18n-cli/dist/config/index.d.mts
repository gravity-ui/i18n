import { FallbackLocales, DefaultFallback } from '@gravity-ui/i18n-types';

type ClientIntlModule = {
    /**
     * For example `src/ui/shared/i18n.ts`
     */
    path: string;
    /**
     * Client module alias from which to import the intl instance. Example: `@shared/i18n`
     */
    alias?: string;
};
type ServerIntlModule = {
    /**
     * For example `src/server/utils/i18n.ts`
     */
    path: string;
    /**
     * Server module alias from which to import the intl instance. Example: @utils/i18n
     */
    alias?: string;
    /**
     * Matchers for detection if path belongs to the server part.
     * Default: `[/src\/server\/.+$/]`
     */
    pathMatchers?: RegExp[];
};
type ProjectConfig<Locales extends string[] = string[]> = {
    allowedLocales: Locales;
    fallbackLocales?: FallbackLocales<Locales[number]>;
    defaultFallback?: DefaultFallback<Locales[number]>;
    clientIntlModule?: ClientIntlModule;
    serverIntlModule?: ServerIntlModule;
};

declare function defineConfig<Locales extends string[]>(config: ProjectConfig<Locales>): ProjectConfig<Locales>;

export { type ProjectConfig, defineConfig };
