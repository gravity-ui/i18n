import {Node} from 'estree';

interface GetTemplateLiteralString {
    (node?: Node): string;
}

export const getTemplateLiteralString: GetTemplateLiteralString = (node) => {
    if (node?.type === 'TemplateLiteral') {
        return node.quasis.map((quasi) => quasi.value.raw).join('');
    }
    return '';
};
