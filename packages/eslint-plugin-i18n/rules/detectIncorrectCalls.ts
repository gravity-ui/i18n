import {Rule} from 'eslint';

const DEFAULT_GLOBAL_I18N_NAME = 'i18n';
const DEFAULT_I18N_PREFIX = 'i18n';
const DEFAULT_GLOBAL_I18N_HELPERS = ['ci18n'];
const DEFAULT_IGNORED_IDENTIFIERS = ['i18nCodemod'];

function isI18nBind(node: any, globalI18nName: string) {
    return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === globalI18nName &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'bind'
    );
}

function isI18nDeclaration(node: any, globalI18nName: string) {
    return (
        node.type === 'VariableDeclaration' &&
        node.declarations.length === 1 &&
        node.declarations[0].id.type === 'Identifier' &&
        node.declarations[0].init &&
        isI18nBind(node.declarations[0].init, globalI18nName)
    );
}

function getI18nDeclarationParams(node: any) {
    const init = node.declarations[0].init;

    if (init.type === 'CallExpression' && init.arguments.length === 2) {
        return {
            keysetName: init.arguments[1].type === 'Literal' ? init.arguments[1].value : undefined,
            variableName: node.declarations[0].id.name,
        };
    }

    throw new Error('Incorrect args count');
}

function isValidKey(node: any) {
    return node.type === 'Literal';
}

function isValidParams(node: any) {
    return node.type === 'ObjectExpression';
}

function create(context: any) {
    const {
        globalI18nName = DEFAULT_GLOBAL_I18N_NAME,
        variableI18nPrefix = DEFAULT_I18N_PREFIX,
        globalI18nHelpers = DEFAULT_GLOBAL_I18N_HELPERS,
        ignoredIdentifiers: ignoredIdentifiersOrig = DEFAULT_IGNORED_IDENTIFIERS,
    } = context.options[0] || {};

    const i18nInstances = new Set(globalI18nHelpers);
    const ignoredIdentifiers = new Set(ignoredIdentifiersOrig);

    return {
        VariableDeclaration(node: any) {
            if (isI18nDeclaration(node, globalI18nName)) {
                const {keysetName, variableName} = getI18nDeclarationParams(node);

                if (!keysetName) {
                    context.report({
                        node,
                        message: 'Keyset name in i18n declaration must be String!',
                    });
                    return;
                }

                i18nInstances.add(variableName);

                if (!variableName.startsWith(variableI18nPrefix)) {
                    context.report({
                        node,
                        message: 'The names of i18n instances must starts with {{ prefix }}!',
                        data: {
                            prefix: variableI18nPrefix,
                        },
                    });
                }
            }
        },
        CallExpression(node: any) {
            if (
                isI18nBind(node, globalI18nName) &&
                node.parent &&
                node.parent.type !== 'VariableDeclarator'
            ) {
                context.report({
                    node,
                    message: 'i18n helpers can be assigned only to variable',
                });
                return;
            }

            if (node.callee.type !== 'Identifier') {
                return;
            }

            if (ignoredIdentifiers.has(node.callee.name)) {
                return;
            }

            // Using global i18n. For example i18n('common', 'key')
            if (node.callee.name === globalI18nName) {
                if (node.arguments.length < 2) {
                    context.report({
                        node,
                        message: 'Incorrect count of arguments in i18n call (min 2 arguments)',
                    });
                }

                const keyset = node.arguments[0];
                const key = node.arguments[1];
                const params = node.arguments[2];

                if (!isValidKey(keyset)) {
                    context.report({
                        node: keyset,
                        message: 'Keyset in i18n call must be String Literal, but get {{ type }}',
                        data: {
                            type: keyset.type,
                        },
                    });
                }

                if (!isValidKey(key)) {
                    context.report({
                        node: key,
                        message: 'Key in i18n call must be String Literal, but get {{ type }}',
                        data: {
                            type: key.type,
                        },
                    });
                }

                if (params && !isValidParams(params)) {
                    context.report({
                        node: params,
                        message:
                            'Parameters must be object like {someParam: 123}, but get {{ type }}',
                        data: {
                            type: params.type,
                        },
                    });
                }

                return;
            }

            const isI18nIdentifier = i18nInstances.has(node.callee.name);

            // Validate calls like i18nK('key', {param: 123})
            if (isI18nIdentifier) {
                const key = node.arguments[0];
                const params = node.arguments[1];

                if (!isValidKey(key)) {
                    context.report({
                        node: key,
                        message: 'Key in i18n call must be String Literal, but get {{ type }}',
                        data: {
                            type: key.type,
                        },
                    });
                }

                if (params && !isValidParams(params)) {
                    context.report({
                        node: params,
                        message:
                            'Parameters must be object like {someParam: 123}, but get {{ type }}',
                        data: {
                            type: params.type,
                        },
                    });
                }
            } else if (node.callee.name.startsWith(variableI18nPrefix)) {
                context.report({
                    node,
                    message:
                        '{{ variable }} must be declared in the current file, but declaration not found',
                    data: {
                        variable: node.callee.name,
                    },
                });
            }
        },
        ExportDefaultDeclaration(node: any) {
            if (
                isI18nBind(node.declaration, globalI18nName) ||
                (node.declaration.type === 'Identifier' && i18nInstances.has(node.declaration.name))
            ) {
                context.report({
                    node,
                    message: 'Forbidden to export i18n helpers',
                });
            }
        },
        ExportNamedDeclaration(node: any) {
            if (node.declaration && isI18nDeclaration(node.declaration, globalI18nName)) {
                context.report({
                    node,
                    message: 'Forbidden to export i18n helpers',
                });
            }
        },
        ExportSpecifier(node: any) {
            if (node.local.type === 'Identifier' && i18nInstances.has(node.local.name)) {
                context.report({
                    node,
                    message: 'Forbidden to export i18n helpers',
                });
            }
        },
    };
}

const schema = [
    {
        type: 'object',
        properties: {
            globalI18nName: {
                type: 'string',
                default: DEFAULT_GLOBAL_I18N_NAME,
            },
            variableI18nPrefix: {
                type: 'string',
                default: DEFAULT_I18N_PREFIX,
            },
            globalI18nHelpers: {
                type: 'array',
                default: DEFAULT_GLOBAL_I18N_HELPERS,
            },
            ignoredIdentifiers: {
                type: 'array',
                default: DEFAULT_IGNORED_IDENTIFIERS,
            },
        },
    },
];

export const rule: Rule.RuleModule = {
    create,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Detects calls like "i18n(dynamicVariable)", which don\'t use a string literal as a key.\nCheck that all used i18n identifiers are declared in the current file (except global).',
            recommended: true,
            url: '../docs/rules/detect-incorrect-calls.md',
        },
        schema,
    },
};
