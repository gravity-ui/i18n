export const KEYSET_SEPARATOR = '::';

export const MAX_NESTING_DEPTH = 1
export const getNestingTranslationsRegExp = () => new RegExp(/\$t{([^}]+)}/g)