import {replaceParams} from './replace-params';
import {KeysData, KeysetData, Logger, Params, PluralForm, PluralValue, Pluralizer} from './types';

import pluralizerEn from './plural/en';
import pluralizerRu from './plural/ru';
import {pluralizer} from './plural/general';

export * from './types';

export class I18N {
    data: Record<string, KeysetData> = {};
    lang?: string = undefined;
    pluralizers: Record<string, Pluralizer> = {
        en: pluralizerEn,
        ru: pluralizerRu,
    };
    logger: Logger | null = null;

    constructor(options?: {logger?: Logger}) {
        this.logger = options?.logger || null;
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
        const languageData = this.getLanguageData(this.lang);

        if (typeof languageData === 'undefined') {
            throw new Error(`Language '${this.lang}' is not defined, make sure you call setLang for the same language you called registerKeysets for!`);
        }

        if (Object.keys(languageData).length === 0) {
            this.warn('Language data is empty.');

            return key;
        }

        const keyset = languageData[keysetName];

        if (!keyset) {
            this.warn(
                'Keyset not found.',
                keysetName,
            );

            return key;
        }

        if (Object.keys(keyset).length === 0) {
            this.warn(
                'Keyset is empty.',
                keysetName,
            );

            return key;
        }

        const keyValue = keyset && keyset[key];
        let result: string;

        if (typeof keyValue === 'undefined') {
            this.warn(
                'Missing key.',
                keysetName,
                key,
            );

            return key;
        }

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
        } else if (typeof keyValue === 'object') {
            const count = Number(params?.count);

            if (this.checkErrorRequiredPluralForms(key, keysetName, keyValue)) {
                return key;
            }

            result = this.getTranslationFromObject(key, keysetName, keyValue, this.lang ?? 'en', count)

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

    protected getTranslationFromObject(key: string, keysetName: string, keyValue: PluralValue, lang: string, count: number): string {
        const pluralForm = pluralizer(count, lang);
        const valueByCount = keyValue[count];
        const valueByPlural = keyValue[pluralForm];
        const valueForOther = keyValue['other'];

        if (valueByCount !== undefined) {
            return valueByCount;
        }

        if (valueByPlural !== undefined) {
            return valueByPlural;
        }

        if (valueForOther !== undefined) {
            return valueForOther;
        }

        this.warn(
            'Missing translation for count.',
            keysetName,
            key,
        );

        return key; 
    }

    protected checkErrorRequiredPluralForms(key: string, keysetName: string, keyValue: PluralValue): boolean  {
        let error = false;
        if (keyValue['zero'] === undefined) {
            this.warn(
                'Missing required \'zero\' form',
                keysetName,
                key,
            );
            error = true;
        }

        if (keyValue['one'] === undefined) {
            this.warn(
                'Missing required \'one\' form',
                keysetName,
                key,
            );
            error = true;
        }

        if (keyValue['other'] === undefined) {
            this.warn(
                'Missing required \'other\' form',
                keysetName,
                key,
            );
            error = true;
        }

        return error;
    }
}
