import type {Message} from '@gravity-ui/i18n-types';

export type MessagePlacementMeta = {
    objectKey: string;
};

export type MessageWithPlacementMeta = {
    message: Message;
    meta: MessagePlacementMeta;
};

export type TranslationFunction = 't' | 'Message';

export type ExportAliases = Partial<Record<TranslationFunction, string>>;

export const isTranslationFunction = (
    functionName: string,
): functionName is TranslationFunction => {
    return functionName === 't' || functionName === 'Message';
};

export type DeclarationType = 'createMessages' | 'declareMessages';

export const DECLARATION_TYPES: DeclarationType[] = ['createMessages', 'declareMessages'];

export const isDeclarationType = (value: string): value is DeclarationType => {
    return DECLARATION_TYPES.includes(value as DeclarationType);
};
