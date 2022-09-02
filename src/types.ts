type NoEnumLikeStringLiteral<T> = string extends T ? T : never;

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

export type Params = {[key: string]: any};

export type Pluralizer = (count: number, pluralForms: typeof PluralForm) => PluralForm;

export enum PluralForm {
    One,
    Few,
    Many,
    None
}

export interface Logger {
    log(message: string, options?: {level?: string; logger?: string; extra?: Record<string, unknown>}): void;
}
