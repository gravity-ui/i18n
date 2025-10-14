import type { MessageValue, PluralForm, PluralValue } from './types';
export declare const pluralForms: PluralForm[];
export declare const isLegacyPlural: (messageValue: MessageValue) => messageValue is PluralValue;
