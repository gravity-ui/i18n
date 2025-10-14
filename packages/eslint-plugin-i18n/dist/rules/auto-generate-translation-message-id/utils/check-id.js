"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkId = void 0;
const tslib_1 = require("tslib");
const short_uuid_1 = tslib_1.__importDefault(require("short-uuid"));
const constants_1 = require("../constants");
const build_id_1 = require("./build-id");
const check_generate_id_1 = require("./check-generate-id");
const default_reporters_1 = require("./default-reporters");
const get_namespace_1 = require("./get-namespace");
const checkId = ({ reportLackId, reportMaxValidLengthExceeded = default_reporters_1.defaultReportMaxValidLengthExceeded, hasId, currentIdValue, translationObjectKey, generateId, namespaceMatchers, context, node, maxValidLength = constants_1.DEFAULT_MAX_VALID_LENGTH, invalidCharsPattern = constants_1.DEFAULT_INVALID_CHARS_PATTERN, invalidCharsReplacement = constants_1.DEFAULT_INVALID_CHARS_REPLACEMENT, invalidCharsReplacer, }) => {
    const filename = context.getFilename();
    if (typeof generateId === 'function') {
        (0, check_generate_id_1.checkGenerateId)({
            generateId,
            filename,
            currentIdValue,
            hasId,
            context,
            reportLackId,
            node,
        });
        return;
    }
    const namespace = (0, get_namespace_1.getNamespace)({
        filename,
        namespaceMatchers,
        invalidCharsPattern,
        invalidCharsReplacement,
        invalidCharsReplacer,
    });
    const uuid = short_uuid_1.default.generate().slice(0, 5);
    const id = (0, build_id_1.buildId)({ uuid, namespace, translationObjectKey });
    if (!hasId) {
        if (id.length > maxValidLength) {
            reportMaxValidLengthExceeded({ context, node, maxValidLength });
            return;
        }
        reportLackId({ context, node, id });
        return;
    }
    if (id.length > maxValidLength) {
        reportMaxValidLengthExceeded({ context, node, maxValidLength });
        return;
    }
};
exports.checkId = checkId;
//# sourceMappingURL=check-id.js.map