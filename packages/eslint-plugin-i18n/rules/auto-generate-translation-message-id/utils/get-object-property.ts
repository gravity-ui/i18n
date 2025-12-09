import {Expression, Pattern, Property, SpreadElement} from 'estree';

export type GetObjectProperty = (props: {
    propertyName: string;
    argument?: Expression | SpreadElement | Property | Pattern;
}) => Property | undefined;

export const getObjectProperty: GetObjectProperty = ({argument, propertyName}) => {
    if (argument?.type !== 'ObjectExpression') {
        return;
    }

    return argument?.properties
        ?.filter((item): item is Property => item.type === 'Property')
        .find(
            (filteredProperty) =>
                filteredProperty.type === 'Property' &&
                filteredProperty.key.type === 'Identifier' &&
                filteredProperty.key.name === propertyName,
        );
};
