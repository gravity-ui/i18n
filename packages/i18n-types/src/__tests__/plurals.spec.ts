import {convertLegacyPluralToICU} from '../plurals';

describe('convert plural object to ICU format', () => {
    it('should convert empty object as empty string', () => {
        expect(convertLegacyPluralToICU({})).toBe('');
    });

    it('should convert all plural keys', () => {
        expect(
            convertLegacyPluralToICU({
                zero: 'items {{count}}',
                one: 'items {{count}}',
                two: 'items {{count}}',
                few: 'items',
                many: 'items {count}',
                other: 'items {count}',
            }),
        ).toBe(
            '{count, plural, =0 {items #} one {items #} two {items #} few {items} many {items #} other {items #}}',
        );
    });

    it('should add other form if missing', () => {
        expect(convertLegacyPluralToICU({zero: '{{count}} items'})).toBe(
            '{count, plural, =0 {# items} other {#}}',
        );
    });

    it('should not duplicate other if is null', () => {
        expect(
            convertLegacyPluralToICU({
                zero: 'items {{count}}',
                one: 'items {{count}}',
                two: 'items {{count}}',
                few: 'items {{count}}',
                many: 'items {{count}}',
                other: '',
            }),
        ).toBe(
            '{count, plural, =0 {items #} one {items #} two {items #} few {items #} many {items #} other {items #}}',
        );
    });

    it('should use "many" form for "other" if "other" is not defined', () => {
        expect(
            convertLegacyPluralToICU({
                zero: '',
                one: '',
                two: '',
                few: '',
                many: 'many',
                other: '',
            }),
        ).toBe('{count, plural, =0 {} one {} two {} few {} many {many} other {many}}');
    });

    it('should use "few" form for "other" if "other" and "many" is not defined', () => {
        expect(
            convertLegacyPluralToICU({
                zero: '',
                one: '',
                two: '',
                few: 'few',
                many: '',
                other: '',
            }),
        ).toBe('{count, plural, =0 {} one {} two {} few {few} many {} other {few}}');
    });
});
