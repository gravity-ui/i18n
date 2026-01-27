import type {Messages} from '@gravity-ui/i18n-types';

export function factoryDeclareMessagesFunction<AvailableLocale extends string>() {
    return function declareMessages<K extends string>(
        msgs: Messages<AvailableLocale, K>,
    ): Messages<AvailableLocale, K> {
        return msgs;
    };
}
