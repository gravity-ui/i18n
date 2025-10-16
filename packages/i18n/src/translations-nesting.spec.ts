import {I18N} from './index';
import {hasNestingTranslations} from './translation-helpers';

let i18n: I18N;

beforeEach(() => {
    i18n = new I18N();
});

describe('nesting translations', () => {
    it('has nesting translations', () => {
        expect(hasNestingTranslations('Welcome to $t{service}')).toBe(true);
        expect(hasNestingTranslations('Welcome to $t{inheritance::service}')).toBe(true);
    });

    it('has not nesting translations', () => {
        expect(hasNestingTranslations('Welcome')).toBe(false);
        expect(hasNestingTranslations('Welcome {{data}}')).toBe(false);
    });

    it('should return correct translation with inherited translations from same keyset', () => {
        i18n = new I18N({
            lang: 'en',
            data: {
                en: {
                    inheritance: {
                        service: 'Service',
                        welcome1: 'Welcome to $t{service}',
                        welcome2: 'Welcome to $t{inheritance::service}',

                        nesting1: '1 $t{nesting2}',
                        nesting2: '2',
                    },
                },
            },
        });
        i18n.setLang('en');

        expect(i18n.i18n('inheritance', 'welcome1')).toBe('Welcome to Service');
        expect(i18n.i18n('inheritance', 'welcome2')).toBe('Welcome to Service');
        expect(i18n.i18n('inheritance', 'nesting1')).toBe('1 2');
    });

    it('should return correct translation with inherited translations from other keyset', () => {
        i18n = new I18N({
            lang: 'en',
            data: {
                en: {
                    global: {
                        'app-name': 'I18N',
                    },
                    inheritance: {
                        welcome: 'Welcome to $t{global::app-name}',
                    },
                },
            },
        });
        i18n.setLang('en');

        expect(i18n.i18n('inheritance', 'welcome')).toBe('Welcome to I18N');
    });

    it('should return translation key if translations nesting depth exceed 1', () => {
        i18n = new I18N({
            lang: 'en',
            data: {
                en: {
                    inheritance: {
                        nesting1: '1 $t{nesting2}',
                        nesting2: '2 $t{nesting3}',
                        nesting3: '3',
                    },
                },
            },
        });
        i18n.setLang('en');

        expect(i18n.i18n('inheritance', 'nesting1')).toBe('nesting1');
    });

    it('should return translation key if translation is plural and has nested translations', () => {
        i18n.setLang('en');
        i18n.registerKeyset('en', 'inheritance', {
            service: 'Service',
            nesting_plural_1: {
                zero: 'нет $t{service}',
                one: '{{count}} $t{service}',
                other: '',
            },

            nesting_plural_2: ['нет $t{service}', '{{count}} $t{service}'],
        });

        expect(
            i18n.i18n('inheritance', 'nesting_plural_1', {
                count: 1,
            }),
        ).toBe('nesting_plural_1');

        expect(
            i18n.i18n('inheritance', 'nesting_plural_2', {
                count: 1,
            }),
        ).toBe('nesting_plural_2');
    });

    it('should return translation key if nested translation is plural', () => {
        i18n.setLang('en');
        i18n.registerKeyset('en', 'inheritance', {
            service: 'Service: $t{users}',
            users: {
                zero: 'нет пользователей',
                one: '{{count}} пользователь',
                few: '{{count}} пользователя',
                many: '{{count}} пользователей',
                other: '',
            },
        });

        expect(
            i18n.i18n('inheritance', 'service', {
                count: 1,
            }),
        ).toBe('service');
    });
});
