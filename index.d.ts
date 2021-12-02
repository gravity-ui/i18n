type KeysData = Record<string, string | string[]>;
type KeysetData = Record<string, KeysData>;
type NoEnumLikeStringLiteral<T> = string extends T ? T : never;

export class I18N {
    static LANGS: {
        ru: string;
        en: string;
    };
    static setDefaultLang: (lang: string) => void;

    lang: string;
    data: Record<string, KeysetData>;

    setLang(lang: string): void;
    registerKeyset(lang: string, keysetName: string, data: KeysData): KeysetData;
    registerKeysets(lang: string, data: KeysetData): void;
    has(keysetName: string, key: string): boolean;
    i18n(keysetName: string, key: string, params?: {[key: string]: any}): string;
    keyset(keysetName: string): (key: string, params?: {[key: string]: any}) => string;
}

export type I18NFn<T = any> = {
    <K extends keyof T, G extends keyof T[K], S extends string>(
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
        params?: {[key: string]: any},
    ): S extends G ? T[K][G] : string;
    keyset<K extends keyof T>(
        keysetName: K,
    ): <G extends keyof T[K], S extends string>(
        key: G | NoEnumLikeStringLiteral<S>,
        params?: {[key: string]: any},
    ) => S extends G ? T[K][G] : string;
    i18n<K extends keyof T, G extends keyof T[K], S extends string>(
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
    ): () => S extends G ? T[K][G] : string;
    has<K extends keyof T>(
        keysetName: K,
        key: string
    ): () => boolean;
    bind(
        thisArg: any,
    ): <K extends keyof T, G extends keyof T[K], S extends string>(
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
        params?: {[key: string]: any},
    ) => S extends G ? T[K][G] : string;
    bind<K extends keyof T>(
        thisArg: any,
        keysetName: K,
    ): <G extends keyof T[K], S extends string>(
        key: G | NoEnumLikeStringLiteral<S>,
        params?: {[key: string]: any},
    ) => S extends G ? T[K][G] : string;
    bind<K extends keyof T, G extends keyof T[K], S extends string>(
        thisArg: any,
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
    ): (params?: {[key: string]: any}) => S extends G ? T[K][G] : string;
    bind<K extends keyof T, G extends keyof T[K], S extends string>(
        thisArg: any,
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
        params?: {[key: string]: any},
    ): () => S extends G ? T[K][G] : string;
};
