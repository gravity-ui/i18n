type GetNamespace = (props: {
    filename: string;
    namespaceMatchers: RegExp[];
    invalidCharsPattern: string | RegExp;
    invalidCharsReplacement: string;
    invalidCharsReplacer?: (substring: string) => string;
}) => string;
export declare const getNamespace: GetNamespace;
export {};
