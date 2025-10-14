import type {ResolvedIntlConfigWithLocale} from '../../types';
import {getFallbackLocalesList, isFallbackOnEmptyString} from '../fallbacks';

describe('fallback locales', () => {
    it('empty fallback for one locale', () => {
        expect(
            getFallbackLocalesList('en', {
                allowedLocales: ['en'],
                fallbackLocales: {},
                defaultFallback: 'en',
                disableUseLocaleLangAsFallback: true,
            }),
        ).toEqual([]);
    });

    it('use default locale as fallback', () => {
        expect(
            getFallbackLocalesList('en', {
                allowedLocales: ['en', 'ru'],
                fallbackLocales: {},
                defaultFallback: 'ru',
                disableUseLocaleLangAsFallback: true,
            }),
        ).toEqual(['ru']);
    });

    it('use locale lang as fallback', () => {
        expect(
            getFallbackLocalesList('en-kz', {
                allowedLocales: ['en', 'en-kz'],
                fallbackLocales: {},
                defaultFallback: 'empty-string',
                disableUseLocaleLangAsFallback: false,
            }),
        ).toEqual(['en']);
    });

    it('not conflict between locale lang and fallback locale as fallback', () => {
        expect(
            getFallbackLocalesList('en-kz', {
                allowedLocales: ['en', 'en-kz'],
                fallbackLocales: {
                    'en-kz': 'en',
                    en: 'en-kz',
                },
                defaultFallback: 'empty-string',
                disableUseLocaleLangAsFallback: true,
            }),
        ).toEqual(['en']);
    });

    it('not use locale lang as fallback', () => {
        expect(
            getFallbackLocalesList('en-kz', {
                allowedLocales: ['en', 'en-kz'],
                fallbackLocales: {},
                defaultFallback: 'empty-string',
                disableUseLocaleLangAsFallback: true,
            }),
        ).toEqual([]);
    });

    it("correct order of fallbacks from fallbackLocales, locale lang and locale lang's fallback", () => {
        expect(
            getFallbackLocalesList('en-kz', {
                allowedLocales: ['en', 'en-kz', 'ru'],
                fallbackLocales: {
                    'en-kz': 'ru',
                    en: 'fr',
                },
                defaultFallback: 'empty-string',
                disableUseLocaleLangAsFallback: false,
            }),
        ).toEqual(['ru', 'en', 'fr']);

        expect(
            getFallbackLocalesList('en-kz', {
                allowedLocales: ['en', 'en-kz', 'ru', 'cn'],
                fallbackLocales: {
                    'en-kz': 'ru',
                    en: 'fr',
                    fr: 'cn',
                },
                defaultFallback: 'empty-string',
                disableUseLocaleLangAsFallback: false,
            }),
        ).toEqual(['ru', 'en', 'fr']);

        expect(
            getFallbackLocalesList('ru-unknown', {
                allowedLocales: ['en', 'ru'],
                fallbackLocales: {
                    ru: 'en',
                },
                defaultFallback: 'en',
                disableUseLocaleLangAsFallback: false,
            }),
        ).toEqual(['ru', 'en']);
    });

    it('use default fallback locale', () => {
        const config: Pick<
            ResolvedIntlConfigWithLocale<never, 'en' | 'en-kz' | 'ru'>,
            | 'fallbackLocales'
            | 'disableUseLocaleLangAsFallback'
            | 'allowedLocales'
            | 'defaultFallback'
        > = {
            allowedLocales: ['en', 'en-kz', 'ru'],
            fallbackLocales: {},
            defaultFallback: 'en',
            disableUseLocaleLangAsFallback: false,
        };

        expect(getFallbackLocalesList('en-kz', config)).toEqual(['en']);
        expect(getFallbackLocalesList('ru', config)).toEqual(['en']);
        expect(getFallbackLocalesList('unknown', config)).toEqual(['en']);
    });

    it('with default fallback locale as empty-string', () => {
        const config: Pick<
            ResolvedIntlConfigWithLocale<never, 'en' | 'en-kz' | 'ru'>,
            | 'fallbackLocales'
            | 'disableUseLocaleLangAsFallback'
            | 'allowedLocales'
            | 'defaultFallback'
        > = {
            allowedLocales: ['en', 'en-kz', 'ru'],
            fallbackLocales: {},
            defaultFallback: 'empty-string',
            disableUseLocaleLangAsFallback: true,
        };

        expect(getFallbackLocalesList('en-kz', config)).toEqual([]);
        expect(getFallbackLocalesList('ru', config)).toEqual([]);
        expect(getFallbackLocalesList('unknown', config)).toEqual([]);
    });

    it('with default fallback locale as key', () => {
        const config: Pick<
            ResolvedIntlConfigWithLocale<never, 'en' | 'en-kz' | 'ru'>,
            | 'fallbackLocales'
            | 'disableUseLocaleLangAsFallback'
            | 'allowedLocales'
            | 'defaultFallback'
        > = {
            allowedLocales: ['en', 'en-kz', 'ru'],
            fallbackLocales: {},
            defaultFallback: 'key',
            disableUseLocaleLangAsFallback: true,
        };

        expect(getFallbackLocalesList('en-kz', config)).toEqual([]);
        expect(getFallbackLocalesList('ru', config)).toEqual([]);
        expect(getFallbackLocalesList('unknown', config)).toEqual([]);
    });

    it('fallback on empty string is available if default fallback is empty-string', () => {
        expect(
            isFallbackOnEmptyString({
                defaultFallback: 'empty-string',
            }),
        ).toBe(true);
    });

    it('fallback on empty string is available if default fallback is undefined', () => {
        expect(
            isFallbackOnEmptyString({
                defaultFallback: undefined,
            }),
        ).toBe(true);
    });

    it('fallback on empty string is not available if default fallback is not empty-string', () => {
        expect(
            isFallbackOnEmptyString({
                defaultFallback: 'key',
            }),
        ).toBe(false);
    });
});
