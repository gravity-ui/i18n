import {defineConfig} from '@gravity-ui/i18n-cli/config';

export default defineConfig({
    allowedLocales: ['ru', 'en', 'ru-kz', 'en-kz', 'ru-yateam', 'en-yateam', 'en-tr'] as const,
    fallbackLocales: {
        'ru-kz': 'ru',
        'ru-yateam': 'ru',
        'en-yateam': 'en',
        'en-kz': 'en',
        'en-tr': 'en',
    },
    defaultFallback: 'en',

    clientIntlModule: {
        path: 'src/shared/i18n/intl.tsx',
        alias: '@shared/i18n',
    },
});
