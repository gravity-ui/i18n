"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntlFormatters = exports.getFormatters = void 0;
const getFormatters = (formatters) => {
    return {
        getNumberFormat: formatters.getNumberFormat,
        getMessageFormat: formatters.getMessageFormat,
        getPluralRules: formatters.getPluralRules,
        getListFormat: formatters.getListFormat,
        getDisplayNames: formatters.getDisplayNames,
    };
};
exports.getFormatters = getFormatters;
const getIntlFormatters = (intlFormatters) => {
    return {
        formatNumber: intlFormatters.formatNumber,
        formatNumberToParts: intlFormatters.formatNumberToParts,
        formatDisplayName: intlFormatters.formatDisplayName,
        formatList: intlFormatters.formatList,
        formatListToParts: intlFormatters.formatListToParts,
    };
};
exports.getIntlFormatters = getIntlFormatters;
//# sourceMappingURL=baseTypes.js.map