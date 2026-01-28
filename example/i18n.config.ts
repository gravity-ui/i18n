import {defineConfig} from '@gravity-ui/i18n-cli/config';

const config = defineConfig({
    allowedLocales: ['ru', 'en', 'ru-kz', 'en-kz', 'en-tr'] as const,
    fallbackLocales: {
        'ru-kz': 'ru',
        'en-kz': 'en',
        'en-tr': 'en',
    },
    defaultFallback: 'en',

    clientIntlModule: {
        path: 'src/shared/i18n/intl.tsx',
        alias: '@shared/i18n',
    },
});

export type AllowedLocales = (typeof config.allowedLocales)[number];

export default config;
