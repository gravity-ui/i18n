import {
    type MessageWithPlacementMeta,
    generateMessagesObject,
    getMessagesFromObjectExpression,
    loadProjectConfig,
} from '@gravity-ui/i18n-cli';
import type {Rule, SourceCode} from 'eslint';
import type {CallExpression, Node, ObjectExpression, Property} from 'estree';

import {
    DEFAULT_CALL_EXPRESSIONS,
    DEFAULT_FILENAME_MATCHER,
    DEFAULT_MEMBER_EXPRESSIONS,
    FILENAME_MATCHER_SCHEMA_PROPERTY,
    type I18nCreateMessagesFilenamesOptions,
    createFilenamePredicate,
    isCreateMessagesCall,
} from '../shared/create-messages-call';
import {detectIndentStep} from '../shared/multiline-message-body';

type NormalizeMessagesOptions = I18nCreateMessagesFilenamesOptions & {
    allowedLocales?: string[];
};

type ParseObjectExpression = Parameters<typeof getMessagesFromObjectExpression>[0];

const IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/;

/**
 * A plural value with all forms empty is stored as an empty string.
 * Everything else is handled by the shared i18n-cli parser/generator.
 */
function collapseEmptyPlurals(messages: MessageWithPlacementMeta[]): MessageWithPlacementMeta[] {
    for (const {message} of messages) {
        for (const [locale, value] of Object.entries(message)) {
            if (
                locale !== 'meta' &&
                value &&
                typeof value === 'object' &&
                Object.values(value).every((form) => !form)
            ) {
                message[locale] = '';
            }
        }
    }

    return messages;
}

function getKeyName(key: Property['key']): string | null {
    if (key.type === 'Identifier') {
        return key.name;
    }
    if (
        key.type === 'Literal' &&
        (typeof key.value === 'string' || typeof key.value === 'number')
    ) {
        return String(key.value);
    }
    return null;
}

/** Structural comparison that ignores formatting, quote style and key notation (`ru` vs `'ru'`). */
function isSameNode(actual: Node, expected: Node): boolean {
    switch (expected.type) {
        case 'Literal':
            return actual.type === 'Literal' && actual.value === expected.value;
        case 'Identifier':
            return actual.type === 'Identifier' && actual.name === expected.name;
        case 'TemplateLiteral':
            return (
                actual.type === 'TemplateLiteral' &&
                actual.expressions.length === 0 &&
                actual.quasis.length === 1 &&
                actual.quasis[0]?.value.raw === expected.quasis[0]?.value.raw
            );
        case 'ObjectExpression':
            return (
                actual.type === 'ObjectExpression' &&
                actual.properties.length === expected.properties.length &&
                expected.properties.every((expectedProp, index) => {
                    const actualProp = actual.properties[index];

                    return (
                        expectedProp.type === 'Property' &&
                        actualProp?.type === 'Property' &&
                        actualProp.kind === 'init' &&
                        !actualProp.computed &&
                        !actualProp.method &&
                        getKeyName(actualProp.key) === getKeyName(expectedProp.key) &&
                        isSameNode(actualProp.value, expectedProp.value)
                    );
                })
            );
        default:
            return false;
    }
}

function findProperty(obj: Node | undefined, name: string | null): Property | undefined {
    if (obj?.type !== 'ObjectExpression' || name === null) {
        return undefined;
    }

    return obj.properties.find(
        (prop): prop is Property =>
            prop.type === 'Property' && !prop.computed && getKeyName(prop.key) === name,
    );
}

function quoteString(value: string, quote: string): string {
    const json = JSON.stringify(value);

    if (quote === '"') {
        return json;
    }

    return `'${json.slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'")}'`;
}

type PrinterOptions = {
    sourceCode: SourceCode;
    step: string;
    quote: string;
    trailingComma: string;
};

/**
 * Prints `expected` as source text. Subtrees that already match their counterpart in `actual`
 * are copied verbatim, so the fix only touches what normalization actually changes.
 */
function printNode(
    expected: Node,
    actual: Node | undefined,
    indent: string,
    options: PrinterOptions,
): string {
    const {sourceCode, step, quote, trailingComma} = options;

    if (actual && isSameNode(actual, expected)) {
        return sourceCode.getText(actual);
    }

    switch (expected.type) {
        case 'Literal':
            return typeof expected.value === 'string'
                ? quoteString(expected.value, quote)
                : String(expected.value);
        case 'Identifier':
            return expected.name;
        case 'TemplateLiteral':
            return `\`${expected.quasis[0]?.value.raw ?? ''}\``;
        case 'ObjectExpression': {
            if (expected.properties.length === 0) {
                return '{}';
            }

            const innerIndent = indent + step;
            const lines = expected.properties.map((prop, index) => {
                const property = prop as Property;
                const name = getKeyName(property.key);
                const actualProp = findProperty(actual, name);
                const key = actualProp
                    ? sourceCode.getText(actualProp.key)
                    : printKey(name ?? '', quote);
                const value = printNode(property.value, actualProp?.value, innerIndent, options);
                const comma = index === expected.properties.length - 1 ? trailingComma : ',';

                return `${innerIndent}${key}: ${value}${comma}`;
            });

            return `{\n${lines.join('\n')}\n${indent}}`;
        }
        default:
            throw new Error(`Unexpected node type in generated messages: ${expected.type}`);
    }
}

function printKey(name: string, quote: string): string {
    return IDENTIFIER_RE.test(name) ? name : quoteString(name, quote);
}

function detectQuote(sourceCode: SourceCode, node: ObjectExpression): string {
    const stringToken = sourceCode.getTokens(node).find((token) => token.type === 'String');

    return stringToken?.value[0] === '"' ? '"' : "'";
}

function detectTrailingComma(sourceCode: SourceCode, node: ObjectExpression): string {
    const lastProp = node.properties[node.properties.length - 1];
    const closeToken = sourceCode.getLastToken(node);

    if (!lastProp?.range || !closeToken) {
        return ',';
    }

    return sourceCode.text.slice(lastProp.range[1], closeToken.range[0]).includes(',') ? ',' : '';
}

function getLineIndent(sourceCode: SourceCode, index: number): string {
    const lineStart = sourceCode.text.lastIndexOf('\n', index - 1) + 1;

    return sourceCode.text.slice(lineStart, index).match(/^[ \t]*/)?.[0] ?? '';
}

const RULE_DESCRIPTION = 'Enforce i18n messages to match the canonical form generated by i18n-cli.';

export const rule: Rule.RuleModule = {
    meta: {
        type: 'layout',
        fixable: 'code',
        docs: {
            description: RULE_DESCRIPTION,
        },
        messages: {
            notNormalized:
                'i18n messages are not normalized: keys must be sorted, each message must contain exactly the allowed locales ({{locales}}) followed by meta.',
            cannotNormalize: 'i18n messages cannot be normalized: {{error}}',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    memberExpressions: {type: 'array'},
                    callExpressions: {type: 'array'},
                    filenameMatcher: FILENAME_MATCHER_SCHEMA_PROPERTY,
                    allowedLocales: {
                        type: 'array',
                        items: {type: 'string'},
                        uniqueItems: true,
                        minItems: 1,
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create(context) {
        const options: NormalizeMessagesOptions = context.options[0] || {};
        const memberExpressions = options.memberExpressions ?? DEFAULT_MEMBER_EXPRESSIONS;
        const callExpressions = options.callExpressions ?? DEFAULT_CALL_EXPRESSIONS;
        const matchesFilename = createFilenamePredicate(
            options.filenameMatcher ?? DEFAULT_FILENAME_MATCHER,
        );

        if (!matchesFilename(context.filename)) {
            return {};
        }

        const sourceCode = context.sourceCode;

        function visitCreateMessagesCall(node: CallExpression) {
            if (!isCreateMessagesCall(node, sourceCode, memberExpressions, callExpressions)) {
                return;
            }

            const messagesNode = node.arguments[0];
            if (messagesNode?.type !== 'ObjectExpression') {
                return;
            }

            let messages: MessageWithPlacementMeta[];

            try {
                messages = getMessagesFromObjectExpression(
                    messagesNode as unknown as ParseObjectExpression,
                );
            } catch (error) {
                context.report({
                    node: messagesNode,
                    messageId: 'cannotNormalize',
                    data: {error: error instanceof Error ? error.message : String(error)},
                });
                return;
            }

            const allowedLocales =
                options.allowedLocales ?? loadProjectConfig({cwd: context.cwd}).allowedLocales;
            const expected = generateMessagesObject(
                collapseEmptyPlurals(messages),
                allowedLocales,
            ) as unknown as ObjectExpression;

            if (isSameNode(messagesNode, expected)) {
                return;
            }

            context.report({
                node: messagesNode,
                messageId: 'notNormalized',
                data: {locales: allowedLocales.join(', ')},
                fix(fixer) {
                    // Rebuilding the object would move or drop comments
                    if (sourceCode.getCommentsInside(messagesNode).length) {
                        return null;
                    }

                    const indent = getLineIndent(sourceCode, messagesNode.range![0]);
                    const text = printNode(expected, messagesNode, indent, {
                        sourceCode,
                        step: detectIndentStep(sourceCode, indent),
                        quote: detectQuote(sourceCode, messagesNode),
                        trailingComma: detectTrailingComma(sourceCode, messagesNode),
                    });

                    return fixer.replaceText(messagesNode, text);
                },
            });
        }

        return {
            CallExpression: visitCreateMessagesCall,
        };
    },
};
