const warnCache = new Set();

type KeysData = Record<string, string | string[]>;
type KeysetData = Record<string, KeysData>;

declare global {
    interface Window {
        Ya: {
            Rum: {
                logError: (arg?: any) => void;
                ERROR_LEVEL: {
                    INFO: string;
                };
            };
        };
    }
}

export class I18N {
    static LANGS: Record<string, string> = {
        ru: 'ru',
        en: 'en',
    };

    static defaultLang: string | undefined = undefined;

    static setDefaultLang(lang: string) {
        if (I18N.LANGS[lang]) {
            I18N.defaultLang = lang;
        } else {
            console.warn('Attempted to set unknown lang as default.');
            I18N.defaultLang = I18N.LANGS.ru;
        }
    }

    data: Record<string, KeysetData> = {
        [I18N.LANGS.ru]: {},
        [I18N.LANGS.en]: {},
    };

    lang: string | undefined = undefined;

    setLang(lang: string) {
        if (I18N.LANGS[lang]) {
            this.lang = lang;
        } else {
            console.warn('Attempted to set unknown lang.');
            this.lang = I18N.LANGS.ru;
        }
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

    has(keysetName: string, key: string) {
        const lang = this.lang || I18N.defaultLang;
        let languageData: KeysetData | undefined;
        if (lang) {
            languageData = this.data[lang];
        }

        return Boolean(languageData && languageData[keysetName] && languageData[keysetName][key]);
    }

    i18n(keysetName: string, key: string, params?: {[key: string]: any}): string | string[] {
        const lang = this.lang || I18N.defaultLang;
        let languageData: KeysetData | undefined;
        if (lang) {
            languageData = this.data[lang];
        }

        if (typeof languageData === 'undefined') {
            // eslint-disable-next-line max-len
            throw new Error(`Language '${lang}' is not defined, make sure you call setLang for the same language you called registerKeysets for!`);
        }

        // если нет переводов
        if (Object.keys(languageData).length === 0) {
            this.warn('Language data is empty.');

            return key;
        }

        const keyset = languageData[keysetName];

        // если нет кейсета
        if (!keyset) {
            this.warn(
                'Keyset not found.',
                keysetName,
            );

            return key;
        }

        // если в кейсете нет переводов
        if (Object.keys(keyset).length === 0) {
            this.warn(
                'Keyset is empty.',
                keysetName,
            );

            return key;
        }

        const keyValue = keyset && keyset[key];
        let result: string | string[];

        if (typeof keyValue === 'undefined') {
            this.warn(
                'Missing key.',
                keysetName,
                key,
            );

            return key;
        }

        if (params) {
            const count = Number(params.count);

            if (Array.isArray(keyValue)) {
                if (typeof count !== 'number') {
                    this.warn(
                        'Missing params.count for key.',
                        keysetName,
                        key,
                    );

                    return key;
                }

                const lastNumber = count % 10;
                const lastNumbers = count % 100;
                let index;

                if (count === 0) {
                    index = 3;
                } else if (lastNumber === 1 && lastNumbers !== 11) {
                    index = 0;
                } else if ((lastNumber > 1 && lastNumber < 5) && (lastNumbers < 10 || lastNumbers > 20)) {
                    index = 1;
                } else {
                    index = 2;
                }

                result = keyValue[index];
            } else {
                result = keyValue;
            }

            Object.keys(params).forEach((param) => {
                let replacer = params[param];
                if (typeof replacer === 'string' && replacer.indexOf('$') > -1) {
                    // заменить все одиночные символы '$' на '$$'
                    replacer = replacer.replace(/(?:([^$])\$|^\$)(?!\$)/g, '$1$$$$');
                }

                result = (result || '') as string;
                // eslint-disable-next-line security/detect-non-literal-regexp
                result = result.replace(new RegExp(`({{${param}}})`, 'g'), replacer)
            });
        } else {
            result = keyValue;
        }

        return result;
    }

    keyset(keysetName: string) {
        return (...args: [string, {[key: string]: any}]): string | string[] => {
            return this.i18n(keysetName, ...args);
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


        if (!warnCache.has(cacheKey)) {
            console.warn(`[i18n][${cacheKey}] ${msg}`);

            /* eslint-disable no-undef */
            if (typeof window !== 'undefined'
                && window.Ya
                && window.Ya.Rum
                && typeof window.Ya.Rum.logError === 'function')
            {
                try {
                    window.Ya.Rum.logError({
                        message: `I18n: ${msg}`,
                        type: 'i18n',
                        level: window.Ya.Rum.ERROR_LEVEL.INFO,
                        block: cacheKey,
                    });
                } catch (err) {
                    console.error(err);
                }
            }
            /* eslint-enable no-undef */

            warnCache.add(cacheKey);
        }
    }
}
