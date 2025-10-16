import {intl} from './intl';

export const {t} = intl.createMessages({
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
        'en-tr': '',
        'en-yateam': '',
        ru: `
{ count, plural,
     =0 {У нас нет офисов}
     =1 {У нас всего один офис}
  other {У нас # офисов}
}`,
        'ru-kz': '',
        'ru-yateam': '',
        meta: {
            id: 'AboutPage.wteiuy1246',
        },
    },
    messageWithMarkdown: {
        ru: 'Содержат правила для получения и отправки трафика. Управлять группами безопасности можно в сервисе [Virtual Private Cloud](https://console.yandex.cloud/link/vpc/security-groups){target=_blank rel="noopener"}.\n\nГруппы безопасности не ограничивают трафик к веб-интерфейсу Apache Airflow™.',
        en: 'Contain rules for receiving and sending traffic. You can manage security groups in the [Virtual Private Cloud service](https://kz.console.yandex.cloud/link/vpc/security-groups){target=_blank rel="noopener"}.\n\nSecurity groups do not restrict traffic to the Apache Airflow™ web interface.',
        'en-kz': null,
        meta: {
            markdown: true,
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
        'ru-yateam': {
            one: 'one',
            few: '',
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
        en: {
            one: 'one',
            few: 'few',
            many: '',
            zero: 'zero',
            two: '',
            other: '',
        },
        'en-yateam': {
            one: 'one жжуййкйцк',
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
            id: 'AboutPage.kJ8gtXxcmB9F73ztkLFhqG',
            description: 'да, тут есть контекст!',
        },
    },
});
