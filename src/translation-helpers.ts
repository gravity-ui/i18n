export const ErrorCode = {
    EmptyKeyset: 'EMPTY_KEYSET',
    EmptyLanguageData: 'EMPTY_LANGUAGE_DATA',
    KeysetNotFound: 'KEYSET_NOT_FOUND',
    MissingKey: 'MISSING_KEY',
    MissingKeyFor0: 'MISSING_KEY_FOR_0',
    MissingKeyParamsCount: 'MISSING_KEY_PARAMS_COUNT',
    MissingKeyPlurals: 'MISSING_KEY_PLURALS',
    NoLanguageData: 'NO_LANGUAGE_DATA',
} as const;

const codeValues = Object.values(ErrorCode);
export type ErrorCodeType = (typeof codeValues)[number];

export function mapErrorCodeToMessage(args: {lang?: string; fallbackLang?: string; code?: ErrorCodeType}) {
    const {code, fallbackLang, lang} = args;
    let message = '';

    switch (code) {
        case 'EMPTY_KEYSET': {
            message = `Keyset is empty.`;
            break;
        }
        case 'EMPTY_LANGUAGE_DATA': {
            message = 'Language data is empty.';
            break;
        }
        case 'KEYSET_NOT_FOUND': {
            message = 'Keyset not found.';
            break;
        }
        case 'MISSING_KEY': {
            message = 'Missing key.';
            break;
        }
        case 'MISSING_KEY_FOR_0': {
            message = 'Missing key for 0';
            break;
        }
        case 'MISSING_KEY_PARAMS_COUNT': {
            message = 'Missing params.count for key.';
            break;
        }
        case 'MISSING_KEY_PLURALS': {
            message = 'Missing required plurals';
            break;
        }
        case 'NO_LANGUAGE_DATA': {
            message = `Language "${lang}" is not defined, make sure you call setLang for the same language you called registerKeysets for!`;
        }
    }

    if (fallbackLang) {
        message += ` Trying to use default language "${fallbackLang}"...`;
    }

    return message;
}
