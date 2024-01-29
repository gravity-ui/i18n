import type { DeprecatedPluralValue, PluralValue, Pluralizer } from "../types";
import {PluralForm} from '../types';

export function getPluralViaIntl(key: string, value: PluralValue, count: number, lang: string) {
    if (typeof value.other === 'undefined') {
        throw new Error(`Missing required plural form 'other' for key '${key}'`);
    }

    if (value.zero && count === 0) {
        return value.zero;
    }

    if (!Intl.PluralRules) {
        throw new Error('Intl.PluralRules is not available. Use polyfill.');
    }

    const pluralRules = new Intl.PluralRules(lang);
    return value[pluralRules.select(count)] || value.other;
}

type FormatPluralArgs = {
    key: string;
    value: DeprecatedPluralValue | PluralValue;
    fallbackValue?: string;
    count: number;
    lang: string;
    pluralizers?: Record<string, Pluralizer>;
    log: (message: string) => void;
}

export function getPluralValue({value, count, lang, pluralizers, log, key}: FormatPluralArgs) {
    if (!Array.isArray(value)) {
        return getPluralViaIntl(key, value, count, lang) || key;
    }

    if (!pluralizers) {
        log('Can not use deprecated plural format without pluralizers');
        return key;
    }

    if (!pluralizers[lang]) {
        log(`Pluralization is not configured for language '${lang}', falling back to the english ruleset`);
    }

    if (value.length < 3) {
        log('Missing required plurals');
        return key;
    }

    const pluralizer = pluralizers[lang] || pluralizers['en'];

    if (!pluralizer) {
        log('Fallback pluralization is not configured!');
        return key;
    }

    return value[pluralizer(count, PluralForm)] || value[PluralForm.Many] || key;
}
