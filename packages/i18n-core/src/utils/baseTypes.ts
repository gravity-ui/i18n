import type {Formatters, IntlFormatters} from '../types';

export const getFormatters = (formatters: Formatters): Formatters => {
    return {
        getNumberFormat: formatters.getNumberFormat,
        getMessageFormat: formatters.getMessageFormat,
        getPluralRules: formatters.getPluralRules,
        getListFormat: formatters.getListFormat,
        getDisplayNames: formatters.getDisplayNames,
    };
};

export const getIntlFormatters = <TBase>(
    intlFormatters: IntlFormatters<TBase>,
): IntlFormatters<TBase> => {
    return {
        formatNumber: intlFormatters.formatNumber,
        formatNumberToParts: intlFormatters.formatNumberToParts,
        formatDisplayName: intlFormatters.formatDisplayName,
        formatList: intlFormatters.formatList,
        formatListToParts: intlFormatters.formatListToParts,
    };
};
