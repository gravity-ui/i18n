"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildId = void 0;
const constants_1 = require("../constants");
const buildId = ({ translationObjectKey, namespace, uuid }) => {
    // Заменяем точки на нижнее подчеркивание в ключе объекта переводов
    const sanitizedTranslationObjectKey = translationObjectKey?.replace(/\./g, '_');
    const translationObjectKeyWithUuid = [sanitizedTranslationObjectKey, uuid]
        .filter(Boolean)
        .join(constants_1.TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR);
    return [namespace, translationObjectKeyWithUuid].filter(Boolean).join(constants_1.ID_SEPARATOR);
};
exports.buildId = buildId;
//# sourceMappingURL=build-id.js.map