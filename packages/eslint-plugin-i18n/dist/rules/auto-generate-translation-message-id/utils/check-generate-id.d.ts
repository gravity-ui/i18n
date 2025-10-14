import { Rule } from 'eslint';
import { Node } from 'estree';
import { ReportDecorator } from '../types/handlers';
import { GenerateId } from '../types/utils';
export type CheckGenerateId = (props: {
    generateId: GenerateId;
    filename: string;
    currentIdValue: string;
    hasId: boolean;
    context: Rule.RuleContext;
    reportLackId: (props: ReportDecorator<Node>) => void;
    node: Node;
}) => void;
export declare const checkGenerateId: CheckGenerateId;
