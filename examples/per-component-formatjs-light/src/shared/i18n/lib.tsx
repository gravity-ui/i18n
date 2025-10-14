// Этот код предполагается вынести в либу
import {
    IntlConfig as CoreIntlConfig,
    IntlShape as CoreIntlShape,
    FormattedMessage,
    IntlFormatters,
    MessageDescriptor,
    createIntl as coreCreateIntl,
    createIntlCache,
} from 'react-intl';
import React from 'react';
import { Props as FormattedMessageProps } from 'react-intl/src/components/message';

type MultiLocaleMessage<AvailableLocale extends string = string> = Record<AvailableLocale, string>;

type MultiLocaleDescriptor<AvailableLocale extends string = string> = {
    id: string;
    description?: string;
    messages: MultiLocaleMessage<AvailableLocale>;
}

type Message<AvailableLocale extends string> = MultiLocaleDescriptor<AvailableLocale> | MultiLocaleMessage<AvailableLocale>;

type MultilocaleMessages<K extends string, AvailableLocale extends string> = Record<K, Message<AvailableLocale>>

const isDescriptor = <T extends string>(message: Message<T>): message is MultiLocaleDescriptor<T> => {
    return 'id' in message && 'messages' in message;
}

const isMultilocaleMessage = <T extends string>(message: Message<T>): message is MultiLocaleMessage<T> => {
    return !('id' in message) && !('messages' in message);
}

function factoryCreateMessagesFunction<AvailableLocale extends string = string>(intl: CoreIntlShape) {
    return function createMessages<K extends string>(
        msgs: MultilocaleMessages<K, AvailableLocale>
    ): Record<K, MessageDescriptor> {
        return new Proxy({} as Record<K, MessageDescriptor>, {
            get(_target, key) {
                const baseMsg = msgs[key as K];

                if (typeof baseMsg === 'undefined') {
                    throw new Error(`Not found message for key ${String(key)}`);
                }

                let id = String(key);
                let defaultMessage = String(key);

                if (isDescriptor(baseMsg)) {
                    id = baseMsg.id;
                    defaultMessage = baseMsg.messages[intl.locale as AvailableLocale] || defaultMessage;
                } else if (isMultilocaleMessage(baseMsg)) {
                    defaultMessage = baseMsg[intl.locale as AvailableLocale] || defaultMessage;
                }

                return {
                    id,
                    defaultMessage,
                };
            },
        });
    };
}

interface I18NProps<K extends string> extends Exclude<FormattedMessageProps, 'id' | 'description' | 'defauleMessage'> {
    id: K;
}

type RemoveFirst<T extends unknown[]> = T extends [infer H, ...infer R] ? R : T;

type FormatMessageArgs = RemoveFirst<Parameters<IntlFormatters<React.ReactNode>['formatMessage']>>

function factoryCreateMessageFunctions(intl: CoreIntlShape) {
    return function createMessageFunctions<T extends Record<string, MessageDescriptor>, K extends keyof T = string>(messages: T) {
        return {
            t: (id: K, ...args: FormatMessageArgs) => intl.formatMessage(messages[id], ...args),
            Message: ({id, ...props}: I18NProps<Extract<K, string>>) => <FormattedMessage {...messages[id]} {...props} />,
        };
    }
}

interface IntlConfig<AvailableLocale extends string> extends CoreIntlConfig {
    allowedLocales: AvailableLocale[];
}

export interface IntlShape<AvailableLocale extends string> extends CoreIntlShape {
    createMessages: ReturnType<typeof factoryCreateMessagesFunction<AvailableLocale>>;
    createMessageFunctions: ReturnType<typeof factoryCreateMessageFunctions>;
}

export function createIntl<AvailableLocale extends string>(
    config: IntlConfig<AvailableLocale>,
): IntlShape<AvailableLocale> {
    const cache = createIntlCache();
    const coreIntl = coreCreateIntl(config, cache);

    return {
        ...coreIntl,
        createMessages: factoryCreateMessagesFunction<AvailableLocale>(coreIntl),
        createMessageFunctions: factoryCreateMessageFunctions(coreIntl),
    };
}
