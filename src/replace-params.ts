import {Params} from './types';

export function replaceParams(keyValue: string, params: Params): string {
    let result = keyValue;

    Object.keys(params).forEach((param) => {
        let replacer = params[param];
        if (typeof replacer === 'string' && replacer.indexOf('$') > -1) {
            // заменить все одиночные символы '$' на '$$'
            replacer = replacer.replace(/(?:([^$])\$|^\$)(?!\$)/g, '$1$$$$');
        }

        // eslint-disable-next-line security/detect-non-literal-regexp
        result = result.replace(new RegExp(`({{${param}}})`, 'g'), replacer)
    });

    return result;
}
