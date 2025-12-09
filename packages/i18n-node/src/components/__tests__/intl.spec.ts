import {createIntl} from '../createIntl';

describe('intl entity', () => {
    it('should create intl entity with valid config', () => {
        expect(
            createIntl({
                allowedLocales: ['en'],
            }),
        ).not.toBeUndefined();
    });

    it('should create messages without synchronization', () => {
        const create = 'Create';

        const intl = createIntl({
            allowedLocales: ['en'],
        });

        const {messages} = intl.createMessages({
            create: {
                en: create,
            },
        });

        const instance = intl.getLocaleInstance('en');
        const {t} = instance.useMessages(messages);

        expect(t('create')).toBe(create);
    });

    it('should create messages with synchronization', () => {
        const create = 'Create';

        const intl = createIntl({
            allowedLocales: ['en'],
        });

        const {messages} = intl.createMessages({
            create: {
                en: create,
                meta: {
                    id: 'create-id',
                },
            },
        });

        const instance = intl.getLocaleInstance('en');
        const {t} = instance.useMessages(messages);

        expect(t('create')).toBe(create);
    });

    it('should escape parameters when escapeParameter enabled in config', () => {
        const intl = createIntl({
            allowedLocales: ['en'],
            escapeParameter: true,
        });

        const {messages} = intl.createMessages({
            escaped: {
                en: 'Escape {param}',
            },
        });

        const instance = intl.getLocaleInstance('en');
        const {t} = instance.useMessages(messages);

        expect(
            t('escaped', {
                param: '<b>tag</b>',
            }),
        ).toBe('Escape &lt;b&gt;tag&lt;/b&gt;');
    });

    it('should escape parameters when escapeParameter enabled in call options', () => {
        const intl = createIntl({
            allowedLocales: ['en'],
        });

        const {messages} = intl.createMessages({
            escaped: {
                en: 'Escape {param}',
            },
        });

        const instance = intl.getLocaleInstance('en');
        const {t} = instance.useMessages(messages);

        expect(
            t(
                'escaped',
                {
                    param: '<b>tag</b>',
                },
                {escapeParameter: true},
            ),
        ).toBe('Escape &lt;b&gt;tag&lt;/b&gt;');
    });
});

describe('multi-locale', () => {
    it('should allow change locales', () => {
        const createEN = 'Create';
        const createRU = 'Создать';

        const intl = createIntl({
            allowedLocales: ['en', 'ru'],
        });

        const {messages} = intl.createMessages({
            create: {
                en: createEN,
                ru: createRU,
            },
        });

        const instanceEN = intl.getLocaleInstance('en');
        const {t: tEN} = instanceEN.useMessages(messages);
        expect(instanceEN.getLocale()).toBe('en');
        expect(tEN('create')).toBe(createEN);

        const instanceRU = intl.getLocaleInstance('ru');
        const {t: tRU} = instanceRU.useMessages(messages);
        expect(instanceRU.getLocale()).toBe('ru');
        expect(tRU('create')).toBe(createRU);
    });

    it('should throw error if new locale is invalid', () => {
        let error;
        let errorFromOnError;

        const intl = createIntl({
            allowedLocales: ['en'],
            onError: (e) => {
                errorFromOnError = e;
            },
        });

        try {
            intl.getLocaleInstance('ru');
        } catch (e) {
            error = e;
        }

        expect(String(error)).toMatchSnapshot('set invalid locale error');
        expect(String(errorFromOnError)).toMatchSnapshot('set invalid locale error from onError');
    });

    it('should change fallback locales after change locale', () => {
        const intl = createIntl({
            allowedLocales: ['en', 'en-kz', 'ru', 'ru-kz'],
            fallbackLocales: {
                'en-kz': 'en',
                'ru-kz': 'ru',
            },
        });

        const instanceEN = intl.getLocaleInstance('en-kz');
        expect(instanceEN.getCurrentFallbackLocales()).toEqual(['en']);

        const instanceRU = intl.getLocaleInstance('ru-kz');
        expect(instanceRU.getCurrentFallbackLocales()).toEqual(['ru']);
    });
});
