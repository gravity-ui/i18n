import {createTranslationsFilePredicate} from '../filename-matcher';

describe('createTranslationsFilePredicate', () => {
    it('matches i18n.ts by default', () => {
        const isTranslationsFile = createTranslationsFilePredicate();

        expect(isTranslationsFile('/app/src/Component/i18n.ts')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/component.i18n.ts')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/keysets.ts')).toBe(false);
    });

    it('matches custom name by string suffix', () => {
        const isTranslationsFile = createTranslationsFilePredicate('keysets.ts');

        expect(isTranslationsFile('/app/src/Component/keysets.ts')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/component.keysets.ts')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/i18n.ts')).toBe(false);
    });

    it('matches windows paths', () => {
        const isTranslationsFile = createTranslationsFilePredicate([
            'shared/keysets.ts',
            {type: 'regexp', pattern: 'src/locales/[^/]+\\.ts$'},
        ]);

        expect(isTranslationsFile('C:\\app\\src\\shared\\keysets.ts')).toBe(true);
        expect(isTranslationsFile('C:\\app\\src\\locales\\en.ts')).toBe(true);
        expect(isTranslationsFile('C:\\app\\src\\other\\keysets.ts')).toBe(false);
    });

    it('matches by RegExp instance', () => {
        const isTranslationsFile = createTranslationsFilePredicate(/\.(i18n|keysets)\.tsx?$/);

        expect(isTranslationsFile('/app/src/Component/component.i18n.tsx')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/component.keysets.ts')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/component.ts')).toBe(false);
    });

    it('ignores stateful regexp flags', () => {
        const isTranslationsFile = createTranslationsFilePredicate(/i18n\.ts$/g);

        expect(isTranslationsFile('/app/src/Component/i18n.ts')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/i18n.ts')).toBe(true);
    });

    it('supports several matchers', () => {
        const isTranslationsFile = createTranslationsFilePredicate([
            'i18n.ts',
            'keysets.ts',
            {type: 'regexp', pattern: 'translations\\.tsx?$'},
        ]);

        expect(isTranslationsFile('/app/src/Component/i18n.ts')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/keysets.ts')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/translations.tsx')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/index.ts')).toBe(false);
    });

    it('falls back to default matcher for an empty list', () => {
        const isTranslationsFile = createTranslationsFilePredicate([]);

        expect(isTranslationsFile('/app/src/Component/i18n.ts')).toBe(true);
        expect(isTranslationsFile('/app/src/Component/keysets.ts')).toBe(false);
    });

    it('throws on invalid matcher', () => {
        expect(() => createTranslationsFilePredicate({type: 'regexp', pattern: '('})).toThrow(
            /Invalid filenameMatcher regexp/,
        );
        expect(() =>
            // @ts-expect-error проверяем поведение при невалидной конфигурации
            createTranslationsFilePredicate(42),
        ).toThrow(/Invalid filenameMatcher/);
    });
});
