import { intl } from "@shared/i18n";

export const messages = intl.createMessages({
    pageTitle: {
        id: 'pages.AboutPage.984hgs',
        description: 'Тайтл страницы о нас',
        messages: {
            ru: 'О нас',
            en: 'About us',
        },
    },
    countOffices: {
        id: 'pages.AboutPage.098fg2',
        description: 'Количество офисов в стране',
        messages: {
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
        },
    }
});
