import type {AllowedLocales, Message, Messages} from './types';

/**
 * Declares messages without binding to an intl instance.
 * Useful for sharing messages between client and server.
 *
 * To get locale type checking, use module augmentation:
 * @example
 * ```typescript
 * // In a .d.ts file or at the top of your entry point:
 * declare module '@gravity-ui/i18n-types' {
 *     interface CustomTypeOptions {
 *         allowedLocales: 'ru' | 'en';
 *     }
 * }
 *
 * // Then use declareMessages without specifying locale type:
 * import {declareMessages} from '@gravity-ui/i18n-types';
 *
 * export const greetingMessages = declareMessages({
 *     hello: {
 *         en: 'Hello {name}!',
 *         ru: 'Привет {name}!',
 *     },
 * });
 * ```
 */
export function declareMessages<const M extends Record<string, Message<AllowedLocales>>>(
    msgs: M,
): Messages<AllowedLocales, keyof M & string> {
    return msgs as Messages<AllowedLocales, keyof M & string>;
}
