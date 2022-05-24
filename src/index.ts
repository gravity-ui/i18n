import {pluralize} from './pluralize';
import {replaceParams} from './replace-params';
import {Logger, Params, Plural} from './types';


type KeysData = Record<string, string | string[]>;
type KeysetData = Record<string, KeysData>;

export * from './types';

export class I18N {
    data: Record<string, KeysetData> = {};
    lang?: string = undefined;
    logger: Logger | null = null;

    constructor(options?: {logger?: Logger}) {
        this.logger = options?.logger || null;
    }

    setLang(lang: string) {
        this.lang = lang;
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

            result = pluralize(keyValue, count);

            if (keyValue[Plural.None] === undefined) {
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

    keyset(keysetName: string) {
        return (key: string, params?: Params): string => {
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
}
