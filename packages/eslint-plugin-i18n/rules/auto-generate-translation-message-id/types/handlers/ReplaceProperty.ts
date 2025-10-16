import {AST, Rule} from 'eslint';
import {Node} from 'estree';

export type ReplaceProperty = (props: {
    fixer: Rule.RuleFixer;
    idProperty: Node | AST.Token;
    id: string;
}) => Rule.Fix;
