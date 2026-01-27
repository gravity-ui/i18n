import type {Message, Messages} from './types';

/**
 * Declares messages without binding to an intl instance.
 * Useful for sharing messages between client and server.
 *
 * @example
 * ```typescript
 * import {declareMessages} from '@gravity-ui/i18n-types';
 *
 * export const greetingMessages = declareMessages<'ru' | 'en'>({
 *     hello: {
 *         en: 'Hello {name}!',
 *         ru: 'Привет {name}!',
 *     },
 * });
 * ```
 */
export function declareMessages<
    AvailableLocale extends string,
    const M extends Record<string, Message<AvailableLocale>> = Record<string, Message<AvailableLocale>>,
>(msgs: M): Messages<AvailableLocale, keyof M & string> {
    return msgs as Messages<AvailableLocale, keyof M & string>;
}
