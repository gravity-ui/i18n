import {Node} from 'estree';

interface GetLiteralString {
    (node?: Node): string;
}

export const getLiteralString: GetLiteralString = (node) => {
    if (node?.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
    }
    return '';
};
