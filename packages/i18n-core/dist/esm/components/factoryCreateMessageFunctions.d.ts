import type { IntlFormatters, MessageDescriptor } from '@formatjs/intl';
type RemoveFirst<T extends unknown[]> = T extends [infer H, ...infer R] ? R : T;
export declare function factoryCreateMessageFunctions<TBase>(intlFormatters: Pick<IntlFormatters<TBase>, 'formatMessage'>): <T extends Record<string, MessageDescriptor>, K extends keyof T = string>(messages: T) => {
    t: (id: K, values?: Record<string, TBase | import("intl-messageformat").PrimitiveType | import("intl-messageformat").FormatXMLElementFn<TBase>> | undefined, opts?: import("intl-messageformat").Options | undefined) => string;
};
export {};
