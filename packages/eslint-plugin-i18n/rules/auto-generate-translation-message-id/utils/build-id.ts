import {ID_SEPARATOR, TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR} from '../constants';

type BuildId = {
    (props: {uuid?: string; namespace?: string; translationObjectKey?: string}): string;
};

export const buildId: BuildId = ({translationObjectKey, namespace, uuid}) => {
    // Заменяем точки на нижнее подчеркивание в ключе объекта переводов
    const sanitizedTranslationObjectKey = translationObjectKey?.replace(/\./g, '_');

    const translationObjectKeyWithUuid = [sanitizedTranslationObjectKey, uuid]
        .filter(Boolean)
        .join(TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR);
    return [namespace, translationObjectKeyWithUuid].filter(Boolean).join(ID_SEPARATOR);
};
