import type {MessageValue, PluralForm, PluralValue} from './types';

export const pluralForms: PluralForm[] = ['zero', 'one', 'two', 'few', 'many', 'other'];

export const isLegacyPlural = (messageValue: MessageValue): messageValue is PluralValue => {
    return (
        typeof messageValue === 'object' &&
        messageValue !== null &&
        !Array.isArray(messageValue) &&
        Object.keys(messageValue).every((form) => pluralForms.includes(form as PluralForm))
    );
};
