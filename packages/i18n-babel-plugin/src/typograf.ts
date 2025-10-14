import Typograf from 'typograf';

import {TypografConfig} from './types';

export const DEFAULT_TYPOGRAF_CONFIG: TypografConfig = {
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
const normalizeLocale = (locale: string) => {
    return locale.split('-')[0]!.toLowerCase()!;
};

const localeByLang: Record<string, string[]> = {
    ru: ['ru', 'en-US'],
    en: ['en-US', 'ru'],
};

const typografByLang: Record<string, Typograf> = {
    ru: new Typograf({locale: localeByLang['ru']!}),
    en: new Typograf({locale: localeByLang['en']!}),
};

export function typograf(text: string, origLocale: string, typografConfig: TypografConfig) {
    const locale = normalizeLocale(origLocale);
    const tp = typografByLang[locale];

    if (!tp) {
        throw new Error(`Typograf dont support locale '${locale}'`);
    }

    const {disabled, enabled} = typografConfig;

    enabled.forEach((rule) => tp.enableRule(rule));
    disabled.forEach((rule) => tp.disableRule(rule));

    return tp.execute(text);
}
