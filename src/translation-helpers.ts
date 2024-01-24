export const ErrorCode = {
    NO_LANGUAGE_DATA: 'NO_LANGUAGE_DATA',
    EMPTY_LANGUAGE_DATA: 'EMPTY_LANGUAGE_DATA',
    KEYSET_NOT_FOUND: 'KEYSET_NOT_FOUND',
    EMPTY_KEYSET: 'EMPTY_KEYSET',
    MISSING_KEY: 'MISSING_KEY',
    MISSING_REQUIRED_PLURALS: 'MISSING_REQUIRED_PLURALS',
    MISSING_KEY_PARAMS_COUNT: 'MISSING_KEY_PARAMS_COUNT',
    MISSING_KEY_FOR_0: 'MISSING_KEY_FOR_0',
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
        case 'MISSING_REQUIRED_PLURALS': {
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
