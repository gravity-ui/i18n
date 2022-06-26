import {pluralize} from "./pluralize";

const keyset = ["one", "few", "many", "zero"];
const keysetWithoutZero = ["one", "few", "many"];

describe('pluralize', () => {
    describe('ru', () => {
        const lang = 'ru';

        test('singular', () => {
            expect(pluralize(keyset, 1, lang)).toBe('one');
            expect(pluralize(keyset, 21, lang)).toBe('one');
            expect(pluralize(keyset, 121, lang)).toBe('one');
        })
        test('few', () => {
            expect(pluralize(keyset, 2, lang)).toBe('few');
            expect(pluralize(keyset, 3, lang)).toBe('few');
            expect(pluralize(keyset, 4, lang)).toBe('few');
            expect(pluralize(keyset, 22, lang)).toBe('few');
            expect(pluralize(keyset, 123, lang)).toBe('few');
            expect(pluralize(keyset, 524, lang)).toBe('few');
        })
        test('many', () => {
            for (let i = 5; i < 20; i++){
                expect(pluralize(keyset, i, lang)).toBe('many');
            }
            expect(pluralize(keyset, 25, lang)).toBe('many');
            expect(pluralize(keyset, 26, lang)).toBe('many');
            expect(pluralize(keyset, 27, lang)).toBe('many');
            expect(pluralize(keyset, 28, lang)).toBe('many');
            expect(pluralize(keyset, 29, lang)).toBe('many');
            expect(pluralize(keyset, 105, lang)).toBe('many');
            expect(pluralize(keyset, 126, lang)).toBe('many');
            expect(pluralize(keyset, 137, lang)).toBe('many');
            expect(pluralize(keyset, 148, lang)).toBe('many');
            expect(pluralize(keyset, 159, lang)).toBe('many');
            expect(pluralize(keyset, 160, lang)).toBe('many');
            expect(pluralize(keyset, 211, lang)).toBe('many');
        })
        test('zero', () => {
            expect(pluralize(keyset, 0, lang)).toBe('zero');
            expect(pluralize(keysetWithoutZero, 0, lang)).toBe('many');
        })
    })

    describe('en', () => {
        const lang = 'en';

        test('singular', () => {
            expect(pluralize(keyset, 1, lang)).toBe('one');
        })
        test('many', () => {
            for (let i = 2; i < 20; i++){
                expect(pluralize(keyset, i, lang)).toBe('many');
            }
            expect(pluralize(keyset, 21, lang)).toBe('many');
            expect(pluralize(keyset, 22, lang)).toBe('many');
            expect(pluralize(keyset, 121, lang)).toBe('many');
            expect(pluralize(keyset, 135, lang)).toBe('many');
        })
        test('zero', () => {
            expect(pluralize(keyset, 0, lang)).toBe('zero');
            expect(pluralize(keysetWithoutZero, 0, lang)).toBe('many');
        })
    })

    describe('unknown language', () => {
        expect(() => pluralize(keyset, 0, undefined)).toThrow();
        expect(() => pluralize(keyset, 1, undefined)).toThrow();
        expect(() => pluralize(keyset, 2, undefined)).toThrow();
        expect(() => pluralize(keyset, 5, undefined)).toThrow();

        expect(() => pluralize(keyset, 0, 'ca')).toThrow();
        expect(() => pluralize(keyset, 1, 'ca')).toThrow();
        expect(() => pluralize(keyset, 2, 'ca')).toThrow();
        expect(() => pluralize(keyset, 5, 'ca')).toThrow();
    })

});
