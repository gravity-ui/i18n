import {Params} from './types';

const PARAM_REGEXP = /{{(.*?)}}/g;

export function replaceParams(keyValue: string, params: Params): string {
    let result = '';

    let lastIndex = (PARAM_REGEXP.lastIndex = 0);
    let match;
    while ((match = PARAM_REGEXP.exec(keyValue))) {
        if (lastIndex !== match.index) {
            result += keyValue.slice(lastIndex, match.index);
        }
        lastIndex = PARAM_REGEXP.lastIndex;

        const [all, key] = match;
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            result += params[key];
        } else {
            result += all;
        }
    }
    if (lastIndex < keyValue.length) {
        result += keyValue.slice(lastIndex);
    }

    return result;
}
