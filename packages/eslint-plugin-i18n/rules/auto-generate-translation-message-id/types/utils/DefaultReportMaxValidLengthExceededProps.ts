import {Rule} from 'eslint';
import {Node} from 'estree';

export interface DefaultReportMaxValidLengthExceededProps {
    context: Rule.RuleContext;
    node: Node;
    maxValidLength: number;
}
