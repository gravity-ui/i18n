import React from 'react';

import {factoryCreateMessageFunctions as coreFactoryCreateMessageFunctions} from '@gravity-ui/i18n-core';
import type {IntlFormatters, MessageDescriptor} from 'react-intl';

import type {ResolvedIntlConfig} from '../types';

import type {FormattedMessageProps} from './message';
import FormattedMessage from './message';

export type MessageProps<Key extends string> = Pick<
    FormattedMessageProps,
    'children' | 'ignoreTag' | 'tagName' | 'values'
> & {
    id: Key;
};

export function factoryCreateMessageFunctions<AvailableLocale extends string>(
    config: ResolvedIntlConfig<AvailableLocale>,
    intlFormatters: Pick<IntlFormatters<React.ReactNode>, 'formatMessage'>,
) {
    const coreCreateMessageFunctions =
        coreFactoryCreateMessageFunctions<React.ReactNode>(intlFormatters);

    return function createMessageFunctions<
        T extends Record<string, MessageDescriptor>,
        K extends keyof T = string,
    >(messages: T) {
        return {
            ...coreCreateMessageFunctions<T, K>(messages),
            Message: ({id, ...props}: MessageProps<Extract<K, string>>) => (
                <FormattedMessage
                    {...messages[id]}
                    {...props}
                    intlFormatters={intlFormatters}
                    config={config}
                />
            ),
        };
    };
}
