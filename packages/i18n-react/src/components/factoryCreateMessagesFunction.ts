import type {Messages} from '@gravity-ui/i18n-types';
import {factoryCreateMessagesFunction as coreFactoryCreateMessagesFunction} from '@gravity-ui/i18n-core';
import type {IntlFormatters} from 'react-intl';

import type {ResolvedIntlConfig} from '../types';

import {factoryCreateMessageFunctions} from './factoryCreateMessageFunctions';

export function factoryCreateMessagesFunction<AvailableLocale extends string>(
    config: ResolvedIntlConfig<AvailableLocale>,
    intlFormatters: Pick<IntlFormatters<React.ReactNode>, 'formatMessage'>,
) {
    return function createMessages<K extends string>(msgs: Messages<AvailableLocale, K>) {
        const coreCreateMessages = coreFactoryCreateMessagesFunction(config);
        const messages = coreCreateMessages(msgs);
        const createMessageFunctions = factoryCreateMessageFunctions(config, intlFormatters);

        return {
            messages,
            ...createMessageFunctions(messages),
        };
    };
}
