import { Rule } from 'eslint';
import { MemberExpression } from 'estree-jsx';
import { BaseRuleOptions } from '../types';
import { BaseHandler } from '../types/handlers';
type GetMemberExpressionProps = BaseHandler & BaseRuleOptions & {
    memberExpressions: Array<{
        member: string;
        property: string;
    }>;
};
type MemberExpressionNode = MemberExpression & Rule.NodeParentExtension;
export declare const getMemberExpression: ({ context, idName, memberExpressions, ...rest }: GetMemberExpressionProps) => (node: MemberExpressionNode) => void;
export {};
