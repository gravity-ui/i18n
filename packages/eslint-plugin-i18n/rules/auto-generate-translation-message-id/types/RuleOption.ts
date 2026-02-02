import {BaseRuleOptions} from './BaseRuleOptions';

export interface RuleOptions extends BaseRuleOptions {
    memberExpressions: Array<{member: string; property: string}>;
    callExpressions: string[];
}
