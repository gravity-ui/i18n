import {declareMessages} from '@gravity-ui/i18n-types';

export const messages = declareMessages({
    normalMessage: {
        ru: 'русский',
        en: 'english',
        'en-kz': '',
        meta: {
            id: '123456',
        },
    },
    countOffices: {
        en: `
{ count, plural,
     =0 {We don''t have offices}
     =1 {We have only one office}
  other {We have # offices}
}`,
        'en-kz': '',
        ru: `
{ count, plural,
     =0 {У нас нет офисов}
     =1 {У нас всего один офис}
  other {У нас # офисов}
}`,
        'ru-kz': '',
        meta: {
            id: 'AboutPage.wteiuy1246',
        },
    },
    oldPlural: {
        ru: {
            one: '{count} проект',
            few: '{count} проекта',
            many: '{count} проектов',
            zero: 'ноль проектов',
            two: '',
            other: '',
        },
        en: {
            one: 'one',
            few: 'few',
            many: '',
            zero: 'zero',
            two: '',
            other: '',
        },
        meta: {
            id: 'AboutPage.kJ8gtXxcmB9F73ztkLFhqG',
            description: 'да, тут есть контекст!',
        },
    },
});
