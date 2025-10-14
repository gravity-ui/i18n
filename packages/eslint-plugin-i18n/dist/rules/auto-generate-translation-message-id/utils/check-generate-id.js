"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGenerateId = void 0;
const checkGenerateId = ({ generateId, filename, currentIdValue, hasId, context, reportLackId, node, }) => {
    const id = generateId({
        filename,
        currentIdValue,
        hasId,
    });
    if (!hasId) {
        reportLackId({ context, node, id });
        return;
    }
};
exports.checkGenerateId = checkGenerateId;
//# sourceMappingURL=check-generate-id.js.map