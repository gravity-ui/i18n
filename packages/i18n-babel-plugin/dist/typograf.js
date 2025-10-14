"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TYPOGRAF_CONFIG = void 0;
exports.typograf = typograf;
const tslib_1 = require("tslib");
const typograf_1 = tslib_1.__importDefault(require("typograf"));
exports.DEFAULT_TYPOGRAF_CONFIG = {
    enabled: ['common/nbsp/afterNumber', 'common/nbsp/afterParagraphMark'],
    disabled: ['common/symbols/cf', 'common/space/trimRight', 'common/space/trimLeft'],
};
/**
 * Отбрасывает из локали регион.
 * en-ru => en
 * ru-yateam => ru
 * ru-kz => ru
 *
 * @param locale stromg
 * @returns string
 */
const normalizeLocale = (locale) => {
    return locale.split('-')[0].toLowerCase();
};
const localeByLang = {
    ru: ['ru', 'en-US'],
    en: ['en-US', 'ru'],
};
const typografByLang = {
    ru: new typograf_1.default({ locale: localeByLang['ru'] }),
    en: new typograf_1.default({ locale: localeByLang['en'] }),
};
function typograf(text, origLocale, typografConfig) {
    const locale = normalizeLocale(origLocale);
    const tp = typografByLang[locale];
    if (!tp) {
        throw new Error(`Typograf dont support locale '${locale}'`);
    }
    const { disabled, enabled } = typografConfig;
    enabled.forEach((rule) => tp.enableRule(rule));
    disabled.forEach((rule) => tp.disableRule(rule));
    return tp.execute(text);
}
//# sourceMappingURL=typograf.js.map