import {intl} from '@shared/i18n';

export const {t, Message} = intl.createMessages({
    countOffices: {
        ru: `
{ count, plural,
     =0 {У нас нет офисов}
     =1 {У нас всего один офис}
  other {У нас # офисов}
}`,
        en: `
{ count, plural,
     =0 {We don''t have offices}
     =1 {We have only one office}
  other {We have # offices}
}`,
        'ru-kz': null,
        'en-kz': null,
        'ru-yateam': null,
        'en-yateam': null,
        'en-tr': null,
        meta: {
            id: 'AboutPage.uEhzUbvdPhfq81YtViTVho',
        },
    },
    pluralMessage: {
        ru: null,
        en: 'Plural message, ICU',
        'ru-kz': null,
        'en-kz': null,
        'ru-yateam': null,
        'en-yateam': null,
        'en-tr': null,
        meta: {
            id: 'components.pluralMessage:p158D',
        },
    },
});
