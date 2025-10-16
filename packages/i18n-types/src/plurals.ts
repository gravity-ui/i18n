import type {PluralValue} from './types';

const PluralToICUKeysMap: Record<keyof PluralValue, string> = {
    zero: '=0',
    one: 'one',
    two: 'two',
    few: 'few',
    many: 'many',
    other: 'other',
};

// TODO Maybe doesn't need
const convertValueCountParameter = (value: string) =>
    value.replace('{{count}}', '#').replace('{count}', '#');

const PluralValueConverter: Partial<Record<keyof PluralValue, (value: PluralValue) => string>> = {
    other: (value) => value['other'] || value['many'] || value['few'] || '',
};

export const convertLegacyPluralToICU = (pluralValue: PluralValue) => {
    const icuParts: string[] = [];

    Object.entries(pluralValue).forEach(([key, value]) => {
        const convertedValue = convertValueCountParameter(
            PluralValueConverter[key as keyof PluralValue]?.(pluralValue) ?? value,
        );
        icuParts.push(`${PluralToICUKeysMap[key as keyof PluralValue]} {${convertedValue}}`);
    });

    if (icuParts.length === 0) {
        return '';
    }

    // TODO Is fallback needed?
    // Fallback to other if not defined
    if (!('other' in pluralValue)) {
        icuParts.push('other {#}');
    }

    return `{count, plural, ${icuParts.join(' ')}}`;
};
