"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNamespace = void 0;
const constants_1 = require("../constants");
const getNamespace = ({ filename, namespaceMatchers, invalidCharsPattern, invalidCharsReplacement, invalidCharsReplacer, }) => {
    const defaultNamespace = '';
    let matches = null;
    for (const namespaceMatcher of namespaceMatchers ?? []) {
        matches = filename.match(namespaceMatcher);
        if (matches) {
            break;
        }
    }
    const namespace = matches
        ? matches.slice(1).filter(Boolean).join(constants_1.ID_SEPARATOR)
        : defaultNamespace;
    if (typeof invalidCharsReplacer === 'function') {
        return namespace.replaceAll(invalidCharsPattern, invalidCharsReplacer);
    }
    return namespace.replaceAll(invalidCharsPattern, invalidCharsReplacement);
};
exports.getNamespace = getNamespace;
//# sourceMappingURL=get-namespace.js.map