import {createIntl} from '../createIntl';

describe('intl entity', () => {
    it('should create intl entity with valid config', () => {
        expect(
            createIntl({
                allowedLocales: ['en'],
                locale: 'en',
            }),
        ).not.toBeUndefined();
    });

    it('should throw error with invalid locale in config', () => {
        let error;
        let errorFromOnError;

        try {
            createIntl({
                allowedLocales: ['en'],
                locale: 'ru',
                onError: (e) => {
                    errorFromOnError = e;
                },
            });
        } catch (e) {
            error = e;
        }

        expect(String(error)).toBe('Error');
        expect(String(errorFromOnError)).toBe(
            'Error: [@formatjs/intl Error MISSING_DATA] Missing locale data for locale: "ru" in config.allowedLocales and in config.fallbackLocales.\n',
        );
    });

    it('should create messages without synchronization', () => {
        const create = 'Create';

        const intl = createIntl({
            allowedLocales: ['en'],
            locale: 'en',
        });

        const {t} = intl.createMessages({
            create: {
                en: create,
            },
        });

        expect(t('create')).toBe(create);
    });

    it('should create messages with synchronization', () => {
        const create = 'Create';

        const intl = createIntl({
            allowedLocales: ['en'],
            locale: 'en',
        });

        const {t} = intl.createMessages({
            create: {
                en: create,
                meta: {
                    id: 'create-id',
                },
            },
        });

        expect(t('create')).toBe(create);
    });

    it('should escape parameters when escapeParameter enabled in config', () => {
        const intl = createIntl({
            allowedLocales: ['en'],
            locale: 'en',
            escapeParameter: true,
        });

        const {t} = intl.createMessages({
            escaped: {
                en: 'Escape {param}',
            },
        });

        expect(
            t('escaped', {
                param: '<b>tag</b>',
            }),
        ).toBe('Escape &lt;b&gt;tag&lt;/b&gt;');
    });

    it('should escape parameters when escapeParameter enabled in call options', () => {
        const intl = createIntl({
            allowedLocales: ['en'],
            locale: 'en',
        });

        const {t} = intl.createMessages({
            escaped: {
                en: 'Escape {param}',
            },
        });

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
            locale: 'en',
        });

        const {t} = intl.createMessages({
            create: {
                en: createEN,
                ru: createRU,
            },
        });

        expect(intl.getLocale()).toBe('en');
        expect(t('create')).toBe(createEN);

        intl.setLocale('ru');
        expect(intl.getLocale()).toBe('ru');
        expect(t('create')).toBe(createRU);

        intl.setLocale('en');
        expect(intl.getLocale()).toBe('en');
        expect(t('create')).toBe(createEN);
    });

    it('should throw error and use previous locale if new locale is invalid', () => {
        let errorFromOnError;

        const intl = createIntl({
            allowedLocales: ['en'],
            locale: 'en',
            onError: (e) => {
                errorFromOnError = e;
            },
        });

        intl.setLocale('ru');
        expect(intl.getLocale()).toBe('en');
        expect(String(errorFromOnError)).toMatchSnapshot('set invalid locale error');
    });

    it('should change fallback locales after change locale', () => {
        const intl = createIntl({
            allowedLocales: ['en', 'en-kz', 'ru', 'ru-kz'],
            locale: 'en',
            fallbackLocales: {
                'en-kz': 'en',
                'ru-kz': 'ru',
            },
        });

        intl.setLocale('en-kz');
        expect(intl.getCurrentFallbackLocales()).toEqual(['en']);

        intl.setLocale('ru-kz');
        expect(intl.getCurrentFallbackLocales()).toEqual(['ru']);
    });
});
