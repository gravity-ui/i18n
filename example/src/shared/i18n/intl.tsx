import {createIntl} from '@gravity-ui/i18n-react';
import i18nConfig from '../../../i18n.config';

const {allowedLocales, fallbackLocales, defaultFallback} = i18nConfig;

export const intl = createIntl({
    allowedLocales,
    fallbackLocales,
    defaultFallback,
    locale: localStorage.getItem('locale') ?? 'ru', // TODO: pass user locale (for example, from window.YC.lang)
    // formats: {}, // Set based on user settings
    // defaultFormats: {}, // Set based on user settings
    defaultRichTextElements: {
        p: (chunks) => <p>{chunks}</p>,
        h1: (chunks) => <h1>{chunks}</h1>,
        a: (chunks) => <a>{chunks}</a>,
        h3: (chunks) => <h3>{chunks}</h3>,
        ul: (chunks) => <ul>{chunks}</ul>,
        li: (chunks) => <li>{chunks}</li>,
    },
    onError: (error) => {
        console.error(error);
    },
    // onWarn: () => {},
    // textComponent: React.Fragment, // React.Fragment is default
    wrapRichTextChunksInFragment: true,
});

export const setLocale = (locale: string) => {
    intl.setLocale(locale);
    localStorage.setItem('locale', locale);
    window.location.reload();
};
