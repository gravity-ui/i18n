import type {IntlFormatters, MessageDescriptor} from '@formatjs/intl';

import {escapeHtml} from '../utils/escape';

type RemoveFirst<T extends unknown[]> = T extends [infer _H, ...infer R] ? R : T;

type FormatMessageArgs<TBase> = RemoveFirst<Parameters<IntlFormatters<TBase>['formatMessage']>>;
type FormatMessageParams<TBase> = FormatMessageArgs<TBase>[0];
type FormatMessageOptions<TBase> = NonNullable<FormatMessageArgs<TBase>[1]> & {
    escapeParameter?: boolean;
};

function escapeParams<TBase>(params?: FormatMessageParams<TBase>): FormatMessageParams<TBase> {
    return params
        ? Object.entries(params).reduce<NonNullable<FormatMessageParams<TBase>>>(
              (acc, [key, value]) => {
                  acc[key as keyof typeof acc] =
                      typeof value === 'string' ? escapeHtml(value) : value;
                  return acc;
              },
              {},
          )
        : params;
}

export function factoryCreateMessageFunctions<TBase>(
    intlFormatters: Pick<IntlFormatters<TBase>, 'formatMessage'>,
    config?: {
        escapeParameter?: boolean;
    },
) {
    return function createMessageFunctions<
        T extends Record<string, MessageDescriptor>,
        K extends keyof T = string,
    >(messages: T) {
        return {
            t: (
                id: K,
                params?: FormatMessageParams<TBase>,
                options?: FormatMessageOptions<TBase>,
            ) => {
                const descriptor = messages[id]!;

                // formatjs cannot handle empty defaultMessage
                // so we return empty string in this case ourselves
                if (descriptor.defaultMessage === '') {
                    return '';
                }

                const {escapeParameter, ...restFormatMessageOptions} = options ?? {};

                const shouldEscapeParameter = escapeParameter ?? config?.escapeParameter;
                const values = shouldEscapeParameter ? escapeParams(params) : params;

                const nodes = intlFormatters.formatMessage(descriptor, values, {
                    ...restFormatMessageOptions,
                    ignoreTag: true,
                }) as string | string[];

                return Array.isArray(nodes) ? nodes.join('') : nodes;
            },
        };
    };
}
