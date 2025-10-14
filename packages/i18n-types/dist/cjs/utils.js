"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLegacyPlural = exports.pluralForms = void 0;
exports.pluralForms = ['zero', 'one', 'two', 'few', 'many', 'other'];
const isLegacyPlural = (messageValue) => {
    return (typeof messageValue === 'object' &&
        messageValue !== null &&
        !Array.isArray(messageValue) &&
        Object.keys(messageValue).every((form) => exports.pluralForms.includes(form)));
};
exports.isLegacyPlural = isLegacyPlural;
//# sourceMappingURL=utils.js.map