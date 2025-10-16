import {Rule} from 'eslint';

export interface BaseHandler {
    context: Rule.RuleContext;
    idName: string;
}
