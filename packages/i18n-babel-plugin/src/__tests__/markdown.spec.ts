import {transformMarkdownToHTML} from '../markdown';

const INPUT_SIMPLE = 'Simple string';
const INPUT_MARKDOWN = 'String with a `markdown`';
const INPUT_HTML_TAG = 'String with an HTML <b>tag</b>';
const INPUT_HTML_ENTITY = 'String with an HTML entity &';
const INPUT_MD_WITH_PARAM = 'MD with *{param1}* link [some text](https://domain.com/)';
const INPUT_MD_WITH_ICU = '*this* is {count, plural, one{# dog} other{# *dogs*}}';
const INPUT_MD_WITH_PARAM_IN_LINK =
    'Платёжный аккаунт создан.\nЧтобы активировать его, заполните [форму](https://forms.yandex.ru/surveys/10033352.3c456c5feb5c56ed6c3112834db3233af1434edc/?language=ru&resident_ru=ru_ru&utm_source=console&account_id={accountId}){target=_blank} или отправьте на [cloud_docs@support.yandex.ru](mailto:cloud_docs@support.yandex.ru)';

describe('markdown', () => {
    it('simple text', () => {
        expect(transformMarkdownToHTML(INPUT_SIMPLE)).toEqual('<p>Simple string</p>\n');
    });

    it('markdown text', () => {
        expect(transformMarkdownToHTML(INPUT_MARKDOWN)).toEqual(
            '<p>String with a <code>markdown</code></p>\n',
        );
    });

    it('html tag text', () => {
        expect(transformMarkdownToHTML(INPUT_HTML_TAG)).toEqual(
            '<p>String with an HTML &lt;b&gt;tag&lt;/b&gt;</p>\n',
        );
    });

    it('html entity text', () => {
        expect(transformMarkdownToHTML(INPUT_HTML_ENTITY)).toEqual(
            '<p>String with an HTML entity &amp;</p>\n',
        );
    });

    it('with param', () => {
        expect(transformMarkdownToHTML(INPUT_MD_WITH_PARAM)).toEqual(
            '<p>MD with <em>{param1}</em> link <a href="https://domain.com/">some text</a></p>\n',
        );
    });

    it('with param and ICU', () => {
        expect(transformMarkdownToHTML(INPUT_MD_WITH_ICU)).toEqual(
            '<p><em>this</em> is {count, plural, one{# dog} other{# <em>dogs</em>}}</p>\n',
        );
    });

    it('with param in link', () => {
        expect(transformMarkdownToHTML(INPUT_MD_WITH_PARAM_IN_LINK)).toEqual(
            '<p>Платёжный аккаунт создан.<br />\nЧтобы активировать его, заполните <a href="https://forms.yandex.ru/surveys/10033352.3c456c5feb5c56ed6c3112834db3233af1434edc/?language=ru&amp;resident_ru=ru_ru&amp;utm_source=console&amp;account_id={accountId}" target="_blank">форму</a> или отправьте на <a href="mailto:cloud_docs@support.yandex.ru">cloud_docs@support.yandex.ru</a></p>\n',
        );
    });
});
