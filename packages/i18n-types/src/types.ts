export type MessageMeta = {
    /** Ключ для Танкера */
    id?: string;
    /** Включает трансформацию текстов из YFM в HTML */
    markdown?: boolean;
    /** Описание ключа для Танкера */
    description?: string;
    /** Отключает применение типографа к текстам */
    disableTypograf?: boolean;
};

export type PluralValue = {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other?: string;
};

export type PluralForm = keyof PluralValue;

export type MessageValue = string | PluralValue | null;

export type MultiLocaleMessage<AvailableLocale extends string> = Record<
    AvailableLocale,
    MessageValue
>;

export type Message<AvailableLocale extends string = string> =
    MultiLocaleMessage<AvailableLocale> & {
        meta?: MessageMeta;
    };

export type Messages<AvailableLocale extends string, Key extends string> = Record<
    Key,
    Message<AvailableLocale>
>;

export type FallbackLocales<AvailableLocale extends string> = Partial<
    Record<AvailableLocale, AvailableLocale | AvailableLocale[]>
>;

export type DefaultFallback<AvailableLocale extends string> =
    | AvailableLocale
    | AvailableLocale[]
    | 'empty-string'
    | 'key';
