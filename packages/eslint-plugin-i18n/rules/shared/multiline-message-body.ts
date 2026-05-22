import type {SourceCode} from 'eslint';
import type {ObjectExpression, Property} from 'estree';

const COMMENT_RE = /\/\/|\/\*/;
const INDENT_RE = /^[ \t]*/;
const LEADING_WHITESPACE_RE = /^[ \t]+/;

/** Whitespace from the start of the line up to `index`. */
export function getIndentBeforeIndex(sourceCode: SourceCode, index: number): string {
    const text = sourceCode.text;
    const lineStart = text.lastIndexOf('\n', index - 1) + 1;
    return text.slice(lineStart, index);
}

/**
 * Best-effort detection of a single indentation step (one level deeper than `baseIndent`)
 * by scanning the source for the smallest indent that extends `baseIndent`.
 *
 * Falls back to tab when the file uses tabs, otherwise to four spaces.
 */
export function detectIndentStep(sourceCode: SourceCode, baseIndent: string): string {
    const text = sourceCode.text;
    const lines = text.split('\n');

    let minStep: string | null = null;

    for (const line of lines) {
        const match = line.match(INDENT_RE);
        if (!match) {
            continue;
        }

        const indent = match[0];

        if (indent.length === line.length) {
            continue;
        }
        if (indent.length <= baseIndent.length) {
            continue;
        }
        if (!indent.startsWith(baseIndent)) {
            continue;
        }

        const step = indent.slice(baseIndent.length);
        if (step.length === 0) {
            continue;
        }
        if (minStep === null || step.length < minStep.length) {
            minStep = step;
        }
    }

    if (minStep) {
        return minStep;
    }

    if (/\n\t/.test(text)) {
        return '\t';
    }

    const anyIndent = text.match(/\n([ \t]+)/);
    if (anyIndent?.[1]) {
        const ws = anyIndent[1].match(LEADING_WHITESPACE_RE);
        if (ws?.[0]) {
            return ws[0];
        }
    }

    return '    ';
}

/**
 * An object is considered properly multiline-formatted when:
 *  - the opening brace is followed by a newline before the first property,
 *  - every property starts on its own line (newline separates each pair),
 *  - the closing brace is on its own line (newline precedes it),
 *  - or, for an empty object, `{` and `}` are on different lines.
 *
 * This intentionally rejects "mixed format" objects like `{a: 1,\n    b: 2,\n}`
 * (first property inlined with the brace) so downstream rules can normalize them.
 */
export function isObjectMultilineFormatted(sourceCode: SourceCode, obj: ObjectExpression): boolean {
    if (obj.range === undefined) {
        return false;
    }

    const openToken = sourceCode.getFirstToken(obj);
    const closeToken = sourceCode.getLastToken(obj);
    if (!openToken || !closeToken) {
        return false;
    }
    if (openToken.value !== '{' || closeToken.value !== '}') {
        return false;
    }

    const text = sourceCode.text;
    const properties = obj.properties;

    if (properties.length === 0) {
        const between = text.slice(openToken.range[1], closeToken.range[0]);
        return between.includes('\n');
    }

    const firstProp = properties[0]!;
    if (firstProp.range === undefined) {
        return false;
    }
    if (!text.slice(openToken.range[1], firstProp.range[0]).includes('\n')) {
        return false;
    }

    for (let i = 1; i < properties.length; i++) {
        const prev = properties[i - 1]!;
        const curr = properties[i]!;
        if (prev.range === undefined || curr.range === undefined) {
            return false;
        }
        if (!text.slice(prev.range[1], curr.range[0]).includes('\n')) {
            return false;
        }
    }

    const lastProp = properties[properties.length - 1]!;
    if (lastProp.range === undefined) {
        return false;
    }
    if (!text.slice(lastProp.range[1], closeToken.range[0]).includes('\n')) {
        return false;
    }

    return true;
}

type BuildMultilineObjectOptions = {
    sourceCode: SourceCode;
    obj: ObjectExpression;
    /** Indent of the line that contains the parent property (e.g. `markdownMessage:`). */
    baseIndent: string;
    /** One indentation step (e.g. `'    '` or `'\t'`). */
    step: string;
    /**
     * Property order to emit. Defaults to the source order found in `obj`.
     * Caller may pass a permutation (e.g. desired sort order).
     */
    desiredOrder?: Property[];
};

/**
 * Builds the multiline source representation of `obj`, including the braces:
 *
 *     {
 *         a: 1,
 *         b: 2,
 *     }
 *
 * Apply via `fixer.replaceTextRange(obj.range, output)`.
 *
 * Returns `null` when normalization is unsafe — currently when:
 *  - the object contains a spread element, or
 *  - there are comments interleaved between properties or braces (we would
 *    move/lose them when reordering or reflowing).
 */
export function buildMultilineObject(options: BuildMultilineObjectOptions): string | null {
    const {sourceCode, obj, baseIndent, step, desiredOrder} = options;

    const properties: Property[] = [];
    for (const p of obj.properties) {
        if (p.type !== 'Property') {
            return null;
        }
        properties.push(p);
    }

    const openToken = sourceCode.getFirstToken(obj);
    const closeToken = sourceCode.getLastToken(obj);
    if (!openToken || !closeToken) {
        return null;
    }

    const text = sourceCode.text;

    if (properties.length === 0) {
        const inner = text.slice(openToken.range[1], closeToken.range[0]);
        if (COMMENT_RE.test(inner)) {
            return null;
        }
        return `{\n${baseIndent}}`;
    }

    const firstProp = properties[0]!;
    const lastProp = properties[properties.length - 1]!;
    if (firstProp.range === undefined || lastProp.range === undefined) {
        return null;
    }
    if (COMMENT_RE.test(text.slice(openToken.range[1], firstProp.range[0]))) {
        return null;
    }
    if (COMMENT_RE.test(text.slice(lastProp.range[1], closeToken.range[0]))) {
        return null;
    }
    for (let i = 1; i < properties.length; i++) {
        const prev = properties[i - 1]!;
        const curr = properties[i]!;
        if (prev.range === undefined || curr.range === undefined) {
            return null;
        }
        if (COMMENT_RE.test(text.slice(prev.range[1], curr.range[0]))) {
            return null;
        }
    }

    const order = desiredOrder ?? properties;
    const innerIndent = `${baseIndent}${step}`;
    const lines = order.map((p) => `${innerIndent}${sourceCode.getText(p)},`);
    return `{\n${lines.join('\n')}\n${baseIndent}}`;
}
