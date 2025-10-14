import { intl } from "@shared/i18n";

const messages = intl.createMessages({
    pageTitle: {
        ru: 'О нас',
        en: 'About us',
    },
    countOffices: {
        ru: `{countOffices, plural,
            =0 {У нас нет офисов}
            =1 {У нас всего один офис}
            other {У нас # офисов}
        }`,
        en: `{countOffices, plural,
            =0 {We don't have offices}
            =1 {We have only one office}
            other {We have # offices}
        }`,
    }
});

export const {t, Message} = intl.createMessageFunctions(messages);
