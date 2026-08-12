import type {FilenameMatcher} from './types';

export const DEFAULT_FILENAME_MATCHER = 'i18n.ts';

function normalizePath(filePath: string) {
    return filePath.replaceAll('\\', '/');
}

function createStatelessRegExp(pattern: string, flags = '') {
    return new RegExp(pattern, flags.replace(/[gy]/g, ''));
}

function createSinglePredicate(matcher: FilenameMatcher): (filePath: string) => boolean {
    if (typeof matcher === 'string') {
        return (filePath) => normalizePath(filePath).endsWith(matcher);
    }

    if (matcher instanceof RegExp) {
        const regExp = createStatelessRegExp(matcher.source, matcher.flags);

        return (filePath) => regExp.test(normalizePath(filePath));
    }

    if (matcher && matcher.type === 'regexp') {
        let regExp: RegExp;

        try {
            regExp = createStatelessRegExp(matcher.pattern, matcher.flags);
        } catch (err) {
            const reason = err instanceof Error ? err.message : String(err);

            throw new Error(
                `[i18n-babel-plugin] Invalid filenameMatcher regexp: /${matcher.pattern}/${matcher.flags ?? ''}. ${reason}`,
            );
        }

        return (filePath) => regExp.test(normalizePath(filePath));
    }

    throw new Error(
        `[i18n-babel-plugin] Invalid filenameMatcher: ${JSON.stringify(matcher)}. Expected a string, a RegExp or {type: 'regexp', pattern, flags}`,
    );
}

export function createTranslationsFilePredicate(
    matchers: FilenameMatcher | FilenameMatcher[] = DEFAULT_FILENAME_MATCHER,
): (filePath: string) => boolean {
    const list = Array.isArray(matchers) ? matchers : [matchers];
    const predicates = (list.length === 0 ? [DEFAULT_FILENAME_MATCHER] : list).map(
        createSinglePredicate,
    );

    const [firstPredicate] = predicates;

    if (predicates.length === 1 && firstPredicate) {
        return firstPredicate;
    }

    return (filePath) => predicates.some((predicate) => predicate(filePath));
}
