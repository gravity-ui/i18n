import {defineConfig} from '@gravity-ui/i18n-cli/config';

export default defineConfig({
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
