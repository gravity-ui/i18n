import type {IntlFormatters, MessageDescriptor} from '@formatjs/intl';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RemoveFirst<T extends unknown[]> = T extends [infer H, ...infer R] ? R : T;

export function factoryCreateMessageFunctions<TBase>(
    intlFormatters: Pick<IntlFormatters<TBase>, 'formatMessage'>,
) {
    return function createMessageFunctions<
        T extends Record<string, MessageDescriptor>,
        K extends keyof T = string,
    >(messages: T) {
        return {
            // TODO Change args types
            t: (
                id: K,
                ...args: RemoveFirst<Parameters<IntlFormatters<TBase>['formatMessage']>>
            ) => {
                const descriptor = messages[id]!;

                // formatjs не дает возможность указывать пустую строку для defaultMessage
                // поэтому возвращаем пустую строку на этот случай сами
                if (descriptor.defaultMessage === '') {
                    return '';
                }

                const nodes = intlFormatters.formatMessage(descriptor, args[0], {
                    ...args[1],
                    ignoreTag: true,
                }) as string | string[];

                return Array.isArray(nodes) ? nodes.join('') : nodes;
            },
        };
    };
}
