import {replaceParams} from './replace-params';
import {KeysData, KeysetData, Logger, Params, PluralValue, Pluralizer, isPluralValue} from './types';

import pluralizerEn from './plural/en';
import pluralizerRu from './plural/ru';
import {getPluralValue} from './plural/general';

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
        if (!this.lang) {
            throw new Error(`Language is not defined, make sure you call setLang for the same language you called registerKeysets for!`);
        }

        const languageData = this.getLanguageData();

        if (!languageData || Object.keys(languageData).length === 0) {
            this.warn(`Data for language '${this.lang}' is empty.`);
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

        if (isPluralValue(keyValue)) {
            const count = Number(params?.count);

            if (Number.isNaN(count)) {
                this.warn(
                    'Missing params.count for key.',
                    keysetName,
                    key,
                );

                return key;
            }

            result = getPluralValue({
                key,
                value: keyValue,
                count,
                lang: this.lang,
                pluralizers: this.pluralizers,
                log: (message) => this.warn(message, keysetName, key),
            });
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

    convertArrayPluralToObject() {
        for (const keySet in this.data) {
            for (const keysData in this.data[keySet]) {
                for (const keyData in this.data[keySet][keysData]) {
                    if (Array.isArray(this.data[keySet][keysData][keyData])) {
                        this.data[keySet][keysData][keyData] = this.convertPluralValue(keySet, this.data[keySet][keysData][keyData] as string[]);
                    }
                }                
            }
        }
        return this.data;
    }

    protected convertPluralValue(keySet: string, value: string[]): PluralValue {
        if (keySet === 'en') {
            return {
                zero: value[0],
                one: value[1],
                other: value[2],
            };
        }
        if (keySet === 'ru') {
            return {
                zero: value[0],
                one: value[1],
                few: value[2],
                many: value[3],
                other: '',
            };
        }
        return {
            other: ''
        }
    }

    protected getLanguageData(lang?: string): KeysetData | undefined {
        const langCode = lang || this.lang;
        return langCode ? this.data[langCode] : undefined;
    }
}
