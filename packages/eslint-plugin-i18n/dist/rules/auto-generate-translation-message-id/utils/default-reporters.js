"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultReportMaxValidLengthExceeded = void 0;
const defaultReportMaxValidLengthExceeded = ({ context, node, maxValidLength, }) => {
    context.report({
        node,
        message: `Can't generate message id because it exceeds the maximum valid length of ${maxValidLength} characters. Please change the regular expression in namespaceMatchers used for id generation, update the generateId function`,
    });
};
exports.defaultReportMaxValidLengthExceeded = defaultReportMaxValidLengthExceeded;
//# sourceMappingURL=default-reporters.js.map