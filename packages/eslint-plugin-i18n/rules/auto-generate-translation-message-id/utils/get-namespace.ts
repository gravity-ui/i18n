import {ID_SEPARATOR} from '../constants';

type GetNamespace = (props: {
    filename: string;
    namespaceMatchers: RegExp[];
    invalidCharsPattern: string | RegExp;
    invalidCharsReplacement: string;
    invalidCharsReplacer?: (substring: string) => string;
}) => string;

export const getNamespace: GetNamespace = ({
    filename,
    namespaceMatchers,
    invalidCharsPattern,
    invalidCharsReplacement,
    invalidCharsReplacer,
}) => {
    const defaultNamespace = '';
    let matches: RegExpMatchArray | null = null;

    for (const namespaceMatcher of namespaceMatchers ?? []) {
        matches = filename.match(namespaceMatcher);
        if (matches) {
            break;
        }
    }

    const namespace = matches
        ? matches.slice(1).filter(Boolean).join(ID_SEPARATOR)
        : defaultNamespace;
    if (typeof invalidCharsReplacer === 'function') {
        return namespace.replaceAll(invalidCharsPattern, invalidCharsReplacer);
    }

    return namespace.replaceAll(invalidCharsPattern, invalidCharsReplacement);
};
