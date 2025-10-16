import {replaceParams} from './replace-params';

describe('replaceParams', () => {
    it('should substitute params', () => {
        expect(replaceParams('{{test}}', {test: 'text'})).toBe('text');
        expect(replaceParams('{{test}}{{test}}', {test: 'text'})).toBe('texttext');
        expect(replaceParams('some {{test}}', {test: 'text'})).toBe('some text');
        expect(replaceParams('some {{test}} text', {test: 'cool'})).toBe('some cool text');
        expect(replaceParams('{{test}} text', {test: 'cool'})).toBe('cool text');
        expect(replaceParams('some {{test}} text {{test2}} !!', {test: 'cool', test2: 'hey'})).toBe(
            'some cool text hey !!',
        );
    });
    it('should not replace missing params', () => {
        expect(replaceParams('{{test}}', {})).toBe('{{test}}');
        expect(replaceParams('some {{test}}', {})).toBe('some {{test}}');
        expect(replaceParams('some {{test}} text', {})).toBe('some {{test}} text');
        expect(replaceParams('{{test}} text', {})).toBe('{{test}} text');
        expect(replaceParams('some {{test}} text {{test2}} !!', {test: 'cool'})).toBe(
            'some cool text {{test2}} !!',
        );
    });
    it('should correctly substitute content with specials', () => {
        expect(replaceParams('{{test}}', {test: '$'})).toBe('$');
        expect(replaceParams('{{test}}', {test: '$$'})).toBe('$$');
        expect(
            replaceParams('{{test1}} {{test2}}', {
                test1: '{{test2}}',
                test2: '{{test3}}',
                test3: 'content',
            }),
        ).toBe('{{test2}} {{test3}}');
    });
});
