"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiteralString = void 0;
const getLiteralString = (node) => {
    if (node?.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
    }
    return '';
};
exports.getLiteralString = getLiteralString;
//# sourceMappingURL=getLiteralString.js.map