import { Node } from 'estree';
import { JSXOpeningElement } from 'estree-jsx';
export type NodeWithParent<T extends Node, U extends Node = JSXOpeningElement> = T & {
    parent: U;
};
