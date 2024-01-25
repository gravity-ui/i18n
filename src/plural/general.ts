export function pluralizer (count: number, lang: string): Intl.LDMLPluralRule {
    const pluralCategories = new Intl.PluralRules(lang).resolvedOptions().pluralCategories;
    if (!pluralCategories.includes('zero') && count === 0) {
        return 'zero';
    }

    return new Intl.PluralRules(lang).select(count);
}
