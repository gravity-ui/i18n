import {intl} from '@shared/i18n';

export const {t, Message} = intl.createMessages({
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
        'ru-kz': {
            one: 'one',
            few: '',
            many: '',
            zero: 'zero',
            two: '',
            other: '',
        },
        'en-kz': {
            one: 'one',
            few: '',
            many: '',
            zero: 'внес изменения zero',
            two: '',
            other: '',
        },
        'en-tr': {
            one: 'one',
            few: '',
            many: '',
            zero: 'zero',
            two: '',
            other: '',
        },
        meta: {
            id: 'components.oldPlural:dR31S',
            description: 'да, тут есть контекст!',
        },
    },
    pluralMessage: {
        ru: null,
        en: 'Plural message, Object',
        'ru-kz': null,
        'en-kz': null,
        'en-tr': null,
        meta: {
            id: 'components.pluralMessage:4wfnp',
        },
    },
});
