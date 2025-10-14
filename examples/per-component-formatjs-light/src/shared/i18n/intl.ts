import {createIntl} from './lib';

export const intl = createIntl({
    locale: 'ru', // TODO: pass user locale (for example, from window.YC.lang)
    allowedLocales: ['ru', 'en'] as const,
});
