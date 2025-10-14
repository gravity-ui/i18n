import {Expression, Identifier} from 'estree';

import {getObjectProperty} from '../get-object-property';

describe('getObjectProperty', () => {
    it('should return the correct property when found', () => {
        const argument = {
            type: 'ObjectExpression',
            properties: [
                {
                    type: 'Property',
                    key: {type: 'Identifier', name: 'id'},
                },
            ],
        } as Expression;

        const result = getObjectProperty({propertyName: 'id', argument});
        expect(result).toBeDefined();
        expect((result?.key as Identifier).name).toBe('id');
    });

    it('should return undefined when property is not found', () => {
        const argument = {
            type: 'ObjectExpression',
            properties: [
                {
                    type: 'Property',
                    key: {type: 'Identifier', name: 'defaultMessage'},
                },
            ],
        } as Expression;

        const result = getObjectProperty({propertyName: 'id', argument});
        expect(result).toBeUndefined();
    });

    it('should return undefined when argument is not an ObjectExpression', () => {
        const argument = {
            type: 'ArrayExpression',
        } as Expression;

        const result = getObjectProperty({propertyName: 'id', argument});
        expect(result).toBeUndefined();
    });
});
