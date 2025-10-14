"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLegacyPluralToICU = void 0;
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
const convertLegacyPluralToICU = (pluralValue) => {
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
exports.convertLegacyPluralToICU = convertLegacyPluralToICU;
//# sourceMappingURL=plurals.js.map