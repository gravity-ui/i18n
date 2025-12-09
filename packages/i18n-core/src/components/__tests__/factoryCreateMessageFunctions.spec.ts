import {createIntl} from '@formatjs/intl';

import {onErrorFactory} from '../../utils/onErrorFactory';
import {factoryCreateMessageFunctions} from '../factoryCreateMessageFunctions';
import {factoryCreateMessagesFunction} from '../factoryCreateMessagesFunction';

const INPUT_SIMPLE = 'Simple string';
const INPUT_MARKDOWN = 'String with a `markdown`';
const INPUT_HTML_TAG = 'String with an HTML <b>tag</b>';
const INPUT_HTML_ENTITY = 'String with an HTML entity &';
const INPUT_WITH_PARAM = 'String with {param1}';
const INPUT_WITH_ICU = `this is {count, plural,
    one{# dog}
    other{# dogs}
}`;

describe('factoryCreateMessageFunctions', () => {
    const createMessages = factoryCreateMessagesFunction({
        allowedLocales: ['ru'],
        getLocale: () => 'ru',
        fallbackLocales: {},
        defaultFallback: 'empty-string',
        disableUseLocaleLangAsFallback: true,
    });

    const intl = createIntl({
        locale: 'ru',
        onError: onErrorFactory({}),
    });

    const messages = createMessages({
        simple: {
            ru: INPUT_SIMPLE,
        },
        markdown: {
            ru: INPUT_MARKDOWN,
        },
        htmlTag: {
            ru: INPUT_HTML_TAG,
        },
        htmlEntity: {
            ru: INPUT_HTML_ENTITY,
        },
        withParam: {
            ru: INPUT_WITH_PARAM,
        },
        wihICU: {
            ru: INPUT_WITH_ICU,
        },
    });

    const createMessageF = factoryCreateMessageFunctions(intl);
    const createMessageFWithEscape = factoryCreateMessageFunctions(intl, {
        escapeParameter: true,
    });

    const {t} = createMessageF(messages);
    const {t: tWithEscape} = createMessageFWithEscape(messages);

    it('simple text', () => {
        expect(t('simple')).toBe(INPUT_SIMPLE);
    });

    it('html tag text', () => {
        expect(t('htmlTag')).toBe(INPUT_HTML_TAG);
    });

    it('html entity text', () => {
        expect(t('htmlEntity')).toBe(INPUT_HTML_ENTITY);
    });

    it('text with missed param', () => {
        expect(() => t('withParam')).toThrow();
    });

    it('text with param', () => {
        expect(
            t('withParam', {
                param1: 'hello!',
            }),
        ).toBe('String with hello!');
    });

    it('ICU message syntax', () => {
        expect(t('wihICU', {count: 123})).toBe('this is 123 dogs');
    });

    it('should escape parameters when enabled in config', () => {
        expect(
            tWithEscape('withParam', {
                param1: '<escaped>',
            }),
        ).toBe('String with &lt;escaped&gt;');
    });

    it('should escape parameters when enabled in call options', () => {
        expect(
            t(
                'withParam',
                {
                    param1: '<escaped>',
                },
                {escapeParameter: true},
            ),
        ).toBe('String with &lt;escaped&gt;');
    });
});
