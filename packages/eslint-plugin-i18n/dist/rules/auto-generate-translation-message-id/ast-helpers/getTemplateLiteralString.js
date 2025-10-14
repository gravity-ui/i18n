"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateLiteralString = void 0;
const getTemplateLiteralString = (node) => {
    if (node?.type === 'TemplateLiteral') {
        return node.quasis.map((quasi) => quasi.value.raw).join('');
    }
    return '';
};
exports.getTemplateLiteralString = getTemplateLiteralString;
//# sourceMappingURL=getTemplateLiteralString.js.map