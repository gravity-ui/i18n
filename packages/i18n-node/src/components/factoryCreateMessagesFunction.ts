/// <reference types="intl-messageformat" />
import type {IntlFormattersFull} from '@gravity-ui/i18n-core';
import type {Messages} from '@gravity-ui/i18n-types';
import {
    factoryCreateMessagesFunction as coreFactoryCreateMessagesFunction,
    factoryCreateMessageFunctions,
} from '@gravity-ui/i18n-core';

import type {ResolvedIntlConfigWithLocale} from '../types';

export function factoryCreateMessagesFunction<AvailableLocale extends string>(
    config: ResolvedIntlConfigWithLocale<AvailableLocale>,
    intlFormatters: Pick<IntlFormattersFull<string>, 'formatMessage'>,
) {
    return function createMessages<K extends string>(msgs: Messages<AvailableLocale, K>) {
        const coreCreateMessages = coreFactoryCreateMessagesFunction(config);
        const messages = coreCreateMessages(msgs);
        const createMessageFunctions = factoryCreateMessageFunctions(intlFormatters, {
            escapeParameter: config.escapeParameter,
        });

        return createMessageFunctions(messages);
    };
}
