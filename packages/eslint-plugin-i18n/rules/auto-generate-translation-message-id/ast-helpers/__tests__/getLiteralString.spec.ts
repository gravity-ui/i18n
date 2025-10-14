import {Node} from 'estree';

import {getLiteralString} from '../getLiteralString';

describe('getLiteralString', () => {
    it('should return the string value when node type is Literal and value is a string', () => {
        const node: Node = {
            type: 'Literal',
            value: 'componentId',
        } as Node;

        const result = getLiteralString(node);
        expect(result).toBe('componentId');
    });

    it('should return an empty string when node type is not Literal', () => {
        const node: Node = {
            type: 'Identifier',
            name: 'componentId',
        } as Node;

        const result = getLiteralString(node);
        expect(result).toBe('');
    });

    it('should return an empty string when node value is not a string', () => {
        const node: Node = {
            type: 'Literal',
            value: {},
        } as Node;

        const result = getLiteralString(node);
        expect(result).toBe('');
    });

    it('should return an empty string when node is undefined', () => {
        const result = getLiteralString(undefined);
        expect(result).toBe('');
    });
});
