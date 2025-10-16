import {Node} from 'estree';

import {getTemplateLiteralString} from '../getTemplateLiteralString';

describe('getTemplateLiteralString', () => {
    it('should return the raw string from TemplateLiteral', () => {
        const node: Node = {
            type: 'TemplateLiteral',
            quasis: [{value: {raw: 'componentId '}}, {value: {raw: 'componentHash'}}],
        } as Node;

        const result = getTemplateLiteralString(node);
        expect(result).toBe('componentId componentHash');
    });

    it('should return an empty string when node type is not TemplateLiteral', () => {
        const node: Node = {
            type: 'Literal',
            value: 'componentId',
        } as Node;

        const result = getTemplateLiteralString(node);
        expect(result).toBe('');
    });

    it('should return an empty string when node is undefined', () => {
        const result = getTemplateLiteralString(undefined);
        expect(result).toBe('');
    });

    it('should handle TemplateLiteral with no quasis', () => {
        const node: Node = {
            type: 'TemplateLiteral',
            quasis: [],
        } as unknown as Node;

        const result = getTemplateLiteralString(node);
        expect(result).toBe('');
    });
});
