const PluralToICUKeysMap = {
    zero: '=0',
    one: 'one',
    two: 'two',
    few: 'few',
    many: 'many',
    other: 'other',
};
// TODO Maybe doesn't need
const convertValueCountParameter = (value) => value.replace('{{count}}', '#').replace('{count}', '#');
const PluralValueConverter = {
    other: (value) => value['other'] || value['many'] || value['few'] || '',
};
export const convertLegacyPluralToICU = (pluralValue) => {
    const icuParts = [];
    Object.entries(pluralValue).forEach(([key, value]) => {
        const convertedValue = convertValueCountParameter(PluralValueConverter[key]?.(pluralValue) ?? value);
        icuParts.push(`${PluralToICUKeysMap[key]} {${convertedValue}}`);
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
//# sourceMappingURL=plurals.js.map