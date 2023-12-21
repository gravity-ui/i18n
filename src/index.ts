import {replaceParams} from './replace-params';
import {KeysData, KeysetData, Logger, Params, PluralForm, Pluralizer} from './types';

import pluralizerEn from './plural/en';
import pluralizerRu from './plural/ru';

export * from './types';

export class I18N {
    data: Record<string, KeysetData> = {};
    lang?: string = undefined;
    pluralizers: Record<string, Pluralizer> = {
        en: pluralizerEn,
        ru: pluralizerRu,
    };
    logger: Logger | null = null;
    defaultLang?: string;

    constructor(options?: {logger?: Logger; defaultLang?: string}) {
        this.logger = options?.logger || null;
        this.defaultLang = options?.defaultLang;
    }

    setLang(lang: string) {
        this.lang = lang;
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
        this.checkLangDefinitionOrThrow();

        let keyValue = this.getValue(keysetName, key, this.lang);

        if (!keyValue) {
            if (this.lang === this.defaultLang || !this.defaultLang) {
                return key;
            }
            
            this.warn(`Switch to default language ${this.defaultLang}`);

            keyValue = this.getValue(keysetName, key, this.defaultLang);
            if (!keyValue) {
                return key
            }
        }
        
        let result: string;

        if (Array.isArray(keyValue)) {
            if (keyValue.length < 3) {
                this.warn(
                    'Missing required plurals',
                    keysetName,
                    key,
                );

                return key;
            }

            const count = Number(params?.count);

            if (Number.isNaN(count)) {
                this.warn(
                    'Missing params.count for key.',
                    keysetName,
                    key,
                );

                return key;
            }

            const pluralizer = this.getLanguagePluralizer(this.lang);
            result = keyValue[pluralizer(count, PluralForm)] || keyValue[PluralForm.Many];

            if (keyValue[PluralForm.None] === undefined) {
                this.warn('Missing key for 0', keysetName, key);
            }
        } else {
            result = keyValue;
        }

        if (params) {
            result = replaceParams(result, params);
        }

        return result;
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

    protected checkLangDefinitionOrThrow() {
        if ((!this.lang || !this.getLanguageData(this.lang)) && (!this.defaultLang || !this.getLanguageData(this.defaultLang))) {
            throw Error(`Language '${this.lang}' is not defined, make sure you call setLang for the same language you called registerKeysets for!`);
        }
    }

    protected getLanguageData(lang?: string): KeysetData | undefined {
        const langCode = lang || this.lang;

        const langData = langCode ? this.data[langCode] : undefined;

        if (typeof langData === 'undefined') {
            this.warn(`Language data not found.`);
            return undefined;
        }

        return langData;
    }

    protected getKeysetData(keysetName: string, lang?: string) {
        const languageData = this.getLanguageData(lang);

        if (!languageData) {
            return undefined;
        }

        const keyset = languageData[keysetName];

        if (!keyset) {
            this.warn('Keyset not found.', keysetName);
            return undefined;
        }

        if (Object.keys(keyset).length === 0) {
            this.warn('Keyset is empty.', keysetName);

            return undefined;
        }

        return keyset;
    }

    protected getValue(keysetName: string, key: string, lang?: string) {
        const keyset = this.getKeysetData(keysetName, lang);

        const value = keyset && keyset[key];

        if (!value) {
            this.warn('Missing key.', keysetName, key);

            return undefined;
        }

        return value;
    }

    protected getLanguagePluralizer(lang?: string): Pluralizer {
        const pluralizer = lang ? this.pluralizers[lang] : undefined;
        if (!pluralizer) {
            this.warn(`Pluralization is not configured for language '${lang}', falling back to the english ruleset`);
        }
        return pluralizer || pluralizerEn;
    }
}
