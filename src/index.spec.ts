import {I18N} from './index';

let i18n: I18N;

beforeEach(() => {
    i18n = new I18N();
});

describe('has', () => {
    it('should return false w/out any data available', () => {
        expect(i18n.has('notification', 'title')).toBe(false);
    });

    it('should return false when keyset is missing', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: 'New version'
        });

        expect(i18n.has('button', 'label')).toBe(false);
    });

    it('should return false when key is missing', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: 'New version'
        });

        expect(i18n.has('notification', 'label')).toBe(false);
    });

    it('should return true when key exist', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: 'New version'
        });

        expect(i18n.has('notification', 'title')).toBe(true);
    });
});

describe('i18n', () => {
    it('should return key when translation missing', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {});
        expect(i18n.i18n('notification', 'title')).toBe('title');
    });

    it('should return key when keyset missing', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: 'New version'
        });
        expect(i18n.i18n('button', 'title')).toBe('title');
    });

    it('should return key when keyset is empty', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {});
        expect(i18n.i18n('notification', 'title')).toBe('title');
    });

    it('should return key when key missing', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: 'New version'
        });
        expect(i18n.i18n('notification', 'label')).toBe('label');
    });

    it('should return translation', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: 'New version'
        });
        expect(i18n.i18n('notification', 'title')).toBe('New version');
    });

    it('should return key when plural translation missing "count" param', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: ['New version', 'New versions', 'New versions']
        });
        expect(i18n.i18n('notification', 'title', {})).toBe('title');
    });

    it('should return correct pluralization', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: ['New version of {{project}}', 'New versions of {{project}}', 'New versions of {{project}}', 'Is up to date']
        });
        const project = 'Cloud';

        expect(i18n.i18n('notification', 'title', {
            count: 1,
            project
        })).toBe('New version of Cloud');
        expect(i18n.i18n('notification', 'title', {
            count: 2,
            project
        })).toBe('New versions of Cloud');
        expect(i18n.i18n('notification', 'title', {
            count: 10,
            project
        })).toBe('New versions of Cloud');
        expect(i18n.i18n('notification', 'title', {
            count: 0,
            project
        })).toBe('Is up to date');
    });

    it('should interpolate params', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: 'Hello, {{username}}!'
        });

        expect(i18n.i18n('notification', 'title', {
            username: 'Joe'
        })).toBe('Hello, Joe!');
    });

    it('should accept dollar-sign in params', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'notification', {
            title: 'Give me {{money}}!'
        });

        expect(i18n.i18n('notification', 'title', {
            money: 'money $ honey'
        })).toBe('Give me money $ honey!');
    });

    it('should return second plural form with count 0 and missing translation', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'app', {
            users: ['{{count}} пользователь', '{{count}} пользователя', '{{count}} пользователей']
        });

        expect(i18n.i18n('app', 'users', {
            count: 0
        })).toBe('0 пользователей');
    });

    it('should use pluralization ruleset for the current language', () => {
        i18n.registerKeyset('ru', 'cats', {
            count: ['{{count}} котик', '{{count}} котика', '{{count}} котиков', 'Нет котиков'],
        });
        i18n.registerKeyset('en', 'cats', {
            count: ['{{count}} kitty', '', '{{count}} kitties', 'No kitties'],
        });

        i18n.setLang('ru');

        expect(i18n.i18n('cats', 'count', {count: 0})).toBe('Нет котиков');
        expect(i18n.i18n('cats', 'count', {count: 1})).toBe('1 котик');
        expect(i18n.i18n('cats', 'count', {count: 2})).toBe('2 котика');
        expect(i18n.i18n('cats', 'count', {count: 5})).toBe('5 котиков');
        expect(i18n.i18n('cats', 'count', {count: 10})).toBe('10 котиков');
        expect(i18n.i18n('cats', 'count', {count: 11})).toBe('11 котиков');
        expect(i18n.i18n('cats', 'count', {count: 12})).toBe('12 котиков');
        expect(i18n.i18n('cats', 'count', {count: 21})).toBe('21 котик');

        i18n.setLang('en');

        expect(i18n.i18n('cats', 'count', {count: 0})).toBe('No kitties');
        expect(i18n.i18n('cats', 'count', {count: 1})).toBe('1 kitty');
        expect(i18n.i18n('cats', 'count', {count: 2})).toBe('2 kitties');
        expect(i18n.i18n('cats', 'count', {count: 5})).toBe('5 kitties');
        expect(i18n.i18n('cats', 'count', {count: 10})).toBe('10 kitties');
        expect(i18n.i18n('cats', 'count', {count: 11})).toBe('11 kitties');
        expect(i18n.i18n('cats', 'count', {count: 12})).toBe('12 kitties');
        expect(i18n.i18n('cats', 'count', {count: 21})).toBe('21 kitties');
    });

    it('should allow custom pluralizations', () => {
        i18n.setLang('nonexistent');
        i18n.configurePluralization({
            nonexistent: (count, pluralForms) => {
                if (count === 10) {
                    return pluralForms.One;
                }
                if (count === 20) {
                    return pluralForms.Few;
                }
                if (count === 30) {
                    return pluralForms.Many;
                }
                return pluralForms.None;
            },
        });
        i18n.registerKeyset('nonexistent', 'app', {
            title: ['one', 'few', 'many', 'none'],
        });

        expect(i18n.i18n('app', 'title', {count: 10})).toBe('one');
        expect(i18n.i18n('app', 'title', {count: 20})).toBe('few');
        expect(i18n.i18n('app', 'title', {count: 30})).toBe('many');
        expect(i18n.i18n('app', 'title', {count: 100})).toBe('none');
    });

    it('should allow overriding existing pluralizations', () => {
        i18n.setLang('en');
        i18n.configurePluralization({
            en: (count, pluralForms) => {
                if (count === 10) {
                    return pluralForms.One;
                }
                if (count === 20) {
                    return pluralForms.Few;
                }
                if (count === 30) {
                    return pluralForms.Many;
                }
                return pluralForms.None;
            },
        });
        i18n.registerKeyset('en', 'app', {
            title: ['one', 'few', 'many', 'none'],
        });

        expect(i18n.i18n('app', 'title', {count: 10})).toBe('one');
        expect(i18n.i18n('app', 'title', {count: 20})).toBe('few');
        expect(i18n.i18n('app', 'title', {count: 30})).toBe('many');
        expect(i18n.i18n('app', 'title', {count: 100})).toBe('none');
    });

    it('should fallback to english pluralization for unconfigured languages', () => {
        i18n.setLang('nonexistent');
        i18n.registerKeyset('nonexistent', 'app', {
            title: ['one', 'few', 'many', 'none'],
        });

        expect(i18n.i18n('app', 'title', {count: 0})).toBe('none');
        expect(i18n.i18n('app', 'title', {count: 1})).toBe('one');
        expect(i18n.i18n('app', 'title', {count: 2})).toBe('many');
        expect(i18n.i18n('app', 'title', {count: 5})).toBe('many');
        expect(i18n.i18n('app', 'title', {count: 11})).toBe('many');
        expect(i18n.i18n('app', 'title', {count: 12})).toBe('many');
        expect(i18n.i18n('app', 'title', {count: 21})).toBe('many');
    });

    it('should use the same pluralization rules for both positive and negative numbers in russian', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'scoreboard', {
            points: ['одно очко', 'два очка', 'пять очков', 'ноль очков']
        });

        const positive = [
            i18n.i18n('scoreboard', 'points', {count: 1}),
            i18n.i18n('scoreboard', 'points', {count: 2}),
            i18n.i18n('scoreboard', 'points', {count: 5}),
            i18n.i18n('scoreboard', 'points', {count: 11}),
            i18n.i18n('scoreboard', 'points', {count: 12}),
            i18n.i18n('scoreboard', 'points', {count: 21}),
        ];

        const negative = [
            i18n.i18n('scoreboard', 'points', {count: -1}),
            i18n.i18n('scoreboard', 'points', {count: -2}),
            i18n.i18n('scoreboard', 'points', {count: -5}),
            i18n.i18n('scoreboard', 'points', {count: -11}),
            i18n.i18n('scoreboard', 'points', {count: -12}),
            i18n.i18n('scoreboard', 'points', {count: -21}),
        ];

        expect(negative[0]).toBe(positive[0]);
        expect(negative[1]).toBe(positive[1]);
        expect(negative[2]).toBe(positive[2]);
        expect(negative[3]).toBe(positive[3]);
        expect(negative[4]).toBe(positive[4]);
        expect(negative[5]).toBe(positive[5]);
    });

    it('should use the same pluralization rules for both positive and negative numbers in english', () => {
        i18n.setLang('en');
        i18n.registerKeyset('en', 'scoreboard', {
            points: ['one point', '', 'some points', 'no points']
        });

        const positive = [
            i18n.i18n('scoreboard', 'points', {count: 1}),
            i18n.i18n('scoreboard', 'points', {count: 2}),
        ];

        const negative = [
            i18n.i18n('scoreboard', 'points', {count: -1}),
            i18n.i18n('scoreboard', 'points', {count: -2}),
        ];

        expect(negative[0]).toBe(positive[0]);
        expect(negative[1]).toBe(positive[1]);
    });

    it('should warn about unconfigured pluralization', () => {
        const logger = {log: jest.fn()};
        i18n = new I18N({logger});

        i18n.setLang('fr');
        i18n.registerKeyset('fr', 'app', {
            title: ['one', 'few', 'many', 'none'],
        });

        const callsLength = logger.log.mock.calls.length;

        i18n.i18n('app', 'title', {count: 1});

        expect(logger.log).toHaveBeenCalledTimes(callsLength + 1);
    });

    it('basic checks for plurals with Intl.PluralRules', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'app', {
            users: {
                'zero': 'нет пользователей',
                'one': '{{count}} пользователь',
                'few': '{{count}} пользователя',
                'many': '{{count}} пользователей',
                'other': '',
            },
        });

        expect(i18n.i18n('app', 'users', {
            count: 0
        })).toBe('нет пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 1
        })).toBe('1 пользователь');

        expect(i18n.i18n('app', 'users', {
            count: 2
        })).toBe('2 пользователя');

        expect(i18n.i18n('app', 'users', {
            count: 3
        })).toBe('3 пользователя');

        expect(i18n.i18n('app', 'users', {
            count: 5
        })).toBe('5 пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 11
        })).toBe('11 пользователей');
    });

    it('should use `other` form when no other forms are specified', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'app', {
            users: {'other': '{{count}} пользователей'}
        });

        expect(i18n.i18n('app', 'users', {
            count: 21,
        })).toBe('21 пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 0,
        })).toBe('0 пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 10,
        })).toBe('10 пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 2,
        })).toBe('2 пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 1,
        })).toBe('1 пользователей');
    });

    it('should use `other` form when no other forms are specified', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'app', {
            users: {'other': '{{count}} пользователей'},
            articles: {'one': '{{count}} статья', 'other': '{{count}} статей'},
        });

        expect(i18n.i18n('app', 'users', {
            count: 21,
        })).toBe('21 пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 0,
        })).toBe('0 пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 10,
        })).toBe('10 пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 2,
        })).toBe('2 пользователей');

        expect(i18n.i18n('app', 'users', {
            count: 1,
        })).toBe('1 пользователей');

        expect(i18n.i18n('app', 'articles', {
            count: 1,
        })).toBe('1 статья');

        expect(i18n.i18n('app', 'articles', {
            count: 21,
        })).toBe('21 статья');

        expect(i18n.i18n('app', 'articles', {
            count: 0,
        })).toBe('0 статей');

        expect(i18n.i18n('app', 'articles', {
            count: 5,
        })).toBe('5 статей');

        expect(i18n.i18n('app', 'articles', {
            count: 3,
        })).toBe('3 статей');
    });

    it('compare results between old and new plural formats', () => {
        i18n.setLang('ru');
        i18n.registerKeyset('ru', 'app', {
            usersOldPlural: [
                '{{count}} пользователь',
                '{{count}} пользователя',
                '{{count}} пользователей',
                'нет пользователей',
            ],
            users: {
                'zero': 'нет пользователей',
                'one': '{{count}} пользователь',
                'few': '{{count}} пользователя',
                'many': '{{count}} пользователей',
                'other': '',
            },
        });

        expect(i18n.i18n('app', 'users', {
            count: 0
        })).toBe(i18n.i18n('app', 'usersOldPlural', {
            count: 0
        }));

        expect(i18n.i18n('app', 'users', {
            count: 1
        })).toBe(i18n.i18n('app', 'usersOldPlural', {
            count: 1
        }));

        expect(i18n.i18n('app', 'users', {
            count: 2
        })).toBe(i18n.i18n('app', 'usersOldPlural', {
            count: 2
        }));

        expect(i18n.i18n('app', 'users', {
            count: 3
        })).toBe(i18n.i18n('app', 'usersOldPlural', {
            count: 3
        }));

        expect(i18n.i18n('app', 'users', {
            count: 5
        })).toBe(i18n.i18n('app', 'usersOldPlural', {
            count: 5
        }));

        expect(i18n.i18n('app', 'users', {
            count: 11
        })).toBe(i18n.i18n('app', 'usersOldPlural', {
            count: 11
        }));
    });
});

describe('constructor options', () => {
    describe('lang', () => {
        it('should return translation [set lang via options.lang]', () => {
            i18n = new I18N({lang: 'en'});
            i18n.registerKeyset('en', 'notification', {
                title: 'New version'
            });
            expect(i18n.i18n('notification', 'title')).toBe('New version');
        });

        it('should return translation [set lang via i18n.setLang]', () => {
            i18n.setLang('en');
            i18n.registerKeyset('en', 'notification', {
                title: 'New version'
            });
            expect(i18n.i18n('notification', 'title')).toBe('New version');
        });
    });

    describe('data', () => {
        it('should return translation [set data via options.data]', () => {
            i18n = new I18N({lang: 'en', data: {en: {notification: {title: 'New version'}}}});
            expect(i18n.i18n('notification', 'title')).toBe('New version');
        });

        it('should return translation [set data via i18n.registerKeyset]', () => {
            i18n = new I18N({lang: 'en'});
            i18n.registerKeyset('en', 'notification', {
                title: 'New version'
            });
            expect(i18n.i18n('notification', 'title')).toBe('New version');
        });
    });

    describe('fallbackLang', () => {
        it('should return translation from default language in case of language data absence', () => {
            i18n = new I18N({
                lang: 'sr',
                fallbackLang: 'en',
                data: {en: {notification: {title: 'New version'}}},
            });
            expect(i18n.i18n('notification', 'title')).toBe('New version');
        });

        it('should return fallback from default language in case of language data absence', () => {
            i18n = new I18N({lang: 'sr', fallbackLang: 'en', data: {en: {notification: {}}}});
            expect(i18n.i18n('notification', 'title')).toBe('title');
        });

        it('should return translation from default language in case of empty keyset', () => {
            i18n = new I18N({
                lang: 'sr',
                fallbackLang: 'en',
                data: {
                    en: {notification: {title: 'New version'}},
                    sr: {notification: {}},
                },
            });
            expect(i18n.i18n('notification', 'title')).toBe('New version');
        });

        it('should return translation from default language in case of missing key', () => {
            i18n = new I18N({
                lang: 'sr',
                fallbackLang: 'en',
                data: {
                    en: {notification: {title: 'New version'}},
                    sr: {notification: {hey: 'Zdravo!'}},
                },
            });
            expect(i18n.i18n('notification', 'title')).toBe('New version');
        });

        it('should return fallback from default language in case of missing key', () => {
            i18n = new I18N({
                lang: 'sr',
                fallbackLang: 'en',
                data: {
                    en: {notification: {hey: 'Hello!'}},
                    sr: {notification: {hey: 'Zdravo!'}},
                },
            });
            expect(i18n.i18n('notification', 'title')).toBe('title');
        });
    });
});

describe('registerKeyset', () => {
    it('should throw an error in case of duplicated keysets', () => {
        i18n = new I18N({
            lang: 'en',
            data: {en: {notification: {hey: 'Hello!'}}},
        });

        expect(() => {
            i18n.registerKeyset('en', 'notification', {
                title: 'Hello!'
            })
        }).toThrow(Error);
    });
});

describe('translations inheritance', () => {
    it('should return correct translation with inherited translations from same keyset', () => {
        i18n = new I18N({
            lang: 'en',
            data: {
                en: {
                    inheritance: {
                        service: "Service",
                        welcome1: "Welcome to $t{service}",
                        welcome2: "Welcome to $t{inheritance.service}",

                        nesting1: "1 $t{nesting2}",
                        nesting2: "2",
                    }
                }
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
                        "app-name": "I18N"
                    },
                    inheritance: {
                        welcome: "Welcome to $t{global.app-name}",
                    }
                }
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
                        nesting1: "1 $t{nesting2}",
                        nesting2: "2 $t{nesting3}",
                        nesting3: "3",
                    }
                }
            },
        });
        i18n.setLang('en');

        expect(i18n.i18n('inheritance', 'nesting1')).toBe('nesting1');
    });
});