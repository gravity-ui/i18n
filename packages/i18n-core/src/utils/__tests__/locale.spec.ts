import {TECH_LOCALE} from '@gravity-ui/i18n-types';
import {validateLocale} from '../locale';

describe('locale', () => {
    it('should be valid if it is one of allowed locales', () => {
        let error;

        expect(
            validateLocale('en', {
                allowedLocales: ['en'],
                fallbackLocales: {},
                onError: (e) => {
                    error = e;
                },
                onWarn: () => {},
                disableUseLocaleLangAsFallback: true,
                defaultFallback: 'empty-string',
            }),
        ).toBe(true);

        expect(error).toEqual(undefined);
    });

    it('should be valid if have fallback locales', () => {
        let error;

        expect(
            validateLocale('en-kz', {
                allowedLocales: ['en'],
                fallbackLocales: {
                    // @ts-ignore
                    'en-kz': 'en',
                },
                onError: (e) => {
                    error = e;
                },
                onWarn: () => {},
                disableUseLocaleLangAsFallback: true,
                defaultFallback: 'empty-string',
            }),
        ).toBe(true);

        expect(error).toEqual(undefined);
    });

    it('should not be valid if it is unknown locale for intl', () => {
        let errorA;

        expect(
            validateLocale('unknown', {
                allowedLocales: ['en'],
                fallbackLocales: {
                    // @ts-ignore
                    'en-kz': 'en',
                },
                onError: (e) => {
                    errorA = e;
                },
                onWarn: () => {},
                disableUseLocaleLangAsFallback: true,
                defaultFallback: 'empty-string',
            }),
        ).toBe(false);

        expect(errorA).toMatchSnapshot('not valid locale error');

        let errorB;

        expect(
            validateLocale('someUnknownLocale', {
                allowedLocales: ['en'],
                fallbackLocales: {
                    // @ts-ignore
                    'en-kz': 'en',
                },
                onError: (e) => {
                    errorB = e;
                },
                onWarn: () => {},
                disableUseLocaleLangAsFallback: true,
                defaultFallback: 'empty-string',
            }),
        ).toBe(false);

        expect(errorB).toMatchSnapshot('not valid locale for Intl error');
    });

    it('should be valid if it is tech locale', () => {
        expect(
            validateLocale(TECH_LOCALE, {
                allowedLocales: ['en'],
                fallbackLocales: {},
                onError: () => {},
                onWarn: () => {},
                disableUseLocaleLangAsFallback: true,
                defaultFallback: 'empty-string',
            }),
        ).toBe(true);
    });
});
