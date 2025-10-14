// Этот код предполагается вынести в либу
import {
    IntlConfig as CoreIntlConfig,
    IntlShape as CoreIntlShape,
    MessageDescriptor,
    MissingDataError,
    createIntl as coreCreateIntl,
    createIntlCache,
} from 'react-intl';

type LocaleMessages = Record<string, MessageDescriptor['defaultMessage']>;

/**
* Функция, регистрирующая тексты для дальнейшего использования в текущем модуле.
* В разработке вызывать не нужно!
* Внедряется автоматически при сборке проекта для частичной поставки текстов по месту использования.
*
* @example
* intl.addMessages({
*    ru: {
*        'compute.disks.0f6ee': 'Диски',
*        'compute.disks.853gf9': 'Создать диск',
*    },
*    en: {
*        'compute.disks.0f6ee': 'Disks',
*        'compute.disks.853gf9': 'Create disk',
*    },
* })
*/
function factoryAddMessagesFunction<AvailableLocale extends string>(intl: CoreIntlShape) {
    return function addMessages(messages: Record<AvailableLocale, LocaleMessages>) {
        const currentLocaleMessages = messages[intl.locale as AvailableLocale];

        if (typeof currentLocaleMessages === 'undefined') {
            intl?.onError(new MissingDataError(`Not found messages for locale ${intl.locale}`));
            return;
        }

        intl.messages = {
            ...intl.messages,
            ...currentLocaleMessages,
        };
    };
}

interface IntlConfig<AvailableLocale extends string> extends CoreIntlConfig {
    allowedLocales: AvailableLocale[];
}

export interface IntlShape<AvailableLocale extends string> extends CoreIntlShape {
    addMessages: ReturnType<typeof factoryAddMessagesFunction<AvailableLocale>>;
}

export function createIntl<AvailableLocale extends string>(
    config: IntlConfig<AvailableLocale>,
): IntlShape<AvailableLocale> {
    const cache = createIntlCache();
    const coreIntl = coreCreateIntl(config, cache);

    return {
        ...coreIntl,
        addMessages: factoryAddMessagesFunction<AvailableLocale>(coreIntl),
    };
}
