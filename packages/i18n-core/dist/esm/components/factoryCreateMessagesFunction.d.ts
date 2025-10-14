import { type MessageDescriptor } from '@formatjs/intl';
import type { Messages } from '@gravity-ui/i18n-types';
import { ResolvedIntlConfigWithLocale } from '../types';
export declare function factoryCreateMessagesFunction<TBase, AvailableLocale extends string>(config: Pick<ResolvedIntlConfigWithLocale<TBase, AvailableLocale>, 'getLocale' | 'fallbackLocales' | 'disableUseLocaleLangAsFallback' | 'allowedLocales' | 'defaultFallback'>): <K extends string>(msgs: Messages<AvailableLocale, K>) => Record<K, MessageDescriptor>;
