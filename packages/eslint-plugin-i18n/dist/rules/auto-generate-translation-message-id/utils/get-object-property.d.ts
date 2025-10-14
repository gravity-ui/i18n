import { Expression, Pattern, Property, SpreadElement } from 'estree';
export type GetObjectProperty = (props: {
    propertyName: string;
    argument?: Expression | SpreadElement | Property | Pattern;
}) => Property | undefined;
export declare const getObjectProperty: GetObjectProperty;
