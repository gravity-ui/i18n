export type KeyData = string | DeprecatedPluralValue | PluralValue;
export type KeysData = Record<string, KeyData>;
export type KeysetData = Record<string, KeysData>;

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

// Recursive helper for finding path parameters
type KeyParam<Path extends string> =
    Path extends `${infer L}{{${infer K}}}${infer R}`
        ? K | KeyParam<L> | KeyParam<R>
        : never;

type StringKey = string;

type RequiredPluralValue = {
    count: number;
}

export type TypedParams<K = (StringKey | PluralValue), V = string | number> = (
    K extends StringKey
        ? Record<KeyParam<K>, V>
        : (
            K extends PluralValue
                ? Record<KeyParam<NonNullable<K["zero"]>> | KeyParam<NonNullable<K['one']>> | KeyParam<NonNullable<K['two']>> | KeyParam<NonNullable<K['few']>> | KeyParam<NonNullable<K['many']>> | KeyParam<NonNullable<K['other']>>, V> & RequiredPluralValue
                : unknown
            )
    );

export type TypedParamsI18NFn<T = any> = {
    <K extends keyof T, G extends keyof T[K], S extends string>(
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
        params?: TypedParams<T[K][G]>,
    ): string;
    keyset<K extends keyof T>(
        keysetName: K,
    ): <G extends keyof T[K], S extends string>(
        key: G | NoEnumLikeStringLiteral<S>,
        params?: TypedParams<T[K][G]>,
    ) => string;
    i18n<K extends keyof T, G extends keyof T[K], S extends string>(
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
    ): () => string;
    has<K extends keyof T>(
        keysetName: K,
        key: string
    ): () => boolean;
    bind(
        thisArg: any,
    ): <K extends keyof T, G extends keyof T[K], S extends string>(
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
        params?: TypedParams<T[K][G]>,
    ) => string;
    bind<K extends keyof T>(
        thisArg: any,
        keysetName: K,
    ): <G extends keyof T[K], S extends string>(
        key: G | NoEnumLikeStringLiteral<S>,
        params?: TypedParams<T[K][G]>,
    ) => string;
    bind<K extends keyof T, G extends keyof T[K], S extends string>(
        thisArg: any,
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
    ): (params?: TypedParams<T[K][G]>) => string;
    bind<K extends keyof T, G extends keyof T[K], S extends string>(
        thisArg: any,
        keysetName: K,
        key: G | NoEnumLikeStringLiteral<S>,
        params?: TypedParams<T[K][G]>,
    ): () => string;
};

export type Params = {[key: string]: any};

export type Pluralizer = (count: number, pluralForms: typeof PluralForm) => PluralForm;

export enum PluralForm {
    One,
    Few,
    Many,
    None
}

/**
 * @deprecated Old plurals format. Use new format from type PluralValue. Will be removed in v2.
 */
export type DeprecatedPluralValue = string[]

export type PluralValue = {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other?: string;
}

export function isPluralValue(value: KeyData): value is DeprecatedPluralValue | PluralValue {
    return typeof value !== 'string';
}

export interface Logger {
    log(message: string, options?: {level?: string; logger?: string; extra?: Record<string, unknown>}): void;
}
