import {DEFAULT_TYPOGRAF_CONFIG, typograf} from '../typograf';
import {transformMarkdownToHTML} from '../markdown';

const LANG = 'ru';

const INPUT_SIMPLE = 'Simple string';
const INPUT_MARKDOWN = 'String with a `markdown`';
const INPUT_HTML_TAG = 'String with an HTML <b>tag</b>';
const INPUT_HTML_ENTITY = 'String with an HTML entity &';

describe('typograf', () => {
    it('simple text with typograf', () => {
        expect(typograf(INPUT_SIMPLE, LANG, DEFAULT_TYPOGRAF_CONFIG)).toEqual('Simple string');
    });

    it('markdown text with typograf', () => {
        const text = transformMarkdownToHTML(INPUT_MARKDOWN);

        expect(typograf(text, LANG, DEFAULT_TYPOGRAF_CONFIG)).toEqual(
            '<p>String with a\u00a0<code>markdown</code></p>\n',
        );
    });

    it('html tag text with typograf', () => {
        expect(typograf(INPUT_HTML_TAG, LANG, DEFAULT_TYPOGRAF_CONFIG)).toEqual(
            'String with an\u00a0HTML <b>tag</b>',
        );
    });

    it('html entity text with typograf', () => {
        expect(typograf(INPUT_HTML_ENTITY, LANG, DEFAULT_TYPOGRAF_CONFIG)).toEqual(
            'String with an\u00a0HTML entity &',
        );
    });
});
