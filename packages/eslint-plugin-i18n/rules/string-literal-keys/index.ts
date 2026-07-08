import {createSourceVisitors} from '@gravity-ui/i18n-cli';
import {ESLintUtils, TSESTree} from '@typescript-eslint/utils';

const MESSAGE = 'Key in i18n call must be String Literal';

export const rule = ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: 'problem',
        docs: {
            description: MESSAGE,
            url: '/docs/rules/string-literal-keys.md',
        },
        messages: {stringLiteralOnly: MESSAGE},
        schema: [
            {
                type: 'object',
                properties: {
                    i18nSpecifier: {type: 'array'},
                    jsxI18nSpecifier: {type: 'array'},
                },
            },
        ],
    },
    defaultOptions: [
        {
            additionalFunctions: [],
            additionalComponents: [],
        },
    ],
    create(context) {
        const {additionalComponents, additionalFunctions} = context.options[0];

        const i18nCallVisitors = createSourceVisitors({
            additionalComponents,
            additionalFunctions,
            onCallFound({idNode}) {
                if (!idNode) return;

                if (idNode.type !== 'Literal') {
                    context.report({
                        messageId: 'stringLiteralOnly',
                        // `idNode` is typed against @gravity-ui/i18n-cli's own (older) copy of
                        // @typescript-eslint/utils, which is a structurally-compatible but
                        // nominally distinct AST node type from this package's copy.
                        node: idNode as unknown as TSESTree.Node,
                    });
                }
            },
            onJsxCallFound({idAttr}) {
                if (idAttr.value && idAttr.value.type !== 'Literal') {
                    context.report({
                        messageId: 'stringLiteralOnly',
                        // same cross-version node-type bridge as above
                        node: idAttr as unknown as TSESTree.Node,
                    });
                }
            },
        });

        // createSourceVisitors is typed against i18n-cli's older @typescript-eslint/utils copy;
        // bridge the RuleListener type identity to this package's copy
        return i18nCallVisitors as unknown as ESLintUtils.RuleListener;
    },
});
