import {
    type Message,
    type MessageMeta,
    type MessageValue,
    type PluralValue,
    type PluralForm,
    isLegacyPlural,
} from '@gravity-ui/i18n-types';
import {
    MessageWithPlacementMeta,
    ExportAliases,
    isTranslationFunction,
    DeclarationType,
} from './types';
import {MODULE_NAME, removeStartNewLineFromICU} from './shared';
import {simpleTraverse} from '@typescript-eslint/typescript-estree';
import {AST_NODE_TYPES, TSESTree} from '@typescript-eslint/types';
import {parseToAst} from './parsing';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stringifyObj = (obj: any) => JSON.stringify(obj, null, 4);

export type ParseTranslationsFileArgs = {
    filePath: string;
    content?: string;
};

export type ParseTranslationsFileResult = {
    messages: MessageWithPlacementMeta[];
    filePath: string;
    exportAliases: ExportAliases;
    declarationType: DeclarationType;
};

function isMessagesCall(node: TSESTree.Node): node is TSESTree.CallExpression {
    if (node.type !== AST_NODE_TYPES.CallExpression) {
        return false;
    }

    // intl.createMessages(...)
    if (
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'createMessages'
    ) {
        return true;
    }

    // declareMessages(...) - standalone call
    if (node.callee.type === 'Identifier' && node.callee.name === 'declareMessages') {
        return true;
    }

    return false;
}

function getMessagesCallType(node: TSESTree.CallExpression): DeclarationType | undefined {
    // intl.createMessages(...)
    if (
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'createMessages'
    ) {
        return 'createMessages';
    }

    // declareMessages(...) - standalone call
    if (node.callee.type === 'Identifier' && node.callee.name === 'declareMessages') {
        return 'declareMessages';
    }

    return undefined;
}


function parseStringValue(node: TSESTree.Node): string {
    if (node.type === 'Identifier') {
        return node.name;
    }

    if (node.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
    }

    throw new Error(
        `[${MODULE_NAME}] Node must be string, but get ${node.type} at ${stringifyObj(node.loc)}`,
    );
}

function parseBooleanValue(node: TSESTree.Node): boolean {
    if (node.type === 'Literal' && typeof node.value === 'boolean') {
        return node.value;
    }

    throw new Error(
        `[${MODULE_NAME}] Node must be boolean, but get ${node.type} at ${stringifyObj(node.loc)}`,
    );
}

function parseMessageMeta(node: TSESTree.Node): MessageMeta {
    if (node.type !== 'ObjectExpression') {
        throw new Error(
            `[${MODULE_NAME}] Message meta must be ObjectExpression, but get ${node.type} at ${node.loc}`,
        );
    }

    const meta: MessageMeta = {};

    node.properties.forEach((prop) => {
        if (prop.type !== 'Property') {
            throw new Error(
                `[${MODULE_NAME}] Incorrect node type ${prop.type} at ${stringifyObj(prop.loc)}`,
            );
        }

        const key = parseStringValue(prop.key);

        if (key === 'id') {
            meta.id = parseStringValue(prop.value);
        } else if (key === 'description') {
            meta.description = parseStringValue(prop.value);
        } else if (key === 'markdown') {
            meta.markdown = parseBooleanValue(prop.value);
        } else if (key === 'disableTypograf') {
            meta.disableTypograf = parseBooleanValue(prop.value);
        }
    });

    return meta;
}

function parseMessageValue(node: TSESTree.Node, disallowNesting?: boolean): MessageValue {
    if (node.type === 'Literal') {
        if (node.value === null) {
            return null;
        }

        return parseStringValue(node);
    }

    if (node.type === 'Identifier' && node.name === 'undefined') {
        return null;
    }

    if (node.type === 'TemplateLiteral') {
        if (node.expressions.length || node.quasis.length > 1) {
            throw new Error(
                `[${MODULE_NAME}] Forbidden to use expressions in TemplateLiteral. ${stringifyObj(node.loc)}`,
            );
        }

        return removeStartNewLineFromICU(node.quasis[0]?.value.raw || '');
    }

    if (!disallowNesting && node.type === 'ObjectExpression') {
        const value: PluralValue = {
            one: undefined,
            few: undefined,
            many: undefined,
            zero: undefined,
            two: undefined,
            other: undefined,
        };

        node.properties.forEach((prop) => {
            if (prop.type !== 'Property') {
                throw new Error(
                    `[${MODULE_NAME}] Incorrect node type ${prop.type} at ${stringifyObj(prop.loc)}`,
                );
            }

            const key = parseStringValue(prop.key);

            if (Object.keys(value).includes(key)) {
                const pluralVal = parseMessageValue(prop.value, true);
                if (
                    typeof pluralVal !== 'string' &&
                    typeof pluralVal !== 'undefined' &&
                    pluralVal !== null
                ) {
                    throw new Error();
                }
                value[key as PluralForm] = pluralVal || '';
            } else {
                throw new Error(
                    `[${MODULE_NAME}] Incorrect plural form ${key} at ${stringifyObj(prop.loc)}`,
                );
            }
        });

        return value;
    }

    throw new Error(
        `[${MODULE_NAME}] Incorrect translation value type ${node.type} at ${stringifyObj(node.loc)}`,
    );
}

function parseMessage(node: TSESTree.Node): Message {
    if (node.type !== 'ObjectExpression') {
        throw new Error(
            `[${MODULE_NAME}] Message must be ObjectExpression, but get ${node.type} at ${stringifyObj(node.loc)}`,
        );
    }

    const message: Message = {};

    node.properties.forEach((prop) => {
        if (prop.type !== 'Property') {
            throw new Error(
                `[${MODULE_NAME}] Incorrect node type ${prop.type} at ${stringifyObj(prop.loc)}`,
            );
        }

        const key = parseStringValue(prop.key);

        if (key === 'meta') {
            message.meta = parseMessageMeta(prop.value);
        } else {
            const value = parseMessageValue(prop.value);
            message[key] = value;
        }
    });

    const {pluralCount, normalCount} = Object.entries(message).reduce(
        (acc, [key, cur]) => {
            if (key === 'meta') {
                return acc;
            }

            if (cur === null || cur === '') {
                return acc;
            }

            const isPlural = isLegacyPlural(cur as MessageValue);

            return {
                pluralCount: isPlural ? acc.pluralCount + 1 : acc.pluralCount,
                normalCount: !isPlural ? acc.normalCount + 1 : acc.normalCount,
            };
        },
        {normalCount: 0, pluralCount: 0},
    );

    if (pluralCount > 0 && normalCount > 0) {
        throw new Error(
            `[${MODULE_NAME}] All translations must be strictly in the same form. Problem with message: ${stringifyObj(message)}`,
        );
    }

    return message;
}

function getMessagesFromObjectExpression(
    node: TSESTree.ObjectExpression,
): MessageWithPlacementMeta[] {
    const messages: MessageWithPlacementMeta[] = [];

    node.properties.forEach((prop) => {
        if (prop.type !== 'Property') {
            throw new Error(
                `[${MODULE_NAME}] Incorrect node type ${prop.type} at ${stringifyObj(prop.loc)}`,
            );
        }

        const key = parseStringValue(prop.key);

        messages.push({
            message: parseMessage(prop.value),
            meta: {
                objectKey: key,
            },
        });
    });

    return messages;
}

export async function parseTranslationsFile(
    args: ParseTranslationsFileArgs,
): Promise<ParseTranslationsFileResult> {
    let messages: MessageWithPlacementMeta[] = [];
    const exportAliases: ExportAliases = {};
    let declarationType: DeclarationType = 'createMessages';

    const ast = await parseToAst({
        filename: args.filePath,
        content: args.content,
    });

    simpleTraverse(ast, {
        visitors: {
            VariableDeclarator: (node) => {
                if (
                    node.type === AST_NODE_TYPES.VariableDeclarator &&
                    node.init &&
                    node.init.type === AST_NODE_TYPES.CallExpression &&
                    isMessagesCall(node.init)
                ) {
                    const callType = getMessagesCallType(node.init);
                    if (callType) {
                        declarationType = callType;
                    }

                    // For declareMessages with Identifier: export const msgs = declareMessages(...)
                    if (
                        callType === 'declareMessages' &&
                        node.id.type === AST_NODE_TYPES.Identifier
                    ) {
                        exportAliases.default = node.id.name;
                    }

                    // For createMessages with ObjectPattern: const {t, Message} = intl.createMessages(...)
                    if (node.id.type === AST_NODE_TYPES.ObjectPattern) {
                        node.id.properties.forEach((prop) => {
                            if (
                                prop.type === AST_NODE_TYPES.Property &&
                                prop.key.type === AST_NODE_TYPES.Identifier
                            ) {
                                const originalName = prop.key.name;

                                if (
                                    prop.computed === false &&
                                    prop.value.type === AST_NODE_TYPES.Identifier &&
                                    originalName !== prop.value.name &&
                                    isTranslationFunction(originalName)
                                ) {
                                    exportAliases[originalName] = prop.value.name;
                                }
                            }
                        });
                    }
                }
            },
            CallExpression: (node) => {
                if (node && node.type === AST_NODE_TYPES.CallExpression && isMessagesCall(node)) {
                    const arg = node.arguments[0];

                    if (!arg || arg?.type !== 'ObjectExpression') {
                        throw new Error(
                            `[${MODULE_NAME}] Incorrect argument type ${arg?.type} at ${stringifyObj(node.loc)}`,
                        );
                    }

                    messages = getMessagesFromObjectExpression(arg);
                }
            },
        },
    });

    return {
        filePath: args.filePath,
        messages,
        exportAliases,
        declarationType,
    };
}
