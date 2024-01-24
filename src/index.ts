import {replaceParams} from './replace-params';
import {ErrorCode, mapErrorCodeToMessage} from './translation-helpers';
import type {ErrorCodeType} from './translation-helpers';
import {PluralForm} from './types';
import type {KeysData, KeysetData, Logger, Params, Pluralizer} from './types';
import pluralizerEn from './plural/en';
import pluralizerRu from './plural/ru';

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

type TranslationData = {
    text?: string;
    fallbackText?: string;
    details?: {
        code: ErrorCodeType;
        error?: boolean;
        keysetName?: string;
        key?: string;
    };
};

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

    configurePluralization(pluralizers: Record<string, Pluralizer>) {
        this.pluralizers = Object.assign({}, this.pluralizers, pluralizers);
    }

    registerKeyset(lang: string, keysetName: string, data: KeysData = {}) {
        if (this.data[lang] && Object.prototype.hasOwnProperty.call(this.data[lang], keysetName)) {
            throw new Error(`Keyset '${keysetName}' is already registered, aborting!`);
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

        return Boolean(languageData && languageData[keysetName] && languageData[keysetName][key]);
    }

    i18n(keysetName: string, key: string, params?: Params): string {
        const languages = [this.lang, this.fallbackLang].filter(Boolean) as string[];
        let text: string | undefined;
        let fallbackText: string | undefined;
        let details: TranslationData['details'];

        for (const lang of languages) {
            ({text, fallbackText, details} = this.getTranslation({keysetName, key, params, lang}));

            if (details && (!details.error || (details.error && lang !== this.fallbackLang))) {
                const message = mapErrorCodeToMessage({
                    code: details.code,
                    lang,
                    ...(this.fallbackLang && lang !== this.fallbackLang && {fallbackLang: this.fallbackLang})
                });
                
                this.warn(message, details.keysetName, details.key);
            }

            if (text) {
                break;
            }
        }
        
        if (details?.error) {
            const message = mapErrorCodeToMessage({
                code: details.code,
                lang: languages[languages.length - 1],
            });
            throw new Error(message);
        }
        
        return (text || fallbackText) as string;
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

    protected getLanguageData(lang?: string): KeysetData | undefined {
        const langCode = lang || this.lang;
        return langCode ? this.data[langCode] : undefined;
    }

    protected getLanguagePluralizer(lang?: string): Pluralizer {
        const pluralizer = lang ? this.pluralizers[lang] : undefined;
        if (!pluralizer) {
            this.warn(`Pluralization is not configured for language '${lang}', falling back to the english ruleset`);
        }
        return pluralizer || pluralizerEn;
    }

    private getTranslation(args: {
        keysetName: string;
        key: string;
        lang?: string;
        params?: Params;
    }): TranslationData {
        const {lang, key, keysetName, params} = args;
        const languageData = this.getLanguageData(lang);

        if (typeof languageData === 'undefined') {
            return {details: {code: ErrorCode.NO_LANGUAGE_DATA, error: true}};
        }

        if (Object.keys(languageData).length === 0) {
            return {
                fallbackText: key,
                details: {code: ErrorCode.EMPTY_LANGUAGE_DATA},
            };
        }

        const keyset = languageData[keysetName];

        if (!keyset) {
            return {
                fallbackText: key,
                details: {code: ErrorCode.KEYSET_NOT_FOUND, keysetName},
            };
        }

        if (Object.keys(keyset).length === 0) {
            return {
                fallbackText: key,
                details: {code: ErrorCode.EMPTY_KEYSET, keysetName},
            };
        }

        const keyValue = keyset && keyset[key];
        const result: TranslationData = {};

        if (typeof keyValue === 'undefined') {
            return {
                fallbackText: key,
                details: {code: ErrorCode.MISSING_KEY, keysetName, key},
            };
        }

        if (Array.isArray(keyValue)) {
            if (keyValue.length < 3) {
                return {
                    fallbackText: key,
                    details: {code: ErrorCode.MISSING_REQUIRED_PLURALS, keysetName, key},
                };
            }

            const count = Number(params?.count);

            if (Number.isNaN(count)) {
                return {
                    fallbackText: key,
                    details: {code: ErrorCode.MISSING_KEY_PARAMS_COUNT, keysetName, key},
                };
            }

            const pluralizer = this.getLanguagePluralizer(lang);
            result.text = keyValue[pluralizer(count, PluralForm)] || keyValue[PluralForm.Many];

            if (keyValue[PluralForm.None] === undefined) {
                result.details = {
                    code: ErrorCode.MISSING_KEY_FOR_0,
                    keysetName,
                    key,
                };
            }
        } else {
            result.text = keyValue;
        }

        if (params) {
            result.text = replaceParams(result.text, params);
        }

        return result;
    }
}
