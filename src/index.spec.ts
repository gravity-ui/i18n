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
});
