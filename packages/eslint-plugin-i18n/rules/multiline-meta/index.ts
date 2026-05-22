import type {Rule} from 'eslint';
import type {CallExpression, ObjectExpression, Property} from 'estree';

import {
    DEFAULT_CALL_EXPRESSIONS,
    DEFAULT_FILENAME_MATCHER,
    DEFAULT_MEMBER_EXPRESSIONS,
    FILENAME_MATCHER_SCHEMA_PROPERTY,
    createFilenamePredicate,
    isCreateMessagesCall,
    type I18nCreateMessagesFilenamesOptions,
} from '../shared/create-messages-call';
import {
    buildMultilineObject,
    detectIndentStep,
    getIndentBeforeIndex,
    isObjectMultilineFormatted,
} from '../shared/multiline-message-body';

const MESSAGE =
    'In i18n.ts createMessages definitions, meta must be written as a multiline object ({ with line breaks }), not inlined as meta: { id: ... }.';

function isMetaPropertyKey(key: Property['key']): boolean {
    if (key.type === 'Identifier') {
        return key.name === 'meta';
    }
    if (key.type === 'Literal') {
        return key.value === 'meta';
    }
    return false;
}

function metaObjectHasUnsupportedFeatures(objectExpr: ObjectExpression): boolean {
    return objectExpr.properties.some((p) => p.type !== 'Property');
}

export const rule: Rule.RuleModule = {
    meta: {
        type: 'layout',
        fixable: 'code',
        docs: {
            description: MESSAGE,
        },
        messages: {
            inlineMeta: MESSAGE,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    memberExpressions: {type: 'array'},
                    callExpressions: {type: 'array'},
                    filenameMatcher: FILENAME_MATCHER_SCHEMA_PROPERTY,
                },
                additionalProperties: false,
            },
        ],
    },

    create(context) {
        const options: I18nCreateMessagesFilenamesOptions = context.options[0] || {};
        const memberExpressions = options.memberExpressions ?? DEFAULT_MEMBER_EXPRESSIONS;
        const callExpressions = options.callExpressions ?? DEFAULT_CALL_EXPRESSIONS;
        const filenameMatcher = options.filenameMatcher ?? DEFAULT_FILENAME_MATCHER;
        const matchesFilename = createFilenamePredicate(filenameMatcher);

        const filename = context.getFilename();

        if (!matchesFilename(filename)) {
            return {};
        }

        const sourceCode = context.getSourceCode();

        function visitCreateMessagesCall(node: CallExpression) {
            if (!isCreateMessagesCall(node, sourceCode, memberExpressions, callExpressions)) {
                return;
            }

            const arg0 = node.arguments[0];
            if (!arg0 || arg0.type !== 'ObjectExpression') {
                return;
            }

            for (const messageEntry of arg0.properties) {
                if (messageEntry.type !== 'Property') {
                    continue;
                }

                const messageBody = messageEntry.value;
                if (messageBody.type !== 'ObjectExpression') {
                    continue;
                }

                for (const field of messageBody.properties) {
                    if (field.type !== 'Property' || !isMetaPropertyKey(field.key)) {
                        continue;
                    }

                    const metaValue = field.value;
                    if (metaValue.type !== 'ObjectExpression') {
                        continue;
                    }

                    if (metaObjectHasUnsupportedFeatures(metaValue)) {
                        continue;
                    }

                    if (isObjectMultilineFormatted(sourceCode, metaValue)) {
                        continue;
                    }

                    if (metaValue.range === undefined) {
                        continue;
                    }

                    context.report({
                        node: metaValue,
                        messageId: 'inlineMeta',
                        fix(fixer) {
                            // When the enclosing message body itself is not yet
                            // multiline (e.g. one-liner from auto-id injection or
                            // hand-written compact form), reformat the *body* first.
                            // The next ESLint fix pass will then re-enter this rule
                            // with a well-formatted body and produce a multiline meta.
                            if (!isObjectMultilineFormatted(sourceCode, messageBody)) {
                                if (
                                    messageBody.range === undefined ||
                                    messageEntry.range === undefined
                                ) {
                                    return null;
                                }

                                const bodyBaseIndent = getIndentBeforeIndex(
                                    sourceCode,
                                    messageEntry.range[0],
                                );
                                const step = detectIndentStep(sourceCode, bodyBaseIndent);
                                const bodyReplacement = buildMultilineObject({
                                    sourceCode,
                                    obj: messageBody,
                                    baseIndent: bodyBaseIndent,
                                    step,
                                });

                                if (bodyReplacement === null) {
                                    return null;
                                }

                                return fixer.replaceTextRange(messageBody.range, bodyReplacement);
                            }

                            const baseIndent = field.range
                                ? getIndentBeforeIndex(sourceCode, field.range[0])
                                : '';
                            const step = detectIndentStep(sourceCode, baseIndent);
                            const replacement = buildMultilineObject({
                                sourceCode,
                                obj: metaValue,
                                baseIndent,
                                step,
                            });

                            if (replacement === null) {
                                return null;
                            }

                            return fixer.replaceTextRange(metaValue.range!, replacement);
                        },
                    });
                }
            }
        }

        return {
            CallExpression: visitCreateMessagesCall,
        };
    },
};
