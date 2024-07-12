import {replaceParams} from './replace-params';
import {ErrorCode, getPluralValues, hasNestingTranslations, mapErrorCodeToMessage} from './translation-helpers';
import type {ErrorCodeType} from './translation-helpers';
import {isPluralValue} from './types';
import type {KeysData, KeysetData, Logger, Params, Pluralizer} from './types';

import pluralizerEn from './plural/en';
import pluralizerRu from './plural/ru';
import {getPluralValue} from './plural/general';
import { KEYSET_SEPARATOR, MAX_NESTING_DEPTH, getNestingTranslationsRegExp } from './consts';

export * from './types';

type I18NOptions = {
    /**
     * Keysets mapped data.
     * @example
     * ```
        import {I18N} from '@gravity-ui/i18n';

        let i18n = new I18N({
            lang: 'en',
            data: {
                en: {notification: {title: 'New version'}},
                sr: {notification: {title: 'Нова верзија'}},
            },
        });
        // Equivalent approach via public api of i18n instance
        i18n = new I18N();
        i18n.setLang('en');
        i18n.registerKeysets('en', {notification: {title: 'New version'}});
        i18n.registerKeysets('sr', {notification: {title: 'Нова верзија'}});
     * ```
     */
    data?: Record<string, KeysetData>;
    /**
     * Language used as fallback in case there is no translation in the target language.
     * @example
     * ```
        import {I18N} from '@gravity-ui/i18n';

        const i18n = new I18N({
            lang: 'sr',
            fallbackLang: 'en',
            data: {
                en: {notification: {title: 'New version'}},
                sr: {notification: {}},
            },
        });
        i18n.i18n('notification', 'title'); // 'New version'
        // Equivalent approach via public api of i18n instance
        i18n = new I18N();
        i18n.setLang('sr');
        i18n.setFallbackLang('en');
        i18n.registerKeysets('en', {notification: {title: 'New version'}});
        i18n.registerKeysets('sr', {notification: {}});
        i18n.i18n('notification', 'title'); // 'New version'
     * ```
     */
    fallbackLang?: string;
    /**
     * Target language for the i18n instance.
     * @example
     * ```
        import {I18N} from '@gravity-ui/i18n';

        let i18n = new I18N({lang: 'en'});
        // Equivalent approach via public api of i18n instance
        i18n = new I18N();
        i18n.setLang('en');
     * ```
     */
    lang?: string;
    logger?: Logger;
};

type ErrorDetails = {
    details?: {
        code: ErrorCodeType;
        keysetName?: string;
        key?: string;
    };
}

type SearchTranslationData = {
    text?: string;
} & ErrorDetails;

type SearchKeysetData = {
    data?: KeysData;
} & ErrorDetails;

export class I18N {
    data: Record<string, KeysetData> = {};
    pluralizers: Record<string, Pluralizer> = {
        en: pluralizerEn,
        ru: pluralizerRu,
    };
    logger: Logger | null = null;
    fallbackLang?: string;
    lang?: string;

    constructor(options: I18NOptions = {}) {
        const {data, fallbackLang, lang, logger = null} = options;
        this.fallbackLang = fallbackLang;
        this.lang = lang;
        this.logger = logger;

        if (data) {
            Object.entries(data).forEach(([keysetLang, keysetData]) => {
                this.registerKeysets(keysetLang, keysetData)
            });
        }
    }

    setLang(lang: string) {
        this.lang = lang;
    }

    setFallbackLang(fallbackLang: string) {
        this.fallbackLang = fallbackLang;
    }

    /**
     * @deprecated Plurals automatically used from Intl.PluralRules. You can safely remove this call. Will be removed in v2.
     */
    configurePluralization(pluralizers: Record<string, Pluralizer>) {
        this.pluralizers = Object.assign({}, this.pluralizers, pluralizers);
    }

    registerKeyset(lang: string, keysetName: string, data: KeysData = {}) {
        const isAlreadyRegistered = this.data[lang]
            && Object.prototype.hasOwnProperty.call(this.data[lang], keysetName);

        if (isAlreadyRegistered && process.env.NODE_ENV === 'production') {
            throw new Error(`Keyset '${keysetName}' is already registered, aborting!`);
        } else if (isAlreadyRegistered) {
            this.warn(`Keyset '${keysetName}' is already registered.`);
        }

        this.data[lang] = Object.assign({}, this.data[lang], {[keysetName]: data});
    }

    registerKeysets(lang: string, data: KeysetData) {
        Object.keys(data).forEach((keysetName) => {
            this.registerKeyset(lang, keysetName, data[keysetName]);
        });
    }

    has(keysetName: string, key: string, lang?: string) {
        const languageData = this.getLanguageData(lang);

        return Boolean(languageData && languageData[keysetName] && languageData[keysetName]?.[key]);
    }

    i18n(keysetName: string, key: string, params?: Params): string {
        if (!this.lang && !this.fallbackLang) {
            throw new Error('Language is not specified. You should set at least one of these: "lang", "fallbackLang"');
        }

        let text: string | undefined;

        if (this.lang) {
            text = this._i18n(keysetName, key, this.lang, params);
        } else {
            this.warn('Target language is not specified.');
        }

        if (text === undefined && this.fallbackLang && this.fallbackLang !== this.lang) {
            text = this._i18n(keysetName, key, this.fallbackLang, params);
        }

        return text ?? key;
    }

    keyset<TKey extends string = string>(keysetName: string) {
        return (key: TKey, params?: Params): string => {
            return this.i18n(keysetName, key, params);
        };
    }

    warn(msg: string, keyset?: string, key?: string) {
        let cacheKey = '';

        if (keyset) {
            cacheKey += keyset;

            if (key) {
                cacheKey += `.${key}`;
            }
        } else {
            cacheKey = 'languageData';
        }

        this.logger?.log(`I18n: ${msg}`, {
            level: 'info',
            logger: cacheKey,
            extra: {
                type: 'i18n'
            }
        });
    }

    getLanguageData(lang?: string): KeysetData | undefined {
        const langCode = lang || this.lang;
        return langCode ? this.data[langCode] : undefined;
    }

    private _i18n(keysetName: string, key: string, lang: string, params?: Params) {
        const {text, details} = (new I18NTranslation(this, lang, key, keysetName, params)).getTranslationData()

        if (details) {
            const message = mapErrorCodeToMessage({
                code: details.code,
                lang,
                fallbackLang: this.fallbackLang === lang ? undefined : this.fallbackLang,
            });
            this.warn(message, details.keysetName, details.key);
        }

        return text
    }
}

class I18NTranslation {
    private i18n: I18N
    private lang: string
    private key: string
    private keysetName: string
    private params?: Params
    private nestingDepth: number

    constructor(
        i18n: I18N, 
        lang: string,
        key: string, 
        keysetName: string, 
        params?: Params,
        nestingDepth?: number
    ) {
        this.i18n = i18n
        this.lang = lang
        this.key = key
        this.keysetName = keysetName
        this.params = params
        this.nestingDepth = nestingDepth ?? 0
    }

    getTranslationData(): SearchTranslationData {
        const {data: keyset, details} = this.getKeyset();

        if (details) {
            return {details}
        }

        const keyValue = keyset && keyset[this.key];
        const result: SearchTranslationData = {};

        if (keyValue === undefined) {
            return this.getTranslationDataError(ErrorCode.MissingKey)
        }

        if (isPluralValue(keyValue)) {
            // Limit nesting plural due to the difficulties of translations inlining
            const isNested = this.nestingDepth > 0
            const isPluralValueHasNestingTranslations = getPluralValues(keyValue).some(kv => hasNestingTranslations(kv))
            if (isNested || isPluralValueHasNestingTranslations) {
                return this.getTranslationDataError(ErrorCode.NestedPlural)
            }

            const count = Number(this.params?.count);

            if (Number.isNaN(count)) {
                return this.getTranslationDataError(ErrorCode.MissingKeyParamsCount)
            }

            result.text = getPluralValue({
                key: this.key,
                value: keyValue,
                count,
                lang: this.lang || 'en',
                pluralizers: this.i18n.pluralizers,
                log: (message) => this.i18n.warn(message, this.keysetName, this.key),
            });
        } else {
            result.text = String(keyValue);
        }

        if (this.params) {
            result.text = replaceParams(String(result.text), this.params);
        }

        const replaceTranslationsInheritanceResult = this.replaceTranslationsInheritance({
            keyValue: String(result.text),
        })
        if (!replaceTranslationsInheritanceResult.text) {
            return replaceTranslationsInheritanceResult
        }
        result.text = replaceTranslationsInheritanceResult.text

        return result;

    }

    private getTranslationDataError(errorCode: ErrorCode): SearchTranslationData {
        return {details: {code: errorCode, keysetName: this.keysetName, key: this.key}}
    }

    private getKeyset(): SearchKeysetData {
        const languageData = this.i18n.getLanguageData(this.lang);

        if (typeof languageData === 'undefined') {
            return this.getTranslationDataError(ErrorCode.NoLanguageData)
        }

        if (Object.keys(languageData).length === 0) {
            return this.getTranslationDataError(ErrorCode.EmptyLanguageData)
        }

        const keyset = languageData[this.keysetName];

        if (!keyset) {
            return this.getTranslationDataError(ErrorCode.KeysetNotFound)
        }

        if (Object.keys(keyset).length === 0) {
            return this.getTranslationDataError(ErrorCode.EmptyKeyset)
        }

        return {data: keyset}
    }

    private replaceTranslationsInheritance(args: {
        keyValue: string;
    }): SearchTranslationData {
        const {keyValue} = args
        const NESTING_PREGEXP = getNestingTranslationsRegExp();
        let result = '';

        let lastIndex = (NESTING_PREGEXP.lastIndex = 0);
        let match;
        while ((match = NESTING_PREGEXP.exec(keyValue))) {
            if (lastIndex !== match.index) {
                result += keyValue.slice(lastIndex, match.index);
            }
            lastIndex = NESTING_PREGEXP.lastIndex;

            const [all, key] = match;
            if (key) {
                if (this.nestingDepth + 1 > MAX_NESTING_DEPTH) {
                    return this.getTranslationDataError(ErrorCode.ExceedTranslationNestingDepth)
                }

                let [inheritedKey, inheritedKeysetName]: [string, string | undefined] = [key, undefined]

                const parts = key.split(KEYSET_SEPARATOR)
                if (parts.length > 1) {
                    [inheritedKeysetName, inheritedKey] = [parts[0], parts[1]!]
                }
                
                if (!inheritedKey) {
                    return this.getTranslationDataError(ErrorCode.MissingInheritedKey)
                }

                // Not support nested params
                const data = (new I18NTranslation(
                    this.i18n,
                    this.lang, 
                    inheritedKey, 
                    inheritedKeysetName ?? this.keysetName, 
                    undefined,
                    this.nestingDepth + 1
                )).getTranslationData()

                if (data.details) {
                    return this.getTranslationDataError(ErrorCode.MissingInheritedKey)
                }
                result += data.text;
            } else {
                result += all;
            }
        }
        if (lastIndex < keyValue.length) {
            result += keyValue.slice(lastIndex);
        }

        return {text: result};
    }
}