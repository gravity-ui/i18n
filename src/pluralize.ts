import {Plural} from './types';

export function pluralize(keyValue: string[], count: number, lang: string | undefined): string {
    switch (lang) {
        case 'ru': {
            return pluralizeRu(keyValue, count);
        }
        case 'en': {
            return pluralizeEn(keyValue, count);
        }
    }

    throw new Error(`Can't pluralize for unknown language: ${lang}`);
}

export function pluralizeRu(keyValue: string[], count: number): string {
    let result: string;

    const lastNumber = count % 10;
    const last2Numbers = count % 100;
    let index: Plural;

    if (count === 0) {
        index = Plural.None;
    } else if (lastNumber === 1 && last2Numbers !== 11) {
        index = Plural.Singular;
    } else if ((lastNumber > 1 && lastNumber < 5) && (last2Numbers < 10 || last2Numbers > 20)) {
        index = Plural.Few;
    } else {
        index = Plural.Many;
    }

    result = keyValue[index];

    // Fallback to Many plural form, if key is missing
    if (result === undefined) {
        result = keyValue[Plural.Many];
    }

    return result;
}

export function pluralizeEn(keyValue: string[], count: number): string {
    let result: string;

    let index: Plural;
    if (count === 0) {
        index = Plural.None;
    } else if (count === 1) {
        index = Plural.Singular;
    } else {
        index = Plural.Many;
    }

    result = keyValue[index];

    // Fallback to Many plural form, if key is missing
    if (result === undefined) {
        result = keyValue[Plural.Many];
    }

    return result;
}
