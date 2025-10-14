export const getFormatters = (formatters) => {
    return {
        getNumberFormat: formatters.getNumberFormat,
        getMessageFormat: formatters.getMessageFormat,
        getPluralRules: formatters.getPluralRules,
        getListFormat: formatters.getListFormat,
        getDisplayNames: formatters.getDisplayNames,
    };
};
export const getIntlFormatters = (intlFormatters) => {
    return {
        formatNumber: intlFormatters.formatNumber,
        formatNumberToParts: intlFormatters.formatNumberToParts,
        formatDisplayName: intlFormatters.formatDisplayName,
        formatList: intlFormatters.formatList,
        formatListToParts: intlFormatters.formatListToParts,
    };
};
//# sourceMappingURL=baseTypes.js.map