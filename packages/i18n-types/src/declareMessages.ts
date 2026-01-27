import type {Messages} from './types';

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
export function declareMessages<AvailableLocale extends string, K extends string>(
    msgs: Messages<AvailableLocale, K>,
): Messages<AvailableLocale, K> {
    return msgs;
}
