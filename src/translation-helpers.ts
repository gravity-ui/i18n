import { getNestingTranslationsRegExp } from "./consts";
import { KeyData } from "./types";

export enum ErrorCode {
    EmptyKeyset = 'EMPTY_KEYSET',
    EmptyLanguageData = 'EMPTY_LANGUAGE_DATA',
    KeysetNotFound = 'KEYSET_NOT_FOUND',
    MissingKey = 'MISSING_KEY',
    MissingKeyFor0 = 'MISSING_KEY_FOR_0',
    MissingKeyParamsCount = 'MISSING_KEY_PARAMS_COUNT',
    MissingKeyPlurals = 'MISSING_KEY_PLURALS',
    MissingInheritedKey = 'MISSING_INHERITED_KEY',
    NestedPlural = 'NESTED_PLURAL',
    ExceedTranslationNestingDepth = 'EXCEED_TRANSLATION_NESTING_DEPTH',
    NoLanguageData = 'NO_LANGUAGE_DATA',
}

const codeValues = Object.values(ErrorCode);
export type ErrorCodeType = (typeof codeValues)[number];

export function mapErrorCodeToMessage(args: {code: ErrorCodeType; lang: string; fallbackLang?: string}) {
    const {code, fallbackLang, lang} = args;
    let message = `Using language ${lang}. `;

    switch (code) {
        case ErrorCode.EmptyKeyset: {
            message += `Keyset is empty.`;
            break;
        }
        case ErrorCode.EmptyLanguageData: {
            message += 'Language data is empty.';
            break;
        }
        case ErrorCode.KeysetNotFound: {
            message += 'Keyset not found.';
            break;
        }
        case ErrorCode.MissingKey: {
            message += 'Missing key.';
            break;
        }
        case ErrorCode.MissingKeyFor0: {
            message += 'Missing key for 0';
            return message
        }
        case ErrorCode.MissingKeyParamsCount: {
            message += 'Missing params.count for key.';
            break;
        }
        case ErrorCode.MissingKeyPlurals: {
            message += 'Missing required plurals.';
            break;
        }
        case ErrorCode.NoLanguageData: {
            message = `Language "${lang}" is not defined, make sure you call setLang for the same language you called registerKeysets for!`;
        }
    }

    if (fallbackLang) {
        message += ` Trying to use fallback language "${fallbackLang}"...`;
    }

    return message;
}

export const hasNestingTranslations = (keyValue: string): boolean => {
    const NESTING_PREGEXP = getNestingTranslationsRegExp();
    const match = NESTING_PREGEXP.exec(keyValue)
    return (match?.length ?? 0) > 0
}

export const getPluralValues = (keyValue: KeyData): string[] => {
    if (keyValue instanceof Array) {
        return keyValue
    } else if (keyValue instanceof Object) {
        return Object.values(keyValue)
    }

    return []
}