// Этот код предполагается вынести в либу
import {
    IntlConfig as CoreIntlConfig,
    IntlShape as CoreIntlShape,
    MessageDescriptor,
    createIntl as coreCreateIntl,
    createIntlCache,
} from 'react-intl';

type MultiLocaleDescriptor<AvailableLocale extends string> = {
    id: string;
    description?: string;
    messages: Record<AvailableLocale, string>;
};

function factoryCreateMessagesFunction<AvailableLocale extends string>(intl: CoreIntlShape) {
    return function createMessages<
        T extends MultiLocaleDescriptor<AvailableLocale> = MultiLocaleDescriptor<AvailableLocale>,
        U extends Record<string, T> = Record<string, T>,
    >(msgs: U): Record<keyof U, MessageDescriptor> {
        return new Proxy({} as Record<keyof U, MessageDescriptor>, {
            get(_target, key) {
                const baseMsg = msgs[key as keyof U];

                if (typeof baseMsg === 'undefined') {
                    throw new Error(`Not found message for key ${String(key)}`);
                }

                return {
                    id: baseMsg.id,
                    description: baseMsg.description,
                    defaultMessage: baseMsg.messages[intl.locale as AvailableLocale] as unknown as string,
                };
            },
        });
    };
}

interface IntlConfig<AvailableLocale extends string> extends CoreIntlConfig {
    allowedLocales: AvailableLocale[];
}

export interface IntlShape<AvailableLocale extends string> extends CoreIntlShape {
    createMessages: ReturnType<typeof factoryCreateMessagesFunction<AvailableLocale>>;
}

export function createIntl<AvailableLocale extends string>(
    config: IntlConfig<AvailableLocale>,
): IntlShape<AvailableLocale> {
    const cache = createIntlCache();
    const coreIntl = coreCreateIntl(config, cache);

    return {
        ...coreIntl,
        createMessages: factoryCreateMessagesFunction<AvailableLocale>(coreIntl),
    };
}
